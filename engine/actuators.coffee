{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'

SIGNED_AXES = {'X': 1, 'Y': 2, 'Z': 3, '-X': -1, '-Y': -2, '-Z': -3}

#rotate objet around target
rotate_around = (ob, target=[0,0,0], rotation=[0,0,0])->
    pos = ob.position
    rot = ob.rotation
    invrot = quat.invert([], rot)
    obr = quat.create()
    quat.rotateX(obr, obr, v[0])
    quat.rotateY(obr, obr, v[1])
    quat.rotateZ(obr, obr, v[2])
    pos = vec3.sub(pos, pos, target)
    vec3.transformQuat(pos, pos, invrot)
    vec3.transformQuat(pos, pos, obr)
    vec3.transformQuat(pos, pos, rot)
    vec3.add(pos, pos, target)
    quat.mul(rot, rot, obr)

#rotate object to look at target.
look_at = (viewer, target, viewer_up='Z', viewer_front='-Y', smooth, frame_duration)->
    u_idx = SIGNED_AXES[viewer_up]
    f_idx = SIGNED_AXES[viewer_front]
    tup = [0,0,1]
    #vec3.transformQuat(tup, tup, viewer.rotation)
    if u_idx < 0
        tup = vec3.negate(vec3.clone(tup),tup)
    origin = viewer.get_world_position()
    u = abs(u_idx) - 1
    f = abs(f_idx) - 1
    s = 3 - u - f

    if f_idx < 0
        front = vec3.sub([], origin, target)
    else
        front = vec3.sub([], target, origin)
    up = vec3.clone(tup)
    if u == 1 or f == 2
        side = vec3.cross([], up, front)
    else:
        side = vec3.cross([], front, up)
    # TODO: should be this condition above?
    if [0,1,0,0,1][2-f+s]
        up = vec3.cross(up, side, front)
    else
        up = vec3.cross(up, front, side)
    vec3.normalize(side, side)
    vec3.normalize(up, up)
    vec3.normalize(front, front)
    m = mat3.create()
    m[u] = up[0]
    m[u+3] = up[1]
    m[u+6] = up[2]
    m[f] = front[0]
    m[f+3] = front[1]
    m[f+6] = front[2]
    m[s] = side[0]
    m[s+3] = side[1]
    m[s+6] = side[2]
    n = frame_duration * 0.06 #frame duration in seconds * 60
    smooth = max(0,1 - smooth)
    smooth = 1 - Math.pow(smooth, n) * Math.pow((1/smooth - 1), n)
    viewer_rotation = viewer.rotation
    quat.slerp(viewer_rotation, viewer_rotation, quat.fromMat3([], m), smooth)
    # necessary only for paralell up and front
    # also for lerps
    quat.normalize(viewer_rotation, viewer_rotation)

snap_to_curve = (ob, curve, pos_axes=[1,1,1], front='-Y', up'Z', ,position_factor=1, rotation_factor=1)->
    filter = pos_axes
    antifilter = vec3.sub([], [1,1,1], filter)
    ob_position = ob.position
    vec3.sub(ob_position, ob_position, curve.position)
    curve.rotation[3] *= -1
    vec3.transformQuat(ob_position, ob_position, curve.rotation)
    curve.rotation[3] *= -1
    p_n = curve.closest_point(ob_position, filter)
    point = p_n[0]
    vec3.mul(point, point, filter)
    pre_filtered = vec3.mul([], ob_position, antifilter)
    vec3.add(point, point, pre_filtered)
    t = position_factor
    n = frame_factor
    t = 1 - Math.pow(t, n) * Math.pow((1/t - 1), n)
    vec3.lerp(ob_position, ob_position, point, t)
    vec3.transformQuat(ob_position, ob_position, curve.rotation)
    vec3.add(ob_position, ob_position, curve.position)

    rotation_factor = rotation_factor
    if rotation_factor
        normal = p_n[1]
        vec3.transformQuat(normal, normal, curve.rotation)

        #look_at
        smooth =  1 - abs(rotation_factor)
        target = vec3.add(normal, normal, ob_position)

        look_at(ob, target, [1,1,1] front, up, smooth)

module.exports = {rotate_around, look_at, snap_to_curve}
