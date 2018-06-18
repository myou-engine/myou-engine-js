{mat3, mat4, vec3, vec4, quat, color4} = require 'vmath'
{Probe} = require './probe'
{Body} = require './physics/bullet'

# Main 3D Object class (Called GameObject to distinguish from JS Object).
#
# It's the base for mesh objects, cameras, lamps, armatures, etc.
# It can also be used by itself (a.k.a. Empty).

class GameObject
    constructor: (@context)->
        @debug=false
        @position = vec3.create()
        @rotation = quat.create()
        @radius = 0
        @rotation_order = 'XYZ'
        @scale = vec3.new 1, 1, 1
        @dimensions = vec3.create()
        @bound_box = [vec3.create(), vec3.create()]
        @color = color4.new 1, 1, 1, 1
        @alpha = 1
        @matrix_parent_inverse = mat4.create()
        @scene = null
        @original_scene = null
        @dupli_group = null
        @visible = true
        @_sqdist = 0  # Squared distance to camera
        @_flip = false
        @_sqscale = 1 # Globally squared scale, to avoid rendering zero scale
        @parent = null
        @children = []
        @static = false
        @world_matrix = mat4.create()
        @probe_cube = null
        @probe_planar = null
        @properties = {}
        @animation_strips = []
        @animations = {}
        @name = null
        @original_name = null
        @lod_objects = []
        @parent_bone_index = -1
        @behaviours = {}
        @body = new Body this
        @avg_poly_area = 0
        @avg_poly_length = 0
        @zindex = 1

        @pending_bodies = [] # physics bodies that depend on this object

        # Remember to add any new mutable member to clone()

    _update_matrices:  ->
        {x, y, z, w} = @rotation
        if @rotation_order != 'Q'
            q = quat.fromEulerOrder quat.create(), @rotation, @rotation_order
            {x, y, z, w} = q

        scl = @scale
        @_flip = false
        @_sqscale = vec3.sqrLen scl
        if @parent?
            @_flip = @parent._flip
            @_sqscale *= @parent._sqscale
        if scl.x*scl.y*scl.z < 0
            x=-x
            w=-w
            @_flip = not @_flip
        wm = @world_matrix
        pos = @position
        wm.m00 = (w*w + x*x - y*y - z*z) * scl.x
        wm.m01 = (2 * (x * y + z * w)) * scl.x
        wm.m02 = (2 * (x * z - y * w)) * scl.x
        wm.m04 = (2 * (x * y - z * w)) * scl.y
        wm.m05 = (w*w - x*x + y*y - z*z) * scl.y
        wm.m06 = (2 * (z * y + x * w)) * scl.y
        wm.m08 = (2 * (x * z + y * w)) * scl.z
        wm.m09 = (2 * (y * z - x * w)) * scl.z
        wm.m10 = (w*w - x*x - y*y + z*z) * scl.z
        wm.m12 = pos.x
        wm.m13 = pos.y
        wm.m14 = pos.z

        # Assumes objects are evaluated in order,
        # Parents before children
        if @parent
            # TODO: test with negative scale
            mat4.mul wm, @matrix_parent_inverse, wm
            bi = @parent_bone_index
            if bi >= 0
                bone = @parent._bone_list[bi]
                # In Blender, matrix_parent_inverse is relative to the
                # TIP of the bone, while bone.matrix is relative to the BASE
                # so we need to add the bone length
                wm.m13 += bone.blength
                mat4.mul(@world_matrix, bone.matrix, @world_matrix)
            mat4.mul wm, @parent.world_matrix, wm

    set_rotation_order: (order) ->
        if order == @rotation_order
            return
        if order != 'Q'
            f = quat['to_euler_'+order]
            if not f?
                throw Error "Invalid rotation order.
                    Should be one of: Q XYZ XZY YXZ YZX ZXY ZYX."
        q = @rotation
        if @rotation_order != 'Q'
            quat.fromEulerOrder q, q, @rotation_order
        if f?
            f(q,q)
            q.w = 0
        @rotation_order = order


    get_world_matrix: ->
        @parent?.get_world_matrix()
        @_update_matrices()
        return @world_matrix

    get_world_position: () ->
        if not @parent?
            return vec3.clone @position
        wm = @get_world_matrix()
        return vec3.set vec3.create(), wm.m12, wm.m13, wm.m14

    get_world_rotation: ()  ->
        wm = @get_world_matrix()
        # TODO: Calculate rotation matrix more efficiently
        rot_matrix = mat3.rotationFromMat4 mat3.create(), wm
        quat.fromMat3 quat.create(), rot_matrix

    get_world_position_into: (out) ->
        if not @parent?
            return vec3.copy out, @position
        wm = @get_world_matrix()
        return vec3.set out, wm.m12, wm.m13, wm.m14

    get_world_rotation_into: (out)  ->
        wm = @get_world_matrix()
        # TODO: Calculate rotation matrix more efficiently
        rot_matrix = mat3.rotationFromMat4 mat3.create(), wm
        quat.fromMat3 out, rot_matrix

    get_world_position_rotation: ->
        wm = @get_world_matrix()
        position = vec3.new wm.m12, wm.m13, wm.m14
        # TODO: Calculate rotation matrix more efficiently
        rot_matrix = mat3.rotationFromMat4 mat3.create(), wm
        rotation = quat.fromMat3 quat.create(), rot_matrix
        return {position, rotation}

    get_world_position_rotation_into: (out_pos, out_rot) ->
        wm = @get_world_matrix()
        vec3.set out_pos, wm.m12, wm.m13, wm.m14
        # TODO: Calculate rotation matrix more efficiently
        rot_matrix = mat3.rotationFromMat4 mat3.create(), wm
        quat.fromMat3 out_rot, rot_matrix
        return

    translate: (vector, relative_object) ->
        if relative_object? or @parent?
            vector = vec3.clone vector
            q = quat.create()
        if relative_object?
            relative_object.get_world_rotation_into q
            vec3.transformQuat vector, vector, q
        if @parent?
            # we're using our world_matrix as temporary matrix
            # because it's invalid and will be recalculated anyway
            m = @world_matrix
            mat4.mul m, @parent.get_world_matrix(), @matrix_parent_inverse
            quat.fromMat3 q, mat3.rotationFromMat4(mat3.create(), m)
            quat.invert q, q
            vec3.transformQuat vector, vector, q
        vec3.add @position, @position, vector
        return this

    translate_x: (x, relative_object) ->
        @translate vec3.new(x, 0, 0), relative_object

    translate_y: (y, relative_object) ->
        @translate vec3.new(0, y, 0), relative_object

    translate_z: (z, relative_object) ->
        @translate vec3.new(0, 0, z), relative_object

    rotate_euler: (vector, order, relative_object) ->
        q = quat.fromEulerOrder(quat.create(), vector, order)
        @rotate_quat q, relative_object

    rotate_euler_deg: (vector, order, relative_object) ->
        v = vec3.scale vec3.create(), vector, 0.017453292519943295 # PI*2 / 360
        q = quat.fromEulerOrder(quat.create(), v, order)
        @rotate_quat q, relative_object

    rotate_quat: (q, relative_object) ->
        # TODO: optimize
        rel = quat.create()
        inv_rel = quat.create()
        par = quat.create()
        inv_par = quat.create()
        if relative_object?
            relative_object.get_world_rotation_into(rel)
            quat.invert inv_rel, rel
        if @parent?
            # we're using our world_matrix as temporary matrix
            # because it's invalid and will be recalculated anyway
            m = @world_matrix
            mat4.mul m, @parent.get_world_matrix(), @matrix_parent_inverse
            quat.fromMat3 par, mat3.rotationFromMat4(mat3.create(), m)
            quat.invert inv_par, par
        {rotation_order} = this
        if rotation_order != 'Q'
            @set_rotation_order 'Q'
        quat.mul @rotation, par, @rotation
        quat.mul @rotation, inv_rel, @rotation
        quat.mul @rotation, q, @rotation
        quat.mul @rotation, rel, @rotation
        quat.mul @rotation, inv_par, @rotation
        if rotation_order != 'Q'
            @set_rotation_order rotation_order
        return this

    rotate_x: (angle, relative_object) ->
        q = quat.create()
        @rotate_quat(quat.rotateX(q, q, angle), relative_object)

    rotate_y: (angle, relative_object) ->
        q = quat.create()
        @rotate_quat(quat.rotateY(q, q, angle), relative_object)

    rotate_z: (angle, relative_object) ->
        q = quat.create()
        @rotate_quat(quat.rotateZ(q, q, angle), relative_object)

    rotate_x_deg: (angle, relative_object) ->
        q = quat.create()
        angle *= 0.017453292519943295
        @rotate_quat(quat.rotateX(q, q, angle), relative_object)

    rotate_y_deg: (angle, relative_object) ->
        q = quat.create()
        angle *= 0.017453292519943295
        @rotate_quat(quat.rotateY(q, q, angle), relative_object)

    rotate_z_deg: (angle, relative_object) ->
        q = quat.create()
        angle *= 0.017453292519943295
        @rotate_quat(quat.rotateZ(q, q, angle), relative_object)

    look_at: (target, options) ->
        {
            front='-Y'
            up='+Z'
            up_vector=vec3.new 0,0,1
            influence=1
        } = options ? {}
        # It accepts both an object and a vector
        target = target.get_world_position?() ? target
        {position, rotation} = @get_world_position_rotation()
        axes = [vec3.create(), vec3.create(), vec3.create()]
        front_idx = (front.codePointAt(1)|0x20) - 120
        up_idx = (up.codePointAt(1)|0x20) - 120
        front_v = axes[front_idx]
        vec3.sub front_v, target, position
        vec3.scale front_v, front_v, +(front[0]+'1')
        up_v = axes[up_idx]
        vec3.copy up_v, up_vector
        vec3.scale up_v, up_v, +(up[0]+'1')
        vec3.fixAxes axes..., front_idx, up_idx
        q = quat.fromAxes quat.create(), axes...
        quat.slerp rotation, rotation, q, influence
        @set_world_rotation rotation

    add_behaviour: (behaviour)->
        behaviour.assign @

    remove_behaviour: (behaviour)->
        behaviour.unassign @

    add_behavior: (behaviour)->
        behaviour.assign @

    remove_behavior: (behaviour)->
        behaviour.unassign @

    # Returns a clone of the object
    # @option options scene [Scene] Destination scene
    # @option options recursive [bool] Whether to clone its children
    # @option options behaviours [bool] Whether to clone its behaviours
    clone: (options, options2) ->
        if options?.type == 'SCENE'
            console.warn "DEPRECATED: clone(scene, options) is now
                clone(options={scene})"
            scene = options
            options = options2 ? {}
            options.scene = scene
            options.recursive = options.recursive ? false
        {
            recursive=true
            behaviours=true
            new_parent=@parent
            scene = @scene
        } = options ? {}
        # TODO: Is it better or more efficient to instance a new object
        # and then copy all the values? (i.e. "new GameObject")
        n = Object.create @
        n.children = children = []
        n.position = vec3.clone @position
        n.rotation = vec4.clone @rotation
        n.scale = vec3.clone @scale
        n.dimensions = vec3.clone @dimensions
        n.bound_box = [vec3.clone(@bound_box[0]), vec3.clone(@bound_box[1])]
        n.world_matrix = mat4.clone @world_matrix
        n.matrix_parent_inverse = mat4.clone @matrix_parent_inverse
        n.color = color4.clone @color
        n.properties = Object.create @properties
        n.passes = @passes and @passes[...]
        n.avg_poly_area = @avg_poly_area
        n.avg_poly_length = @avg_poly_length
        n.behaviours = []
        if new_parent?
            n.parent = new_parent
            n.parent.children.push n
        @body._clone_to(n)

        # Warning! This only works reliably
        # if the target scene have the same type of lamps!
        n.materials = materials = n.materials?[...]
        if n.materials and scene != this.scene
            for i in [0...materials.length]
                n.materials[i] = materials[i].clone_to_scene scene

        n.scene = null
        scene?.add_object n, @name
        if behaviours
            for b in @behaviours
                b.assign n
        # Adding children after ensures objects don't need to be sorted
        if recursive
            for child in @children
                child = child.clone({options..., new_parent: n})
                child.parent = n
                children.push child
        n.body.instance()
        for child in n.children
            child.body.instance()
        return n

    set_parent: (parent, options) ->
        if @parent?
            @scene.clear_parent this, options
        @scene.make_parent parent, this, options

    parent_to: (parent, options) ->
        if @parent?
            @scene.clear_parent this, options
        @scene.make_parent parent, this, options

    clear_parent: (options) ->
        @scene.clear_parent this, options

    get_top_ancestor: (top_level_parents=[]) ->
        ob = this
        while ob.parent? and ob.parent not in top_level_parents
            ob = ob.parent
        return ob

    get_descendants: (include_self)->
        children_lists = [@children]
        if include_self
            children_lists.unshift [this]
        @_fill_children_lists_recursive children_lists
        return Array.prototype.concat children_lists...

    _fill_children_lists_recursive: (children_lists) ->
        for c in @children
            children_lists.push c.children
            c._fill_children_lists_recursive children_lists
        return

    load: (options) ->
        return @scene?.load_objects [this], options

    load_recursive: (options) ->
        return @scene?.load_objects @get_descendants(true), options

    # Removes the object from the scene. It does NOT delete the object itself.
    remove: (recursive) ->
        if @properties.probe_options?
            @probe?.destroy()
        @scene.remove_object @, recursive

    # Removes the object from the scene and destroys (deletes) the object.
    # Use this when deleting clones (it doesn't delete mesh data, etc.)
    destroy: (recursive=true) ->
        @body.destroy()
        @remove recursive
        if recursive
            for child in @children
                child.destroy true
        delete @context.objects[@name]

    instance_probes: ->
        if @probe_cube?
            return
        {probe_options} = @properties
        if probe_options?
            ob = @scene.objects[probe_options.object]
            if probe_options.type in ['OBJECT', 'PLANE']
                if not ob?
                    if probe_options.object != ''
                        console.error "Object '#{@name}' tries to use
                            probe object '#{probe_options.object}'
                            which doesn't exist."
                    @probe_cube =
                        @scene.background_probe ? @scene.instance_probe()
                else
                    ob.probe_cube ? ob.instance_probes()
                    @probe_cube = ob.probe_cube
                    # this will be overwritten below if probe is planar
                    @probe_planar = ob.probe_planar
            switch probe_options.type
                when 'CUBEMAP', 'CUBE'
                    @probe_cube = new Probe @, probe_options
                when 'PLANE'
                    @probe_planar = new Probe @, probe_options
                when 'OBJECT' then # handled before
                else
                    throw Error "Inavlid probe type: " + probe_options.type
        else
            @probe_cube = @scene.background_probe ? @scene.instance_probe()
        return

module.exports = {GameObject}
