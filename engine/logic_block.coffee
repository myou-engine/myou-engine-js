{Scene} = require './scene.coffee'
#only tick must write in the scene
class LogicBlock
    constructor: (@context, scene_name)->
        @context.load_scene(scene_name).then (scene) =>
            scene.enabled = false
            scene.load_visible_objects().then =>
                scene.enabled = true
                @init scene
                if @tick?
                    scene.logic_ticks.push(@tick.bind(@))
    init: (@scene)->

module.exports = {LogicBlock}
