"use strict"

evaluate_all_animations = require('./animation').evaluate_all_animations
# Logic assumes a frame won't be longer than this
# Below that point, things go slow motion
MAX_FRAME_DURATION = 167   # 10 fps

class MainLoop

    # All milliseconds
    frame_duration: 16
    last_frame_durations: [16, 16, 16, 16, 16, 16, 16, 16, 16, 16]
    _fdi: 0
    last_time: 0
    timeout: 5000
    timeout_timer: null
    enabled: false
    constructor: (context)->
        @context = context

    run: ->
        @_bound_tick = @tick.bind(@)
        requestAnimationFrame(@_bound_tick)
        @enabled = true
        @last_time = performance.now()

    stop: ->
        cancelAnimationFrame(@_bound_tick)
        @enabled = false

    tick: ->
        requestAnimationFrame(@_bound_tick)
        time = performance.now()
        @frame_duration = frame_duration = Math.min(time - @last_time, MAX_FRAME_DURATION)

        if @enabled == false or @context.loaded_scenes.length == 0
            return

        @last_frame_durations[@_fdi] = frame_duration
        @_fdi = (@_fdi+1) % @last_frame_durations.length

        @last_time = time

        for scene in @context.loaded_scenes
            if not scene.enabled
                continue

            if scene.rigid_bodies.length or scene.kinematic_characters.length
                get_last_char_phy(scene.kinematic_characters)
                step_world(scene.world, frame_duration * 0.001)
                phy_to_ob(scene.rigid_bodies)

            for f in scene.pre_draw_callbacks
                f(scene, frame_duration)

            for p in scene.active_particle_systems
                p._eval()

        evaluate_all_animations(frame_duration)
        for s in @context.active_sprites
            s.evaluate_sprite(frame_duration)
        @context.render_manager.draw_all()

        for scene in @context.loaded_scenes
            if not @context.scene? or not @context.scene.enabled
                continue
            callbacks = scene.post_draw_callbacks
            n_callbacks = callbacks.length
            while n_callbacks
                n_callbacks -= 1
                callbacks[n_callbacks](scene, frame_duration)

        @context.events.reset_frame_events()

    reset_timeout: ->
        #TODO: find Where is this created and what is the meaning
        #clearTimeout(@timeout_timer)
        @enabled = true
        # f = =>
        #     @enabled = false
        # @timeout_timer = setTimeout(f, @timeout)

module.exports = {MainLoop}
