
{addListener, removeListener} = require 'spur-events'

class Behaviour
    id = ''
    constructor: (@scene, options={})->
        if @scene?.type != 'SCENE'
            throw 'Expected a scene'
        {
            objects
            #TODO: destroy or improve when we have GLRay
            @ray_int_mask=-1
        } = options
        if not @id
            @id = (Math.random()+'')[2...]

        @assignment_times = {}
        @objects = []
        if objects
            for ob in objects
                @assign ob

        {@root} = @scene.context
        @scene.context.behaviours.push @
        @init_time = performance.now()
        @_enabled = false
        @_object_under_pointer = {}
        @_last_hit = {}
        @_objects_frame_callback = _frame_callback = null
        @enable()
        @on_init?()

    enable: ->
        if not @_enabled
            @_create_events()
            @scene.post_draw_callbacks.push @_add_callbacks
            @_enabled = true

    disable: ->
        if @_enabled
            @_destroy_events()
            @scene.post_draw_callbacks.push @_remove_callbacks
            @_enabled = false

    age: ->
        performance.now() - @init_time

    assignment_age: (object)->
        performance.now() - @assignment_times[object.name]

    assign: (object)->
        if @id of object.behaviours
            throw "#{object.name} already has a behaviour with id #{@id}"
        if object.scene != @scene
            throw "Object #{object.name} is not in expected scene #{@scene.name}"
        object.behaviours[@id] = @
        @objects.push(object)
        @assignment_times[object.name] = performance.now()
        @on_init?(object)

    unassign: (object)->
        i = object.behaviours.indexOf @
        if i > -1 then object.behaviours.splice(i, 1)

        i = @objects.indexOf object
        if i > -1 then @objects.splice(i, 1)

    _add_callbacks: =>
        @_remove_callbacks()
        if @on_tick?
            @_frame_callback = (scene, frame_duration) =>
                @on_tick frame_duration
            @scene.pre_draw_callbacks.push @_frame_callback
        if @on_object_tick?
            @_objects_frame_callback = (scene, frame_duration) =>
                for ob in @objects
                    @on_object_tick(ob, frame_duration)
                return
            @scene.pre_draw_callbacks.push @_objects_frame_callback
        return

    _remove_callbacks: =>
        pdc = @scene.pre_draw_callbacks
        if @_objects_frame_callback?
            pdc.splice pdc.indexOf(@_objects_frame_callback), 1
        if @_frame_callback?
            pdc.splice pdc.indexOf(@_frame_callback), 1
        @_objects_frame_callback = _frame_callback = null

    _create_events: ->
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
        if @on_object_pointer_over? or @on_object_pointer_out?
            addListener @root, 'pointerover', @_on_object_pointer_over_out_listener
            addListener @root, 'pointermove', @_on_object_pointer_over_out_listener
            addListener @root, 'pointerout', @_on_object_pointer_over_out_listener
        @on_object_pointer_down? and addListener @root, 'pointerdown', @_on_object_pointer_down_listener
        @on_object_pointer_up? and addListener @root, 'pointerup', @_on_object_pointer_up_listener
        @on_object_pointer_move? and addListener @root, 'pointermove', @_on_object_pointer_move_listener


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
        if @on_object_pointer_over? or @on_object_pointer_out?
            removeListener root, 'pointerover', @_on_object_pointer_over_out_listener
            removeListener root, 'pointermove', @_on_object_pointer_over_out_listener
            removeListener root, 'pointerout', @_on_object_pointer_over_out_listener
        @on_object_pointer_down? and removeListener root, 'pointerdown', @_on_object_pointer_down_listener
        @on_object_pointer_up? and removeListener root, 'pointerup', @_on_object_pointer_up_listener
        @on_object_pointer_move? and removeListener root, 'pointermove', @_on_object_pointer_move_listener

    _on_object_pointer_over_out_listener: (e) =>
        obhit = null
        if e.type != 'pointerout'
            hit = @scene.get_ray_hit_under_pointer(e, @ray_int_mask)
            obhit = hit[0]?.owner
            if not obhit in @objects
                obhit = null
        last_hit = @_last_hit[e.pointerId]
        last_obhit = last_hit?[0]?.owner

        are_different = last_obhit != obhit
        if last_obhit? and are_different
            @on_object_pointer_out?(e, last_obhit, last_hit[1], last_hit[2])
        if obhit? and are_different
            @on_object_pointer_over?(e, obhit, hit[1], hit[2])

        @_object_under_pointer[e.pointerId] = obhit
        @_last_hit[e.pointerId] = hit
        return

    _on_object_pointer_move_listener: (e)=>
        hit = @scene.get_ray_hit_under_pointer(e, @ray_int_mask)
        if (obhit = hit[0]?.owner) in @objects
            @on_object_pointer_move(e, obhit, hit[1], hit[2])
        return

    _on_object_pointer_down_listener: (e)=>
        hit = @scene.get_ray_hit_under_pointer(e, @ray_int_mask)
        if (obhit = hit[0]?.owner) in @objects
            @on_object_pointer_down(e, obhit, hit[1], hit[2])
        return

    _on_object_pointer_up_listener: (e)=>
        hit = @scene.get_ray_hit_under_pointer(e, @ray_int_mask)
        if (obhit = hit[0]?.owner) in @objects
            @on_object_pointer_up(e, obhit, hit[1], hit[2])
        return



module.exports = {Behaviour}
