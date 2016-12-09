{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{Animation} = require './animation.coffee'
fetch_assets = require './fetch_assets.coffee'
{
    update_ob_physics,

    BoxShape, SphereShape, CylinderShape, CapsuleShape,
    ConvexShape, TriangleMeshShape, CompoundShape,
    get_convex_hull_edges, add_child_shape,

    RigidBody, StaticBody, CharacterBody,
    add_body, remove_body,

    allow_sleeping, make_ghost,
    set_linear_factor, set_angular_factor

} = require './physics.coffee'


NO_MIRROR = 1
MIRROR_X = 2
MIRROR_Y = 4
MIRROR_Z = 8
MIRROR_XY = 16
MIRROR_XZ = 32
MIRROR_YZ = 64
MIRROR_XYZ = 128

class GameObject
    constructor: (@context, use_physics)->
        @debug=false
        @position = vec3.create()
        @rotation = quat.create()
        @radius = 0
        @rotation_order = 'Q'
        @scale = vec3.fromValues 1, 1, 1
        @dimensions = vec3.create()
        @color = vec4.fromValues 1, 1, 1, 1
        @alpha = 1
        @offset_scale = vec3.fromValues 1, 1, 1
        @matrix_parent_inverse = mat4.create()
        @scene = null
        @dupli_group = null
        @visible = true
        @_world_position = vec3.create()
        @_sqdist = 0  # Squared distance to camera
        @_flip = false
        @parent = null
        @children = []
        @static = false
        @world_matrix = mat4.create()
        @rotation_matrix = mat3.create() # not used elsewhere
        @normal_matrix = mat3.create()
        @_m3 = mat3.create()
        @custom_uniform_values = []
        @properties = {}
        @animations = {}
        @name = null
        @original_name = null
        @mirrors = 1
        @lod_objects = []
        @parent_bone_index = -1
        # Physics
        @body = null
        @shape = null
        @physics_type = 'NO_COLLISION'
        if @context.use_physics
            @physical_radius = 1
            @anisotropic_friction = false
            @friction_coefficients = vec3.fromValues 1, 1, 1
            @collision_group = 1   # [1, 0, 0, 0, 0, 0, 0, 0]
            @collision_mask = 255  # [1, 1, 1, 1, 1, 1, 1, 1]
            @collision_shape = null
            @collision_margin = 0
            @collision_compound = false
            @mass = 0
            @no_sleeping = false
            @is_ghost = false
            @linear_factor = vec3.fromValues 1, 1, 1
            @angular_factor = vec3.fromValues 1, 1, 1
            @form_factor = 0.4
            @friction = 0.5
            @elasticity = 0
            @phy_mesh = null
            @phy_he = vec3.create() # half extents
            @phy_debug_mesh = null
            @phy_debug_hull = null
            @_use_visual_mesh = false
            # for kinematic characters
            @step_height = 0.15
            @jump_force = 10
            @max_fall_speed = 55
            @last_position = vec3.create()
        @actions = []
        @particle_systems = null
        @avg_poly_area = 0
        @avg_poly_length = 0


        # Remember to add any new mutable member to clone()

    #Physics settings into object
    instance_physics: (use_visual_mesh=false) ->
        #This function only can be called if the object is in a scene.
        if @visible_mesh
            # Logic for physical submeshes is run for
            # the real "visible" mesh
            @visible_mesh.instance_physics()
            return

        if @body# and @body.world == @scene.world
            remove_body @scene.world, @body
            @scene.rigid_bodies.remove @
            @scene.static_ghosts.remove @
            @body = null
            @phy_debug_mesh = null  # but it preserves phy_debug_hull

        mass = @mass
        shape = null
        #@phy_debug_mesh = null
        has_collision = @physics_type != 'NO_COLLISION'
        if has_collision
            if not @scene.world
                return

            is_hull =  @collision_shape == 'CONVEX_HULL'
            is_tmesh =  @collision_shape == 'TRIANGLE_MESH'

            # TODO: CONE

            # half extents
            he = @phy_he
            dim = @dimensions
            if dim[0] == 0 and dim[1] == 0 and dim[2] == 0
                he = vec3.scale he, @scale, @physical_radius
            else
                vec3.scale he, dim, 0.5

            if @collision_shape=='BOX'
                shape = new BoxShape he[0], he[1], he[2], @collision_margin
                @phy_debug_mesh = @context.render_manager.debug.box
            else if @collision_shape=='SPHERE'
                radius = Math.max he[0], he[1], he[2]
                he = [radius, radius, radius]
                shape = new SphereShape radius, @collision_margin
                @phy_debug_mesh = @context.render_manager.debug.sphere
            else if @collision_shape=='CYLINDER'
                radius = Math.max he[0], he[1]
                he = [radius, radius, he[2]]
                shape = new CylinderShape radius, he[2], @collision_margin
                @phy_debug_mesh = @context.render_manager.debug.cylinder
            else if @collision_shape=='CAPSULE'
                radius = Math.max he[0], he[1]
                he = [radius, radius, he[2]]
                shape = new CapsuleShape radius, he[2], @collision_margin
                @phy_debug_mesh = @context.render_manager.debug.cylinder
            else if is_hull or is_tmesh
                # Choose which mesh to use as physics

                if @physics_mesh
                    if use_visual_mesh
                        ob = @
                    else
                        ob = @physics_mesh
                else
                    use_visual_mesh = true
                    ob = @
                data = ob.data

                if not data?
                    return

                if is_hull
                    shape = data.phy_convex_hull
                else
                    shape = data.phy_mesh
                    if @mirrors & 2
                        shape = data.phy_mesh_mx

                if shape and (not use_visual_mesh) != (not @_use_visual_mesh)
                    shape.mesh and destroy shape.mesh
                    destroy shape
                    shape = null

                @_use_visual_mesh = use_visual_mesh

                if not shape
                    # Get "global" scale
                    # TODO: Get average scale and add an option for recomputing real scale
                    scale = vec3.clone @scale
                    while p
                        vec3.scale scale, scale, p.scale[2]
                        p = p.parent
                    if @mirrors & 2
                        scale[0] = -scale[0]
                    if is_hull
                        shape = new ConvexShape data.varray, ob.stride/4, @scale, @collision_margin
                        data.phy_convex_hull = shape
                        if @debug and not @phy_debug_hull
                            va_ia = get_convex_hull_edges data.varray, ob.stride/4, scale
                            @phy_debug_hull = @context.render_manager.debug.debug_mesh_from_va_ia va_ia[0], va_ia[1]
                        @phy_debug_mesh = @phy_debug_hull
                    else
                        shape = TriangleMeshShape(
                            data.varray,
                            # TODO: use all submeshes
                            data.iarray.subarray(0, ob.offsets[2]),
                            ob.stride/4,
                            scale,
                            @collision_margin,
                            ob.hash
                        )
                        if @mirrors & 2
                            data.phy_mesh_mx = shape
                        else
                            data.phy_mesh = shape
                vec3.copy he, @scale
            else
                console.log "Warning: Unknown shape", @collision_shape

            #TODO: changing compunds live don't work well unless they're reinstanced in order
            if @collision_compound and shape
                if @parent and @parent.collision_compound
                    parent = @parent
                    while parent.parent and parent.parent.collision_compound
                        parent = parent.parent

                    posrot = @get_world_pos_rot()
                    pos = posrot[0]
                    rot = posrot[1]
                    # TODO: avoid calling this all the time
                    parent_posrot = parent.get_world_pos_rot()
                    vec3.sub pos, pos, parent_posrot[0]
                    inv = quat.invert quat.create(), parent_posrot[1]
                    vec3.transformQuat pos, pos, inv
                    quat.mul rot, inv, rot
                    comp = parent.shape
                    add_child_shape comp, shape, pos, rot
                    shape = null
                else
                    comp = new CompoundShape
                    add_child_shape comp, shape, [0, 0, 0], [0, 0, 0, 1]
                    shape = comp
            else
                @collision_compound = false

            if shape
                posrot = @get_world_pos_rot()
                pos = posrot[0]
                if @mirrors & 2
                    pos[0] = -pos[0]
                rot = posrot[1]
                # TODO: SOFT_BODY, OCCLUDE, NAVMESH
                if @physics_type == 'RIGID_BODY'
                    body = new RigidBody mass, shape, pos, rot, @friction, @elasticity, @form_factor
                    set_linear_factor body, @linear_factor
                    set_angular_factor body, @angular_factor
                    @scene.rigid_bodies.push @
                else if @physics_type == 'DYNAMIC'
                    body = new RigidBody mass, shape, pos, rot, @friction, @elasticity, @form_factor
                    set_linear_factor body, @linear_factor
                    set_angular_factor body, [0, 0, 0]
                    @scene.rigid_bodies.push @
                else if @physics_type == 'STATIC' or @physics_type == 'SENSOR'
                    body = new StaticBody shape, pos, rot, @friction, @elasticity
                else if @physics_type == 'CHARACTER'
                    body = CharacterBody(
                        shape
                        pos
                        rot
                        @step_height
                        2 #axis
                        -@scene.world.getGravity().z()*1
                        @jump_force
                        @max_fall_speed
                        PI_2 #slope
                        )

                    @scene.rigid_bodies.push @
                else
                    console.log "Warning: Type not handled", @physics_type
                @shape = shape
            else
                body = null

            if body
                add_body @scene.world, body, @collision_group, @collision_mask
                body.owner = @
                if @no_sleeping
                    allow_sleeping body, false
                if @is_ghost or @physics_type == 'SENSOR'
                    @scene.static_ghosts.push @
                    make_ghost body, true
                if @physics_type == 'CHARACTER'
                    @scene.kinematic_characters.push @
                update_ob_physics @
            @body = body

    _update_matrices:  ->
        rm = @rotation_matrix
        [x, y, z, w] = @rotation
        scl = @scale
        @_flip = @parent?._flip or false
        if scl[0]*scl[1]*scl[2] < 0
            x=-x
            w=-w
            @_flip = not @_flip
        rm[0] = w*w + x*x - y*y - z*z
        rm[1] = 2 * (x * y + z * w)
        rm[2] = 2 * (x * z - y * w)
        rm[3] = 2 * (x * y - z * w)
        rm[4] = w*w - x*x + y*y - z*z
        rm[5] = 2 * (z * y + x * w)
        rm[6] = 2 * (x * z + y * w)
        rm[7] = 2 * (y * z - x * w)
        rm[8] = w*w - x*x - y*y + z*z

        pos = @position
        ox = @offset_scale[0]
        oy = @offset_scale[1]
        oz = @offset_scale[2]

        # Assumes objects are evaluated in order,
        # Parents before children

        # TODO: manage negative scales (use abs() here, flip polygons and rotation)
        isx = 1/scl[0]
        isy = 1/scl[1]
        isz = 1/scl[2]

        nm = @normal_matrix
        nm[0] = rm[0]*isx
        nm[1] = rm[1]*isx
        nm[2] = rm[2]*isx
        nm[3] = rm[3]*isy
        nm[4] = rm[4]*isy
        nm[5] = rm[5]*isy
        nm[6] = rm[6]*isz
        nm[7] = rm[7]*isz
        nm[8] = rm[8]*isz


        wm = @world_matrix
        wm[0] = rm[0]*ox*scl[0]
        wm[1] = rm[1]*oy*scl[0]
        wm[2] = rm[2]*oz*scl[0]
        wm[4] = rm[3]*ox*scl[1]
        wm[5] = rm[4]*oy*scl[1]
        wm[6] = rm[5]*oz*scl[1]
        wm[8] = rm[6]*ox*scl[2]
        wm[9] = rm[7]*oy*scl[2]
        wm[10] = rm[8]*oz*scl[2]
        wm[12] = pos[0]
        wm[13] = pos[1]
        wm[14] = pos[2]

        if @parent
            bi = @parent_bone_index
            if bi >= 0
                bone = @parent._bone_list[bi]
                m3 = mat3.fromMat4(@_m3, bone.ol_matrix)
                mat3.mul(rm, m3, rm)
                mat3.mul(nm, m3, nm)
                mat4.mul(@world_matrix, bone.ol_matrix, @world_matrix)

            ## TODO: make this more efficient, etc
            mat3.mul rm, @parent.rotation_matrix, rm
            mat3.mul nm, @parent.normal_matrix, nm
            mat4.mul wm, @matrix_parent_inverse, wm
            mat4.mul @world_matrix, @parent.world_matrix, @world_matrix
            #ppos = @parent.world_matrix.subarray 12,15
            #pos = [pos[0] + ppos[0], pos[1] + ppos[1], pos[2] + ppos[2]]

    update_matrices_recursive: ->
        @parent?.update_matrices_recursive()
        @_update_matrices()

    calc_bounding_box: ->
        @bounding_box_low = vec4.create()
        @bounding_box_high = vec4.create()
        @bounding_box_low[3] = @bounding_box_high[3] = 1
        dim_half = vec3.create()
        vec3.scale(dim_half, @dimensions, 0.5)
        vec3.sub(@bounding_box_low, @position, dim_half)
        vec3.add(@bounding_box_high, @position, dim_half)


    # TODO: make property
    get_world_position: (out) ->
        p = @parent
        pos = vec3.copy @_world_position, @position
        while p
            vec3.mul pos, pos, p.scale
            vec3.transformQuat pos, pos, p.rotation
            vec3.add pos, pos, p.position
            p = p.parent
        return pos

    # TODO: make property
    get_world_rotation: (out)  ->
        p = @parent
        rot = quat.copy(out or quat.create(), @rotation)
        while p
            quat.mul rot, p.rotation, rot
            p = p.parent
        return rot

    get_world_pos_rot: ->
        p = @parent
        pos = vec3.clone @position
        rot = quat.clone @rotation
        while p
            vec3.mul pos, pos, p.scale
            vec3.transformQuat pos, pos, p.rotation
            vec3.add pos, pos, p.position
            quat.mul rot, p.rotation, rot

            p = p.parent
        return [pos, rot]

    clone: (scene=this.scene, recursive=false) ->
        n = Object.create @
        if recursive
            n.children = for child in @children then child.clone(scene, true)
        else
            n.children = []
        n.position = vec3.clone @position
        n.rotation = vec4.clone @rotation
        n.scale = vec3.clone @scale
        n.dimensions = vec3.clone @dimensions
        n.offset_scale = vec3.clone @offset_scale
        n.world_matrix = mat4.clone @world_matrix
        n.rotation_matrix = mat3.clone @rotation_matrix
        n.normal_matrix = mat3.clone @normal_matrix
        n.color = vec4.clone @color
        n.custom_uniform_values = @custom_uniform_values[...]
        n.properties = Object.create @properties
        n.actions = @actions[...]
        n.passes = @passes and @passes[...]
        n.avg_poly_area = @avg_poly_area
        n.avg_poly_length = @avg_poly_length

        #n.state_machines = Object.create @state_machines
        #n.friction_coefficients = @friction_coefficients[...]
        #n.linear_factor = @linear_factor[...]
        #n.angular_factor = @angular_factor[...]
        #n.phy_he = @phy_he[...]

        # Warning! This only works reliably
        # if the target scene have the same type of lamps!
        if n.materials and scene != this.scene
            n.materials = materials = n.materials[...]
            for i in [0...materials.length]
                mat = materials[i] = materials[i].clone_to_scene scene

        scene?.add_object n, @name
        if @body
            n.body = null
            n.instance_physics @_use_visual_mesh
        return n

    remove: (recursive) ->
        @scene.remove_object @, recursive

    add_animation: (anim_id, action) ->
        if Object.keys(@animations).length == 0
            @scene.context.all_anim_objects.push @
        anim = @animations[anim_id] = new Animation
        anim.action = action
        anim.owner = @
        @_recalc_affected_channels()
        return anim

    del_animation: (anim_id) ->
        #console.log 'removing',anim_id
        delete @animations[anim_id]
        if Object.keys @animations.length == 0
            @scene.context.all_anim_objects.remove @
        @_recalc_affected_channels()

    _recalc_affected_channels:  ->
        # We make a list of affected channels
        # each with a list of channels from animations
        # and we'll make sure they all are present as zero
        # (or one, depending on the mixing type)
        # NOTE: maybe it's a good idea to add a preweight for each chan
        # and add all contiguous channels
        # Eventually this will also reserve memory for
        # storing cache
        affected = {}
        i = 0
        for key, anim of @animations
            for path of anim.action.channels
                c = affected[path]
                if not c?
                    c = affected[path] = true
            i += 1
        @affected_anim_channels = affected

    # delete me
    set_altmesh: (index) ->
        set_altmesh @,index

class STransform

    constructor:  ->
        @position = [0,0,0]
        @rotation = [0,0,0,1]
        @scale = 1

    to_mat4: (out) ->
        x = @rotation[0]
        y = @rotation[1]
        z = @rotation[2]
        w = @rotation[3]
        s = @scale
        out[0] = (w*w + x*x - y*y - z*z) * s
        out[1] = 2 * (x * y + z * w) * s
        out[2] = 2 * (x * z - y * w) * s
        out[3] = 0
        out[4] = 2 * (x * y - z * w) * s
        out[5] = (w*w - x*x + y*y - z*z) * s
        out[6] = 2 * (z * y + x * w) * s
        out[7] = 0
        out[8] = 2 * (x * z + y * w) * s
        out[9] = 2 * (y * z - x * w) * s
        out[10] = (w*w - x*x - y*y + z*z) * s
        out[11] = 0
        out[12] = @position[0]
        out[13] = @position[1]
        out[14] = @position[2]
        out[15] = 1

    transform: (out, other) ->
        vec3.add out.position, other.position, out.position
        quat.mul out.rotation. other.rotation, out.rotation
        out.scale *= other.scale

    invert: (out) ->
        scale = out.scale = 1/@scale
        rot = quat.invert out.rotation, @rotation
        pos = vec3.scale out.position, @position, -scale
        vec3.transformQuat pos, pos, rot

    randomize:  ->
        @rotation = [Math.random()-0.5,
                         Math.random()-0.5,
                         Math.random()-0.5,
                         Math.random()-0.5]
        quat.normalize @rotation, @rotation
        @position = [Math.random()-0.5,
                         Math.random()-0.5,
                         Math.random()-0.5]
        @scale = Math.random()*2 + 0.1

module.exports = {GameObject, STransform}
