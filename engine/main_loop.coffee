{evaluate_all_animations} = require './animation.coffee'
{get_last_char_phy, step_world, step_world, phy_to_ob} = require './physics.coffee'
# Logic assumes a frame won't be longer than this
# Below that point, things go slow motion
MAX_FRAME_DURATION = 167  # 6 fps
MAX_TASK_DURATION = MAX_FRAME_DURATION * 0.5

class MainLoop

    constructor: (context)->
        # All in milliseconds
        @frame_duration = 16
        # Time from beginning of a tick to the next (including idle time)
        (@last_frame_durations = new Float32Array(30)).fill?(16)
        # Time it takes for running (logic) JS code
        (@logic_durations = new Float32Array(30)).fill?(16)
        # Time it takes for physics evaluations
        (@physics_durations = new Float32Array(30)).fill?(16)
        # Time it takes for evaluating animations and constraints
        (@animation_durations = new Float32Array(30)).fill?(16)
        # Time it takes for submitting GL commands
        (@render_durations = new Float32Array(30)).fill?(16)
        @_fdi = 0
        @timeout_time = context.MYOU_PARAMS.timeout
        @tasks_per_tick = context.MYOU_PARAMS.tasks_per_tick || 1
        @reset_timeout()
        @last_time = 0
        @enabled = false
        @stopped = true
        @context = context
        @_bound_tick = @tick.bind @
        @_bound_run = @run.bind @
        @_frame_callbacks = []
        @frame_number = 0
        @update_fps = null # assign a function to be called every 30 frames

    run: ->
        @stopped = false
        @enabled = true
        if not @req_tick
            @req_tick = requestAnimationFrame @_bound_tick
        @last_time = performance.now()


    stop: ->
        if @req_tick?
            cancelAnimationFrame @req_tick
            @req_tick = null
        @enabled = false
        @stopped = true

    sleep: (time)->
        if @sleep_timeout_id?
            clearTimeout(@sleep_timeout_id)
            @sleep_timeout_id = null
        if @enabled
            @stop()
        @sleep_timeout_id = setTimeout(@_bound_run, time)

    add_frame_callback: (callback)->
        # Uncomment next line to debug trackebacks involving frame callbacks
        # return callback()
        @_frame_callbacks.push callback

    timeout: (time)->
        if @stopped
            return
        if @timeout_id?
            clearTimeout(@timeout_id)
            @timeout_id = null
        @enabled = true
        @timeout_id = setTimeout((=>@enabled = false), time)

    reset_timeout: =>
        if @timeout_time
            @timeout(@timeout_time)

    tick_once: ->
        if @req_tick?
            cancelAnimationFrame @req_tick
            @tick()
        else
            @tick()
            cancelAnimationFrame @req_tick
            @req_tick = null

    tick: ->
        {_HMD} = @context
        if _HMD?
            @req_tick = _HMD.requestAnimationFrame @_bound_tick
        else
            @req_tick = requestAnimationFrame @_bound_tick
        time = performance.now()
        @frame_duration = frame_duration = time - @last_time
        @last_time = time

        task_time = time
        max_task_time = MAX_TASK_DURATION + time
        while (task_time < max_task_time) and (@_frame_callbacks.length != 0)
            @_frame_callbacks.shift()()
            task_time = performance.now()

        if not @enabled
            return
        @last_frame_durations[@_fdi] = frame_duration

        # Limit low speed of logic and physics
        frame_duration = Math.min(frame_duration, MAX_FRAME_DURATION)

        for scene_name in @context.loaded_scenes
            scene = @context.scenes[scene_name]
            i = scene.pre_draw_callbacks.length+1
            while --i != 0
                scene.pre_draw_callbacks[scene.pre_draw_callbacks.length-i] scene, frame_duration

            for p in scene.active_particle_systems
                p._eval()

        time2 = performance.now()

        for scene_name in @context.loaded_scenes
            if scene.physics_enabled and (scene.rigid_bodies.length or scene.kinematic_characters.length)
                get_last_char_phy scene.kinematic_characters
                step_world scene.world, frame_duration * 0.001
                phy_to_ob scene.rigid_bodies

        time3 = performance.now()

        evaluate_all_animations @context, frame_duration

        time4 = performance.now()

        for name, video_texture of @context.video_textures
            #TODO: Optimize updating only the video_textures whose video is being played
            video_texture.update_texture?()

        # for s in @context.active_sprites
        #     s.evaluate_sprite frame_duration
        @context.render_manager.draw_all()

        time5 = performance.now()

        for scene_name in @context.loaded_scenes
            scene = @context.scenes[scene_name]
            i = scene.post_draw_callbacks.length+1
            while --i != 0
                scene.post_draw_callbacks[scene.post_draw_callbacks.length-i] scene, frame_duration

        @context.events.reset_frame_events()
        @frame_number += 1

        time6 = performance.now()

        @logic_durations[@_fdi] = (time2 - time) + (time6 - time5)
        @physics_durations[@_fdi] = time3 - time2
        @animation_durations[@_fdi] = time4 - time3
        @render_durations[@_fdi] = time5 - time4
        @_fdi = (@_fdi+1) % @last_frame_durations.length
        if @_fdi == 0 and @update_fps
            @update_fps {
                max_fps: 1000/Math.min.apply(null, @last_frame_durations),
                min_fps: 1000/Math.max.apply(null, @last_frame_durations),
                average_fps: 1000/average(@last_frame_durations),
                max_logic_duration: 1000/Math.max.apply(null, @logic_durations),
                average_logic_duration: average @logic_durations,
                max_physics_durations: 1000/Math.max.apply(null, @physics_durations),
                average_physics_durations: average @physics_durations,
                max_animation_durations: 1000/Math.max.apply(null, @animation_durations),
                average_animation_durations: average @animation_durations,
                max_render_durations: 1000/Math.max.apply(null, @render_durations),
                average_render_durations: average @render_durations,
            }


average = (list) ->
    r = 0
    for v in list
        r += v
    return r/list.length

module.exports = {MainLoop}
