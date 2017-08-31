

class PlainShaderMaterial
    constructor: (@material) ->
        {data, _input_list, inputs, _texture_list} = @material
        for u in data.uniforms or []
            {varname, value} = u
            _input_list.push inputs[varname] = {value, type: value.length or 1}
            if value.type == 'TEXTURE'
                _texture_list.push inputs[varname]

    assign_textures: ->

    get_model_view_matrix_name: -> 'model_view_matrix'

    get_projection_matrix_name: -> 'projection_matrix'

    get_code: ->
        {fragment} = @material.data
        glsl_version = if fragment[...15] == '#version 300 es' then 300 else 100
        {fragment, glsl_version}

    get_uniform_assign: (gl, program) ->
        code = []
        locations = []
        for u,i in @material.data.uniforms or []
            {varname, value} = u
            uloc = gl.getUniformLocation(program, u.varname)
            if not uloc? or uloc == -1
                continue
            loc_idx = locations.length
            value_code = "inputs[#{i}].value"
            code.push if value.type == 'TEXTURE'
                "gl.uniform1i(locations[#{loc_idx}], #{value_code}.bound_unit);"
            else if value.length?
                "gl.uniform#{value.length}fv(locations[#{loc_idx}], #{value_code});"
            else if value.w?
                "v=#{value_code};gl.uniform4f(locations[#{loc_idx}], v.x, v.y, v.z, v.w);"
            else if value.z?
                "v=#{value_code};gl.uniform3f(locations[#{loc_idx}], v.x, v.y, v.z);"
            else if value.y?
                "v=#{value_code};gl.uniform2f(locations[#{loc_idx}], v.x, v.y);"
            else if value.a?
                "v=#{value_code};gl.uniform4f(locations[#{loc_idx}], v.r, v.g, v.b, v.a);"
            else if value.b?
                "v=#{value_code};gl.uniform3f(locations[#{loc_idx}], v.r, v.g, v.b);"
            else
                "gl.uniform1f(locations[#{loc_idx}], #{value_code});"
            locations.push uloc
        if code.length
            preamble = 'var locations=shader.uniform_locations,
            inputs=shader.material._input_list, v;\n'
            uniform_assign_func = new Function 'gl', 'shader', 'ob', 'render', 'mat4', preamble+code.join '\n'
        else
            uniform_assign_func = ->
        {
            uniform_assign_func,
            uniform_locations: locations,
        }


module.exports = {PlainShaderMaterial}
