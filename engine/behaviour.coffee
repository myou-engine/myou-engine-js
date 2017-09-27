PointerEvents = require 'spur-events'
{addListener, removeListener} = PointerEvents

{Scene} = require './scene.coffee'
#only tick must write in the scene

class BasicBehaviour
    constructor: (scene)->
        @scene = scene
        {@root} = scene.context
        scene.context.behaviours.push @
        @init_time = performance.now()
        @_enabled = false

    enable_behaviour: -> if not @_enabled
        @_create_events()
        @_enabled = true

    disable_behaviour: -> if @_enabled
        @_destroy_events()
        @_enabled = false

    age: ->
        performance.now() - @init_time

    _create_events: ->
        {root} = @
        {@root} = @scene.context
        @on_pointer_over? and addListener @root, 'pointerover', @on_pointer_over
        @on_pointer_out? and addListener @root, 'pointerout', @on_pointer_out
        @on_pointer_down? and addListener @root, 'pointerdown', @on_pointer_down
        @on_pointer_up? and addListener @root, 'pointerup', @on_pointer_up
        @on_pointer_move? and addListener @root, 'pointermove', @on_pointer_move
        @on_key_down? and addListener @root, 'keydown', @onkeydown
        @on_key_up? and addListener @root, 'keyup', @onkeyup
        @on_wheel? and addListener @root, 'wheel', @onwheel
        @on_click? and addListener @root, 'click', @onclick

    _destroy_events: ->
        {root} = @
        @on_pointer_over? and removeListener root, 'pointerover', @on_pointer_over
        @on_pointer_out? and removeListener root, 'pointerout', @on_pointer_out
        @on_pointer_down? and removeListener root, 'pointerdown', @on_pointer_down
        @on_pointer_up? and removeListener root, 'pointerup', @on_pointer_up
        @on_pointer_move? and removeListener root, 'pointermove', @on_pointer_move
        @on_key_down? and removeListener root, 'keydown', @onkeydown
        @on_key_up? and removeListener root, 'keyup', @onkeyup
        @on_wheel? and removeListener root, 'wheel', @onwheel
        @on_click? and removeListener root, 'click', @onclick

class SceneBehaviour extends BasicBehaviour
    constructor: (scene, @options={})->
        super scene
        @on_init?()
        @enable_behaviour()

    enable_behaviour: -> if not @_enabled
        if @on_tick?
            @_pre_draw_callback = (scene, frame_duration) =>
                @on_tick frame_duration
            @scene.pre_draw_callbacks.push @_pre_draw_callback
        super
    disable_behavior: -> if @_enabled
        if @on_tick?
            i = scene.pre_draw_callbacks.indexOf @_pre_draw_callback
            @scene.pre_draw_callbacks.splice i, 1
        super

class Behaviour extends BasicBehaviour
    id: ''
    constructor: (objects=[], options={})->
        if not @id
            throw 'Behaviour ID is empty. It should have an identifier'
        if not objects.length
            throw 'Expecting a non empty list of objects.'

        #TODO: destroy or improve when we have GLRay
        {@ray_int_mask=-1} = options

        @assignment_times = {}

        @objects = []
        for ob in objects
            @assign ob

        super objects[0].scene

        @_object_under_pointer = {}
        @_last_hit = {}

        @enable_behaviour()

    enable_behaviour: -> if not @_enabled
        if @on_tick?
            @_pre_draw_callback = (scene, frame_duration) =>
                for ob in @objects
                    @on_tick(ob, frame_duration)
            @scene.pre_draw_callbacks.push @_pre_draw_callback
        super

    disable_behaviour: -> if @_enabled
        if @on_tick?
            i = @scene.pre_draw_callbacks.indexOf @_pre_draw_callback
            @scene.pre_draw_callbacks.splice i, 1
        super

    assignment_age: (object)->
        performance.now() - @assignment_times[object.name]

    assign: (object)->
        if @id of object.behaviours
            throw "#{object.name} already has a behaviour with id #{@id}"
        object.behaviours[@id] = @
        @objects.push(object)
        @assignment_times[object.name] = performance.now()
        @on_init?(object)

    unassign: (object)->
        i = object.behaviours.indexOf @
        if i > -1 then object.behaviours.splice(i, 1)

        i = @objects.indexOf object
        if i > -1 then @objects.splice(i, 1)

    _on_object_pointer_over_out_listener: (e)=>
        hit = @scene.get_ray_hit_under_pointer(e, @ray_int_mask)
        obhit = hit[0]?.owner
        obhit = obhit in @objects and obhit
        last_obhit = @_last_hit[e.pointerId]?[0]?.owner
        last_obhit = last_obhit in @objects and last_obhit

        are_different = last_obhit != obhit
        if last_obhit? and are_different
            @on_object_pointer_out?(e, @_last_hit[e.pointerId])
        if obhit? and are_different
            @on_object_pointer_over?(e, hit)

        @_object_under_pointer[e.pointerId] = obhit
        @_last_hit[e.pointerId] = hit

    _on_object_pointer_move_listener: (e)=>
        hit = @scene.get_ray_hit_under_pointer(e, @ray_int_mask)
        if hit[0]?.owner in @objects
            @on_pointer_move_over(e, hit)

    _on_pointer_down_listener: (e)=>
        hit = @scene.get_ray_hit_under_pointer(e, @ray_int_mask)
        if hit[0]?.owner in @objects
            @on_pointer_down_over(e, hit)

    _on_pointer_up_listener: (e)=>
        hit = @scene.get_ray_hit_under_pointer(e, @ray_int_mask)
        if hit[0]?.owner in @objects
            @on_pointer_up_over(e, hit)

    _create_events: ->
        {@root} = @scene.context
        super
        if @on_object_pointer_over? or @on_object_pointer_out?
            addListener @root, 'pointerover', @_on_object_pointer_over_out_listener
            addListener @root, 'pointermove', @_on_object_pointer_over_out_listener
        @on_object_pointer_down? and addListener @root, 'pointerdown', @_on_object_pointer_down_listener
        @on_object_pointer_up? and addListener @root, 'pointerup', @_on_object_pointer_up_listener
        @on_object_pointer_move? and addListener @root, 'pointermove', @_on_object_pointer_move_listener

    _destroy_events: ->
        {root} = @
        super
        if @on_object_pointer_over? or @on_object_pointer_out?
            removeListener root, 'pointerover', @_on_object_pointer_over_out_listener
            removeListener root, 'pointermove', @_on_object_pointer_over_out_listener
        @on_object_pointer_down? and removeListener root, 'pointerdown', @_on_object_pointer_down_listener
        @on_object_pointer_up? and removeListener root, 'pointerup', @_on_object_pointer_up_listener
        @on_object_pointer_move? and removeListener root, 'pointermove', @_on_object_pointer_move_listener



module.exports = {Behaviour, SceneBehaviour}
