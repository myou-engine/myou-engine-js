require './engine/init'
{Myou, create_canvas, create_full_window_canvas} = require './engine/myou'
{Behaviour, SceneBehaviour} = require './engine/behaviour'

# geometry utils
gmath =
    g2: require './engine/math_utils/g2'
    g3: require './engine/math_utils/g3'

# vector utils
vmath = require './engine/math_utils/vmath_extra'

# math utils
math = require './engine/math_utils/math_extra'

Behavior = Behaviour
SceneBehavior = SceneBehaviour

module.exports = {
    #myou engine
    Myou, Behaviour, SceneBehaviour, Behavior, SceneBehavior,
    #Utils
    create_canvas, create_full_window_canvas, gmath, vmath, math,
}
