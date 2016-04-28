{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{LogicBlock} = require './logic_block.coffee'
SIGNED_AXES = {'X': 1, 'Y': 2, 'Z': 3, '-X': -1, '-Y': -2, '-Z': -3}

#rotate objet around target
class RotateAround extends LogicBlock
    init: ->
        @invrot = quat.create()
        @obrot = quat.create()

    eval: (ob, target=[0,0,0], rotation=[0,0,0])->
        {invrot, obrot} = @

        obrot[0] = 0
        obrot[1] = 0
        obrot[2] = 0
        obrot[3] = 1


        quat.rotateX(obrot, obrot, rotation[0])
        quat.rotateY(obrot, obrot, rotation[1])
        quat.rotateZ(obrot, obrot, rotation[2])

        rot = ob.rotation
        pos = ob.position

        vec3.sub(pos, pos, target)
        quat.invert(invrot, rot)
        vec3.transformQuat(pos, pos, invrot)
        vec3.transformQuat(pos, pos, obrot)
        vec3.transformQuat(pos, pos, rot)

        vec3.add(pos, pos, target)
        quat.mul(rot, rot, obrot)


#rotate object to look at target.
class LookAt extends LogicBlock
    init:->
        #TODO: Optimization: tup, side and front as mat3 subarrays
        @tup = [0,0,1]
        @side = vec3.create()
        @front = vec3.create()
        @m = mat3.create()
        @q = quat.create()

    eval: (viewer, target=[0,0,0], viewer_up='Z', viewer_front='-Y', smooth=0, frame_duration)->
        if not frame_duration?
            frame_duration = @context.main_loop.frame_duration

        {q, m, tup, front, side} = @
        u_idx = SIGNED_AXES[viewer_up]
        f_idx = SIGNED_AXES[viewer_front]

        #reseting tup instead create another array
        tup[0] = 0
        tup[1] = 0
        tup[2] = 1

        #vec3.transformQuat(tup, tup, viewer.rotation)

        if u_idx < 0
            vec3.negate(tup,tup)

        origin = viewer.get_world_position()
        u = Math.abs(u_idx) - 1
        f = Math.abs(f_idx) - 1
        s = 3 - u - f

        if f_idx < 0
            vec3.sub(front, origin, target)
        else
            vec3.sub(front, target, origin)

        if u == 1 or f == 2
            vec3.cross(side, tup, front)
        else
            vec3.cross(side, front, tup)

        # TODO: should be this condition above?

        if [0,1,0,0,1][2-f+s]
            vec3.cross(tup, side, front)
        else
            vec3.cross(tup, front, side)

        vec3.normalize(side, side)
        vec3.normalize(tup, tup)
        vec3.normalize(front, front)

        m[u] = tup[0]
        m[u+3] = tup[1]
        m[u+6] = tup[2]
        m[f] = front[0]
        m[f+3] = front[1]
        m[f+6] = front[2]
        m[s] = side[0]
        m[s+3] = side[1]
        m[s+6] = side[2]

        mat3.transpose(m, m)
        quat.fromMat3(q, m)

        q[0] = -q[0]
        q[1] = -q[1]
        q[2] = -q[2]
        q[3] = -q[3]

        n = frame_duration * 0.06 #frame duration in seconds * 60
        smooth = Math.max(0,1 - smooth)
        smooth = 1 - Math.pow(smooth, n) * Math.pow((1/smooth - 1), n)

        quat.slerp(viewer.rotation, viewer.rotation, q, smooth)
        # necessary only for paralell up and front
        # also for lerps
        quat.normalize(viewer.rotation, viewer.rotation)

# Move objet into the closest point of a curve.
class SnapToCurve extends LogicBlock
    init:->
        @antifilter = vec3.create()
        @pre_filtered = vec3.create()
        @v_one = [1,1,1]
        @look_at = new LookAt @scene

    eval: (ob, curve, pos_axes=[1,1,1], front='-Y', up='Z', position_factor=1, rotation_factor=1, frame_duration)->
        {antifilter, pre_filtered} = @

        if not frame_duration?
            frame_duration = @context.main_loop.frame_duration

        filter = pos_axes

        # antifilter = filter - [1,1,1]
        vec3.sub(antifilter, @v_one, filter)

        # "Parented" position
        vec3.sub(ob.position, ob.position, curve.position)

        # flipping curve rotation to do corretly the transformQuat to avoid cloning the quat
        curve.rotation[3] *= -1
        vec3.transformQuat(ob.position, ob.position, curve.rotation)
        curve.rotation[3] *= -1

        # It returns [point, normal]
        p_n = curve.closest_point(ob.position, filter)
        point = p_n[0]
        vec3.mul(point, point, filter)
        vec3.mul(pre_filtered, ob.position, antifilter)
        vec3.add(point, point, pre_filtered)

        # sSooth position
        t = position_factor
        n = frame_factor
        t = 1 - Math.pow(t, n) * Math.pow((1/t - 1), n)

        vec3.lerp(ob.position, ob.position, point, t)
        vec3.transformQuat(ob.position, ob.position, curve.rotation)
        vec3.add(ob.position, ob.position, curve.position)

        if rotation_factor
            # Align to normal curve
            normal = p_n[1]

            # Transform normal to match curve rotation
            vec3.transformQuat(normal, normal, curve.rotation)

            # Look at objet position + normal vector
            smooth =  1 - Math.abs(rotation_factor)
            target = vec3.add(normal, normal, ob.position)
            @look_at(ob, target, [1,1,1], front, up, smooth, frame_duration)

module.exports = {RotateAround, LookAt, SnapToCurve}
