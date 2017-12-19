

# TODO: Should jitter be generated with a different random distrubition?


class BlenderCyclesPBRMaterial
    constructor: (@material) ->
        {data, _texture_list, @context, scene} = @material
        {blank_texture} = @context.render_manager
        for u in data.uniforms
            switch u.type
                when 'IMAGE', 'LAMP_SHADOW_MAP'
                    _texture_list.push {value: blank_texture}
        @unfjitter_index = _texture_list.length
        _texture_list.push {value: get_jitter_texture(scene)}
        @unflutsamples_index = _texture_list.length
        _texture_list.push {value: get_lutsamples_texture(scene)}
        @unfprobe_index = _texture_list.length
        _texture_list.push {value: {}, is_probe: true}
        @unfreflect_index = _texture_list.length
        _texture_list.push {value: {}, is_reflect: true}
        return

    assign_textures: ->
        {data, _texture_list, scene, render_scene} = @material
        texture_count = 0
        for u in data.uniforms
            switch u.type
                when 'IMAGE'
                    tex = scene?.textures[u.image]
                    if not tex?
                        throw Error "Texture #{u.image} not found (in material
                            #{@material.name})."
                    _texture_list[texture_count++].value = tex
                when 'LAMP_SHADOW_MAP'
                    tex = render_scene.objects[u.lamp].shadow_texture
                    if not tex?
                        console.warn "Material #{@material.name} tries to use
                            unexisting shadow of lamp #{u.lamp}"
                        tex = @context.render_manager.white_texture
                    _texture_list[texture_count++].value = tex
        return

    get_model_view_matrix_name: ->
        for u in @material.data.uniforms or []
            switch u.type
                when 'OB_VIEW_MAT' # model_view_matrix
                    return u.varname
        return "model_view_matrix"

    get_projection_matrix_name: ->
        for u in @material.data.uniforms or []
            switch u.type
                when 'PROJ_MAT' # model_view_matrix
                    return u.varname
        return "projection_matrix"

    get_projection_matrix_inverse_name: ->
        @material.data.uniforms = @material.data.uniforms or []
        for u in @material.data.uniforms
            switch u.type
                when 'PROJ_IMAT' # model_view_matrix
                    return u.varname
        # Add it if it doesn't exist
        varname = "projection_matrix_inverse"
        @material.data.uniforms.push \
            {type: 'PROJ_IMAT', datatype: 'mat4', varname}
        return varname

    get_code: (defines) ->
        head = []
        glsl_version = 100
        if @context.is_webgl2
            head.push '#version 300 es'
            glsl_version = 300
        for def,val of defines
            head.push "#define #{def} #{val}"
        head.push "#define CLIPPING_PLANE"
        fragment = @material.data.fragment
        fragment = head.join('\n') + @material.context.SHADER_LIB + fragment
        return {fragment, glsl_version}

    get_uniform_assign: (gl, program) ->
        # TODO: reassign lamps when cloning etc
        {scene:{objects}} = @material
        code = [] # lines for the @uniform_assign_func function
        lamp_indices = {}
        lamps = []
        current_lamp = null
        current_input = -1
        locations = []
        texture_count = 0
        for u in @material.data.uniforms or []
            if u.type == -1 # custom uniforms are material.inputs
                current_input++
            uloc = gl.getUniformLocation(program, u.varname)
            if not uloc? or uloc == -1
                if u.type == 'IMAGE'
                    texture_count++
                continue
            # We'll use this location in a JS function
            # that we'll be generating below
            # The result is @uniform_assign_func
            loc_idx = locations.length
            locations.push uloc
            if u.lamp?
                current_lamp = lamp_indices[u.lamp]
                if not current_lamp?
                    current_lamp = lamp_indices[u.lamp] = lamps.length
                    lamp = objects[u.lamp]
                    lamps.push lamp
                    if not lamp?
                        console.error "Lamp '#{name}' not found,
                            referenced in material '#{@material.name}"
                        continue
            switch u.type
                # TODO: A bunch of these should be passed in the same way,
                # see TODO in draw_mesh
                when 'PROJ_MAT' # projection_matrix
                    null # Already being set by the renderer
                when 'PROJ_IMAT' # inverse projection_matrix
                    code.push "gl.uniformMatrix4fv(locations[#{loc_idx}], false,
                        render.projection_matrix_inverse.toJSON());"
                when 'OB_VIEW_MAT' # model_view_matrix
                    null # Already being set by the renderer
                when 'OB_VIEW_IMAT' # model_view_matrix_inverse
                    # NOTE: Objects with zero scale are not drawn,
                    # otherwise m4 could be null
                    code.push "m4 =
                        mat4.invert(render._m4, render._model_view_matrix);"
                    code.push "gl.uniformMatrix4fv(locations[#{loc_idx}], false,
                        m4.toJSON());"
                when 'VIEW_MAT' # view_matrix
                    code.push "gl.uniformMatrix4fv(locations[#{loc_idx}], false,
                        render._world2cam.toJSON());"
                when 'VIEW_IMAT' # inverse view_matrix
                    code.push "gl.uniformMatrix4fv(locations[#{loc_idx}], false,
                        render._cam2world.toJSON());"
                when 'VIEW_IMAT3' # inverse view_matrix 3x3
                    # a.k.a. camera rotation matrix
                    code.push "gl.uniformMatrix3fv(locations[#{loc_idx}], false,
                        render._cam2world3.toJSON());"
                when 'OB_MAT' # object_matrix
                    code.push "gl.uniformMatrix4fv(locations[#{loc_idx}], false,
                        ob.world_matrix.toJSON());"
                when 'OB_IMAT' # object_matrix_inverse
                    # NOTE: Objects with zero scale are not drawn,
                    # otherwise m4 could be null
                    code.push "m4 = mat4.invert(render._m4, ob.world_matrix);"
                    code.push "gl.uniformMatrix4fv(locations[#{loc_idx}], false,
                        m4.toJSON());"
                when 'BG_COLOR'
                    code.push "v=scene.background_color;
                        gl.uniform4f(locations[#{loc_idx}], v.r, v.g, v.b, v.a)"
                when 'LAMP_DIR' # lamp direction in camera space
                    code.push "v=lamps[#{current_lamp}]._dir;
                        gl.uniform3f(locations[#{loc_idx}], v.x, v.y, v.z);"
                when 'LAMP_CO' # lamp position in camera space
                    code.push "v=lamps[#{current_lamp}]._view_pos;
                        gl.uniform3f(locations[#{loc_idx}], v.x, v.y, v.z);"
                when 'LAMP_COL' # lamp color
                    code.push "v=lamps[#{current_lamp}].color;
                        gl.uniform4f(locations[#{loc_idx}], v.r, v.g, v.b, v.a)"
                when 'LAMP_STRENGTH'
                    code.push "gl.uniform1f(locations[#{loc_idx}],
                        lamps[#{current_lamp}].energy);"
                when 'LAMP_SIZE'
                    code.push "gl.uniform1f(locations[#{loc_idx}],
                        lamps[#{current_lamp}].size_x);"
                when 'IMAGE'
                    code.push "gl.uniform1i(locations[#{loc_idx}],
                        tex_list[#{texture_count++}].value.bound_unit);"
                when 'LAMP_SHADOW_MAP'
                    code.push "gl.uniform1i(locations[#{loc_idx}],
                        tex_list[#{texture_count++}].value.bound_unit);"
                when 'LAMP_SHADOW_PROJ'
                    code.push "gl.uniformMatrix4fv(locations[#{loc_idx}], false,
                        lamps[#{current_lamp}]._cam2depth.toJSON());"
                when 'LAMP_SHADOW_BIAS'
                    code.push "gl.uniform1f(locations[#{loc_idx}],
                        lamps[#{current_lamp}].shadow_options.bias);"
                when 'LAMP_BLEED_BIAS'
                    code.push "gl.uniform1f(locations[#{loc_idx}],
                        lamps[#{current_lamp}].shadow_options.bleed_bias);"
                else
                    console.log "Warning: unknown uniform", u.varname, \
                        u.type, "of data type", u.datatype

        # PBR uniforms are not given as parameters,
        # so we have to figure out if they're present
        # by getting their locations
        probe_code = []
        coeff_code = []

        for i in [0..8]
            unf = 'unfsh'+i
            loc = gl.getUniformLocation program, unf
            if loc?
                coeff_code.push "gl.uniform3fv(locations[#{locations.length}],
                    coefs[#{i}]);"
                locations.push loc

        if coeff_code.length != 0
            probe_code.push \
                # NOTE: If there's probe, there's ALWAYS a background probe
                'var cubemap = probe.cubemap||scene.background_probe.cubemap;',
                'if(cubemap!=null){',
                coeff_code...,
                '}'

        if (loc = gl.getUniformLocation program, 'unfbsdfsamples')?
            code.push "var samples = scene.bsdf_samples;"
            code.push "gl.uniform2f(locations[#{locations.length}],
                samples, 1/samples);"
            locations.push loc

        if (loc = gl.getUniformLocation program, 'unflodfactor')?
            probe_code.push "gl.uniform1f(locations[#{locations.length}],
                probe&&probe.lodfactor);"
            locations.push loc

        if (loc = gl.getUniformLocation program, 'unfjitter')?
            code.push "gl.uniform1i(locations[#{locations.length}],
                tex_list[#{@unfjitter_index}].value.bound_unit);"
            locations.push loc

        if (loc = gl.getUniformLocation program, 'unflutsamples')?
            code.push "gl.uniform1i(locations[#{locations.length}],
                tex_list[#{@unflutsamples_index}].value.bound_unit);"
            locations.push loc

        if (loc = gl.getUniformLocation program, 'unfprobe')?
            code.push "gl.uniform1i(locations[#{locations.length}],
                tex_list[#{@unfprobe_index}].value.bound_unit);"
            locations.push loc

        if (loc = gl.getUniformLocation program, 'unfreflect')?
            code.push "gl.uniform1i(locations[#{locations.length}],
                tex_list[#{@unfreflect_index}].value.bound_unit);"
            locations.push loc

        if (loc = gl.getUniformLocation program, 'unfplanarvec')?
            probe_code.push """
                v=probe.normal;
                gl.uniform3f(locations[#{locations.length}], v.x, v.y, v.z);"""
            locations.push loc

        if (loc = gl.getUniformLocation program, 'unfplanarreflectmat')?
            probe_code.push """
                gl.uniformMatrix4fv(locations[#{locations.length}], false,
                probe.planarreflectmat.toJSON());"""
            locations.push loc

        if (loc = gl.getUniformLocation program, 'unf_clipping_plane')?
            code.push "v=render.clipping_plane;
                gl.uniform4f(locations[#{locations.length}],
                v.x, v.y, v.z, v.w);"
            locations.push loc

        if probe_code.length != 0
            code.push \
                'var probe = ob.probe||scene.background_probe;',
                'if(probe){',
                probe_code...,
                '}'

        # detect presence of any of all the unhandled uniforms in the shader
        @unfs = {}
        for unf in 'unfrefract unfltcmat unfltcmag unfscenebuf unfdepthbuf
                unfbackfacebuf unfprobepos unfssrparam unfssaoparam unfclip
                unfprobecorrectionmat unfpixelprojmat'.split ' '
            if gl.getUniformLocation(program, unf)?
                console.warn "Unhandled uniform:", unf

        preamble = 'var v, locations=shader.uniform_locations,
            lamps=shader.lamps, scene=ob.scene, material=shader.material,
            inputs=material._input_list, tex_list=material._texture_list;\n'
        func = new Function 'gl', 'shader', 'ob', 'render', 'mat4',
            preamble+code.join '\n'
        {uniform_assign_func: func, uniform_locations: locations, lamps}


jitter_texture = lutsamples_texture = null

# TODO: Use always the same seed,
# and find one that doesn't have obvious repeating pattern
get_jitter_texture = (scene) ->
    if not jitter_texture?
        # if it doesn't support webgl2,
        # it's not worth to gather more than 1 sample
        if scene.context.is_webgl2
            pixels = new Float32Array 64*64*4
            for i in [0...64*64*4] by 4
                x = Math.random() * 2.0 - 1.0
                y = Math.random() * 2.0 - 1.0
                ilen = 1/Math.sqrt(x*x + y*y)
                pixels[i] = x*ilen
                pixels[i+1] = y*ilen
            jitter_texture = new scene.context.Texture scene,
                formats: raw_pixels: {
                    # NOISE_SIZE
                    width: 64, height: 64, pixels: pixels
                }
            jitter_texture.load()
        else
            jitter_texture = scene.context.render_manager.blank_texture
    return jitter_texture

# From http://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html
radical_inverse = (bits) ->
    bits <<= 1 # multiplying by 2 to avoid signed bit
    bits = (bits << 16) | (bits >> 16)
    bits = ((bits & 0x55555555) << 1) | ((bits & 0xAAAAAAAA) >> 1)
    bits = ((bits & 0x33333333) << 2) | ((bits & 0xCCCCCCCC) >> 2)
    bits = ((bits & 0x0F0F0F0F) << 4) | ((bits & 0xF0F0F0F0) >> 4)
    bits = ((bits & 0x00FF00FF) << 8) | ((bits & 0xFF00FF00) >> 8)
    return bits * 2.3283064365386963e-10 * 2

get_lutsamples_texture = (scene) ->
    if not lutsamples_texture?
        # if it doesn't support webgl2,
        # it's not worth to gather more than 1 sample
        if scene.context.is_webgl2
            # This is the maximum BSDF samples
            samples = 1024
            pixels = new Float32Array samples*4
            for i in [0...samples] by 1
                phi = radical_inverse(i) * 2.0 * Math.PI
                i4 = i<<2
                pixels[i4] = Math.cos(phi)
                pixels[i4+1] = Math.sin(phi)
            lutsamples_texture = new scene.context.Texture scene,
                formats: raw_pixels: {
                    width: samples, height: 1, pixels: pixels
                }
            lutsamples_texture.load()
        else
            lutsamples_texture = scene.context.render_manager.blank_texture
    return lutsamples_texture


module.exports = {BlenderCyclesPBRMaterial}
