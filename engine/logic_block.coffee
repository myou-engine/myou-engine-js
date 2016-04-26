{Scene} = require './scene.coffee'
#only tick must write in the scene
class LogicBlock
    constructor: (@context, scene_name)->
        scene = new Scene(@context, scene_name)
        scene.load_promise.then =>
            console.log 'resolving promise'
            @init @context.scenes[scene_name]
            if @tick?
                @context.scenes[scene_name].logic_ticks.push(@tick.bind(@))
    init: (@scene)->

module.exports = {LogicBlock}
