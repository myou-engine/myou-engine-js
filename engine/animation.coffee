"use strict"

actions = {}
animations = {}
{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{update_ob_physics} = require './physics'

# An action is a bunch of animation splines, without specific start, end
# or any other setting
class Action

    # Channel format:
    # TYPE, NAME, PROPERTY, list of keys for each element
    # 'object', '', 'location', [[x keys], [y keys], [z keys]]
    # 'pose', bone_name, 'location', [...]
    # 'shape', shape_name, '', [[keys]]

    constructor: (name, channels, markers={})->
        @name = name
        @channels = {}
        @markers = markers
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

    action : null
    speed : 0
    pos : 0
    weight : 1
    factor : 1
    blendin_total : 0
    blendout_total : 0
    blendin_remaining : 0
    blendout_remaining : 0
    owner : null

evaluate_all_animations = (context, frame_duration_ms)->
    # TODO each animation will have a FPS setting
    # until then, we assume 60 fps animations,
    # and frame_factor adjusts the speed for that
    frame_factor = frame_duration_ms * 0.06

    for ob in context.all_anim_objects

        blended = []  # [orig_chan, final blend, total weight]

        for path of ob.affected_anim_channels
            blend = null
            weight = 0
            type = name = prop = ''
            for k,anim of ob.animations
                orig_chan = anim.action.channels[path]
                if not orig_chan
                    continue
                v = anim.action.get path, anim.pos
                w = anim.weight * anim.factor
                for i in [0...v.length]
                    v[i] *= w
                if blend is null
                    blend = v
                    type = orig_chan[0]
                    name = orig_chan[1]
                    prop = orig_chan[2]
                else
                    for i in [0...blend.length]
                        blend[i] += v[i]
                weight += w
            blended.push [type, name, prop, blend, weight]

        for chan in blended
            type = chan[0]
            name = chan[1]
            prop = chan[2]
            if type == 'object'
                target = ob
            else if type == 'pose'
                target = ob.bones[name]
            else if type == 'shape'
                target = ob.shapes
                prop = name
            else
                console.log "Unknown channel type:", type
            v = chan[3]
            wi = Math.max(1 - chan[4], 0)
            wo = 1 / Math.max(chan[4], 1)
            if v.length == 1
                v = v[0]
                target[prop] = (target[prop]*wi) + v*wo
            else
                p = target[prop]
                for j in [0...v.length]
                    p[j] = p[j]*wi + v[j]*wo
                if prop == 'rotation'
                    quat.normalize p, p
            i += 1

        for anim_id of ob.animations
            anim = ob.animations[anim_id]
            s = anim.speed * frame_factor
            anim.pos += s
            if s == 0
                #ob.del_animation(anim_id)
                continue
            bo_r = anim.blendout_remaining
            if bo_r > 0
                bo_r -= frame_factor
                if bo_r <= 0
                    #ob.del_animation(anim_id)
                    pass
                else
                    anim.blendout_remaining = bo_r
                    anim.weight = bo_r / anim.blendout_total

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

module.exports = {Action, Animation, evaluate_all_animations, stop_all_animations}
