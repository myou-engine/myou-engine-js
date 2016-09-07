{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'

{fetch_texture_legacy, material_promises} = require './fetch_assets.coffee'

# http://www.blender.org/documentation/blender_python_api_2_65_release/gpu.html

_active_program = null

console_error = console.error.bind(console)

gpu_constants =
 '0': 'GPU_DYNAMIC_NONE',
 '131072': 'GPU_DYNAMIC_GROUP_LAMP',
 '131073': 'GPU_DYNAMIC_LAMP_DYNVEC',
 '131074': 'GPU_DYNAMIC_LAMP_DYNCO',
 '131075': 'GPU_DYNAMIC_LAMP_DYNIMAT',
 '131076': 'GPU_DYNAMIC_LAMP_DYNPERSMAT',
 '131077': 'GPU_DYNAMIC_LAMP_DYNENERGY',
 '131078': 'GPU_DYNAMIC_LAMP_DYNCOL',
 '131079': 'GPU_DYNAMIC_LAMP_DISTANCE',
 '131080': 'GPU_DYNAMIC_LAMP_ATT1',
 '131081': 'GPU_DYNAMIC_LAMP_ATT2',
 '131082': 'GPU_DYNAMIC_LAMP_SPOTSIZE',
 '131083': 'GPU_DYNAMIC_LAMP_SPOTBLEND',
 '131084': 'GPU_DYNAMIC_LAMP_SPOTSCALE',
 '196608': 'GPU_DYNAMIC_GROUP_OBJECT',
 '196609': 'GPU_DYNAMIC_OBJECT_VIEWMAT',
 '196610': 'GPU_DYNAMIC_OBJECT_MAT',
 '196611': 'GPU_DYNAMIC_OBJECT_VIEWIMAT',
 '196612': 'GPU_DYNAMIC_OBJECT_IMAT',
 '196613': 'GPU_DYNAMIC_OBJECT_COLOR',
 '196614': 'GPU_DYNAMIC_OBJECT_AUTOBUMPSCALE',
 '196615': 'GPU_DYNAMIC_OBJECT_LOCTOVIEWMAT',
 '196616': 'GPU_DYNAMIC_OBJECT_LOCTOVIEWIMAT',
 '262144': 'GPU_DYNAMIC_GROUP_SAMPLER',
 '262145': 'GPU_DYNAMIC_SAMPLER_2DBUFFER',
 '262146': 'GPU_DYNAMIC_SAMPLER_2DIMAGE',
 '262147': 'GPU_DYNAMIC_SAMPLER_2DSHADOW',
 '327680': 'GPU_DYNAMIC_GROUP_MIST',
 '327681': 'GPU_DYNAMIC_MIST_ENABLE',
 '327682': 'GPU_DYNAMIC_MIST_START',
 '327683': 'GPU_DYNAMIC_MIST_DISTANCE',
 '327684': 'GPU_DYNAMIC_MIST_INTENSITY',
 '327685': 'GPU_DYNAMIC_MIST_TYPE',
 '327686': 'GPU_DYNAMIC_MIST_COLOR',
 '393216': 'GPU_DYNAMIC_GROUP_WORLD',
 '393217': 'GPU_DYNAMIC_HORIZON_COLOR',
 '393218': 'GPU_DYNAMIC_AMBIENT_COLOR',
 '393219': 'GPU_DYNAMIC_ZENITH_COLOR',
 '458752': 'GPU_DYNAMIC_GROUP_MAT',
 '458753': 'GPU_DYNAMIC_MAT_DIFFRGB',
 '458754': 'GPU_DYNAMIC_MAT_REF',
 '458755': 'GPU_DYNAMIC_MAT_SPECRGB',
 '458756': 'GPU_DYNAMIC_MAT_SPEC',
 '458757': 'GPU_DYNAMIC_MAT_HARD',
 '458758': 'GPU_DYNAMIC_MAT_EMIT',
 '458759': 'GPU_DYNAMIC_MAT_AMB',
 '458760': 'GPU_DYNAMIC_MAT_ALPHA',
 '65536': 'GPU_DYNAMIC_GROUP_MISC',

CD_MCOL = 6
CD_MTFACE = 5
CD_ORCO = 14
CD_TANGENT = 18
CD_SHAPE_KEY = 99 # not supplied by blender but by the export script
CD_ARMATURE_DEFORM = 88 # not supplied by blender but by the export script
CD_ARMATURE_DEFORM_6 = 86 # not supplied by blender but by the export script
GPU_DATA_1I = 1
GPU_DATA_1F = 2
GPU_DATA_2F = 3
GPU_DATA_3F = 4
GPU_DATA_4F = 5
GPU_DATA_9F = 6
GPU_DATA_16F = 7
GPU_DATA_4UB = 8
GPU_DYNAMIC_AMBIENT_COLOR = 393218
GPU_DYNAMIC_GROUP_LAMP = 131072
GPU_DYNAMIC_GROUP_MAT = 458752
GPU_DYNAMIC_GROUP_MISC = 65536
GPU_DYNAMIC_GROUP_MIST = 327680
GPU_DYNAMIC_GROUP_OBJECT = 196608
GPU_DYNAMIC_GROUP_SAMPLER = 262144
GPU_DYNAMIC_GROUP_WORLD = 393216
GPU_DYNAMIC_HORIZON_COLOR = 393217
#                                            point   sun    spot   hemi   area
GPU_DYNAMIC_LAMP_ATT1 = 131080          #
GPU_DYNAMIC_LAMP_ATT2 = 131081          #
GPU_DYNAMIC_LAMP_DISTANCE = 131079      #      X             X
GPU_DYNAMIC_LAMP_DYNCO = 131074         #      X             X             X
GPU_DYNAMIC_LAMP_DYNCOL = 131078        #      X      X      X      X      X
GPU_DYNAMIC_LAMP_DYNENERGY = 131077     #      X      X      X      X      X
GPU_DYNAMIC_LAMP_DYNIMAT = 131075       #                    X
GPU_DYNAMIC_LAMP_DYNPERSMAT = 131076    #             X      X
GPU_DYNAMIC_LAMP_DYNVEC = 131073        #             X      X      X      X
GPU_DYNAMIC_LAMP_SPOTBLEND = 131083     #                 missing?
GPU_DYNAMIC_LAMP_SPOTSCALE = 131084     #                    X
GPU_DYNAMIC_LAMP_SPOTSIZE = 131082      #                    X
GPU_DYNAMIC_MAT_ALPHA = 458760
GPU_DYNAMIC_MAT_AMB = 458759
GPU_DYNAMIC_MAT_DIFFRGB = 458753
GPU_DYNAMIC_MAT_EMIT = 458758
GPU_DYNAMIC_MAT_HARD = 458757
GPU_DYNAMIC_MAT_REF = 458754
GPU_DYNAMIC_MAT_SPEC = 458756
GPU_DYNAMIC_MAT_SPECRGB = 458755
GPU_DYNAMIC_MIST_COLOR = 327686
GPU_DYNAMIC_MIST_DISTANCE = 327683
GPU_DYNAMIC_MIST_ENABLE = 327681
GPU_DYNAMIC_MIST_INTENSITY = 327684
GPU_DYNAMIC_MIST_START = 327682
GPU_DYNAMIC_MIST_TYPE = 327685
GPU_DYNAMIC_NONE = 0
GPU_DYNAMIC_OBJECT_AUTOBUMPSCALE = 196614
GPU_DYNAMIC_OBJECT_COLOR = 196613
GPU_DYNAMIC_OBJECT_IMAT = 196612
GPU_DYNAMIC_OBJECT_LOCTOVIEWIMAT = 196616
GPU_DYNAMIC_OBJECT_LOCTOVIEWMAT = 196615
GPU_DYNAMIC_OBJECT_MAT = 196610
GPU_DYNAMIC_OBJECT_VIEWIMAT = 196611
GPU_DYNAMIC_OBJECT_VIEWMAT = 196609
GPU_DYNAMIC_SAMPLER_2DBUFFER = 262145
GPU_DYNAMIC_SAMPLER_2DIMAGE = 262146
GPU_DYNAMIC_SAMPLER_2DSHADOW = 262147
GPU_DYNAMIC_ZENITH_COLOR = 393219

class ShadingParams
    constructor: (params) ->
        @diffuse_color = vec3.clone(params.diffuse_color)
        @diffuse_intensity = params.diffuse_intensity
        @specular_color = vec3.clone(params.specular_color)
        @specular_intensity = params.specular_intensity
        @specular_hardness = params.specular_hardness
        @emit = params.emit
        @alpha = params.alpha

class Material
    # data is an object with:
    # * vertex: string with vertex shader code
    #       (optional, auto generated here for blender materials)
    # * fragment: string with vertex shader code,
    #       or list of strings (concatenated here)
    # * uniforms: list of uniforms, each have this format:
    #   {
    #       varname: name of GLSL variable
    #       type: (optional) supply a GPU_DYNAMIC_* constant
    #             to have it assigned to some scene parameter
    #             Otherwise, mesh.custom_uniform_values will be used instead.
    #       image: If type is GPU_DYNAMIC_SAMPLER_2DIMAGE, put the texture name
    #             here, it must be defined in context.textures
    #   }
    #   Data type of each uniform is inferred from the type or the custom value.
    # * attributes: list of vertex attributes, each have this format:
    #   {
    #       varname: name of GLSL variable
    #       type: one of these:
    #        * CD_MTFACE: Texture UV coordinates, vec2
    #        * CD_MCOL: Vertex color, vec4
    #        * CD_TANGENT: Vertex tangent vector (for normal mapping), vec4
    #        * there are more types but of limited use outside Blender for now
    #   }
    #   There are two implicit vec3 attributes: vertex, vnormal.
    constructor: (@context, data, @scene) ->
        if @context.all_materials.indexOf(@) == -1
            @context.all_materials.push @
        {@name, uniforms, attributes, params=[]} = data
        @shading_params = for p in params
            new ShadingParams p
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
        @double_sided = not not data.double_sided

        var_model_view_matrix = "model_view_matrix"
        var_inv_model_view_matrix = ""
        var_object_matrix = ""
        var_inv_object_matrix = ""
        var_color = ""
        var_strand = ""
        var_strand_type = "float"
        var_ambient = ""
        var_diffcol = ""
        var_diffint = ""
        var_speccol = ""
        var_specint = ""
        var_hardness = ""
        var_emit = ""
        var_alpha = ""
        var_mistcol = ""
        var_mistdist = ""
        var_mistenable = ""
        var_mistint = ""
        var_miststart = ""
        var_misttype = ""
        var_custom = []
        last_lamp = null

        for u in uniforms or []
            # Magic numbers correspond to the old values of blender constants
            switch u.type
                # when it's a lamp, have "l" ready
                when 6, 7, 9, 10, 11, 16, \
                    GPU_DYNAMIC_LAMP_DYNVEC, GPU_DYNAMIC_LAMP_DYNCO, \
                    GPU_DYNAMIC_LAMP_DYNPERSMAT, GPU_DYNAMIC_LAMP_DYNENERGY, \
                    GPU_DYNAMIC_LAMP_DYNCOL, GPU_DYNAMIC_LAMP_DISTANCE
                        if not u.lamp?
                            # From a buggy Blender version
                            if not last_lamp?
                                throw "A too buggy version of Blender was used"
                            u.lamp = last_lamp
                        last_lamp = u.lamp
                        l = lamps[u.lamp] or {
                            vardir:'', varpos:'', varmat:''
                            varcolor3:'', varcolor4:'', dist:''
                            }
                        lamps[u.lamp] = l
            switch u.type
                when 1, GPU_DYNAMIC_OBJECT_VIEWMAT # model_view_matrix
                    var_model_view_matrix = u.varname
                when 2, GPU_DYNAMIC_OBJECT_MAT # object_matrix
                    var_object_matrix = u.varname
                when 3, GPU_DYNAMIC_OBJECT_VIEWIMAT # inverse model_view_matrix
                    var_inv_model_view_matrix = u.varname
                when 4, GPU_DYNAMIC_OBJECT_IMAT # inverse object_matrix
                    var_inv_object_matrix = u.varname
                when 5, GPU_DYNAMIC_OBJECT_COLOR # object color
                    var_color = u.varname
                when 6, GPU_DYNAMIC_LAMP_DYNVEC # lamp direction in camera space
                    l.vardir = u.varname
                when 7, GPU_DYNAMIC_LAMP_DYNCO # lamp position in camera space
                    l.varpos = u.varname
                when 9, GPU_DYNAMIC_LAMP_DYNPERSMAT # camera to lamp shadow matrix
                    l.varmat = u.varname
                when 10, GPU_DYNAMIC_LAMP_DYNENERGY # lamp energy
                    l.varenergy = u.varname
                when 11, GPU_DYNAMIC_LAMP_DYNCOL # lamp color
                    if u.datatype == 4 # vec3
                        l.varcolor3 = u.varname
                    else # vec4
                        l.varcolor4 = u.varname
                when 16, GPU_DYNAMIC_LAMP_DISTANCE # lamp falloff distance
                    l.dist = u.varname
                # MISSING:
                # GPU_DYNAMIC_LAMP_SPOTSIZE = 19,
                # GPU_DYNAMIC_LAMP_SPOTBLEND = 20,
                # GPU_DYNAMIC_SAMPLER_2DBUFFER = 12,
                # And 15 was distance wrongly, it's GPU_DYNAMIC_OBJECT_AUTOBUMPSCALE
                when 14, GPU_DYNAMIC_SAMPLER_2DSHADOW
                    @textures.push @scene.objects[u.lamp].shadow_texture
                    tex_uniforms.push u.varname
                when 13, GPU_DYNAMIC_SAMPLER_2DIMAGE, GPU_DYNAMIC_SAMPLER_2DBUFFER # 2D image
                    if not u.image?
                        # This means sampler defined elsewhere (in compositor)
                        tex_uniforms.push u.varname
                        continue
                    tex = @context.textures[u.image]
                    if not tex?
                        if not u.filepath
                            throw "Texture #{u.image} not found (in material #{@name})."
                        tex = texture.get_texture_from_path_legacy u.image,
                            u.filepath, u.filter, u.wrap, u.size, @context
                    # Defaults to texture stored settings
                    {wrap=tex.wrap, filter=tex.filter, use_mipmap=tex.use_mipmap} = u
                    # Check for mismatch between material textures and warn about it
                    if tex.users.length != 0 and \
                            (tex.wrap != wrap or tex.filter != filter or
                            tex.use_mipmap != use_mipmap)
                        other_mat = tex.users[tex.users.length-1]
                        console.warn "Texture #{u.image} have different settings
                            in materials #{other_mat.name} and #{@name}"
                    # Overwrite settings
                    tex.wrap = wrap
                    tex.filter = filter
                    tex.use_mipmap = use_mipmap
                    if not tex.loaded
                        tex.load()
                    @textures.push tex
                    tex.users.push @
                    tex_uniforms.push u.varname
                when GPU_DYNAMIC_AMBIENT_COLOR
                    var_ambient = u.varname
                when GPU_DYNAMIC_MAT_DIFFRGB
                    var_diffcol = u.varname
                when GPU_DYNAMIC_MAT_REF
                    var_diffint = u.varname
                when GPU_DYNAMIC_MAT_SPECRGB
                    var_speccol = u.varname
                when GPU_DYNAMIC_MAT_SPEC
                    var_specint = u.varname
                when GPU_DYNAMIC_MAT_HARD
                    var_hardness = u.varname
                when GPU_DYNAMIC_MAT_EMIT
                    var_emit = u.varname
                when GPU_DYNAMIC_MAT_ALPHA
                    var_alpha = u.varname
                when GPU_DYNAMIC_MIST_COLOR
                    var_mistcol = u.varname
                when GPU_DYNAMIC_MIST_DISTANCE
                    var_mistdist = u.varname
                when GPU_DYNAMIC_MIST_ENABLE
                    var_mistenable = u.varname
                when GPU_DYNAMIC_MIST_INTENSITY
                    var_mistint = u.varname
                when GPU_DYNAMIC_MIST_START
                    var_miststart = u.varname
                when GPU_DYNAMIC_MIST_TYPE
                    var_misttype = u.varname
                when 77 # position in strand (0-1)
                    var_strand = u.varname
                    var_strand_type = u.gltype
                when -1 # custom
                    var_custom.push u.varname
                when undefined # custom
                    var_custom.push u.varname
                else
                    console.log u
                    console.log "Warning: unknown uniform", u.varname, \
                        gpu_constants[u.type] or u.type, "of data type", \
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

        for a in attributes or []
            v = 'var' + a.varname[3...]
            switch a.type
                when CD_MTFACE # UV layer
                    @uv_layer_attribs[a.name] = a.varname
                    attribute_decl += "attribute vec2 "+a.varname+";\n"\
                        +"varying vec2 "+v+";\n"
                    attribute_asgn += v+"="+a.varname+"*uv_multiplier;\n"
                    @attrib_locs[a.varname] = -1
                when CD_MCOL # Vertex color
                    @color_attribs[a.name] = a.varname
                    attribute_decl += "attribute vec4 "+a.varname+";\n"\
                        +"varying vec4 "+v+";\n"
                    attribute_asgn += v+"="+a.varname+";\n"
                    @attrib_locs[a.varname] = -1
                when CD_TANGENT # tangent vectors
                    attribute_decl += "attribute vec4 tangent;\n"\
                        +"varying vec4 "+v+";\n"
                    #attribute_asgn += v+".xyz = normalize("\
                        #+var_model_view_matrix+"*vec4(tangent,0.0)).xyz;\n"
                    attribute_asgn += v+".xyz = normalize(("+var_model_view_matrix+"*vec4(tangent.xyz,0)).xyz);\n"
                    attribute_asgn += v+".w = tangent.w;\n"
                    @attrib_locs['tangent'] = -1
                when CD_SHAPE_KEY # shape key
                    num_shapes = a.count
                    for i in [0...num_shapes]
                        attribute_decl += "attribute vec3 shape"+i+";\n"
                        attribute_decl += "attribute vec3 shapenor"+i+";\n"
                        @attrib_locs["shape"+i] = -1
                        @attrib_locs["shapenor"+i] = -1
                    uniform_decl += "uniform float shapef["+num_shapes+"];"
                when CD_ARMATURE_DEFORM # armature deform
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
                when CD_ARMATURE_DEFORM_6 # armature deform, 6 weights
                    num_bones = a.count
                    @num_bone_uniforms = num_bones
                    attribute_decl += "attribute vec4 weights;\n"
                    attribute_decl += "attribute vec4 weights2;\n"
                    attribute_decl += "attribute vec4 b_indices;\n"
                    attribute_decl += "attribute vec4 b_indices2;\n"
                    @attrib_locs["weights"] = -1
                    @attrib_locs["weights2"] = -1
                    @attrib_locs["b_indices"] = -1
                    @attrib_locs["b_indices2"] = -1
                    uniform_decl += "uniform mat4 bones["+@num_bone_uniforms+"];\n"
                    armature_deform_code = ("""
                    vec4 blendco = vec4(0);
                    vec3 blendnor = vec3(0);
                    mat4 m;
                    ivec4 inds = ivec4(b_indices);
                    for(int i=0; i<4; ++i){
                        m = bones[inds[i]];
                        blendco += m * co4 * weights[i];
                        blendnor += mat3(m[0].xyz, m[1].xyz, m[2].xyz) * normal * weights[i];
                    }
                    inds = ivec4(b_indices2);
                    for(int i=0; i<2; ++i){
                        m = bones[inds[i]];
                        blendco += m * co4 * weights2[i];
                        blendnor += mat3(m[0].xyz, m[1].xyz, m[2].xyz) * normal * weights2[i];
                    }
                    co4 = blendco; normal = blendnor;
                    """)
                when 77 # particle hair
                    if var_strand == ""
                        var_strand = "strand"
                    uniform_decl += "uniform "+var_strand_type+" "+var_strand+";\n"
                    num_particles = a.count
                    for i in [0...num_particles]
                        attribute_decl += "attribute vec3 particle"+i+";\n"
                        @attrib_locs["particle"+i] = -1
                when CD_ORCO
                    # original coordinates (TODO: divide by dimensions)
                    attribute_decl += "varying vec3 "+v+";\n"
                    attribute_asgn += v+" = co;\n"
                else
                    console.warn "Warning: unknown attribute type", a.type

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
                normal += n * max(0.0, shapef["""+i+"""]);
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
        @vs_code = vs = data.vertex or """
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
            error_msg = """Error compiling vertex shader of material #{@name}
            #{gl.getShaderInfoLog vertex_shader}"""
            # ext = gl.getExtension "WEBGL_debug_shaders"
            # if ext
            #     console.log  '\n' + ext.getTranslatedShaderSource(vertex_shader)).split('\n')
            gl.deleteShader vertex_shader
            (material_promises[@name]?.functions.reject or console_error)(error_msg)
            return

        @fs_code = data.fragment
        fragment_shader = gl.createShader gl.FRAGMENT_SHADER
        fs = if @fs_code.splice then @fs_code.join('') else @fs_code
        gl.shaderSource fragment_shader, fs
        gl.compileShader fragment_shader

        if not gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS) and not gl.isContextLost()
            error_msg = """Error compiling fragment shader of material #{@name}
            #{gl.getShaderInfoLog fragment_shader}"""
            console.log fs
            # ext = gl.getExtension "WEBGL_debug_shaders"
            # if ext
            #     console.log  '\n' + ext.getTranslatedShaderSource(fragment_shader)).split('\n')
            gl.deleteShader fragment_shader
            (material_promises[@name]?.functions.reject or console_error)(error_msg)
            return


        prog = gl.createProgram()
        gl.attachShader prog, vertex_shader
        gl.attachShader prog, fragment_shader
        gl.bindAttribLocation prog, 0, 'vertex'  # Ensure vertex is attrib 0
        gl.linkProgram prog

        if not gl.getProgramParameter(prog, gl.LINK_STATUS) and not gl.isContextLost()
            error_msg = """Error linking shader of material #{@name}
            #{JSON.stringify attributes}
            #{gl.getProgramInfoLog prog}"""
            #ext = gl.getExtension "WEBGL_debug_shaders"
            #if ext console.log ext.getTranslatedShaderSource vertex_shader
            console.log 'VS ============='
            console.log vs
            # console.log 'FS ============='
            # console.log fs
            console.log '================'
            gl.deleteProgram prog
            gl.deleteShader vertex_shader
            gl.deleteShader fragment_shader
            (material_promises[@name]?.functions.reject or console_error)(error_msg)
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
        @u_ambient = gl.getUniformLocation prog, var_ambient
        @u_diffcol = gl.getUniformLocation prog, var_diffcol
        @u_diffint = gl.getUniformLocation prog, var_diffint
        @u_speccol = gl.getUniformLocation prog, var_speccol
        @u_specint = gl.getUniformLocation prog, var_specint
        @u_hardness = gl.getUniformLocation prog, var_hardness
        @u_emit = gl.getUniformLocation prog, var_emit
        @u_alpha = gl.getUniformLocation prog, var_alpha
        @u_mistcol = gl.getUniformLocation prog, var_mistcol
        @u_mistdist = gl.getUniformLocation prog, var_mistdist
        @u_mistenable = gl.getUniformLocation prog, var_mistenable
        @u_mistint = gl.getUniformLocation prog, var_mistint
        @u_miststart = gl.getUniformLocation prog, var_miststart
        @u_misttype = gl.getUniformLocation prog, var_misttype
        if @u_mistenable?
            gl.uniform1f @u_mistenable, 0
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
        material_promises[@name]?.functions.resolve(@)
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

module.exports = {Material,
CD_MCOL, CD_MTFACE, CD_ORCO, CD_TANGENT, CD_SHAPE_KEY, CD_ARMATURE_DEFORM,
CD_ARMATURE_DEFORM_6, GPU_DATA_1I, GPU_DATA_1F, GPU_DATA_2F, GPU_DATA_3F,
GPU_DATA_4F, GPU_DATA_9F, GPU_DATA_16F, GPU_DATA_4UB, GPU_DYNAMIC_AMBIENT_COLOR,
GPU_DYNAMIC_GROUP_LAMP, GPU_DYNAMIC_GROUP_MAT, GPU_DYNAMIC_GROUP_MISC,
GPU_DYNAMIC_GROUP_MIST, GPU_DYNAMIC_GROUP_OBJECT, GPU_DYNAMIC_GROUP_SAMPLER,
GPU_DYNAMIC_GROUP_WORLD, GPU_DYNAMIC_HORIZON_COLOR, GPU_DYNAMIC_LAMP_ATT1,
GPU_DYNAMIC_LAMP_ATT2, GPU_DYNAMIC_LAMP_DISTANCE, GPU_DYNAMIC_LAMP_DYNCO,
GPU_DYNAMIC_LAMP_DYNCOL, GPU_DYNAMIC_LAMP_DYNENERGY, GPU_DYNAMIC_LAMP_DYNIMAT,
GPU_DYNAMIC_LAMP_DYNPERSMAT, GPU_DYNAMIC_LAMP_DYNVEC, GPU_DYNAMIC_LAMP_SPOTBLEND,
GPU_DYNAMIC_LAMP_SPOTSCALE, GPU_DYNAMIC_LAMP_SPOTSIZE, GPU_DYNAMIC_MAT_ALPHA,
GPU_DYNAMIC_MAT_AMB, GPU_DYNAMIC_MAT_DIFFRGB, GPU_DYNAMIC_MAT_EMIT,
GPU_DYNAMIC_MAT_HARD, GPU_DYNAMIC_MAT_REF, GPU_DYNAMIC_MAT_SPEC,
GPU_DYNAMIC_MAT_SPECRGB, GPU_DYNAMIC_MIST_COLOR, GPU_DYNAMIC_MIST_DISTANCE,
GPU_DYNAMIC_MIST_ENABLE, GPU_DYNAMIC_MIST_INTENSITY, GPU_DYNAMIC_MIST_START,
GPU_DYNAMIC_MIST_TYPE, GPU_DYNAMIC_NONE, GPU_DYNAMIC_OBJECT_AUTOBUMPSCALE,
GPU_DYNAMIC_OBJECT_COLOR, GPU_DYNAMIC_OBJECT_IMAT,
GPU_DYNAMIC_OBJECT_LOCTOVIEWIMAT, GPU_DYNAMIC_OBJECT_LOCTOVIEWMAT,
GPU_DYNAMIC_OBJECT_MAT, GPU_DYNAMIC_OBJECT_VIEWIMAT, GPU_DYNAMIC_OBJECT_VIEWMAT,
GPU_DYNAMIC_SAMPLER_2DBUFFER, GPU_DYNAMIC_SAMPLER_2DIMAGE,
GPU_DYNAMIC_SAMPLER_2DSHADOW, GPU_DYNAMIC_ZENITH_COLOR}
