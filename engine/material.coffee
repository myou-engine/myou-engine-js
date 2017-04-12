{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'

{fetch_texture_legacy, material_promises} = require './fetch_assets.coffee'

# http://www.blender.org/documentation/blender_python_api_2_65_release/gpu.html

_active_program = null

console_error = console.error.bind(console)

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
        @uniforms =
            diffcol: null
            diffint: null
            speccol: null
            specint: null
            hardness: null
            emit: null
            alpha: null
        @vars =
            diffcol: ""
            diffint: ""
            speccol: ""
            specint: ""
            hardness: ""
            emit: ""
            alpha: ""

GL_BYTE = 0x1400
GL_UNSIGNED_BYTE = 0x1401
GL_SHORT = 0x1402
GL_UNSIGNED_SHORT = 0x1403
GL_INT = 0x1404
GL_UNSIGNED_INT = 0x1405
GL_FLOAT = 0x1406
attr_types = {'f': GL_FLOAT, 'b': GL_BYTE, 'B': GL_UNSIGNED_BYTE, 'H': GL_UNSIGNED_SHORT,}

class Material
    constructor: (@context, @name, @data, @scene) ->
        @shaders = []
        @users = []
        @scene?.materials[@name] = this
        @set_data @data
        @last_shader = null # TODO: workaround for short term compatibility problems

    get_shader: (mesh) ->
        if not mesh._signature
            mesh.ensure_layout_and_modifiers()
        shader = @shaders[mesh._signature]
        if not shader?
            shader = @shaders[mesh._signature] = new Shader(@context, @data, @scene, mesh.layout, mesh.vertex_modifiers)
            shader.material = this
            @last_shader = shader
        return shader

    set_data: (@data) ->
        @inputs = {}
        @_input_list = []
        for u in @data?.uniforms or [] when u.type == -1
            path = u.path or u.index
            value = if u.value.length? then new Float32Array(u.value) else u.value
            @_input_list.push @inputs[path] = {value, type: u.count}
        @animation_strips = @data?.animation_strips
        return


id = 0

class Shader
    # TODO: These comments are obsolete, but still somewhat useful.
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
    #             here, it must be defined in scene.textures
    #   }
    #   Data type of each uniform is inferred from the type or the custom value.
    # * varyings: list of varyings, TODO. See loader.coffee:93
    constructor: (@context, @data, @scene, @layout, vertex_modifiers) ->
        @id = id++
        if @context.all_materials.indexOf(@) == -1
            @context.all_materials.push @
        {@name, uniforms, varyings, params=[]} = @data
        @shading_params_dict = {}
        @shading_params = for p in params
            @shading_params_dict[p.name] = new ShadingParams p
        gl = @context.render_manager.gl
        @textures = []
        tex_uniforms = []
        lamps = {} # lamp_name: {varpos, varcolor3, varcolor4, dist}
        @lamps = []  # [[lamp, varpos, varcolor3, varcolor4, dist], ...]
        @is_shadow_material = false  # actually not used
        @users = []
        @group_id = -1
        @double_sided = Boolean @data.double_sided
        @material = null

        var_model_view_matrix = "model_view_matrix"
        var_inv_model_view_matrix = ""
        var_object_matrix = ""
        var_inv_object_matrix = ""
        var_color = ""
        var_ambient = ""
        var_mistcol = ""
        var_mistdist = ""
        var_mistenable = ""
        var_mistint = ""
        var_miststart = ""
        var_misttype = ""
        var_custom = []
        zero_var = []
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
                    tex = @scene?.textures[u.image]
                    if not tex?
                        if not u.filepath
                            throw "Texture #{u.image} not found (in material #{@name})."
                        tex = texture.get_texture_from_path_legacy u.image,
                            u.filepath, u.filter, u.wrap, u.size, @scene or @context
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
                    @shading_params_dict[u.material].vars.diffcol = u.varname
                when GPU_DYNAMIC_MAT_REF
                    @shading_params_dict[u.material].vars.diffint = u.varname
                when GPU_DYNAMIC_MAT_SPECRGB
                    @shading_params_dict[u.material].vars.speccol = u.varname
                when GPU_DYNAMIC_MAT_SPEC
                    @shading_params_dict[u.material].vars.specint = u.varname
                when GPU_DYNAMIC_MAT_HARD
                    @shading_params_dict[u.material].vars.hardness = u.varname
                when GPU_DYNAMIC_MAT_EMIT
                    @shading_params_dict[u.material].vars.emit = u.varname
                when GPU_DYNAMIC_MAT_ALPHA
                    @shading_params_dict[u.material].vars.alpha = u.varname
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
                when -1 # custom
                    var_custom.push u.varname
                when undefined # custom
                    var_custom.push u.varname
                else
                    if u.datatype < 6
                        zero_var.push {
                            name: u.varname
                            type: ['0','1i','1f','2fv','3fv','4fv'][u.datatype]
                            data: [0,0,0,[0,0],[0,0,0],[0,0,0,0]][u.datatype]}
                    # console.log u
                    console.log "Warning: unknown uniform", u.varname, \
                        u.type, "of data type", \
                        ['0','1i','1f','2f','3f','4f','m3','m4','4ub'][u.datatype]

        if @data.vertex
            vs = @data.vertex
        else
            {has_normal=true} = @data

            vs_head = ["""
            #ifdef GL_ES
            precision highp float;
            precision highp int;
            #endif
            uniform mat4 """+var_model_view_matrix+""";
            uniform mat4 projection_matrix;
            uniform mat3 normal_matrix;
            uniform float shape_multiplier;
            uniform vec4 uv_rect;"""]

            #count_to_type = ['','float','vec2','vec3','vec4',
            #    '','','','','mat3','','','','','','','mat4']

            attribute_names = []
            attribute_lines = for {name, count} in @layout
                attribute_names.push name
                "attribute vec#{count} #{name};"

            modifiers_uniforms = []
            modifiers_bodies = []
            for m in vertex_modifiers
                {uniform_lines, body_lines} = m.get_code()
                modifiers_uniforms = modifiers_uniforms.concat uniform_lines
                modifiers_bodies = modifiers_bodies.concat body_lines

            varyings_decl = []
            varyings_assign = []
            for v in varyings or []
                {varname} = v
                switch v.type
                    when 'VIEW_POSITION' # Position relative to the camera
                        varyings_decl.push "varying vec3 #{varname};"
                        varyings_assign.push "#{varname} = view_co.xyz;"
                    when 'PROJ_POSITION' # Position relative to screen with 4th component
                        varyings_decl.push "varying vec4 #{varname};"
                        varyings_assign.push "#{varname} = proj_co;"
                    when 'VIEW_NORMAL' # Normal relative to the camera
                        varyings_decl.push "varying vec3 #{varname};"
                        varyings_assign.push "#{varname} = normalize(normal_matrix * normal);"
                    when 'UV' # UV layer
                        uv_name = 'uv_' + v.attname
                        if uv_name not in attribute_names
                            # When the UV doesn't exist or is empty, we just use the first
                            # layer in the list or a null vector
                            uv_name = 'vec2(0.0)'
                            for aname in attribute_names when /^uv_/.test aname
                                uv_name = aname
                                break
                        varyings_decl.push "varying vec2 #{varname};"
                        varyings_assign.push "#{varname} = #{uv_name} * uv_rect.zw + uv_rect.xy;"
                    when 'VCOL' # Vertex color
                        vc_name = 'vc_' + v.attname
                        if vc_name not in attribute_names
                            vc_name = 'vec4(0.0)'
                            for aname in attribute_names when /^vc_/.test aname
                                vc_name = aname
                                break
                        varyings_decl.push "varying vec4 #{varname};"
                        varyings_assign.push "#{varname} = #{vc_name}/255.0;"
                    when 'TANGENT' # tangent vectors
                        varyings_decl.push "varying vec4 #{varname};"
                        if 'tangent' in attribute_names
                            varyings_assign.push "#{varname}.xyz = normalize((#{var_model_view_matrix}*vec4(tangent.xyz,0)).xyz);"
                            varyings_assign.push "#{varname}.w = tangent.w;"
                        else
                            console.error "Material #{@name} expects tangents, mesh doesn't have any"
                            varyings_assign.push "#{varname}.xyz = normalize(vnormal);"
                            varyings_assign.push "#{varname}.w = 1.0;"

                    when 'ORCO'
                        # original coordinates or "generated", relative to the bounding box of the mesh
                        modifiers_uniforms.push "uniform vec3 mesh_center, mesh_inv_dimensions;"
                        modifiers_bodies.unshift "vec3 orco = (co.xyz - mesh_center) * mesh_inv_dimensions;"
                        varyings_decl.push "varying vec3 #{varname};"
                        varyings_assign.push "#{varname} = orco.xyz;"
                    else
                        console.warn "Warning: unknown varying type #{v.type}"

            vs_body = [
                'void main(){'
                "vec4 co = vec4(vertex, 1.0);"
                "vec3 normal = vnormal;"
                modifiers_bodies...
                "vec4 view_co = #{var_model_view_matrix} * co;"
                "vec4 proj_co = projection_matrix * view_co;"
                varyings_assign...
                "gl_Position = proj_co;\n}"
            ].join('\n  ')

            vs = vs_head.concat(
                attribute_lines, modifiers_uniforms, varyings_decl, vs_body
            ).join '\n'

        @vs_code = vs

        vertex_shader = gl.createShader gl.VERTEX_SHADER
        gl.shaderSource vertex_shader, vs
        gl.compileShader vertex_shader

        if not gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS) and not gl.isContextLost()
            i=0
            console.log vs.replace(/^/mg, (d)->++i+' ')
            error_msg = """Error compiling vertex shader of material #{@name}
            #{gl.getShaderInfoLog vertex_shader}"""
            # ext = gl.getExtension "WEBGL_debug_shaders"
            # if ext
            #     console.log  '\n' + ext.getTranslatedShaderSource(vertex_shader)).split('\n')
            gl.deleteShader vertex_shader
            @context.MYOU_PARAMS.on_shader_failed?()
            (material_promises[@name]?.functions.reject or console_error)(error_msg)
            debugger
            return

        @fs_code = @data.fragment
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
            @context.MYOU_PARAMS.on_shader_failed?()
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
            @context.MYOU_PARAMS.on_shader_failed?()
            (material_promises[@name]?.functions.reject or console_error)(error_msg)
            return

        gl.useProgram prog
        @u_model_view_matrix = gl.getUniformLocation prog, var_model_view_matrix
        @u_projection_matrix = gl.getUniformLocation prog, "projection_matrix"
        @u_normal_matrix = gl.getUniformLocation prog, "normal_matrix"
        @u_uv_rect = gl.getUniformLocation prog, "uv_rect"
        @u_group_id = gl.getUniformLocation prog, "group_id"
        @u_mesh_id = gl.getUniformLocation prog, "mesh_id"
        @u_uv_rect? and gl.uniform4f @u_uv_rect, 0, 0, 1, 1

        # these getUniformLocation may yield null
        @u_inv_model_view_matrix = gl.getUniformLocation prog, var_inv_model_view_matrix
        @u_var_object_matrix = gl.getUniformLocation prog, var_inv_object_matrix
        @u_var_inv_object_matrix = gl.getUniformLocation prog, var_inv_object_matrix
        @u_color = gl.getUniformLocation prog, var_color
        @u_mesh_center = gl.getUniformLocation prog, "mesh_center"
        @u_mesh_inv_dimensions = gl.getUniformLocation prog, "mesh_inv_dimensions"
        @u_color = gl.getUniformLocation prog, var_color
        @u_fb_size = gl.getUniformLocation prog, "fb_size"
        @u_ambient = gl.getUniformLocation prog, var_ambient
        for params in @shading_params
            params.uniforms.diffcol = gl.getUniformLocation prog, params.vars.diffcol
            params.uniforms.diffint = gl.getUniformLocation prog, params.vars.diffint
            params.uniforms.speccol = gl.getUniformLocation prog, params.vars.speccol
            params.uniforms.specint = gl.getUniformLocation prog, params.vars.specint
            params.uniforms.hardness = gl.getUniformLocation prog, params.vars.hardness
            params.uniforms.emit = gl.getUniformLocation prog, params.vars.emit
            params.uniforms.alpha = gl.getUniformLocation prog, params.vars.alpha

        @u_mistcol = gl.getUniformLocation prog, var_mistcol
        @u_mistdist = gl.getUniformLocation prog, var_mistdist
        @u_mistenable = gl.getUniformLocation prog, var_mistenable
        @u_mistint = gl.getUniformLocation prog, var_mistint
        @u_miststart = gl.getUniformLocation prog, var_miststart
        @u_misttype = gl.getUniformLocation prog, var_misttype
        if @u_mistenable?
            gl.uniform1f @u_mistenable, 0

        @modifier_data_store = for m in vertex_modifiers
            m.get_data_store gl, prog

        @u_custom = []
        for v in var_custom
            @u_custom.push gl.getUniformLocation(prog, v)
        for v in zero_var
            gl['uniform'+v.type](gl.getUniformLocation(prog, v.name), v.data)

        fb = @context.render_manager.common_filter_fb
        if fb and @u_fb_size?
            gl.uniform2f @u_fb_size, fb.size_x, fb.size_y

        # vertexAttribPointers:
        # [location, number of components, GL type, offset]
        @attrib_pointers = attrib_pointers = []
        attrib_bitmask = 0
        for {name, count, type, offset} in @layout
            loc = gl.getAttribLocation(prog, name)|0
            if loc != -1
                attrib_pointers.push [loc, count, attr_types[type], offset]
                attrib_bitmask |= 1<<loc
        @attrib_bitmask = attrib_bitmask

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
        @constructor(@context, @data, @scene)

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

    debug_blender_material: (varnum) ->
        if not @fs_code.splice
            throw "Not a Blender material"
        [lib, code] = @orig_fs_code = @orig_fs_code or @fs_code[...]
        re = new RegExp("\\btmp#{varnum}\\b", "g")
        value = "tmp#{varnum}.x"
        if re.test code
            for line in code.split('\n') when re.test line
                if line.length < 15
                    if /float/.test line
                        value = "tmp#{varnum}"
                else
                    console.log line.replace(re, "TMP"+varnum)
            @fs_code[1] = code.replace('gl_FragColor = ',
                "gl_FragColor = vec4(-#{value}, #{value}, #{value}*10.0-5.0, 1.0);//")
            @reupload()
        else
            console.log "No such variable"
        return



module.exports = {Material, Shader,
GPU_DYNAMIC_AMBIENT_COLOR,
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
