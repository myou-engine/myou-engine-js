{Scene} = require './scene.coffee'
#only tick must write in the scene

class SceneBehaviour
    constructor: (scene)->
        @scene = scene
        @context = context = scene.context

        #TODO: manage pointer events

        @init_time = performance.now()
        @now = =>
            performance.now() - @init_time

        @init?()
        if @pre_draw_tick?
            scene.pre_draw_callbacks.push (scene, frame_duration) =>
                @pre_draw_tick frame_duration

        if @post_draw_tick?
            scene.pre_draw_callbacks.push (scene, frame_duration) =>
                @post_draw_tick frame_duration

class Behaviour extends SceneBehaviour
    constructor: (@object)->
        scene = @object.scene
        super scene



module.exports = {SceneBehaviour, Behaviour}
