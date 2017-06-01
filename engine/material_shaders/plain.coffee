

class PlainShaderMaterial
    constructor: (@material) ->
        {data, _input_list, inputs} = @material
        for u in data.uniforms or []
            {varname, value} = u
            _input_list.push inputs[varname] = {value, type: value.length or 1}


    get_model_view_matrix_name: -> 'model_view_matrix'

    get_projection_matrix_name: -> 'projection_matrix'

    get_code: -> @material.data # for data.fragment

    get_uniform_assign: (gl, program) ->
        code = []
        locations = []
        tex_locations = []
        textures = []
        for u,i in @material.data.uniforms or []
            {varname, value} = u
            uloc = gl.getUniformLocation(program, u.varname)
            if not uloc? or uloc == -1
                continue
            loc_idx = locations.length
            value_code = "inputs[#{i}].value"
            code.push if value.type == 'TEXTURE'
                tex_locations.push uloc
                textures.push value
            else if value.length?
                "gl.uniform#{value.length}fv(locations[#{loc_idx}], #{value_code});"
            else
                "gl.uniform1f(locations[#{loc_idx}], #{value_code});"
            locations.push uloc
        if code.length
            preamble = 'var locations=shader.uniform_locations,
            inputs=shader.material._input_list;\n'
            uniform_assign_func = new Function 'gl', 'shader', 'ob', 'render', 'mat4', preamble+code.join '\n'
        else
            uniform_assign_func = ->
        {
            uniform_assign_func,
            uniform_locations: locations,
            textures,
            tex_locations,
        }


module.exports = {PlainShaderMaterial}
