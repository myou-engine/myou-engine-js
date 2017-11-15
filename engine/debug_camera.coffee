{vec3, vec4, clamp} = require 'vmath'
{Behaviour} = require './behaviour'

class DebugCamera extends Behaviour
    on_init: ->
        @debug_camera = @viewports[0].camera.clone()
        @scene.clear_parent @debug_camera
        @debug_camera.set_rotation_order 'XYZ'
        @debug_camera.far_plane *= 10
        @debug_camera.recalculate_projection()
        @pivot = new @context.GameObject
        @pivot.set_rotation_order 'XYZ'
        @debug = @scene.get_debug_draw()
        # we use @active instead of enabling/disabling the behaviour,
        # to be able to re-enable with a key
        @active = false
        @rotating = false
        @panning = false
        @distance = @pan_distance = 5
        @debug = @scene.get_debug_draw()
        @pivot_vis = new @debug.Point
        @pivot_vis.position = @pivot.position
        @disable_context_menu()
        this.enable_object_picking()
        @activate()

    on_tick: ->
        return if not @active
        if not @rotating
            # Change pivot and distance
            {width, height} = @viewports[0]
            {point} = @pick_object width*.5, height*.5, @viewports[0]
            if point?
                @distance = vec3.dist @debug_camera.position, point
                vec3.copy @pivot.position, point
            else
                vec3.set @pivot.position, 0, 0, -@distance
                wm = @debug_camera.get_world_matrix()
                vec3.transformMat4 @pivot.position, @pivot.position, wm

    on_pointer_down: (event) ->
        return if not @active
        if event.button == 0 and not @rotating
            @rotating = true
            vec4.copy @pivot.rotation, @debug_camera.rotation
            @pivot.rotate_x_deg -90, @pivot
            @debug_camera.parent_to @pivot
        if event.button == 2
            @pan_distance = @distance
            @panning = true

    on_pointer_move: (event) ->
        return if not @active
        if @rotating
            {rotation} = @pivot
            HPI = Math.PI * .5
            rotation.z -= event.delta_x * 0.01
            rotation.x -= event.delta_y * 0.01
            rotation.x = clamp rotation.x, -HPI, HPI
        else if @panning
            ratio = event.viewport.pixels_to_units * @pan_distance * 2
            x = -event.delta_x * ratio
            y = event.delta_y * ratio
            @debug_camera.translate vec3.new(x, y, 0), @debug_camera

    on_pointer_up: (event) ->
        # for some reason you can't trust that the button will be detected
        # (e.g. left down, right down, left up, right up: left not detected)
        # so we reset all buttons here
        if @rotating
            @rotating = false
            @debug_camera.clear_parent()
        @panning = false

    on_wheel: (event) ->
        return if not @active
        # zoom with wheel, but avoid going through objects
        # 54 is the approximate amount of pixels of one scroll step
        delta = @distance * (4/5) ** (-event.delta_y/54) - @distance
        delta = Math.max delta, -(@distance - @debug_camera.near_plane*1.2)
        @debug_camera.translate_z delta, @debug_camera
        @distance = vec3.dist @debug_camera.position, @pivot.position

    activate: ->
        if not @active
            [viewport] = @viewports
            viewport.debug_camera = @debug_camera
            viewport.recalc_aspect()
            for behaviour in @context.behaviours when behaviour != this
                if viewport in behaviour._real_viewports
                    behaviour._real_viewports = behaviour._real_viewports[...]
                    behaviour._real_viewports.splice(
                        behaviour._real_viewports.indexOf(viewport), 1)
            @active = true

    deactivate: ->
        if @active
            [viewport] = @viewports
            viewport.debug_camera = null
            for behaviour in @context.behaviours when behaviour != this
                if viewport in behaviour.viewports
                    behaviour._real_viewports = rv = []
                    for v in behaviour.viewports when not v.debug_camera?
                        rv.push v
            @active = false

    on_key_down: (event) ->
        switch event.key.toLowerCase()
            when 'q'
                if @active
                    @deactivate()
                else
                    @activate()

    # on_object_pointer_down: (event) -> console.log 'down', event.object.name
    # on_object_pointer_up: (event) -> console.log 'up', event.object.name
    # on_object_pointer_move: (event) -> console.log 'move', event.object.name
    # on_object_pointer_over: (event) -> console.log 'over', event.object.name
    # on_object_pointer_out: (event) -> console.log 'out', event.object.name

module.exports = {DebugCamera}
