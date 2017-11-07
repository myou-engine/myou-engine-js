require './engine/init.coffee'
{Myou, create_canvas, create_full_window_canvas} = require './engine/myou.coffee'
{Behaviour, SceneBehaviour} = require './engine/behaviour.coffee'

# geometry utils
gmath =
    g2: require './engine/math_utils/g2.coffee'
    g3: require './engine/math_utils/g3.coffee'

# vector utils
vmath = require './engine/math_utils/vmath_extra.coffee'

# math utils
math = require './engine/math_utils/math_extra.coffee'

Behavior = Behaviour
SceneBehavior = SceneBehaviour

module.exports = {
    #myou engine
    Myou, Behaviour, SceneBehaviour, Behavior, SceneBehavior,
    #Utils
    create_canvas, create_full_window_canvas, gmath, vmath, math,
}
