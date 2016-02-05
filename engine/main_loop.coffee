{evaluate_all_animations} = require './animation'
{get_last_char_phy, step_world, step_world, phy_to_ob} = require './physics'
# Logic assumes a frame won't be longer than this
# Below that point, things go slow motion
MAX_FRAME_DURATION = 167   # 10 fps

class MainLoop

    # All milliseconds
    frame_duration: 16
    last_frame_durations: [16, 16, 16, 16, 16, 16, 16, 16, 16, 16]
    _fdi: 0
    last_time: 0
    timeout: null
    timeout_timer: null
    enabled: false
    constructor: (context)->
        @context = context
        @timeout = context.MYOU_PARAMS.timeout
        @timeout? and console.log 'WARNING: Timeout set: ' + @timeout

    run: ->
        @_bound_tick = @tick.bind @
        requestAnimationFrame @_bound_tick
        not @enabled and @timeout? and console.log 'Main loop running: ' + Math.floor(performance.now())
        @enabled = true
        @last_time = performance.now()


    stop: ->
        cancelAnimationFrame @_bound_tick
        @enabled = false

    tick: ->
        requestAnimationFrame @_bound_tick
        time = performance.now()
        @frame_duration = frame_duration = Math.min time - @last_time, MAX_FRAME_DURATION


        if @timeout? and @timeout_timer > @timeout
            @stop()
            @timeout_timer = 0
            console.log 'Main loop paused: ' + Math.floor(time)

        if @enabled == false or @context.loaded_scenes.length == 0
            return

        @timeout_timer += frame_duration
        @last_frame_durations[@_fdi] = frame_duration
        @_fdi = (@_fdi+1) % @last_frame_durations.length

        @last_time = time

        for scene in @context.loaded_scenes
            if not scene.enabled
                continue

            if scene.rigid_bodies.length or scene.kinematic_characters.length
                get_last_char_phy scene.kinematic_characters
                step_world scene.world, frame_duration * 0.001
                phy_to_ob scene.rigid_bodies

            for f in scene.pre_draw_callbacks
                f scene, frame_duration

            for p in scene.active_particle_systems
                p._eval()

        evaluate_all_animations @context, frame_duration
        # for s in @context.active_sprites
        #     s.evaluate_sprite frame_duration
        @context.render_manager.draw_all()

        for scene in @context.loaded_scenes
            callbacks = scene.post_draw_callbacks
            n_callbacks = callbacks.length
            while n_callbacks
                n_callbacks -= 1
                callbacks[n_callbacks](scene, frame_duration)


        cancel_gesture = @context.events.two_finger_gestures()
        if cancel_gesture
            @context.events.touch.rel_rot = @context.events.touch.rel_pinch = 0
            @context.events.touch.rot = @context.events.touch.pinch = null

        @context.events.reset_frame_events()

    reset_timeout: =>
        @timeout_timer = 0
        @enabled = @enabled or @run()


module.exports = {MainLoop}
