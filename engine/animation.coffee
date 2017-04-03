{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{update_ob_physics} = require './physics.coffee'
{clamp} = window

# An action is a bunch of animation splines, without specific start, end
# or any other setting
class Action

    # Channel format:
    # TYPE, NAME, PROPERTY, list of keys for each element
    # 'object', '', 'location', [[x keys], [y keys], [z keys]]
    # 'pose', bone_name, 'location', [...]
    # 'shape', shape_name, '', [[keys]]

    constructor: (name, channels, markers=[], @scene)->
        @name = name
        @channels = {}
        @markers = markers
        @markers_by_name = {}
        for m in markers
            @markers_by_name[m.name] = m

        for ch in channels
            path = ch[0]+'.'+ch[1]+'.'+ch[2]
            @channels[path] = ch
            for i in ch[3]
                if i.length == 0
                    console.error 'Empty channel on ' + name + ' -> '+path
        return

    get: (channel_path, time)->
        ret_vec = []
        for ch in @channels[channel_path][3]
            # Format:
            # Every keyframe has a left handle, a point and a right handle
            #  0    1    2    3    4    5  ;  6    7    8    9
            # lhX, lhY, p_X, p_Y, rhX, rhY ; lhX, lhY, p_X, p_Y, ...
            #            0    1    2    3     4    5    6    7
            #           \_____________first_spline____________/
            last_x = ch[ch.length-4]
            if time > last_x
                ret_vec.push ch[ch.length-3]
            else if time <= ch[2]
                ret_vec.push ch[3]
            else
                idx = 2      # first point X
                while ch[idx] < time
                    idx += 6 # next point X
                spline = ch[idx-6...idx+2]

                rr = solve_roots(time, spline[0], spline[2],
                                       spline[4], spline[6])
                rr = Math.max(0, Math.min(1, rr))
                v = interpolate rr, spline[1], spline[3], spline[5], spline[7]

                #slen = spline[6] - spline[0]
                #f = (time-spline[0]) / slen
                ## linear interpolation
                #v = spline[7] * f + spline[1] * (1-f)
                ret_vec.push v
        return ret_vec

# An animation is a group of actions (usually one of them) with settings
# such as start, end, fade in/out, etc.
class Animation
    constructor: (objects, options) ->
        # TODO document and distinguish:
        # - methods that one can override (init, step)
        # - members usually assigned in step()
        # - members used in apply()
        # - methods for regular usage, that can be chained
        {exclude=[], start_marker, end_marker, strip_name_filter=/^/} = options or {}
        @_strip_name_filter = strip_name_filter
        full_exclude_list = []
        for thing in exclude
            if thing.length?
                full_exclude_list = full_exclude_list.concat thing
            else if thing instanceof Animation
                full_exclude_list = full_exclude_list.concat thing.objects
            else
                full_exclude_list.push thing
        @strips = []
        @objects = for ob in objects when ob not in exclude
            # TODO: Shall we do this when there are strips too?
            if ob.animation_strips.length == 0 and ob.actions.length != 0
                ob.animation_strips.push {
                    action: ob.actions[0]
                    frame_start: 0
                    frame_end: 1e99
                    action_frame_start: 0
                    action_frame_end: 1e99
                    scale: 1
                    blend_in: 0
                    blend_out: 0
                    reversed: false
                    extrapolation: 'HOLD'
                    blend_type: 'REPLACE'
                    name: ''
                }
            for strip in ob.animation_strips
                if strip_name_filter.test (strip.name or '')
                    @strips.push strip
            ob
        {@scene, scene: {@context}} = @objects[0]
        # Position in animation frames, usually assigned in step(),
        # used when evaluating the animation
        @pos = 0
        # Set and used when evaluating the animation to calculate frame_delta
        @last_eval = performance.now()
        # All the rest are only used in step()
        @speed = 0
        # Set start_frame and end_frame
        # from markers (if any) or from scene
        {markers_by_name, frame_start, frame_end} = @scene
        @start_frame = frame_start
        if start_marker? and markers_by_name[start_marker]?
            @start_frame = markers_by_name[start_marker].frame
        @end_frame = frame_end
        if end_marker? and markers_by_name[end_marker]?
            @end_frame = markers_by_name[end_marker].frame
        @init()

        @playing = false
        @_index = -1

    has_strips: ->
        @strips.length != 0

    debug_strip_filters: ->
        for ob in @objects
            for strip in ob.animation_strips
                console.log @_strip_name_filter, strip.name, @_strip_name_filter.test (strip.name or '')
        return

    play: ->
        if not @playing
            @last_eval = performance.now()
            @playing = true
        if @_index == -1
            {active_animations} = @context
            @_index = active_animations.length
            active_animations.push @
        return @

    pause: ->
        @playing = false
        if @_index != -1
            @context.active_animations.splice @_index, 1
            @_index = -1
        return @

    rewind: ->
        @pos = @start_frame
        return @

    stop: ->
        @pause()
        @pos = @start_frame
        return @

    set_frame: (@pos) -> @

    init: ->
        throw "Abstract class"

    step: (frame_delta) ->
        @pos += frame_delta * @speed

    apply: ->
        {actions} = @context
        for ob in @objects
            # TODO: optimize
            affected_channels = {}
            for strip in ob.animation_strips when strip in @strips
                {frame_start, frame_end, action_frame_start, action_frame_end} = strip
                strip_pos = @pos - frame_start
                strip_pos_reverse = frame_end - @pos
                blend_factor = clamp(strip_pos/strip.blend_in, 0, 1) * \
                              clamp(strip_pos_reverse/strip.blend_out, 0, 1)
                if blend_factor < 0.0000000000001
                    continue
                if strip.reversed
                    [strip_pos, strip_pos_reverse] = [strip_pos_reverse, strip_pos]
                switch strip.extrapolation
                    when 'HOLD_FORWARD'
                        if @pos < frame_start
                            continue
                    when 'NOTHING'
                        if @pos < frame_start or @pos > frame_end
                            continue
                action = actions[strip.action]
                scaled_pos = strip_pos/strip.scale
                # we're ignoring strip.repeat, instead we're only checking that
                # we're not exactly at the end or past it (or at the start for reversed)
                # since the repeat is implicit in the other 5 playback attributes we use
                if @pos < frame_end and @pos > frame_start
                    # TODO: check we're not off by one when repeating
                    scaled_pos %= action_frame_end - action_frame_start
                pos = clamp(scaled_pos + action_frame_start, action_frame_start, action_frame_end)
                for path, chan of action.channels
                    ac = affected_channels[path] = affected_channels[path] or []
                    ac.push {strip, action, pos, blend_factor}

            for path, strip_actions of affected_channels
                # First, iterate through all animations
                # to accumulate the result for this channel
                blend = null
                # TODO: blender seems to behave as if the influence of the first strip
                # is always 1 or 0, independently of other strips.
                # we're doing this (with blend_factor = 1 below)
                # but we want it to work across different animations
                # (including copies of the same animation)
                type = name = prop = ''
                for {strip, action, pos, blend_factor} in strip_actions
                    orig_chan = action.channels[path]
                    if not orig_chan
                        continue
                    v = action.get path, pos
                    if not blend?
                        type = orig_chan[0]
                        name = orig_chan[1]
                        prop = orig_chan[2]
                        blend = v[...].fill(prop=='scale')
                        blend_factor = 1
                    switch strip.blend_type
                        when 'REPLACE'
                            for i in [0...blend.length]
                                blend[i] = blend[i] + blend_factor*(v[i]-blend[i])
                        when 'ADD'
                            for i in [0...blend.length]
                                blend[i] += v[i] * blend_factor
                        when 'MULTIPLY'
                            for i in [0...blend.length]
                                blend[i] *= 1 + blend_factor*(v[i]-1)
                        when 'SUBSTRACT'
                            for i in [0...blend.length]
                                blend[i] -= v[i] * blend_factor

                # Then, apply the result to the object
                is_quat = prop == 'rotation'
                if prop == 'rotation_euler'
                    prop = 'rotation'
                if type == 'object'
                    target = ob
                else if type == 'pose'
                    target = ob.bones[name]
                else if type == 'shape'
                    # TODO: Shape keys may not be the first modifier
                    target = ob.vertex_modifiers[0]?.keys?[name]
                    prop = 'value'
                else
                    console.log "Unknown channel type:", type
                if not target
                    continue
                v = blend
                if v.length == 1
                    target[prop] = v[0]
                else
                    p = target[prop]
                    for j in [0...v.length]
                        p[j] = v[j]
                    if is_quat
                        quat.normalize p, p

            update_ob_physics ob
        return @

class LoopedAnimation extends Animation
    init: ->
        @pos = @start_frame
        @speed = 1

    step: (frame_delta) ->
        @pos += frame_delta * @speed
        if @pos > @end_frame
            @pos = @start_frame + (@pos - @end_frame)

class PingPongAnimation extends Animation
    init: ->
        @pos = @start_frame
        @speed = 1

    step: (frame_delta) ->
        @pos += frame_delta * @speed
        if @speed > 0 and @pos > @end_frame
            @speed = -@speed
            @pos = Math.max(@end_frame*2 - @pos, @start_frame)
        else if @speed < 0 and @pos < @start_frame
            @speed = -@speed
            @pos = Math.min(@start_frame*2 - @pos, @start_frame)

class FiniteAnimation extends Animation
    init: ->
        @pos = @start_frame
        @speed = 1

    step: (frame_delta) ->
        @pos += frame_delta * @speed
        if @pos > @end_frame
            @pos = @end_frame
            # even though we're calling stop,
            # it's being evaluated on this frame
            @stop()


evaluate_all_animations = (context, frame_duration_ms)->
    now = performance.now()
    for anim in context.active_animations
        delta = now - anim.last_eval
        anim.step(delta * 0.001 * anim.scene.anim_fps)
        anim.last_eval = now
        anim.apply()
    return

cubic_root = (d) ->
    if d > 0
        Math.pow d, 0.3333333333333333
    else
        -Math.pow -d, 0.3333333333333333

solve_roots = (x, p0, p1, p2, p3, s) ->
    # Adapted from Graphics Gems
    # And from Graphics Gems IV
    # Roots3And4.c, solver.c
    # by Jochen Schwarze

    tPI = (4.0 * Math.atan(1.0)) * 0.3333333333333333

    s = 0.0

    c0 = p0 - x
    c1 = -3.0 * p0 + 3.0 * p1
    c2 = 3.0 * p0 - 6.0 * p1 + 3.0 * p2
    c3 = -p0 + 3.0 * p1 - 3.0 * p2 + p3

    if  Math.abs(c3) <= 0.000000119209290
        if  Math.abs(c1) > 0.000000119209290
                s = -c0 / c1
        if  akEq(s)
                return 1
        if  Math.abs(c0) <= 0.000000119209290
                return 1
        return 0


    # normal form:
    # x^3 + Ax^2 + Bx + C = 0

    a = c2 / c3
    b = c1 / c3
    c = c0 / c3

    # substitute x = y - a/3 to eliminate quadric term:
    # x^3 +px + q = 0

    ao3 = a * 0.3333333333333333
    aa = a * a

    p = 0.3333333333333333 * (-0.3333333333333333 * aa + b)
    q = 0.5 * (2/27 * a * aa - 0.3333333333333333 * a * b + c)

    # use Cardano's formula
    cp = p * p * p
    d = q * q + cp

    if  Math.abs(d) <= 0.000000119209290
        if  Math.abs(q) <= 0.000000119209290
                # one triple solution
                s = 0.0
                console.log 'triple'
                return s
        else
                u = cubic_root -q

                # one single and one double solution
                s = 2.0 * u
                # try next
                if  not akEq(s - ao3)
                        s = -u
    else if  d < 0.0
        # three real solutions
        phi = 0.3333333333333333 * Math.acos(-q / Math.sqrt(-cp))
        t = 2.0 * Math.sqrt -p

        s = t * Math.cos phi
        if  not akEq(s - ao3)
                # try next
                s = -t *  Math.cos(phi + tPI)
                if  not akEq(s - ao3)
                        s = -t * Math.cos(phi - tPI)
    else
        # one real solution
        S = Math.sqrt d
        u = cubic_root(S - q)
        v = -cubic_root(S + q)
        s = u  + v


    # resubstitute
    s -= ao3
    return s


akEq = (v) ->
    return v >= -0.000000119209290 and v < 1+0.000000119209290

module.exports = {
    Action, Animation, LoopedAnimation, FiniteAnimation,
    evaluate_all_animations}
