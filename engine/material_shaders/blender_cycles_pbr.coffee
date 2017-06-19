

{vec3} = require 'gl-matrix'

# TODO: Should jitter be generated with a different random distrubition?


class BlenderCyclesPBRMaterial
    constructor: (@material) ->
        {data, _input_list, inputs, _texture_list, @context, scene} = @material
        for u in data.uniforms
            switch u.type
                when 'IMAGE', 'LAMP_SHADOW_MAP'
                    _texture_list.push {value: @context.render_manager.blank_texture}
        @unfjitter_index = _texture_list.length
        _texture_list.push {value: get_jitter_texture(scene)}
        @unflutsamples_index = _texture_list.length
        _texture_list.push {value: get_lutsamples_texture(scene)}
        @unfprobe_index = _texture_list.length
        _texture_list.push {value: null, is_probe: true}
        return

    get_model_view_matrix_name: ->
        for u in @material.data.uniforms or []
            switch u.type
                when 'VIEW_MAT' # model_view_matrix
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
        @material.data.uniforms.push {type: 'PROJ_IMAT', datatype: 'mat4', varname}
        return varname

    get_code: ->
        fragment = @material.data.fragment
        fragment = @material.context.SHADER_LIB + fragment
        return {fragment}

    get_uniform_assign: (gl, program) ->
        # TODO: reassign lamps when cloning etc
        {scene, scene:{objects}, render_scene} = @material
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
            # We'll use this location in a JS function that we'll be generating below
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
                        console.error "Lamp '#{name}' not found, referenced in material '#{@material.name}"
                        continue
            switch u.type
                # TODO: A bunch of these should be passed in the same way, see TODO in draw_mesh
                when 'PROJ_MAT' # projection_matrix
                    null # Already being set by the renderer
                when 'PROJ_IMAT' # inverse projection_matrix
                    code.push "gl.uniformMatrix4fv(locations[#{loc_idx}], false, render.projection_matrix_inverse);"
                when 'OB_VIEW_MAT' # model_view_matrix
                    null # Already being set by the renderer
                when 'VIEW_IMAT' # inverse model_view_matrix
                    code.push "gl.uniformMatrix4fv(locations[#{loc_idx}], false, render._cam2world);"
                when 'VIEW_IMAT3' # inverse view_matrix 3x3, a.k.a. camera rotation matrix
                    code.push "gl.uniformMatrix3fv(locations[#{loc_idx}], false, render._cam2world3);"
                when 'OB_MAT' # object_matrix
                    code.push "gl.uniformMatrix4fv(locations[#{loc_idx}], false, ob.world_matrix);"
                when 'OB_IMAT' # object_matrix
                    # NOTE: Objects with zero scale are not drawn, otherwise m4 could be null
                    code.push "m4 = mat4.invert(render._m4, ob.world_matrix);"
                    code.push "gl.uniformMatrix4fv(locations[#{loc_idx}], false, m4);"
                when 'BG_COLOR'
                    code.push "gl.uniform4fv(locations[#{loc_idx}], ob.scene.background_color);"
                when 'LAMP_DIR' # lamp direction in camera space
                    code.push "gl.uniform3fv(locations[#{loc_idx}], lamps[#{current_lamp}]._dir);"
                when 'LAMP_CO' # lamp position in camera space
                    code.push "gl.uniform3fv(locations[#{loc_idx}], lamps[#{current_lamp}]._view_pos);"
                when 'LAMP_COL' # lamp color
                    code.push "gl.uniform4fv(locations[#{loc_idx}], lamps[#{current_lamp}]._color4);"
                when 'LAMP_STRENGTH'
                    code.push "gl.uniform1f(locations[#{loc_idx}], lamps[#{current_lamp}].energy);"
                when 'LAMP_SIZE'
                    code.push "gl.uniform1f(locations[#{loc_idx}], lamps[#{current_lamp}].size_x);"
                when 'IMAGE'
                    tex = scene?.textures[u.image]
                    if not tex?
                        throw "Texture #{u.image} not found (in material #{@material.name})."
                    if not tex.loaded
                        tex.load()
                    @material._texture_list[texture_count].value = tex
                    code.push "gl.uniform1i(locations[#{loc_idx}], tex_list[#{texture_count++}].value.bound_unit);"
                when 'LAMP_SHADOW_MAP'
                    tex = render_scene.objects[u.lamp].shadow_texture
                    @material._texture_list[texture_count].value = tex
                    code.push "gl.uniform1i(locations[#{loc_idx}], tex_list[#{texture_count++}].value.bound_unit);"
                when 'LAMP_SHADOW_PROJ'
                    code.push "gl.uniformMatrix4fv(locations[#{loc_idx}], false, lamps[#{current_lamp}]._cam2depth);"
                when 'LAMP_SHADOW_BIAS'
                    code.push "gl.uniform1f(locations[#{loc_idx}], lamps[#{current_lamp}].shadow_options.bias);"
                when 'LAMP_BLEED_BIAS'
                    code.push "gl.uniform1f(locations[#{loc_idx}], lamps[#{current_lamp}].shadow_options.bleed_bias);"
                else
                    console.log "Warning: unknown uniform", u.varname, \
                        u.type, "of data type", u.datatype

        # PBR uniforms are not given as parameters,
        # so we have to figure out if they're present
        # by getting their locations
        has_probe = has_coefs = 0
        var_probe = 'var probe = ob.probe||ob.scene.background_probe;'

        for i in [0..8]
            unf = 'unfsh'+i
            loc = gl.getUniformLocation program, unf
            if loc?
                if not has_probe++
                    code.push var_probe
                if not has_coefs++
                    code.push 'if(probe){'
                    code.push 'var coefs = probe.cubemap.coefficients;'
                code.push "gl.uniform3fv(locations[#{locations.length}], coefs[#{i}]);"
                locations.push loc
        if has_coefs
            code.push '}' # if(probe)


        if (loc = gl.getUniformLocation program, 'unflodfactor')?
            if not has_probe++
                code.push var_probe
            code.push "gl.uniform1f(locations[#{locations.length}], probe&&probe.lodfactor);"
            locations.push loc

        if (loc = gl.getUniformLocation program, 'unfjitter')?
            code.push "gl.uniform1i(locations[#{locations.length}], tex_list[#{@unfjitter_index}].value.bound_unit);"
            locations.push loc

        if (loc = gl.getUniformLocation program, 'unflutsamples')?
            code.push "gl.uniform1i(locations[#{locations.length}], tex_list[#{@unflutsamples_index}].value.bound_unit);"
            locations.push loc

        if (loc = gl.getUniformLocation program, 'unfprobe')?
            code.push "gl.uniform1i(locations[#{locations.length}], tex_list[#{@unfprobe_index}].value.bound_unit);"
            locations.push loc

        # detect presence of any of all the uniforms in the shader
        @unfs = {}
        for unf in 'unfprobe unfreflect unfrefract unfltcmat unfltcmag unfscenebuf unfdepthbuf unfbackfacebuf unfjitter unflutsamples unflodfactor unfsh0 unfsh1 unfsh2 unfsh3 unfsh4 unfsh5 unfsh6 unfsh7 unfsh8 unfprobepos unfplanarvec unfssrparam unfssaoparam unfclip unfprobecorrectionmat unfplanarreflectmat unfpixelprojmat'.split ' '
            if gl.getUniformLocation(program, unf)?
                console.log unf

        preamble = 'var locations=shader.uniform_locations, lamps=shader.lamps,
            material=shader.material, inputs=material._input_list, tex_list=material._texture_list;\n'
        func = new Function 'gl', 'shader', 'ob', 'render', 'mat4', preamble+code.join '\n'
        {uniform_assign_func: func, uniform_locations: locations, lamps}


jitter_texture = lutsamples_texture = null

get_jitter_texture = (scene) ->
    if not jitter_texture?
        jitter_texture = new scene.context.Texture scene,
            formats: raw_pixels: {
                # NOISE_SIZE
                width: 64, height: 64, pixels: (Math.random()*256)|0 for [0...64*64*4]
            }
        jitter_texture.load()
    return jitter_texture

get_lutsamples_texture = (scene) ->
    if not lutsamples_texture?
        lutsamples_texture = new scene.context.Texture scene,
            formats: raw_pixels: {
                # TODO: bsdf_samples
                width: 32, height: 1, pixels: (Math.random()*256)|0 for [0...32*4]
            }
        lutsamples_texture.load()
    return lutsamples_texture


module.exports = {BlenderCyclesPBRMaterial}
