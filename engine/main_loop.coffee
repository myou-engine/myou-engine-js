{evaluate_all_animations} = require './animation'
{get_last_char_phy, step_world, step_world, phy_to_ob} = require './physics'
# Logic assumes a frame won't be longer than this
# Below that point, things go slow motion
MAX_FRAME_DURATION = 167  # 6 fps

class MainLoop

    constructor: (context)->
        # All milliseconds
        @frame_duration = 16
        @last_frame_durations = [16, 16, 16, 16, 16, 16, 16, 16, 16, 16]
        @_fdi = 0
        @timeout = context.MYOU_PARAMS.timeout
        @timeout? and console.log 'WARNING: Timeout set: ' + @timeout
        @pause_time = 0
        @last_time = 0
        @timeout_timer = @timeout
        @enabled = false
        @context = context
        @_bound_tick = @tick.bind @

    run: ->
        if @enabled
            return
        requestAnimationFrame @_bound_tick
        not @enabled and @timeout? and console.log 'Main loop running: ' + Math.floor(performance.now())
        @enabled = true
        @last_time = performance.now()

    stop: ->
        cancelAnimationFrame @_bound_tick
        @enabled = false

    pause: (pause_time)->
        if not pause_time?
            console.log 'WARNING: Undefined pause_time.'
        @pause_time = pause_time

    tick: ->
        requestAnimationFrame @_bound_tick
        time = performance.now()
        @frame_duration = frame_duration = Math.min(time - @last_time, MAX_FRAME_DURATION)
        @last_time = time

        if not @enabled or @pause_time > 0
            @pause_time -= frame_duration
            return

        if  @enabled and @timeout_timer <= 0
            console.log  'Main loop paused: ' + Math.floor(time)
            @enabled = false
            return

        @timeout_timer -= frame_duration
        @last_frame_durations[@_fdi] = frame_duration
        @_fdi = (@_fdi+1) % @last_frame_durations.length


        for scene in @context.loaded_scenes
            if not scene.enabled
                continue

            for f in scene.pre_draw_callbacks
                f scene, frame_duration

            for f in scene.logic_ticks
                f frame_duration

            for p in scene.active_particle_systems
                p._eval()

            if scene.rigid_bodies.length or scene.kinematic_characters.length
                get_last_char_phy scene.kinematic_characters
                step_world scene.world, frame_duration * 0.001
                phy_to_ob scene.rigid_bodies



        evaluate_all_animations @context, frame_duration
        # for s in @context.active_sprites
        #     s.evaluate_sprite frame_duration
        @context.render_manager.draw_all()

        for scene in @context.loaded_scenes
            for f in scene.post_draw_callbacks
                f scene, frame_duration




        cancel_gesture = @context.events.two_finger_gestures()
        if cancel_gesture
            @context.events.touch.rel_rot = @context.events.touch.rel_pinch = 0
            @context.events.touch.rot = @context.events.touch.pinch = null

        @context.events.reset_frame_events()

    set_timeout: (timeout, reset=true)=>
        'WARNING: Timeout set: ' + timeout
        @timeout = timeout
        if reset then @reset_timeout()

    reset_timeout: =>
        if not @enabled
            console.log 'Main loop running: ' + Math.floor( performance.now())

        @timeout_timer =  @timeout
        @enabled = true


module.exports = {MainLoop}
