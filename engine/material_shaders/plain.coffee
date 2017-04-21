 

class PlainShaderMaterial
    constructor: (@material) ->
    get_model_view_matrix_name: -> 'model_view_matrix'
    get_code: -> @material.data # for data.fragment
    get_uniform_assign: -> {
        uniform_assign_func: ->
        textures: []
    }


module.exports = {PlainShaderMaterial}
