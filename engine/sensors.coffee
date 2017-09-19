{vec2, vec3, quat} = require 'vmath'
phy = require './physics.coffee'
{SceneBehaviour} = require './behaviour.coffee'
v3 = vec3.create()
PI_2 = Math.PI * 2
# Capture all the multitouch gestures over the objects in a collision mask

# input: int_mask (binary collision mask as integer)
# output:  {objet_name: {pos, rel_pos, pinch, rel_pinch, rot, rel_rot}, ...}
class TouchGesturesOver extends SceneBehaviour
    init: ->
        #hits by object_name
        @hits = {}
        #hits by touch_event.id
        @hits_by_touch_id = {}

    eval: (int_mask, use_mouse_events=true)->
        new_touches = @context.events.get_touch_events()
        if use_mouse_events and @context.events.mouse.any_button
            new_touches.push @context.events.mouse
        touch_ids = []
        cam = @scene.active_camera
        {width, height} = @context.canvas_rect

        cam_pos = cam.get_world_position()
        cam_view = {x:0,y:0,z:-1}
        vec3.transformQuat(cam_view,cam_view,cam.rotation)

        for touch in new_touches
            # pointer over
            {x,y,id} = touch
            touch_ids.push(id+'')
            x = x/width
            y = y/height
            rayto = cam.get_ray_direction(x,y)
            hit = phy.ray_intersect_body_absolute @scene, cam_pos, rayto, int_mask

            ob_name = @hits_by_touch_id[id]

            if hit?
                #Lock gestures to the first hit object
                ob = hit[0].owner
                ob_pos = ob.position
                ob_name = ob_name or hit[0].owner.name
                touch.hit = hit

            if ob_name?
                obhit = @hits[ob_name] = @hits[ob_name] or {
                    touch_events:{}
                    init_ratio: null
                    # Gesture sensors:
                    pinch_gesture: new PinchGesture @scene
                    rot_gesture: new RotationGesture @scene
                    drag_gesture: new DragGesture @scene
                    ob: ob
                    }

                # ray projection to gesture plane
                if not obhit.init_ratio?
                    obhit.init_ratio = obhit.init_ratio or
                    vec3.len(vec3.sub(vec3.create(),obhit.ob.position,cam_pos))/vec3.len(vec3.sub(vec3.create(),rayto,cam_pos))

                touch.world_position = vec3.scale(vec3.create(), rayto, obhit.init_ratio)

                obhit.touch_events[id] = touch
                @hits_by_touch_id[id] = ob_name


        #Reseting object locking if the finger is not touching
        for id, ob_name of @hits_by_touch_id
            #no ob_name means finger not touching
            if id not in touch_ids and ob_name
                @hits_by_touch_id[id] = null

                new_touch_events = {}
                for tid, touch of @hits[ob_name].touch_events
                    if tid != id
                        new_touch_events[tid] = touch

                @hits[ob_name].touch_events = new_touch_events

        for ob_name, hit of @hits
            if not Object.keys(hit.touch_events).length
                @hits[ob_name].init_ratio = null


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
                    touch_events_3D.push
                        id:touch.id,
                        x:touch.world_position.x
                        y:touch.world_position.y
                        z:touch.world_position.z
                    touch_events.push touch

                {pos, rel_pos, linear_velocity} = hit.drag_gesture.eval(touch_events_3D)

                # Capturing rotation/pinch gestures
                if fingers.length > 1
                    {pinch, rel_pinch} = hit.pinch_gesture.eval(touch_events_3D)
                    {rot, rel_rot, angular_velocity} = hit.rot_gesture.eval(touch_events)
                else if use_mouse_events and @context.events.mouse.any_button
                    pinch = 0
                    rel_pinch =  @context.events.mouse.wheel * 0.1
                else
                    # Reseting rotation/pinch  gestures
                    hit.pinch_gesture.init()
                    hit.rot_gesture.init()
                    {pinch, rel_pinch} = hit.pinch_gesture.eval(touch_events_3D)
                    {rot, rel_rot, angular_velocity} = hit.rot_gesture.eval(touch_events)

                output[ob_name] = {pos, rel_pos, linear_velocity, pinch, rel_pinch, rot, rel_rot, angular_velocity}
            else
                #reseting drag gesture
                hit.drag_gesture.init()
        return output

# Capture drag gestures (It must be used with 3D gestures,
# to capture pointers over screen please, use pointer_event.rel_x)

# Input: pointer_event (It accepts 2D/3D pointer_event as input).
# output: {pos, rel_pos}
class DragGesture extends SceneBehaviour
    init: ->
        @pos = []
        @last_pos = null
        @rel_pos = {x: 0, y:0, z:0}
        @id = null
        @linear_velocity = {x: 0, y:0, z:0}

    eval: (pointer_events)->
        frame_duration = @context.main_loop.frame_duration
        new_id = ''
        ix = iy = iz = 0
        for pointer in pointer_events
            {id,x,y,z} = pointer
            new_id += id + '_'
            ix += x
            iy += y
            iz += z

        n = pointer_events.length

        ix /= n
        iy /= n
        iz /= n
        #if pointer_event.id changes, the relative pos will be locked
        if new_id != @id
            @init()

        @id = new_id

        pos = @pos
        pos.x = ix
        pos.y = iy
        pos.z = iz or 0

        #Locking relative pos if pointer_event.id changes
        linear_velocity = vec3.scale(@linear_velocity,@rel_pos,1/frame_duration)
        @last_pos = if @last_pos? then @last_pos else pos

        rel_pos = vec3.sub(@rel_pos, pos, @last_pos)
        @last_pos = [ix,iy,iz]
        return {pos, rel_pos, linear_velocity}

# Capture pinch gestures

# Input: pointer_events [array] (It accepts 2D/3D pointer_event as input).
# output: {pinch, rel_pinch}
class PinchGesture extends SceneBehaviour
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

        [pe1, pe2] = pointer_events
        id1 = pe1.id
        id2 = pe2.id

        if @id1 != id1 or @id2 != id2
            @init()

        @id1 = id1
        @id2 = id2

        pos1 = @pos1
        pos2 = @pos2


        pos1.x = pe1.x
        pos1.y = pe1.y
        pos1.z = pe1.z or 0
        pos2.x = pe2.x
        pos2.y = pe2.y
        pos2.z = pe2.z or 0

        pinch = vec3.dist(pos1,pos2)

        #If last_pinch is null the rel_pinch must be 0
        last_pinch = if @pinch? then @pinch else pinch
        rel_pinch = pinch - last_pinch
        @pinch = pinch

        return {pinch, rel_pinch}
# Capture rotation gestures

# Input: pointer_events [array]. (It accepts 2D/3D pointer_event as input).
# output: {rot, rel_rot}
class RotationGesture extends SceneBehaviour
    init: ->
        @pos1 = []
        @pos2 = []
        @rot = null
        @id1 = null
        @id2 = null
        @tmpv = @tmpv or vec2.create()

    eval: (pointer_events)->
        frame_duration = @context.main_loop.frame_duration
        if pointer_events.length < 2
            return {
                rot:0
                rel_rot:0
            }

        [pe1, pe2] = pointer_events
        id1 = pe1.id
        id2 = pe2.id

        if @id1 != id1 or @id2 != id2
            @init()

        @id1 = id1
        @id2 = id2

        pos1 = @pos1
        pos2 = @pos2
        pos1.x = pe1.x
        pos1.y = pe1.y
        pos2.x = pe2.x
        pos2.y = pe2.y

        #rot
        r = @tmpv
        vec2.sub(r, pos2, pos1)
        x = r.x
        y = r.y

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
        angular_velocity = vec3.scale(vec3.create(),rel_rot,1/frame_duration)
        return {rot, rel_rot, angular_velocity}


pointer_over_no_phy = (pointer_event, cam, objects={})->
    # objects are considered as spheres
    #TODO: improve using bound box
    scene = cam.scene
    context = scene.context

    cam_pos = cam.get_world_position()
    {width, height} = context.canvas_rect

    {x,y} = pointer_event
    x = x/width
    y = y/height

    dir = cam.get_ray_direction(x,y)

    hits = []

    for ob in objects
        pos = ob.get_world_position()

        vec3.normalize dir, dir
        target_dir = vec3.scale v3, dir, vec3.dist(cam_pos, pos)
        vec3.add target_dir, cam_pos, target_dir
        dist = vec3.dist(target_dir, pos)

        if dist <= ob.radius
            hits.push
                object: ob
                point: vec3.add vec3.create(), pos, vdist

    return hits

# output {objet, point, normal}
pointer_over = (pointer_event, cam, int_mask)->
    scene = cam.scene
    context = scene.context

    pos = cam.get_world_position()
    {width, height} = context.canvas_rect

    {x,y} = pointer_event
    x = x/width
    y = y/height

    rayto = cam.get_ray_direction(x,y)

    return phy.ray_intersect_body_absolute scene, pos, rayto, int_mask

# Convert pointer event coords to an euler rotation (just like blender trackball rotation)
trackball_rotation = (pointer_event, scale_x=1, scale_y=1, z_influence=0.2)->
    {x, y, rel_x, rel_y} = pointer_event
    pos = vec2.new x,y
    rel = [scale*rel_x, scale*rel_y]
    fdist = vec2.len(pos)
    fdist2 = Math.pow(fdist,2)
    lastpos = vec2.sub({},pos,rel)
    if pos.y < 0 and lastpos.y<0
        vec2.negate(pos, pos)
        vec2.negate(lastpos, lastpos)

    rot1 = Math.atan2(pos.x, pos.y)
    rot2 = Math.atan2(lastpos.x, lastpos.y)
    rot = rot2-rot1

    return {
        x: rel.y*PI*(1-pos.y*z_influence),
        y: fdist2*rot*4*z_influence,
        z: rel.x*PI*(1-pos.x*z_influence),
    }

#Returns the closest point in a curve
curve_closest_point = (point=vec3.create(), curve)->
    p = vec3.clone(point)
    vec3.sub(p, p, curve.position)
    curve.rotation.w *= -1
    vec3.transformQuat(p, p, curve.rotation)
    curve.rotation.w *= -1
    p_n = curve.closest_point(p)
    point_in_curve = p_n.x
    tangent = p_n.y
    vec3.transformQuat(point_in_curve, point_in_curve, curve.rotation)
    vec3.transformQuat(tangent, tangent, curve.rotation)
    vec3.add(point_in_curve, point_in_curve, curve.position)
    return [point_in_curve, tangent]


#digital = [X,-X,Y,-Y,Z,-Z]
digital_to_axes = (digital=[0,0,0,0,0,0], normalize=false)->
    x = digital[0] - digital[1]
    y = digital[2] - digital[3]
    z = digital[4] - digital[5]
    axis = {x,y,z}
    if normalize
        vec3.normalize(axis, axis)
    return axis

axis_object_mapper = (pos, cam, axis)->
    # camera Z
    m = cam.world_matrix
    cpos = {x:m.m08,y:m.m09,z:m.m10}
    vec3.transformQuat(cpos, cpos, quat.invert(quat.create(), ob.rotation))
    a = atan2(cpos.x,cpos.y)

    return {
        x: - axis.x*cos(-a) + axis.y*sin(-a),
        y: - axis.y*cos( a) + axis.x*sin( a),
        z: 0
    }

module.exports = {TouchGesturesOver, RotationGesture, PinchGesture, pointer_over_no_phy, pointer_over, trackball_rotation, curve_closest_point, digital_to_axes, axis_object_mapper}
