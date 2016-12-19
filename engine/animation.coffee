actions = {}
animations = {}
{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{update_ob_physics} = require './physics.coffee'

# An action is a bunch of animation splines, without specific start, end
# or any other setting
class Action

    # Channel format:
    # TYPE, NAME, PROPERTY, list of keys for each element
    # 'object', '', 'location', [[x keys], [y keys], [z keys]]
    # 'pose', bone_name, 'location', [...]
    # 'shape', shape_name, '', [[keys]]

    constructor: (name, channels, markers={}, @scene)->
        @name = name
        @channels = {}
        @markers = markers
        @sorted_markers  = sorted_markers = []
        tmp_list = []
        for name,frame of markers
            tmp_list[frame] = {name,frame}

        for m in tmp_list
            if m? then sorted_markers.push m

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
    constructor: (@action) ->
        # Position in animation frames, usually assigned in update(),
        # used when evaluating the animation
        @pos = 0
        # Final factor is calculated from weight and fade in/out
        # usually in update(), and used when evaluating the animation.
        # Multiplies all values of each channel
        # and it's normalized with other animations playing the same channel
        # so the final factor of all animations combined will always be <= 1
        @final_factor = 1
        # Owner is set in ob.add_animation()
        # used when evaluating the animation
        @owner = null
        # Set and used when evaluating the animation to calculate frame_delta
        @last_eval = performance.now()
        # All the rest are only used in update()
        @speed = 0
        @weight = 1
        @blendin_total = 0
        @blendout_total = 0
        @blendin_remaining = 0
        @blendout_remaining = 0
        # Set start_frame and end_frame
        # from markers (if any) or from scene
        {markers, sorted_markers, scene} = @action
        @start_frame = markers['start']
        if not @start_frame?
            @start_frame = sorted_markers[0]?.frame
        if not @start_frame?
            @start_frame = scene.frame_start

        @end_frame = markers['end']
        if not @end_frame?
            @end_frame = sorted_markers[sorted_markers.length-1]?.frame
        if not @end_frame?
            @end_frame = scene.frame_end

    update: (frame_delta) ->
        @pos += frame_delta * @speed

class LoopedAnimation extends Animation
    update: (frame_delta) ->
        @pos += frame_delta * @speed
        if @pos > @end_frame
            @pos = @start_frame + (@pos - @end_frame)

class FiniteAnimation extends Animation
    update: (frame_delta) ->
        @pos += frame_delta * @speed
        if @pos > @end_frame
            @pos = @end_frame
            @speed = 0


evaluate_all_animations = (context, frame_duration_ms)->

    for ob in context.all_anim_objects

        # Update all animations
        now = performance.now()
        for k,anim of ob.animations
            delta = now - anim.last_eval
            anim.update(delta * 0.001 * ob.scene.anim_fps)
            anim.last_eval = now

        for path of ob.affected_anim_channels
            # First, iterate through all animations
            # to accumulate the result for this chanel
            blend = null
            weight = 0
            type = name = prop = ''
            for k,anim of ob.animations
                orig_chan = anim.action.channels[path]
                if not orig_chan
                    continue
                v = anim.action.get path, anim.pos
                w = anim.final_factor
                for i in [0...v.length]
                    v[i] *= w
                if not blend?
                    blend = v
                    type = orig_chan[0]
                    name = orig_chan[1]
                    prop = orig_chan[2]
                else
                    for i in [0...blend.length]
                        blend[i] += v[i]
                weight += w

            # Then, apply the result to the object
            is_quat = prop == 'rotation'
            if prop == 'rotation_euler'
                prop = 'rotation'
            if type == 'object'
                target = ob
            else if type == 'pose'
                target = ob.bones[name]
            else if type == 'shape'
                target = ob.shapes
                prop = name
            else
                console.log "Unknown channel type:", type
            v = blend
            wi = Math.max(1 - weight, 0)
            wo = 1 / Math.max(weight, 1)
            if v.length == 1
                v = v[0]
                target[prop] = (target[prop]*wi) + v*wo
            else
                p = target[prop]
                for j in [0...v.length]
                    p[j] = p[j]*wi + v[j]*wo
                if is_quat
                    quat.normalize p, p
            i += 1

        update_ob_physics ob

    return

stop_all_animations = ->
    for ob in _all_anim_objects[...]
        for anim_id of ob.animations
            ob.del_animation anim_id
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
    evaluate_all_animations, stop_all_animations}
