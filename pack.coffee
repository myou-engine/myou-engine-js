require './engine/init.coffee'
{Myou, create_canvas, create_full_window_canvas} = require './engine/myou.coffee'
glm = {mat2, mat3, mat4, vec2, vec3, vec4, quat} = require './engine/math_utils/glmatrix_extra.coffee'
geometry_utils =
    r2: require './engine/math_utils/r2.coffee'
    r3: require './engine/math_utils/r3.coffee'
{Behaviour, SceneBehaviour} = require './engine/behaviour.coffee'

Behavior = Behaviour
SceneBehavior = SceneBehaviour
module.exports = {
    #myou engine
    Myou, Behaviour, SceneBehaviour, Behavior, SceneBehavior,
    #Utils
    create_canvas, create_full_window_canvas,
    geometry_utils, glm,
}
