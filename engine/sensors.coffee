{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
phy = require './physics'
{LogicBlock} = require './logic_block'

# Capture all the multitouch gestures over the objects in a collision mask

# input: int_mask (binary collision mask as integer)
# output:  {objet_name: {pos, rel_pos, pinch, rel_pinch, rot, rel_rot}, ...}
class TouchGesturesOver extends LogicBlock
    init: (@scene)->
        #hits by object_name
        @hits = {}
        #hits by touch_event.id
        @hits_by_touch_id = {}

    eval: (int_mask)->
        new_touches = @context.events.get_touch_events()
        touch_ids = []
        cam = @scene.active_camera
        cam_pos = cam.get_world_position()
        {width, height} = @context.canvas_rect
        for touch in new_touches
            # pointer over
            {x,y,id} = touch
            touch_ids.push(id+'')
            x = x/width
            y = y/height
            rayto = cam.get_ray_direction(x,y)
            vec3.add(rayto, rayto, cam_pos)
            hit = phy.ray_intersect_body_absolute @scene, cam_pos, rayto, int_mask

            ob_name = @hits_by_touch_id[id]

            if hit?
                #Lock gestures to the first hit object
                ob_name = ob_name or hit[0].owner.name
                touch.hit = hit

            if ob_name?
                @hits[ob_name] = @hits[ob_name] or {
                    touch_events:{}
                    gesture_plane_dist: vec3.dist(hit[0].owner.position, cam_pos)
                    gestures:
                        drag: vec3.create()
                        pinch: 0
                        rel_pinch: 0
                        rotation: 0
                        rel_rotation: 0
                    # Gesture sensors:
                    pinch_gesture: new PinchGesture @context, @scene.name
                    rot_gesture: new RotationGesture @context, @scene.name
                    drag_gesture: new DragGesture @context, @scene.name
                    }

                #ray projection to gesture plane
                vec3.normalize(rayto,rayto)
                vec3.scale(rayto,rayto,@hits[ob_name].gesture_plane_dist)
                touch.world_pos = rayto

                @hits[ob_name].touch_events[id] = touch
                @hits_by_touch_id[id] = ob_name

        #Reseting object locking if the finger is not touching
        for id, ob_name of @hits_by_touch_id
            if id not in touch_ids and ob_name
                @hits_by_touch_id[id] = null
                new_touch_events = {}
                for tid, touch of @hits[ob_name].touch_events
                    if tid != id
                        new_touch_events[tid] = touch
                @hits[ob_name].touch_events = new_touch_events

        output = {}
        for ob_name, hit of @hits
            touch_events = []
            fingers = Object.keys(hit.touch_events)
            if fingers.length
                pinch = rot = rel_pinch = rel_rot = 0
                touch_events_3D = []
                touch_events = []

                # Capturing drag gesture
                for id, touch of hit.touch_events
                    touch_events_3D.push {id:touch.id, x:touch.world_pos[0], y:touch.world_pos[1], z:touch.world_pos[2]}
                    touch_events.push touch
                {pos, rel_pos} = hit.drag_gesture.eval(touch_events_3D[0])

                # Capturing rotation/pinch gestures
                if fingers.length > 1
                    {pinch, rel_pinch} = hit.pinch_gesture.eval(touch_events_3D)
                    {rot, rel_rot} = hit.rot_gesture.eval(touch_events)
                else
                    # Reseting rotation/pinch  gestures
                    hit.pinch_gesture.init()
                    hit.rot_gesture.init()
                    {pinch, rel_pinch} = hit.pinch_gesture.eval(touch_events_3D)
                    {rot, rel_rot} = hit.rot_gesture.eval(touch_events)

                output[ob_name] = {pos, rel_pos, pinch, rel_pinch, rot, rel_rot}
            else
                #reseting drag gesture
                hit.drag_gesture.init()
        return output

# Capture drag gestures (It must be used with 3D gestures,
# to capture pointers over screen please, use pointer_event.rel_x)

# Input: pointer_event (It accepts 2D/3D pointer_event as input).
# output: {pos, rel_pos}
class DragGesture extends LogicBlock
    init: (@scene)->
        @pos = []
        @last_pos = null
        @rel_pos = []
        @id = null
    eval: (pointer_event)->
        {id,x,y,z} = pointer_event
        #if pointer_event.id changes, the relative pos will be locked
        if id != @id
            @init()
        @id = id
        pos = @pos
        pos[0] = x
        pos[1] = y
        pos[2] = z or 0

        #Locking relative pos if pointer_event.id changes
        @last_pos = if @last_pos? then @last_pos else pos

        rel_pos = vec3.sub(@rel_pos, pos, @last_pos)
        @last_pos = [x,y,z]
        return {pos, rel_pos}

# Capture pinch gestures

# Input: pointer_events [array] (It accepts 2D/3D pointer_event as input).
# output: {pinch, rel_pinch}
class PinchGesture extends LogicBlock
    init: ->
        @pos1 = []
        @pos2 = []
        @pinch = null
        @id1 = null
        @id2 = null

    eval: (pointer_events)->
        if pointer_events.length < 2
            return {
                pinch:0
                rel_pinch:0
            }

        id1 = pointer_events[0].id
        id2 = pointer_events[1].id

        if @id1 != id1 or @id2 != id2
            @init()

        @id1 = id1
        @id2 = id2

        pos1 = @pos1
        pos2 = @pos2

        pos1[0] = pointer_events[0].x
        pos1[1] = pointer_events[0].y
        pos1[2] = pointer_events[0].z or 0
        pos2[0] = pointer_events[1].x
        pos2[1] = pointer_events[1].y
        pos2[2] = pointer_events[1].z or 0

        pinch = vec3.dist(pos1,pos2)

        #If last_pinch is null the rel_pinch must be 0
        last_pinch = if @pinch? then @pinch else pinch
        rel_pinch = pinch - last_pinch
        @pinch = pinch

        return {pinch, rel_pinch}
# Capture rotation gestures

# Input: pointer_events [array]. (It accepts 2D/3D pointer_event as input).
# output: {rot, rel_rot}
class RotationGesture extends LogicBlock
    init: ->
        @pos1 = []
        @pos2 = []
        @rot = null
        @id1 = null
        @id2 = null
        @tmpv = @tmpv or vec2.create()

    eval: (pointer_events)->
        if pointer_events.length < 2
            return {
                rot:0
                rel_rot:0
            }

        id1 = pointer_events[0].id
        id2 = pointer_events[1].id

        if @id1 != id1 or @id2 != id2
            @init()

        @id1 = id1
        @id2 = id2

        pos1 = @pos1
        pos2 = @pos2
        pos1[0] = pointer_events[0].x
        pos1[1] = pointer_events[0].y
        pos2[0] = pointer_events[1].x
        pos2[1] = pointer_events[1].y

        #rot
        r = @tmpv
        vec2.sub(r, pos2, pos1)
        x = r[0]
        y = r[1]

        if x > 0 # +X
            rot = Math.atan(y/x)
        else if x < 0 # -X
            rot = Math.atan(y/x) + Math.PI
        else
            if y > 0 # (0,+Y)
                rot = -Math.PI
            else if y < 0  # (0,-Y)
                rot = Math.PI
            else # (0,0)
                rot = @rot

        #If last_rot is null the rel_rot must be 0
        last_rot = if @rot? then @rot else rot

        rel_rot = rot - last_rot

        #Avoid rotation jump when the rotation completes a circle.
        if @rel_rot > 0.9 * PI_2
            @rel_rot = @rel_rot - PI_2

        @rot = rot
        return {rot, rel_rot}

# output {objet, point, normal}
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

module.exports = {TouchGesturesOver, RotationGesture, PinchGesture, pointer_over, trackball_rotation, curve_closest_point, digital_to_axes, axis_objet_mapper}