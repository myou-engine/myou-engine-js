
# Vertex modifiers are pluggable vertex shader functions.
#
# They're stored in the list mesh.vertex_modifiers, with
# possible per-mesh custom information, type, signature,
# and the following methods:
#
# get_code: returns code lines for the vertex shader:
# A list of uniform declaration and a list for main body.
# The body is expected to modify local variables: co and normal.
#
# get_data_store: returns a data structure to store
# uniform locations and optional values in the Shader object,
# It's provided with the GL context and the GL program,
# Usually to call gl.getUniformLocation.
# The data store is only used by update_uniforms below, and
# it's usually just a list with uniform locations.
#
# update_uniforms: is called for every rendered mesh.
# Receives the GL context and the store,
# usually to use gl.uniform* and gl.uniformMatrix* functions.
# Don't forget to return, otherwise the loop wastes resources.
#
# required_attributes: a list of additional used vertex attributes,
# required by the body. Note that it's not currently enforced but
# it's necessary for optimizing shadows.
# TODO: Use it to optimize shadows.


class ShapeKeyModifier
    constructor: (options) ->
        @type = 'SHAPE_KEYS'
        # Format of keys:
        # { Key1: { value: 1.0, index: 0 }, ... }
        {@count, @data_type, @keys} = options
        @ordered_keys = for k,v of @keys then v
        @ordered_keys.sort (a,b) -> a.index - b.index

        @required_attributes = ("shape#{i}" for i in [0...@count]) \
                    .concat("shapenor#{i}" for i in [0...@count])

        @signature = ''

    get_code: ->
        shape_multiplier = if @data_type == 'b' then "* 0.007874016" else ""
        uniform_lines = ["uniform float shapef[#{@count}];"]
        # This body uses attributes: shapeX and shapenorX where X is a number
        body_lines = [
            # Equivalent to /= 127.0, and roughly to normalize byte normals
            "normal *= 0.007874;"
            "float relf = 0.0;"
            "vec3 n;"
            (for i in [0...@count]
              "co += vec4(shape#{i}, 0.0) * shapef[#{i}] #{shape_multiplier};
               relf += shapef[#{i}];"
            )...
            # Interpolating normals instead of re-calculating them is wrong
            # But it's fast, completely unnoticeable in most cases,
            # and better than just not changing them (as many engines do)
            "normal *= clamp(1.0 - relf, 0.0, 1.0);"
            (for i in [0...@count]
                "normal += shapenor#{i} * 0.007874 * max(0.0, shapef[#{i}]);"
            )...
        ]
        return {uniform_lines, body_lines}

    get_data_store: (gl, prog) ->
        # In this case we're returninga list
        for i in [0...@count]
            gl.getUniformLocation prog, "shapef[#{i}]"

    # update_uniforms is called for every rendered mesh
    update_uniforms: (gl, store) ->
        for {value},i in @ordered_keys
            gl.uniform1f store[i], value
        return


class ArmatureModifier
    constructor: (options) ->
        @type = 'ARMATURE'
        {@armature, @data_type} = options
        @attributes_needed = ['weights', 'b_indices']
        # TODO: Document this or get from code instead
        @signature = 'armature'+@armature.deform_bones.length

    get_code: ->
        weight_multiplier = if @data_type == 'B' then "* 0.00392156886" else ""
        count = @armature.deform_bones.length
        uniform_lines = ["uniform mat4 bones[#{count}];"]
        body_lines = [
            'vec4 blendco = vec4(0.0);'
            'vec3 blendnor = vec3(0.0);'
            'mat4 m;'
            'ivec4 inds = ivec4(b_indices);'
            'for(int i=0;i<4;i++){'
            '  m = bones[inds[i]];'
            '  blendco += m * co * weights[i];'
            '  blendnor += mat3(m) * normal * weights[i];'
            '}'
            'co = blendco; normal = blendnor;'
        ]
        return {uniform_lines, body_lines}

    get_data_store: (gl, prog) ->
        for i in [0...@armature.deform_bones.length]
            gl.getUniformLocation prog, "bones[#{i}]"

    update_uniforms: (gl, store) ->
        {deform_bones} = @armature
        for i in [0...deform_bones.length]
            gl.uniformMatrix4fv store[i], false, deform_bones[i].ol_matrix.toJSON()
        return



module.exports = {ShapeKeyModifier, ArmatureModifier}
