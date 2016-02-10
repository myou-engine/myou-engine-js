{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
phy = require './physics'

# Returns [body, point, normal]
pointer_over = (pointer_event, cam, int_mask)->
    scene = cam.scene
    context = cam.scene.context
    events = context.events
    pos = cam.get_world_position()
    {width, height} = context.canvas_rect

    {x,y} = pointer_event
    x = x/width
    y = y/height

    rayto = cam.get_ray_direction(x,y)

    vec3.add(rayto, rayto, pos)
    vec3.copy(context.objects.Icosphere.position, rayto)

    return phy.ray_intersect_body_absolute scene, pos, rayto, int_mask

# Convert pointer event coords to an euler rotation (just like blender trackball rotation)
trackball_rotation = (pointer_event, scale_x=1, scale_y=1, z_influence=0.2)->
    {x, y, rel_x, rel_y} = pointer_event
    pos = [x,y]
    rel = [scale*rel_x, scale*rel_y]
    fdist = vec2.len(pos)
    fdist2 = Math.pow(fdist,2)
    lastpos = vec2.sub([],pos,rel)
    if pos[1] < 0 and lastpos[1]<0
        vec2.negate(pos, pos)
        vec2.negate(lastpos, lastpos)

    rot1 = Math.atan2(pos[0], pos[1])
    rot2 = Math.atan2(lastpos[0], lastpos[1])
    rot = rot2-rot1

    return [
        rel[1]*PI*(1-pos[1]*z_influence),
        fdist2*rot*4*z_influence,
        rel[0]*PI*(1-pos[0]*z_influence),
    ]

#Returns the closest point in a curve
curve_closest_point = (point=[0,0,0], curve)->
    p = vec3.clone(point)
    vec3.sub(p, p, curve.position)
    curve.rotation[3] *= -1
    vec3.transformQuat(p, p, curve.rotation)
    curve.rotation[3] *= -1
    p_n = curve.closest_point(p)
    point_in_curve = p_n[0]
    tangent = p_n[1]
    vec3.transformQuat(point_in_curve, point_in_curve, curve.rotation)
    vec3.transformQuat(tangent, tangent, curve.rotation)
    vec3.add(point_in_curve, point_in_curve, curve.position)
    return [point_in_curve, tangent]

module.exports = {pointer_over, trackball_rotation, curve_closest_point}

#digital = [X,-X,Y,-Y,Z,-Z]
digital_to_axes = (digital=[0,0,0,0,0,0], normalize=false)->
    x = digital[0] - digital[1]
    y = digital[2] - digital[3]
    z = digital[4] - digital[5]
    axis =  [x,y,z]
    if normalize
        vec3.normalize(axis, axis)
    return axis

axis_objet_mapper = (pos, cam, axis=[0,0,0])->
    # camera Z
    m = cam.world_matrix
    cpos = [m[8],m[9],m[10]]
    vec3.transformQuat(cpos, cpos, quat.invert([], ob.rotation))
    a = atan2(cpos[0],cpos[1])

    return [
        - axis[0]*cos(-a) + axis[1]*sin(-a),
        - axis[1]*cos( a) + axis[0]*sin( a),
        0
    ]
