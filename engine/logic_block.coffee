{Scene} = require './scene.coffee'
#only tick must write in the scene
class LogicBlock
    constructor: (@scene, @settings={})->
        scene = @scene
        if not scene
            throw 'No scene given to ' + @constructor.name
        @context = context = scene.context
        @init?()
        if @pre_draw_tick?
            scene.pre_draw_callbacks.push (scene)=> @pre_draw_tick.bind(@)(context.main_loop.frame_duration)

        if @tick? #TODO: Delete it in future versions.
            console.warn '"tick" is deprecated in LogicBlock, please use "pre_draw_tick" or "post_draw_tick" instead.'
            scene.pre_draw_callbacks.push (scene)=> @tick.bind(@)(context.main_loop.frame_duration)

        if @post_draw_tick?
            scene.pre_draw_callbacks.push (scene)=> @post_draw_tick.bind(@)(context.main_loop.frame_duration)

module.exports = {LogicBlock}
