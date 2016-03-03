{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'


load_material = (scene, data)->
    name = data.name
    mat = scene.materials[name] = \
        new Material(
            scene.context, name, [scene.context.SHADER_LIB, data['fragment']],
            data.uniforms, data.attributes, "", scene
            )
    # make sure it's bool
    mat.double_sided = not not data.double_sided

load_textures_of_material = (scene, data) ->
    # When you only want to request textures to be loaded without compiling the shader
    for u in data.uniforms
        if u.type == 13 and scene # 2D image
            scene.loader.load_texture u.image, u.filepath, u.filter, u.wrap, u.size
    return
# http://www.blender.org/documentation/blender_python_api_2_65_release/gpu.html

_active_program = null

class Material

    constructor: (@context, @name, fs, uniforms, attributes, vs="", @scene)->
        if @context.all_materials.indexOf(@) == -1
            @context.all_materials.push @

        gl = @context.render_manager.gl
        @textures = []
        @uv_layer_attribs = {} #name of attribute for each uv layer
        @color_attribs = {}    #name of attribute for each vcol
        tex_uniforms = []
        lamps = {} # lamp_name: {varpos, varcolor3, varcolor4, dist}
        @lamps = []  # [[lamp, varpos, varcolor3, varcolor4, dist], ...]
        @is_shadow_material = false  # actually not used
        @attrib_locs = {"vnormal": -1}
        @users = []
        @uniforms_config = uniforms
        @attributes_config = attributes
        @uv_multiplier = 1
        @shape_multiplier = 1
        @group_id = -1

        var_model_view_matrix = "model_view_matrix"
        var_inv_model_view_matrix = ""
        var_object_matrix = ""
        var_inv_object_matrix = ""
        var_color = ""
        var_strand = ""
        var_strand_type = "float"
        var_custom = []

        for u in uniforms
            if u.type == 6 or u.type == 7 or u.type == 11 or u.type == 15
                l = lamps[u.lamp] or {
                    vardir:'', varpos:'', varmat:''
                    varcolor3:'', varcolor4:'', dist:''
                    }
                lamps[u.lamp] = l

            if u.type == 1 # model_view_matrix
                var_model_view_matrix = u.varname
            else if u.type == 2 # object_matrix
                var_object_matrix = u.varname
            else if u.type == 3 # inverse model_view_matrix
                var_inv_model_view_matrix = u.varname
            else if u.type == 4 # inverse object_matrix
                var_inv_object_matrix = u.varname
            else if u.type == 5 # object color
                var_color = u.varname
            else if u.type == 6 # lamp direction in camera space
                l.vardir = u.varname
            else if u.type == 7 # lamp position in camera space
                l.varpos = u.varname
            else if u.type == 9 # camera to lamp matrix
                l.varmat = u.varname
            else if u.type == 10 # lamp energy
                l.varenergy = u.varname
            else if u.type == 11 # lamp color
                if u.datatype == 4 # vec3
                    l.varcolor3 = u.varname
                else # vec4
                    l.varcolor4 = u.varname
            else if u.type == 16 # lamp falloff distance
                l.dist = u.varname
            # MISSING:
            # GPU_DYNAMIC_LAMP_SPOTSIZE = 19,
            # GPU_DYNAMIC_LAMP_SPOTBLEND = 20,
            # GPU_DYNAMIC_SAMPLER_2DBUFFER = 12,
            # And 15 was distance wrongly, it's GPU_DYNAMIC_OBJECT_AUTOBUMPSCALE
            else if u.type == 14
                if @context.render_manager.extensions.texture_float_linear?# shadow texture
                    @textures.push {loaded: true, tex: @scene.objects[u.lamp].shadow_fb.texture}
                    tex_uniforms.push u.varname
            else if u.type == 13 and @scene # 2D image
                tex = @scene.loader.load_texture u.image, u.filepath, u.filter, u.wrap, u.size
                @textures.push tex
                tex.users.push @
                tex_uniforms.push u.varname
            else if u.type == 77 # position in strand (0-1)
                var_strand = u.varname
                var_strand_type = u.gltype
            else if u.type == -1 # custom
                var_custom.push u.varname
            else
                console.log u
                console.log "Warning: unknown uniform", u.varname, u.type, "of data type", \
                    ['0','1i','1f','2f','3f','4f','m3','m4','4ub'][u.datatype]

        uniform_decl = ""
        attribute_decl = ""
        attribute_asgn = ""
        armature_deform_code = ""
        extrude_code = ""
        num_shapes = 0
        num_bones = 0
        num_particles = 0
        @num_bone_uniforms = 0

        for a in attributes
            v = 'var' + a.varname[3...]
            if a.type < 14
                vtype = "vec3"
                multiplier = ""
                if a.type == 5 # UV layer
                    @uv_layer_attribs[a.name] = a.varname
                    vtype = "vec2"
                    multiplier = "*uv_multiplier"
                else if a.type == 6 # color layer
                    @color_attribs[a.name] = a.varname
                    vtype = "vec4"
                else
                    console.log "Warning: unknown attribute type", a.type

                attribute_decl += "attribute "+vtype+" "+a.varname+";\n"\
                    +"varying "+vtype+" "+v+";\n"
                attribute_asgn += v+"="+a.varname+multiplier+";\n"
                @attrib_locs[a.varname] = -1

            else if a.type == 18 # tangent vectors
                attribute_decl += "attribute vec4 tangent;\n"\
                    +"varying vec4 "+v+";\n"
                #attribute_asgn += v+".xyz = normalize("\
                    #+var_model_view_matrix+"*vec4("+a.varname+",0.0)).xyz;\n"
                attribute_asgn += v+".xyz = normalize(("+var_model_view_matrix+"*vec4(tangent.xyz,0)).xyz);\n"
                attribute_asgn += v+".w = tangent.w;\n"
                @attrib_locs["tangent"] = -1
            else if a.type == 99 # shape key
                num_shapes = a.count
                for i in [0...num_shapes]
                    attribute_decl += "attribute vec3 shape"+i+";\n"
                    attribute_decl += "attribute vec3 shapenor"+i+";\n"
                    @attrib_locs["shape"+i] = -1
                    @attrib_locs["shapenor"+i] = -1
                uniform_decl += "uniform float shapef["+num_shapes+"];"
            else if a.type == 88 # armature deform
                num_bones = a.count
                @num_bone_uniforms = num_bones
                attribute_decl += "attribute vec4 weights;\n"
                attribute_decl += "attribute vec4 b_indices;\n"
                @attrib_locs["weights"] = -1
                @attrib_locs["b_indices"] = -1
                uniform_decl += "uniform mat4 bones["+@num_bone_uniforms+"];\n"
                armature_deform_code = ("""
                vec4 blendco = vec4(0);
                vec3 blendnor = vec3(0);
                mat4 m;
                ivec4 inds = ivec4(b_indices);
                int idx;
                for(int i=0; i<4; ++i){
                    m = bones[inds[i]];
                    blendco += m * co4 * weights[i];
                    blendnor += mat3(m[0].xyz, m[1].xyz, m[2].xyz) * normal * weights[i];
                }
                co4 = blendco; normal = blendnor;
                """)
                # TODO: Allowing deformed mesh transformation in an efficient manner
                # When mesh local transformation is not zero, add a matrix uniform that
                # holds mesh -> armature transformation and use that in the code above
                # but add an optimization pass at export to apply mesh transformations
                # where possible.
            else if a.type == 77 # particle hair
                if var_strand == ""
                    var_strand = "strand"
                uniform_decl += "uniform "+var_strand_type+" "+var_strand+";\n"
                num_particles = a.count
                for i in [0...num_particles]
                    attribute_decl += "attribute vec3 particle"+i+";\n"
                    @attrib_locs["particle"+i] = -1
            else
                # original coordinates (TODO: divide by dimensions)
                attribute_decl += "varying vec3 "+v+";\n"
                attribute_asgn += v+" = co;\n"

        shape_key_code = ""
        if num_shapes
            shape_key_code = """float relf = 0.0;
            vec3 n;
                """
            for i in [0...num_shapes]
                shape_key_code += """co += shape"""+i+""" * shapef["""+i+"""] * shape_multiplier;
                relf += shapef["""+i+"""];
                """
            # Interpolating normals instead of re-calculating them is wrong
            # But it's fast and completely unnoticeable in most cases
            shape_key_code += "normal *= clamp(1.0 - relf, 0.0, 1.0);\n"
            for i in [0...num_shapes]
                shape_key_code += """
                n = shapenor"""+i+""" * 0.007874;
                normal += n * Math.max(0.0, shapef["""+i+"""]);
                """
            # TODO: interleave fors for efficency, adding an uniform with the sum?
            #       saving all uniforms in a single matrix?
            #       (so only one gl.uniform16fv is enough)
            vnormal = "vnormal * 0.007874"
        else
            # Not divided by 128 because it will be normalized anyway
            vnormal = "vnormal"

        if num_particles
            strnd = var_strand
            if var_strand_type!="float" then strnd += ".x"
            extrude_code = """
            co4 = vec4(mix(co4.xyz, particle0, """+strnd+""") ,1.0);
            """

        # TODO: find which uniform
        # has conflicting precision between VS and FS in ANGLE/win32
        @vs_code = vs = vs or """
        precision highp float;
        precision highp int;
        uniform mat4 """+var_model_view_matrix+""";
        uniform mat4 projection_matrix;
        uniform mat3 normal_matrix;
        uniform float shape_multiplier;
        uniform float uv_multiplier;
        attribute vec3 vertex;
        attribute vec3 vnormal;
        varying vec3 varposition;
        varying vec3 varnormal;
        """+attribute_decl+"""
        """+uniform_decl+"""
        void main()
        {
            vec3 co = vertex;
            vec3 normal = """ + vnormal + """;
            """ + shape_key_code + attribute_asgn + """
            vec4 co4 = vec4(co, 1.0);
            """ + armature_deform_code + """
            """ + extrude_code + """
            vec4 global_co = """+var_model_view_matrix+""" * co4;
            varposition = global_co.xyz;
            varnormal = normalize(normal_matrix * normal);
            gl_Position = projection_matrix * global_co;
        }"""

        vertex_shader = gl.createShader gl.VERTEX_SHADER
        gl.shaderSource vertex_shader, vs
        gl.compileShader vertex_shader

        if not gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS) and not gl.isContextLost()
            #console.log vs
            console.log "Error compiling vertex shader of material", name
            console.log gl.getShaderInfoLog vertex_shader
            # ext = gl.getExtension "WEBGL_debug_shaders"
            # if ext
            #     console.log  '\n' + ext.getTranslatedShaderSource(vertex_shader)).split('\n')
            gl.deleteShader vertex_shader
            return

        @fs_code = fs
        fragment_shader = gl.createShader gl.FRAGMENT_SHADER
        fs = if fs.splice then fs.join('') else fs
        gl.shaderSource fragment_shader, fs
        gl.compileShader fragment_shader

        if not gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS) and not gl.isContextLost()
            console.log "Error compiling fragment shader of material", name
            console.log gl.getShaderInfoLog fragment_shader
            # ext = gl.getExtension "WEBGL_debug_shaders"
            # if ext
            #     console.log  '\n' + ext.getTranslatedShaderSource(fragment_shader)).split('\n')
            gl.deleteShader fragment_shader
            return


        prog = gl.createProgram()
        gl.attachShader prog, vertex_shader
        gl.attachShader prog, fragment_shader
        gl.bindAttribLocation prog, 0, 'vertex'  # Ensure vertex is attrib 0
        gl.linkProgram prog

        if not gl.getProgramParameter(prog, gl.LINK_STATUS) and not gl.isContextLost()
            console.log "Error linking shader of material", name
            console.log attributes
            console.log gl.getProgramInfoLog prog
            #ext = gl.getExtension "WEBGL_debug_shaders"
            #if ext console.log ext.getTranslatedShaderSource vertex_shader
            gl.deleteProgram prog
            gl.deleteShader vertex_shader
            gl.deleteShader fragment_shader
            return

        gl.useProgram prog
        @u_model_view_matrix = gl.getUniformLocation prog, var_model_view_matrix
        @u_projection_matrix = gl.getUniformLocation prog, "projection_matrix"
        @u_normal_matrix = gl.getUniformLocation prog, "normal_matrix"
        @u_shape_multiplier = gl.getUniformLocation prog, "shape_multiplier"
        @u_uv_multiplier = gl.getUniformLocation prog, "uv_multiplier"
        @u_group_id = gl.getUniformLocation prog, "group_id"
        @u_mesh_id = gl.getUniformLocation prog, "mesh_id"
        gl.uniform1f @u_shape_multiplier, @shape_multiplier
        gl.uniform1f @u_uv_multiplier, @uv_multiplier

        # these getUniformLocation may yield null
        @u_inv_model_view_matrix = gl.getUniformLocation prog, var_inv_model_view_matrix
        @u_var_object_matrix = gl.getUniformLocation prog, var_inv_object_matrix
        @u_var_inv_object_matrix = gl.getUniformLocation prog, var_inv_object_matrix
        @u_color = gl.getUniformLocation prog, var_color
        @u_fb_size = gl.getUniformLocation prog, "fb_size"
        @u_strand = gl.getUniformLocation prog, var_strand
        @u_shapef = []
        for i in [0...num_shapes]
            @u_shapef[i] = gl.getUniformLocation prog, "shapef["+i+"]"
        @u_bones = []
        for i in [0...@num_bone_uniforms]
            @u_bones[i] = gl.getUniformLocation prog, "bones["+i+"]"
        @u_custom = []
        for v in var_custom
            @u_custom.push gl.getUniformLocation(prog, v)

        fb = @context.render_manager.common_filter_fb
        if fb and @u_fb_size?
            gl.uniform2f @u_fb_size, fb.size_x, fb.size_y

        # getAttribLocation returns -1 if not present (instead of null)
        @a_vertex = gl.getAttribLocation prog, "vertex"
        gl.enableVertexAttribArray @a_vertex

        for a_name of @attrib_locs
           a = gl.getAttribLocation(prog, a_name)|0
           @attrib_locs[a_name] = a

        for i in [0...tex_uniforms.length]
            gl.uniform1i gl.getUniformLocation(prog, tex_uniforms[i]), i

        # TODO: only ~half of those vars are present
        for i, lamp_data of lamps
            @lamps.push([
                @scene.objects[i],
                gl.getUniformLocation(prog, lamp_data.varpos),
                gl.getUniformLocation(prog, lamp_data.varcolor3),
                gl.getUniformLocation(prog, lamp_data.varcolor4),
                gl.getUniformLocation(prog, lamp_data.dist),
                gl.getUniformLocation(prog, lamp_data.vardir),
                gl.getUniformLocation(prog, lamp_data.varmat),
                gl.getUniformLocation(prog, lamp_data.varenergy),
            ])

        @_program = prog
        @context.render_manager.compiled_shaders_this_frame += 1


    use: ->
        prog = @_program
        if _active_program != prog
            @context.render_manager.gl.useProgram prog
        return prog

    reupload: ->
        @constructor(@name, @fs_code,
        @uniforms_config, @attributes_config, @vs_code, @scene)

    destroy: ->
        @context.render_manager.gl.deleteProgram @_program

    debug_set_uniform: (utype, uname, value)->
        # Use only for debugging purposes!
        # Examples:
        # debug_set_uniform '1f', 'some_uniform', 3.0
        # debug_set_uniform '4fv', 'some_uniform', [1,2,3,4]
        @context.render_manager.gl.useProgram @_program
        loc = @context.render_manager.gl.getUniformLocation @_program, uname
        @context.render_manager.gl['uniform'+utype](loc, value)

    debug_set_custom_uniform: (utype, index, value)->
        @context.render_manager.gl.useProgram @_program
        @context.render_manager.gl['uniform'+utype](@u_custom[index], value)

    clone_to_scene: (scene)->
        # The only reason we have for cloning a material is to change the lamps
        # to the ones of a different scene. And you can only do it if there are
        # lamps of the same type in the target scene.
        dest_scene_lamps = scene.lamps[...]
        cloned = scene.materials[@name] = Object.create @
        lamps = cloned.lamps = []
        for l in @lamps
            # First we clone the lamp reference and properties...
            l = l[...]
            # ...then we find an appropiate lamp
            if l[0]
                for dlamp in dest_scene_lamps
                    if dlamp.lamp_type == l[0].lamp_type
                        # console.log 'found matching lamp', dlamp.name, l[0].name
                        l[0] = dlamp
                        dest_scene_lamps.remove dlamp
                        break
            lamps.push l
            # If matches weren't found, fat chance. We're not warning.

        return cloned

module.exports = {load_material, load_textures_of_material, Material}
