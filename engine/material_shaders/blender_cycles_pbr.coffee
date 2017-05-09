

{vec3} = require 'gl-matrix'

# TODO: Should jitter be generated with a different random distrubition?


class BlenderCyclesPBRMaterial
    constructor: (@material) ->
        {data, _input_list, inputs, @context} = @material
        for u in data.uniforms when u.type == -1
            path = u.path or u.index
            value = if u.value.length? then new Float32Array(u.value) else u.value
            _input_list.push inputs[path] = {value, type: u.count}
        return

    get_model_view_matrix_name: ->
        for u in @material.data.uniforms or []
            switch u.type
                when 'VIEW_MAT' # model_view_matrix
                    return u.varname
        return "model_view_matrix"

    get_code: ->
        fragment = @material.data.fragment
#         console.log fragment
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
        textures = [] # temporary, see TODO in material
        for u in @material.data.uniforms or []
            if u.type == -1 # custom uniforms are material.inputs
                current_input++
            uloc = gl.getUniformLocation(program, u.varname)
            if not uloc? or uloc == -1
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
                when 'VIEW_MAT' # inverse model_view_matrix
                    null # Already being set by the renderer
                when 'VIEW_IMAT' # inverse model_view_matrix
                    code.push "gl.uniformMatrix4fv(locations[#{loc_idx}], false, render._cam2world);"
                when 'OB_MAT' # object_matrix
                    code.push "gl.uniformMatrix4fv(locations[#{loc_idx}], false, ob.world_matrix);"
                when 'BG_COLOR'
                    code.push "gl.uniform4fv(locations[#{loc_idx}], ob.scene.background_color);"
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
                    gl.uniform1i locations[loc_idx], textures.length
                    textures.push tex
                else
                    console.log "Warning: unknown uniform", u.varname, \
                        u.type, "of data type", u.datatype

        # PBR uniforms are not given as parameters,
        # so we have to figure out if they're present
        # by getting their locations

        for i in [0..8]
            unf = 'unfsh'+i
            loc = gl.getUniformLocation program, unf
            if loc?
                if i == 0
                    code.push "var bg = ob.scene.background_color;"
                    code.push "gl.uniform3f(locations[#{locations.length}],
                        bg[0]*0.72, bg[1]*0.72, bg[2]*0.72);"
                else
                    # All harmonics except the base are zero, because color is flat all around
                    code.push "gl.uniform3f(locations[#{locations.length}], 0, 0, 0);"
                locations.push loc

        if (loc = gl.getUniformLocation program, 'unflodfactor')?
            code.push "var probe = ob.probe;"
            code.push "gl.uniform1f(locations[#{locations.length}], probe&&probe.lodfactor);"
            locations.push loc

        if (loc = gl.getUniformLocation program, 'unfjitter')?
            gl.uniform1i loc, textures.length
            textures.push get_jitter_texture @

        if (loc = gl.getUniformLocation program, 'unflutsamples')?
            gl.uniform1i loc, textures.length
            textures.push get_lutsamples_texture @

        if (loc = gl.getUniformLocation program, 'unfprobe')?
            gl.uniform1i loc, textures.length
            textures.push null

        # detect presence of any of all the uniforms in the shader
        @unfs = {}
        for unf in 'unfprobe unfreflect unfrefract unfltcmat unfltcmag unfscenebuf unfdepthbuf unfbackfacebuf unfjitter unflutsamples unflodfactor unfsh0 unfsh1 unfsh2 unfsh3 unfsh4 unfsh5 unfsh6 unfsh7 unfsh8 unfprobepos unfplanarvec unfssrparam unfssaoparam unfclip unfprobecorrectionmat unfplanarreflectmat unfpixelprojmat'.split ' '
            if gl.getUniformLocation(program, unf)?
                console.log unf

        preamble = 'var locations=shader.uniform_locations,
            lamps=shader.lamps, inputs=shader.material._input_list;\n'
        func = new Function 'gl', 'shader', 'ob', 'render', 'mat4', preamble+code.join '\n'
        {uniform_assign_func: func, uniform_locations: locations, lamps, textures}


jitter_texture = lutsamples_texture = null

get_jitter_texture = (shader) ->
    if not jitter_texture?
        jitter_texture = new shader.context.Texture shader.material.scene,
            formats: raw_pixels: {
                # NOISE_SIZE
                width: 64, height: 64, pixels: (Math.random()*256)|0 for [0...64*64*4]
            }
        jitter_texture.load()
    return jitter_texture

get_lutsamples_texture = (shader) ->
    if not lutsamples_texture?
        lutsamples_texture = new shader.context.Texture shader.material.scene,
            formats: raw_pixels: {
                # TODO: bsdf_samples
                width: 32, height: 1, pixels: (Math.random()*256)|0 for [0...32*4]
            }
        lutsamples_texture.load()
    return lutsamples_texture


module.exports = {BlenderCyclesPBRMaterial}
