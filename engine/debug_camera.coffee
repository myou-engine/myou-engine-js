{mat2, mat3, mat4, vec2, vec3, vec4, quat, color4, clamp} = require 'vmath'
{Behaviour} = require './behaviour'
{ray_intersect_body_absolute} = require './physics'

class DebugCamera extends Behaviour
    on_init: ->
        @debug_camera = @viewports[0].debug_camera = @viewports[0].camera.clone()
        @scene.clear_parent @debug_camera
        @debug_camera.set_rotation_order 'XYZ'
        @pivot = new @context.GameObject
        @pivot.set_rotation_order 'XYZ'
        @debug = @scene.get_debug_draw()
        # we use @active instead of enabling/disabling the behaviour,
        # to be able to re-enable with a key
        @active = true
        @rotating = false
        @panning = false
        @distance = @pan_distance = 5
        @debug = @scene.get_debug_draw()
        @pivot_vis = new @debug.Point
        @pivot_vis.position = @pivot.position
        @disable_context_menu()
        this.enable_object_picking()

    on_tick: ->
        return if not @active
        if not @rotating
            # Change pivot and distance
            {width, height} = @viewports[0]
            {object, point, normal} = @pick_object width*.5, height*.5, @viewports[0]
            if point?
                @distance = vec3.dist @debug_camera.position, point
                vec3.copy @pivot.position, point
            else
                vec3.set @pivot.position, 0, 0, -@distance
                vec3.transformMat4 @pivot.position, @pivot.position, @debug_camera.get_world_matrix()

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
        dist = @distance * .2 * (event.delta_y/54)
        dist = Math.max dist, -(@distance - @debug_camera.near_plane*1.2)
        @debug_camera.translate_z dist, @debug_camera
        @distance = vec3.dist @debug_camera.position, @pivot.position

    on_key_down: (event) ->
        switch event.key.toLowerCase()
            when 'q'
                @active = not @active
                if @active
                    @viewports[0].debug_camera = @debug_camera
                    @viewports[0].recalc_aspect()
                else
                    @viewports[0].debug_camera = null

    # on_object_pointer_down: (event) -> console.log 'down', event.object.name
    # on_object_pointer_up: (event) -> console.log 'up', event.object.name
    # on_object_pointer_move: (event) -> console.log 'move', event.object.name
    # on_object_pointer_over: (event) -> console.log 'over', event.object.name
    # on_object_pointer_out: (event) -> console.log 'out', event.object.name

module.exports = {DebugCamera}
