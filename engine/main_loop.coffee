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
        @last_time = 0
        @timeout_timer = @timeout
        @enabled = false
        @stopped = false
        @context = context
        @_bound_tick = @tick.bind @
        @_bound_run = @run.bind @

    run: ->
        @stopped = false
        if @enabled
            return
        @req_tick = requestAnimationFrame @_bound_tick
        @enabled = true
        @last_time = performance.now()
        @reset_timeout()

    stop: ->
        if @req_tick?
            cancelAnimationFrame @req_tick
            @req_tick = null

        @enabled = false
        @stopped = true

    sleep: (sleep_time)->
        if @sleep_timeout?
            clearTimeout(@sleep_timeout)
            @sleep_timeout = null
        if @enabled
            @stop()
        @sleep_timeout = setTimeout(@_bound_run, sleep_time)

    tick: ->
        time = performance.now()
        @frame_duration = frame_duration = Math.min(time - @last_time, MAX_FRAME_DURATION)
        @last_time = time

        if  @enabled and @timeout_timer <= 0
            @enabled = false
            return

        @req_tick = requestAnimationFrame @_bound_tick
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

        @context.events.reset_frame_events()

    set_timeout: (timeout, reset=true)=>
        @timeout = timeout
        if reset then @reset_timeout()

    reset_timeout: =>
        if @stopped
            return
        @timeout_timer =  @timeout
        @enabled = true

module.exports = {MainLoop}
