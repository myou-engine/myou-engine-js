{Scene} = require './scene.coffee'
#only tick must write in the scene

class BasicBehaviour
    constructor: (scene)->
        @scene = scene
        @context = scene.context
        @init_time = performance.now()
        @_enabled = false

    age = ->
        performance.now() - @init_time

class SceneBehaviour extends BasicBehaviour
    constructor: (scene)->
        super scene
        @init?()
        @enable_behaviour()

    enable_behaviour: -> if not @_enabled
        @_enabled = true
        if @tick?
            @_pre_draw_callback = (scene, frame_duration) =>
                @tick frame_duration
            scene.pre_draw_callbacks.push @_pre_draw_callback

    disable_behavior = -> if @_enabled
        @_enabled = false
        if @tick?
            i = scene.pre_draw_callbacks.indexOf @_pre_draw_callback
            if i > 1 then scene.pre_draw_callbacks.splice(i, 1)


class Behaviour extends BasicBehaviour
    constructor: (objects=[])->
        @objects = objects
        if objects.length == 0
            throw 'No objects asigned to behaviour'

        scene = @scene = @objects[0].scene
        super scene

        @assignment_times = {}

        for ob in objects
            ob.behaviours.push @
            @assignment_times[ob.name] = @init_time
            @init?(ob)

        @enable_behaviour()

    enable_behaviour: -> if not @_enabled
        @_enabled = true
        if @tick?
            @_pre_draw_callback = (scene, frame_duration) =>
                for ob in @objects
                    @tick(ob, frame_duration)
            @scene.pre_draw_callbacks.push @_pre_draw_callback

    disable_behaviour: -> if @_enabled
        @_enabled = false
        if @tick?
            i = @scene.pre_draw_callbacks.indexOf @_pre_draw_callback
            if i > 1 then @scene.pre_draw_callbacks.splice(i, 1)

    assignment_age: (object)->
        performance.now() - @assignment_times[object.name]

    assign: (object)->
        if @ not in object.behaviours
            object.behaviours.push @
        if object not in @objects
            @objects.push(object)
            @assignment_times[object.name] = performance.now()
            @init?(object)

    unassign: (object)->
        i = object.behaviours.indexOf @
        if i > -1 then object.behaviours.splice(i, 1)

        i = @objects.indexOf object
        if i > -1 then @objects.splice(i, 1)

module.exports = {Behaviour, SceneBehaviour}
