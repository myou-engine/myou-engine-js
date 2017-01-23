{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'

_phy_obs_ptrs = {} # used in body creation/destruction, colliding_bodies and ray_intersect_bodies
_tmp_Vector3 = _tmp_Vector3b = _tmp_Vector3c = _tmp_Quaternion = _tmp_Transform = \
_tmp_ClosestRayResultCallback = destroy = null

physics_engine_init = ->
    # avoiding allocations
    _tmp_Vector3 = new Ammo.btVector3 0, 0, 0
    _tmp_Vector3b = new Ammo.btVector3 0, 0, 0
    _tmp_Vector3c = new Ammo.btVector3 0, 0, 0
    _tmp_Quaternion = new Ammo.btQuaternion 0, 0, 0, 0
    _tmp_Transform = new Ammo.btTransform
    _tmp_ClosestRayResultCallback = new Ammo.ClosestRayResultCallback new Ammo.btVector3(0, 0, 0), new Ammo.btVector3(0, 0, 0)
    destroy = Ammo.destroy or (o)-> o.destroy()

xyz = (v)->
    p = v.ptr>>2
    return Ammo.HEAPF32.subarray p,p+3

PhysicsWorld = ->
    configuration = new Ammo.btDefaultCollisionConfiguration
    dispatcher = new Ammo.btCollisionDispatcher configuration
    broadphase = new Ammo.btDbvtBroadphase
    #ghost_pair_callback = new Ammo.btGhostPairCallback
    #broadphase.getOverlappingPairCache().setInternalGhostPairCallback(ghost_pair_callback)
    solver = new Ammo.btSequentialImpulseConstraintSolver
    world = new Ammo.btDiscreteDynamicsWorld dispatcher, broadphase, solver, configuration
    world.pointers = [solver, broadphase, dispatcher, configuration]
    return world

destroy_world = (world)->
    pointers = world.pointers
    destroy world
    for p in pointers
        destroy p
    return

PhyVec3 = (x, y, z)->
    return  new Ammo.btVector3 x, y, z
    # warning: new objects are not freed automatically

PhyQuat = (x, y, z, w)->
    return  new Ammo.btQuaternion x, y, z, w

BoxShape = (x, y, z, margin)->
    _tmp_Vector3.setValue x, y, z
    shape =  new Ammo.btBoxShape _tmp_Vector3
    shape.setMargin margin
    return shape

SphereShape = (radius, margin)->
    shape =  new Ammo.btSphereShape radius
    shape.setMargin margin
    return shape

CylinderShape = (radius, height, margin)->
    _tmp_Vector3.setValue radius, radius, height
    shape =  new Ammo.btCylinderShapeZ _tmp_Vector3
    shape.setMargin margin
    return shape

CapsuleShape = (radius, height, margin)->
    shape =  new Ammo.btCapsuleShapeZ radius, (height-radius)*2
    shape.setMargin margin
    return shape

ConvexShape = (vertices, vstride, scale, margin)->
    vlen = vertices.length/vstride

    # This should be faster but it doesn't work

    #verts = _malloc(vlen*vstride*4)
    #HEAPU32.set(vertices, verts>>2)
    #shape = new Ammo.btConvexHullShape(verts, vlen, vstride*4)
    #_free(verts)

    shape = new Ammo.btConvexHullShape
    p = shape.ptr
    i = 0
    last = vlen-1
    for i in [0...vlen]
        j = i*vstride
        _tmp_Vector3.setValue vertices[j], vertices[j+1], vertices[j+2]
        shape.addPoint _tmp_Vector3, i==last
    _tmp_Vector3.setValue scale[0], scale[1], scale[2]
    shape.setLocalScaling _tmp_Vector3
    shape.setMargin margin
    return shape

get_convex_hull_edges = (vertices, vstride)->
    # TODO: return faces instead of edges,
    # use a different function to get edges
    # and use original vertices
    vlen = vertices.length/vstride
    verts = []
    for i in [0...vlen]
        j = i*vstride
        verts.push [vertices[j], vertices[j+1], vertices[j+2]]
    faces = convexHull verts
    verts = new Float32Array faces.length*9
    indices = new Int16Array faces.length*6
    for i in [0...faces.length]
        i3 = i*3
        i6 = i*6
        i9 = i*9
        f = faces[i].vertices
        verts.set f[0], i9
        verts.set f[1], i9+3
        verts.set f[2], i9+6
        indices[i6] = i3
        indices[i6+1] = i3+1
        indices[i6+2] = i3+1
        indices[i6+3] = i3+2
        indices[i6+4] = i3+2
        indices[i6+5] = i3
        i+=1
    return [verts, indices]

TriangleMeshShape = (vertices, indices, vstride, scale, margin, name)->
    # TODO all this is not deleted
    #pn = performance.now()
    vlen = vertices.length/vstride
    if not Ammo._malloc
        inds = new Uint32Array(indices)
        verts = new Float32Array(vlen*3)
        offset = 0
        for v in [0...vlen]
            verts.set vertices.subarray(v*vstride,v*vstride+3), offset
            offset += 3
        mesh = new Ammo.btTriangleIndexVertexArray(indices.length/3, inds.buffer, 3*4,
                                                vlen, verts.buffer, 3*4)
        mesh.things = [inds, verts] # avoid deleting those
        # crashes because wrapbtBvhTriangleMeshShape::calculateLocalInertia
        # is being called for some reason
        
        ## another failed attempt below
        # mesh = new Ammo.btTriangleMesh(true, true)
        # for i in [0...indices.length] by 3
        #     v = vertices.subarray(indices[i]*vstride, indices[i]*vstride + 3)
        #     _tmp_Vector3.setValue v[0], v[1], v[2]
        #     v = vertices.subarray(indices[i+1]*vstride, indices[i+1]*vstride + 3)
        #     _tmp_Vector3b.setValue v[0], v[1], v[2]
        #     v = vertices.subarray(indices[i+2]*vstride, indices[i+2]*vstride + 3)
        #     _tmp_Vector3c.setValue v[0], v[1], v[2]
        #     mesh.addTriangle _tmp_Vector3, _tmp_Vector3b, _tmp_Vector3c
    else
        inds = Ammo._malloc indices.length*4
        Ammo.HEAPU32.set indices, inds>>2
        verts = Ammo._malloc vlen*3*4
        offset = verts>>2
        HEAPF32 = Ammo.HEAPF32
        for v in [0...vlen]
            HEAPF32.set vertices.subarray(v*vstride,v*vstride+3), offset
            offset += 3
        mesh = new Ammo.btTriangleIndexVertexArray(indices.length/3, inds, 3*4,
                                                vlen, verts, 3*4)
    shape =  new Ammo.btBvhTriangleMeshShape mesh, true, true
    shape.name = name
    _tmp_Vector3.setValue scale[0], scale[1], scale[2]
    shape.setLocalScaling _tmp_Vector3
    shape.setMargin margin
    shape.calculateLocalInertia = ->
    return shape

CompoundShape = ->
    return new Ammo.btCompoundShape

RigidBody = (mass, shape, position, rotation, friction, elasticity, form_factor)->
    localInertia =  new Ammo.btVector3 0, 0, 0
    if mass
        shape.calculateLocalInertia mass, localInertia
    startTransform = new Ammo.btTransform
    _tmp_Vector3.setValue position[0], position[1], position[2]
    startTransform.setOrigin _tmp_Vector3
    _tmp_Quaternion.setValue rotation[0], rotation[1], rotation[2], rotation[3]
    startTransform.setRotation _tmp_Quaternion
    myMotionState =  new Ammo.btDefaultMotionState startTransform
    rbInfo =  new Ammo.btRigidBodyConstructionInfo mass, myMotionState, shape, localInertia
    rbInfo.set_m_friction friction
    rbInfo.set_m_restitution elasticity
    body =  new Ammo.btRigidBody rbInfo
    body.pointers = [rbInfo, myMotionState, startTransform, localInertia]
    # TODO test destroy(shape)
    if body.getPtr
        _phy_obs_ptrs[body.getPtr()] = body
    else
        _phy_obs_ptrs[body.ptr] = body
    return body

StaticBody = (shape, position, rotation, friction, elasticity)->
    return RigidBody 0, shape, position, rotation, friction, elasticity, 0

_character_controllers = []

CharacterBody = (shape, position, rotation, step_height, axis, gravity, jump_speed, fall_speed, max_slope)->
    body = new Ammo.btPairCachingGhostObject
    body.setCollisionFlags 16 # CF_CHARACTER_OBJECT
    body.setCollisionShape shape
    char = body.char = new Ammo.btKinematicCharacterController body, shape, step_height, axis
    char.setGravity gravity
    char.setJumpSpeed jump_speed
    char.setFallSpeed fall_speed
    char.setMaxSlope max_slope
    _character_controllers.push body.char
    startTransform = new Ammo.btTransform
    _tmp_Vector3.setValue position[0], position[1], position[2]
    startTransform.setOrigin _tmp_Vector3
    _tmp_Quaternion.setValue rotation[0], rotation[1], rotation[2], rotation[3]
    startTransform.setRotation _tmp_Quaternion
    body.setWorldTransform startTransform
    body.pointers = [body.char, startTransform]
    # TODO test destroy(shape)
    if body.getPtr
        _phy_obs_ptrs[body.getPtr()] = body
    else
        _phy_obs_ptrs[body.ptr] = body
    return body

destroy_body = (body)->
    if body.getPtr
        delete _phy_obs_ptrs[body.getPtr()]
    else
        delete _phy_obs_ptrs[body.ptr]
    if body.char
        _character_controllers.remove body.char
    pointers = body.pointers
    destroy body
    for p in pointers
        destroy p
    return

class Ray
    constructor: ->
        @origin =  new Ammo.btVector3 0, 0, 0
        @rayto =  new Ammo.btVector3 0, 0, 0

    destroy: ->
        destroy @origin
        destroy @rayto

# Shape methods

add_child_shape = (comp, shape, p, o)->
    _tmp_Vector3.setValue(p[0], p[1], p[2])
    _tmp_Quaternion.setValue(o[0], o[1], o[2], o[3])
    _tmp_Transform.setOrigin(_tmp_Vector3)
    _tmp_Transform.setRotation(_tmp_Quaternion)
    comp.addChildShape(_tmp_Transform, shape)
    #transform.destroy()
    #rot.destroy()
    #pos.destroy()

# World methods

set_gravity = (world, x, y, z)->
    _tmp_Vector3.setValue(x, y, z)
    world.setGravity(_tmp_Vector3)
    #for b in _character_controllers
        #b.setGravity(-z)

add_body = (world, body, collision_filter_group, collision_filter_mask)->
    if body.char
        world.addCollisionObject(body, collision_filter_group, collision_filter_mask)
        world.addAction(body.char)
    else
        world.addRigidBody(body, collision_filter_group, collision_filter_mask)

remove_body = (world, body)->
    if body.char
        world.removeAction(body.char)
        world.removeCollisionObject(body)
    else
        world.removeRigidBody(body)
    destroy_body(body)

step_world = (world, time_step)->
    world.stepSimulation(time_step, 10)

# object/body methods
set_body_deactivation_time = (body, time)->
    body.setDeactivationTime(time)

activate_body = (body)->
    body.activate()

update_ob_physics = (ob)->
    if ob.body?
        if ob.parent
            posrot = ob.get_world_pos_rot()
            pos = posrot[0]
            rot = posrot[1]
        else
            pos = ob.position
            rot = ob.rotation
        _tmp_Vector3.setValue(pos[0], pos[1], pos[2])
        _tmp_Transform.setOrigin(_tmp_Vector3)
        _tmp_Quaternion.setValue(rot[0], rot[1], rot[2], rot[3])
        _tmp_Transform.setRotation(_tmp_Quaternion)
        ob.body.setWorldTransform(_tmp_Transform)
        ob.body.activate()

set_phy_scale = (ob, scale)->
    world = ob.scene.world
    body = ob.body
    world.removeRigidBody(body)
    ob.phy_he = scale
    _tmp_Vector3.setValue(scale[0], scale[1], scale[2])
    ob.shape.setImplicitShapeDimensions(_tmp_Vector3)
    world.addRigidBody(body, ob.collision_group, ob.collision_mask)

deactivate_body = (body)->
    body.setActivationState(2)

set_body_activation_state = (body, bool_state)->
    if bool_state
        body.activate()
    else
        body.setActivationState(2)

allow_sleeping = (body, allow)->
    # BulletCollision/CollisionDispatch/btCollisionObject.h
    if allow
        # ACTIVE_TAG
        body.setActivationState(1)
    else
        # DISABLE_DEACTIVATION
        body.setActivationState(4)

make_ghost = (body, is_ghost)->
    # CF_NO_CONTACT_RESPONSE = 4
    if is_ghost
        body.setCollisionFlags(body.getCollisionFlags() | 4)
    else
        body.setCollisionFlags(body.getCollisionFlags() & -5)

colliding_bodies = (body)->
    ret = []
    p = body.ptr or body.getPtr()
    dispatcher = scene.world.getDispatcher()
    for i in [0...dispatcher.getNumManifolds()]
        m = dispatcher.getManifoldByIndexInternal(i)
        num_contacts = m.getNumContacts()
        if num_contacts!=0
            has_contact = false
            for j in [0...num_contacts]
                point = m.getContactPoint(j)
                if point.get_m_distance1()<0
                    has_contact = true
            if has_contact
                b0 = m.getBody0()
                b1 = m.getBody1()
                if b0 == p
                    ret.push(_phy_obs_ptrs[b1])
                else if b1 == p
                    ret.push(_phy_obs_ptrs[b0])
    return ret

get_linear_velocity = (body, local = false)->
    v = body.getLinearVelocity()
    if local
        ir = quat.invert(quat.create(), body.owner.get_world_rotation())
        new_v = vec3.transformQuat(vec3.create(), [v.x(), v.y(), v.z()], ir)
        return new_v
    return [v.x(), v.y(), v.z()]

set_linear_velocity = (body, v)->
    _tmp_Vector3.setValue(v[0], v[1], v[2])
    body.setLinearVelocity(_tmp_Vector3)


set_character_velocity = (body, v)->
    _tmp_Vector3.setValue(v[0] * 0.016666666666666666, v[1] * 0.016666666666666666, v[2] * 0.016666666666666666)
    body.char.setWalkDirection(_tmp_Vector3)

set_character_jump_force = (body, f)->
    body.char.setJumpSpeed(f)
    body.owner.jump_force = f

character_jump = (body)->
    body.char.jump()

on_ground = (body)->
    return body.char.onGround()

set_max_fall_speed = (body, f)->
    body.char.setFallSpeed(f)
    body.owner.max_fall_speed = f

get_angular_velocity = (body, local = false)->
    v = body.getAngularVelocity()
    if local
        ir = quat.invert(quat.create(), body.owner.get_world_rotation())
        new_v = vec3.transformQuat(vec3.create(), [v.x(), v.y(), v.z()], ir)
        return new_v
    return [v.x(), v.y(), v.z()]


set_angular_velocity = (body, v)->
    _tmp_Vector3.setValue(v[0], v[1], v[2])
    body.setAngularVelocity(_tmp_Vector3)

get_mass = (body)->
    return body.owner.mass

set_mass = (body)->
    console.log 'set_mass not implemented'

apply_force = (body, force, rel_pos)->
    #f = 1/frame_factor
    # TODO: Find out why is this necesary and how to fix it
    #f = Math.pow(1/frame_factor, 1.025)
    _tmp_Vector3.setValue(force[0], force[1], force[2])
    _tmp_Vector3b.setValue(rel_pos[0], rel_pos[1], rel_pos[2])
    body.applyForce(_tmp_Vector3, _tmp_Vector3b)

apply_central_force = (body, force)->
    f = Math.pow(1/frame_factor, 1.025)
    _tmp_Vector3.setValue(force[0] * f, force[1] * f, force[2] * f)
    body.applyCentralForce(_tmp_Vector3)

apply_central_impulse = (body, force)->
    _tmp_Vector3.setValue(force[0], force[1], force[2])
    body.applyCentralImpulse(_tmp_Vector3)

set_linear_factor = (body, factor)->
    _tmp_Vector3.setValue(factor[0], factor[1], factor[2])
    body.setLinearFactor(_tmp_Vector3)

set_angular_factor = (body, factor)->
    _tmp_Vector3.setValue(factor[0], factor[1], factor[2])
    body.setAngularFactor(_tmp_Vector3)

ob_to_phy = (ob_list)->
    for ob in ob_list
        if ob.parent
            posrot = ob.get_world_pos_rot()
            pos = posrot[0]
            rot = posrot[1]
        else
            pos = ob.position
            rot = ob.rotation
        _tmp_Vector3.setValue(pos[0], pos[1], pos[2])
        _tmp_Transform.setOrigin(_tmp_Vector3)
        _tmp_Quaternion.setValue(rot[0], rot[1], rot[2], rot[3])
        _tmp_Transform.setRotation(_tmp_Quaternion)
        ob.body.setWorldTransform(_tmp_Transform)
    return

ob_to_phy_with_scale = (ob_list)->
    pos = vec3.create()
    rot = quat.create()
    for ob in ob_list when ob.body
        p = ob.parent
        vec3.copy pos, ob.position
        quat.copy rot, ob.rotation
        scale = ob.scale[0]
        while p
            vec3.mul pos, pos, p.scale
            vec3.transformQuat pos, pos, p.rotation
            vec3.add pos, pos, p.position
            quat.mul rot, p.rotation, rot
            scale *= p.scale[0]
            p = p.parent
        _tmp_Vector3.setValue(pos[0], pos[1], pos[2])
        _tmp_Transform.setOrigin(_tmp_Vector3)
        _tmp_Quaternion.setValue(rot[0], rot[1], rot[2], rot[3])
        _tmp_Transform.setRotation(_tmp_Quaternion)
        ob.body.setWorldTransform(_tmp_Transform)
        if ob.data.phy_mesh
            # TODO: avoid doing this when scale didn't change?
            # remove ob_to_phy?
            _tmp_Vector3.setValue scale, scale, scale
            ob.data.phy_mesh.setLocalScaling _tmp_Vector3
        # else TODO
    return

phy_to_ob = (ob_list)->
    # To be used only for dynamic/rigid bodies
    # because it doesn't handle objects with parent
    for ob in ob_list
        body = ob.body
        if body.getMotionState
            transform = _tmp_Transform
            body.getMotionState().getWorldTransform(transform)
        else
            transform = body.getWorldTransform(transform)
        pos = ob.position
        origin = transform.getOrigin()
        pos[0] = origin.x()
        pos[1] = origin.y()
        pos[2] = origin.z()
        rot = ob.rotation
        brot = transform.getRotation()
        rot[0] = brot.x()
        rot[1] = brot.y()
        rot[2] = brot.z()
        rot[3] = brot.w()
    return

get_last_char_phy = (ob_list)->
    # Used for updating last_position, for getting body velocity
    # Use after actuators and before step_world
    for ob in ob_list
        body = ob.body
        transform = body.getWorldTransform(transform)
        pos = ob.last_position
        origin = transform.getOrigin()
        pos[0] = origin.x()
        pos[1] = origin.y()
        pos[2] = origin.z()

    return
# Ray methods

ray_intersect_body = (scene, origin, direction, int_mask=-1)->
    if not scene.world
        return []
    ray_origin = _tmp_Vector3b
    ray_origin.setValue(origin[0], origin[1], origin[2])
    ray_rayto = _tmp_Vector3c
    ray_rayto.setValue(origin[0] + direction[0],
                       origin[1] + direction[1],
                       origin[2] + direction[2])
    callback = _tmp_ClosestRayResultCallback
    callback.set_m_rayFromWorld(ray_origin)
    callback.set_m_rayToWorld(ray_rayto)
    callback.set_m_collisionFilterGroup(-1)
    callback.set_m_collisionFilterMask(int_mask)
    callback.set_m_collisionObject(0)
    callback.set_m_closestHitFraction(1)
    callback.set_m_flags(0)
    scene.world.rayTest(ray_origin, ray_rayto, callback)
    result = []
    point = vec3.create()
    if callback.hasHit()
        hit_point = _tmp_Vector3
        hit_point.setInterpolate3(ray_origin, ray_rayto, callback.get_m_closestHitFraction())
        hit_normal = callback.get_m_hitNormalWorld()
        point[0] = hit_point.x()
        point[1] = hit_point.y()
        point[2] = hit_point.z()
        # TODO optim: check if the pointers of members of callback are always the same
        cob = callback.get_m_collisionObject()
        return {
            body: _phy_obs_ptrs[cob.ptr or cob.getPtr()],  # replace by getPtr() for node
           point: point,
           normal: [hit_normal.x(), hit_normal.y(), hit_normal.z()],
           distance: vec3.dist(point, origin)
           }

    return null

ray_intersect_body_absolute = (scene, rayfrom, rayto, int_mask)->
    # returns [body, point, normal]
    ray_origin = _tmp_Vector3
    ray_rayto = _tmp_Vector3b
    ray_origin.setValue(rayfrom[0], rayfrom[1], rayfrom[2])
    ray_rayto.setValue(rayto[0], rayto[1], rayto[2])
    callback = _tmp_ClosestRayResultCallback
    callback.set_m_rayFromWorld(ray_origin)
    callback.set_m_rayToWorld(ray_rayto)
    callback.set_m_collisionFilterGroup(-1)
    callback.set_m_collisionFilterMask(int_mask)
    callback.set_m_collisionObject(0)
    callback.set_m_closestHitFraction(1)
    callback.set_m_flags(0)
    scene.world.rayTest(ray_origin, ray_rayto, callback)
    if callback.hasHit()
        hit_point = _tmp_Vector3c
        hit_point.setInterpolate3(ray_origin, ray_rayto, callback.get_m_closestHitFraction())
        hit_normal = callback.get_m_hitNormalWorld()

        # TODO optim: check if the pointers of members of callback are always the same
        cob = callback.get_m_collisionObject()

        if cob.ptr
            p = hit_point.ptr>>2
            n = hit_normal.ptr>>2
            return [_phy_obs_ptrs[cob.ptr],
                    new Float32Array(Ammo.HEAPF32.subarray(p,p+3)),
                    new Float32Array(Ammo.HEAPF32.subarray(n,n+3))]
        return [_phy_obs_ptrs[cob.getPtr()],
            vec3.create(hit_point.x(), hit_point.y(), hit_point.z()),
            vec3.create(hit_normal.x(), hit_normal.y(), hit_normal.z())]
    return null

ray_intersect_body_bool = (scene, rayfrom, rayto, mask)->
    cp = _tmp_ClosestRayResultCallback.ptr
    cp32 = cp>>2
    _tmp_Vector3.setValue(rayfrom[0], rayfrom[1], rayfrom[2])
    _tmp_Vector3b.setValue(rayto[0], rayto[1], rayto[2])
    callback = _tmp_ClosestRayResultCallback
    callback.set_m_collisionFilterGroup(-1)
    callback.set_m_collisionFilterMask(mask)
    callback.set_m_collisionObject(0)
    callback.set_m_closestHitFraction(1)
    callback.set_m_flags(0)
    scene.world.rayTest(_tmp_Vector3, _tmp_Vector3b, callback)
    return callback.hasHit()

ray_intersect_body_bool_not_target = (scene, rayfrom, rayto, mask, target_body)->
    cp = _tmp_ClosestRayResultCallback.ptr
    cp32 = cp>>2
    _tmp_Vector3.setValue(rayfrom[0], rayfrom[1], rayfrom[2])
    _tmp_Vector3b.setValue(rayto[0], rayto[1], rayto[2])
    callback = _tmp_ClosestRayResultCallback
    callback.set_m_collisionFilterGroup(-1)
    callback.set_m_collisionFilterMask(mask)
    callback.set_m_collisionObject(0)
    callback.set_m_closestHitFraction(1)
    callback.set_m_flags(0)
    scene.world.rayTest(_tmp_Vector3, _tmp_Vector3b, callback)
    return callback.hasHit() and callback.get_m_collisionObject().ptr != target_body.ptr


module.exports = {
    physics_engine_init,
    PhysicsWorld, destroy_world, set_gravity,
    step_world, update_ob_physics, set_phy_scale,
    ob_to_phy, ob_to_phy_with_scale, phy_to_ob, get_last_char_phy,

    BoxShape, SphereShape, CylinderShape, CapsuleShape,
    ConvexShape, TriangleMeshShape, CompoundShape,
    get_convex_hull_edges, add_child_shape,

    RigidBody, StaticBody, CharacterBody,
    add_body, remove_body, destroy_body,
    set_body_deactivation_time, activate_body,
    deactivate_body, set_body_activation_state,
    colliding_bodies,

    allow_sleeping, make_ghost,
    get_linear_velocity, set_linear_velocity,
    set_character_jump_force, character_jump, on_ground,
    set_max_fall_speed, get_angular_velocity, set_angular_velocity,
    get_mass, set_mass,
    apply_force, apply_central_force, apply_central_impulse,
    set_linear_factor, set_angular_factor,

    Ray, ray_intersect_body, ray_intersect_body_absolute,
    ray_intersect_body_bool, ray_intersect_body_bool_not_target,
}
