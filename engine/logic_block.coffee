{Scene} = require './scene.coffee'
#only tick must write in the scene
class LogicBlock
    constructor: (@scene)->
        scene = @scene
        @context = context = scene.context
        @init()
        if @tick?
            scene.logic_ticks.push(@tick.bind @)

    init: ()->

module.exports = {LogicBlock}
