
#only tick must write in the scene
class LogicBlock
    constructor: (@context, scene_name)->
        @context.on_scene_ready scene_name, =>
            @init @context.scenes[scene_name]
        if @tick? then @context.on_scene_ready scene_name, =>
            @context.scenes[scene_name].logic_ticks.push(@tick.bind(@))
    init: (@scene)->

module.exports = {LogicBlock}
