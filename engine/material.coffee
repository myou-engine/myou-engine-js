
_active_program = null

BYTE = 0x1400
UNSIGNED_BYTE = 0x1401
SHORT = 0x1402
UNSIGNED_SHORT = 0x1403
INT = 0x1404
UNSIGNED_INT = 0x1405
FLOAT = 0x1406
attr_types = {'f': FLOAT, 'b': BYTE, 'B': UNSIGNED_BYTE, 'H': UNSIGNED_SHORT,}

{BlenderInternalMaterial} = require('./material_shaders/blender_internal')
{BlenderCyclesPBRMaterial} = require('./material_shaders/blender_cycles_pbr')
{PlainShaderMaterial} = require('./material_shaders/plain')

material_types =
    BLENDER_INTERNAL: BlenderInternalMaterial
    BLENDER_CYCLES_PBR: BlenderCyclesPBRMaterial
    PLAIN_SHADER: PlainShaderMaterial

NULL_SHADER = {_program: null}

class Material
    constructor: (@context, @name, @data, @scene) ->
        @shaders = {}
        @users = []
        @scene?.materials[@name] = this
        # Materials can be used in other scenes when cloning
        @render_scene = @scene
        @_has_texture_list_checked = false
        @shader_library = ''
        @set_data @data
        # TODO: workaround for short term compatibility problems; remove
        @last_shader = null
        # Store it in context.all_materials with unique name
        @_global_name = (@scene?.name or 'no_scene') + '.' + @name
        dedup = 0
        while @context.all_materials[@_global_name]
            @_global_name = (@scene?.name or 'no_scene') + '.' + @name + ++dedup
        @context.all_materials[@_global_name] = @

    get_shader: (mesh) ->
        if not mesh._signature
            mesh.ensure_layout_and_modifiers()
        shader = @shaders[mesh._signature]
        if not shader?
            if @generator?
                @get_texture_list()
                shader = @shaders[mesh._signature] = new Shader(@context, @data, @,
                    mesh.layout, mesh.vertex_modifiers, mesh.material_defines)
                shader.material = this
                @last_shader = shader
            else
                shader = @shaders[mesh._signature] = NULL_SHADER
        return shader

    set_data: (@data) ->
        @inputs = {}
        @_input_list = []
        @_texture_list = []
        @animation_strips = @data?.animation_strips
        @double_sided = Boolean @data?.double_sided
        @alpha_texture = null
        if @data?
            generator_class = material_types[@data.material_type]
            if not generator_class?
                return console.error "Material #{@name} has invalid
                    material type: #{@data.material_type}"
            # The constructor of the generator populates inputs and _input_list
            @generator = new generator_class(this)
        return

    # Ensures the texture list is correctly filled and returns it.
    # Only valid after the scene has finished loading.
    get_texture_list: ->
        if not @_has_texture_list_checked and @generator?
            @generator.assign_textures()
            for tex in @_texture_list when not tex.skip_load
                @alpha_texture = tex.value
                break
            @_has_texture_list_checked = true
        return @_texture_list

    # Initiates loading of the material and its textures,
    # returning a promise for when all has loaded
    # @option options fetch_textures [boolean]
    #       Whether to fetch textures when they're not loaded already.
    # @option options texture_size_ratio [number]
    #       Quality of textures specified in ratio of number of pixels.
    # @return [Promise]
    load: (options={}) ->
        {
            fetch_textures=true
            texture_size_ratio=null
            load_videos
        } = options
        # TODO: Have a material promise:
        # * Implement Material::ensure_upload(mesh) which generates a
        #   triangle with same layout if it doesn't exist already.
        # * ensure_upload will return a promise (stored in the shader).
        # * Draw it in a 2x2 px framebuffer for this purpose.
        # * Fulfill promise after this.
        promises = []
        if fetch_textures
            for {value, skip_load} in @get_texture_list()
                if not skip_load
                    promises.push value.load {size_ratio: texture_size_ratio, load_videos}
        return Promise.all(promises)

    clone_to_scene: (scene) ->
        n = new Material(@context, @name, @data, null)
        n.scene = @scene
        n.render_scene = scene
        # TODO: Handle lights of new scene
        return n

    # Deletes all shaders so they're re-generated when used
    delete_all_shaders: (destroy=true) ->
        if destroy
            for _,shader of @shaders
                shader.destroy()
        @shaders = {}
        @last_shader = null
        return

    destroy: ->
        for _,shader of @shaders
            shader.destroy()
        delete @context.all_materials[@_global_name]
        return


id = 0

class Shader
    constructor: (args...) ->
        @init args...

    init: (@context, @data, @material, @layout, modifiers, @defines) ->
        @id = id++
        {@name, varyings} = @data
        @shading_params_dict = {}
        {gl, is_webgl2} = @context.render_manager
        lamps = {} # lamp_name: {varpos, varcolor3, varcolor4, dist}
        @lamps = []  # [[lamp, varpos, varcolor3, varcolor4, dist], ...]
        @is_shadow_material = false  # actually not used
        @users = []
        @group_id = -1
        {@name} = @material if @material?
        generator = @material?.generator or new PlainShaderMaterial({@data})
        {fragment, glsl_version} = generator.get_code(@defines)
        @vertex_modifiers = modifiers

        if @data.vertex
            vs = @data.vertex
            var_model_view_matrix = 'model_view_matrix'
            var_projection_matrix = 'projection_matrix'
        else
            # TODO: use this
            {has_normal=true} = @data
            var_model_view_matrix = generator.get_model_view_matrix_name()
            var_projection_matrix = generator.get_projection_matrix_name()

            vs_head = ["""
            #ifdef GL_ES
            precision highp float;
            precision highp int;
            #endif
            uniform mat4 #{var_model_view_matrix};
            uniform mat4 #{var_projection_matrix};
            uniform mat3 normal_matrix;
            uniform vec4 uv_rect;"""]

            #count_to_type = ['','float','vec2','vec3','vec4',
            #    '','','','','mat3','','','','','','','mat4']

            attribute_names = []
            attribute_lines = for {name, count} in @layout
                attribute_names.push name
                "attribute vec#{count} #{name};"
            if 'vnormal' not in attribute_names
                attribute_lines.push 'const vec3 vnormal = vec3(0.0);'

            modifiers_uniforms = []
            modifiers_bodies = []
            modifiers_post_bodies = []
            required_extensions = {}
            for m in @vertex_modifiers
                {uniform_lines, body_lines, post_transform_lines, extensions} = m.get_code()
                modifiers_uniforms = modifiers_uniforms.concat uniform_lines
                modifiers_bodies = modifiers_bodies.concat body_lines
                modifiers_post_bodies = modifiers_post_bodies.concat post_transform_lines if post_transform_lines?
                for e in extensions ? []
                    required_extensions[e] = 1

            extension_lines = []
            for e of required_extensions
                extension_lines.push "#extension #{e} : require"

            varyings_decl = []
            varyings_assign = []
            first_uv = true
            for v in varyings or []
                {varname} = v
                switch v.type
                    when 'UNUSED'
                        varyings_decl.push "varying #{v.gltype} #{varname};"
                        val = v.gltype+'(0.0)'
                        varyings_assign.push "#{varname} = #{val};"
                    when 'VIEW_POSITION'
                        # Position relative to the camera
                        varyings_decl.push "varying vec3 #{varname};"
                        varyings_assign.push "#{varname} = view_co.xyz;"
                    when 'PROJ_POSITION'
                        # Position relative to screen with 4th component
                        varyings_decl.push "varying vec4 #{varname};"
                        varyings_assign.push "#{varname} = proj_co;"
                    when 'VIEW_NORMAL'
                        # Normal relative to the camera
                        varyings_decl.push "varying vec3 #{varname};"
                        varyings_assign.push "#{varname} =
                            normalize(normal_matrix * normal);"
                    when 'UV' # UV layer
                        uv_name = 'uv_' + v.attname
                        if uv_name not in attribute_names
                            # When the UV doesn't exist or is empty, we just use
                            # the first layer in the list or a null vector
                            uv_name = 'vec2(0.0)'
                            for aname in attribute_names when /^uv_/.test aname
                                uv_name = aname
                                break
                        gltype = 'vec2'
                        # # HACK for cycles image nodes in blender internal
                        # # TODO: make it not so hacky
                        # if this.data.fragment.indexOf(' vec3 '+varname+';') != -1
                        #     gltype = 'vec3'
                        #     uv_name = 'vec3('+uv_name+',1.)'
                        if first_uv and @data.force_uv_varname?
                            varname = @data.force_uv_varname
                        varyings_decl.push "varying #{gltype} #{varname};"
                        # varyings_assign.push "#{varname} = #{uv_name};"
                        # TODO: move to vertex modifier
                        varyings_assign.push "#{varname} =
                                    #{uv_name} * uv_rect.zw + uv_rect.xy;"
                        first_uv = false
                    when 'VCOL' # Vertex color
                        vc_name = 'vc_' + v.attname
                        if vc_name not in attribute_names
                            vc_name = 'vec4(0.0)'
                            for aname in attribute_names when /^vc_/.test aname
                                vc_name = aname
                                break
                        multiplier = ''
                        if v.multiplier
                            multiplier = "*#{v.multiplier.toFixed(8)}"
                        varyings_decl.push "varying vec4 #{varname};"
                        varyings_assign.push "#{varname} =
                                    #{vc_name}#{multiplier};"
                    when 'TANGENT' # tangent vectors
                        varyings_decl.push "varying vec4 #{varname};"
                        if 'tangent' in attribute_names
                            varyings_assign.push "#{varname}.xyz =
                                normalize((#{var_model_view_matrix}
                                    * vec4(tangent.xyz,0)).xyz);"
                            varyings_assign.push "#{varname}.w = tangent.w;"
                        else
                            console.error "Material #{@name} expects tangents,
                                mesh doesn't have any"
                            varyings_assign.push "#{varname}.xyz =
                                normalize(vnormal);"
                            varyings_assign.push "#{varname}.w = 1.0;"

                    when 'ORCO'
                        # original coordinates or "generated",
                        # relative to the bounding box of the mesh
                        modifiers_uniforms.push \
                            "uniform vec3 mesh_center, mesh_inv_dimensions;"
                        modifiers_bodies.unshift "vec3 orco =
                                (co.xyz - mesh_center) * mesh_inv_dimensions;"
                        varyings_decl.push "varying vec3 #{varname};"
                        varyings_assign.push "#{varname} = orco.xyz;"
                    else
                        console.warn "Warning: unknown varying type #{v.type}"

            vs_body = [
                'void main(){'
                "vec4 co = vec4(vertex, 1.0);"
                "vec3 normal = vnormal;"
                modifiers_bodies...
                (if @data.fixed_z?
                    # TODO: This is a bit too hacky!
                    # Shared uniforms should be handled better.
                    # This is used with the background mesh, it calculates the
                    # final position in screen, then the view coord from that
                    projection_matrix_inverse =
                        generator.get_projection_matrix_inverse_name()
                    modifiers_uniforms.push \
                        "uniform mat4 #{projection_matrix_inverse};"
                    [
                        "vec4 proj_co = vec4(co.xy,
                                    #{@data.fixed_z.toFixed(7)}, 1.0);"
                        "vec4 view_co = #{projection_matrix_inverse} * proj_co;"
                    ]
                else [
                    "vec4 view_co = #{var_model_view_matrix} * co;"
                    "vec4 proj_co = #{var_projection_matrix} * view_co;"
                ])...
                modifiers_post_bodies...
                varyings_assign...
                "gl_Position = proj_co;\n}"
            ].join('\n  ')

            vs = extension_lines.concat(
                vs_head, attribute_lines, modifiers_uniforms, varyings_decl, vs_body
            ).join '\n'

        if is_webgl2 and glsl_version == 300
            vs = '#version 300 es
                \n#define texture2D texture\n
                '+vs\
                .replace(/\battribute\b/g, 'in')\
                .replace(/\bvarying\b/g, 'out')\
                .replace('GL_OES_EGL_image_external', 'GL_OES_EGL_image_external_essl3')
        @vs_code = vs

        vertex_shader = gl.createShader gl.VERTEX_SHADER
        gl.shaderSource vertex_shader, vs
        gl.compileShader vertex_shader
        failed = not gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS)
        if failed and not gl.isContextLost()
            i=0
            console.log vs.replace(/^/mg, (d)->++i+' ')
            error_msg = """Error compiling vertex shader of material #{@name}
            #{gl.getShaderInfoLog vertex_shader}"""
            # ext = gl.getExtension "WEBGL_debug_shaders"
            # if ext
            #     translated = ext.getTranslatedShaderSource(vertex_shader))
            #     console.log  '\n' + translated.split('\n')
            gl.deleteShader vertex_shader
            @context.MYOU_PARAMS.on_shader_failed?()
            console.error error_msg
            return


        fragment_shader = gl.createShader gl.FRAGMENT_SHADER
        if @debugger?
            fragment = @debugger.patch fragment
        gl.shaderSource fragment_shader, fragment
        gl.compileShader fragment_shader
        failed = not gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS)
        if failed and not gl.isContextLost()
            gl_log = gl.getShaderInfoLog fragment_shader
            error_msg = "Error compiling fragment shader of material #{@name}
                \n#{gl_log}"
            # console.log fragment
            lines = fragment.split('\n')
            # ext = gl.getExtension "WEBGL_debug_shaders"
            # if ext
            #     translated = ext.getTranslatedShaderSource(fragment_shader))
            #     console.log  '\n' + translated.split('\n')
            gl.deleteShader fragment_shader

            if /ERROR: 0:/.test error_msg
                # Show context for first error
                line = error_msg.split(':')[2]|0
                # TODO: show only 4 lines of context but also the previous
                # line without indent to know which function it is
                for i in [Math.max(1,line-100)...Math.min(line+4, lines.length)]
                    console.log "#{i} #{lines[i-1]}"
            console.error error_msg
            @context.MYOU_PARAMS.on_shader_failed?()
            # debugger
            return


        prog = gl.createProgram()
        gl.attachShader prog, vertex_shader
        gl.attachShader prog, fragment_shader
        for {name, location} in @layout
            gl.bindAttribLocation prog, location, name
        gl.linkProgram prog
        failed = not gl.getProgramParameter(prog, gl.LINK_STATUS)
        if failed and not gl.isContextLost()
            error_msg = """Error linking shader of material #{@name}
            #{JSON.stringify varyings}
            #{gl.getProgramInfoLog prog}"""
            # ext = gl.getExtension "WEBGL_debug_shaders"
            # if ext
            #     translated = ext.getTranslatedShaderSource(fragment_shader))
            #     console.log  '\n' + translated.split('\n')
            console.log 'VS ============='
            console.log vs
            # console.log 'FS ============='
            # console.log fragment
            console.log '================'
            gl.deleteProgram prog
            gl.deleteShader vertex_shader
            gl.deleteShader fragment_shader
            @context.MYOU_PARAMS.on_shader_failed?()
            console.error error_msg
            return

        gl.useProgram prog
        @u_model_view_matrix = gl.getUniformLocation prog, var_model_view_matrix
        @u_projection_matrix = gl.getUniformLocation prog, var_projection_matrix
        @u_normal_matrix = gl.getUniformLocation prog, "normal_matrix"
        @u_uv_rect = gl.getUniformLocation prog, "uv_rect"
        @u_group_id = gl.getUniformLocation prog, "group_id"
        @u_uv_rect? and gl.uniform4f @u_uv_rect, 0, 0, 1, 1

        @u_mesh_center = gl.getUniformLocation prog, "mesh_center"
        @u_mesh_inv_dimensions = \
            gl.getUniformLocation prog, "mesh_inv_dimensions"
        @u_fb_size = gl.getUniformLocation prog, "fb_size"

        @modifier_data_store = for m in @vertex_modifiers
            m.get_data_store gl, prog

        # TODO: move textures to @material,
        # create ramps in loader, assign them there as dict,
        # make _texture_list or something
        {@uniform_assign_func, @uniform_locations, @lamps} = \
            generator.get_uniform_assign(gl, prog)

        fb = @context.render_manager.common_filter_fb
        if fb and @u_fb_size?
            gl.uniform2f @u_fb_size, fb.size_x, fb.size_y

        # vertexAttribPointers:
        # [location, number of components, GL type, offset]
        @attrib_pointers = attrib_pointers = []
        attrib_bitmask = 0
        for {name, count, type, offset, location} in @layout
            loc = gl.getAttribLocation(prog, name)|0
            if loc != -1
                if loc != location
                    console.log "#{@material.name}: #{name} HAS DIFFERENT LOCATIONS #{loc} #{location}"
                attrib_pointers.push [loc, count, attr_types[type], offset]
                attrib_bitmask |= 1<<loc
        @attrib_bitmask = attrib_bitmask

        @_program = prog
        @context.render_manager.compiled_shaders_this_frame += 1
        if @debugger?
            @debugger.initialize gl, prog, (pixel) =>
                rm = @context.render_manager
                # TODO: Let the user select the pixel,
                # sample the pixel at the screen center for now
                {width, height} = @context.canvas_screen
                rm.render_and_read_screen_pixels width>>1, height>>1, 1,1,pixel

    use: ->
        prog = @_program
        if _active_program != prog
            @context.render_manager.gl.useProgram prog
        return prog

    reupload: ->
        @init(@context, @data, @material, @layout,
            @vertex_modifiers, @defines)

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

    set_debugger: (@debugger=null) ->
        @reupload()
        return @debugger

glsl100to300 = (fragment, defines={}) ->
    head = ['#version 300 es']
    for def,val of defines
        head.push "#define #{def} #{val}"
    head.join('\n')+'\n'+fragment\
        .replace(///
            \#extension\s+GL_(EXT|OES)_(standard_derivatives|
            frag_depth|draw_buffers|shader_texture_lod)\b///g, '//')\
        .replace(/\bvarying\b/g, 'in')\
        .replace(/\bsample\b/g, 'sample_')\
        .replace(/\b(texture2D|textureCube)(Proj|Lod)?\b/g, 'texture$2')\
        .replace(/\bvoid\s+main\b/g, '''
            out vec4 glOutColor;
            #define gl_FragColor glOutColor
            void main''')


module.exports = {Material, Shader, glsl100to300}
