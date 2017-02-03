{Scene} = require './scene.coffee'
#only tick must write in the scene
class LogicBlock
    constructor: (@scene, @settings={})->
        scene = @scene
        @context = context = scene.context
        if @init? then @init()
        if @pre_draw_tick? then cene.pre_draw_callbacks.push(@pre_draw_tick.bind @)
        if @post_draw_tick? then scene.post_draw_callbacks.push(@pre_draw_tick.bind @)

module.exports = {LogicBlock}
