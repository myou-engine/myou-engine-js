{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{Animation} = require './animation'
{Cubemap} = require './cubemap'
{Probe} = require './probe'
fetch_assets = require './fetch_assets'
{
    update_ob_physics,

    BoxShape, SphereShape, CylinderShape, CapsuleShape,
    ConvexShape, TriangleMeshShape, CompoundShape,
    get_convex_hull_edges, add_child_shape, ob_to_phy_with_scale,

    RigidBody, StaticBody, CharacterBody,
    add_body, remove_body,

    allow_sleeping, make_ghost,
    set_linear_factor, set_angular_factor

} = require './physics'


NO_MIRROR = 1
MIRROR_X = 2
MIRROR_Y = 4
MIRROR_Z = 8
MIRROR_XY = 16
MIRROR_XZ = 32
MIRROR_YZ = 64
MIRROR_XYZ = 128

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
        @scale = vec3.fromValues 1, 1, 1
        @dimensions = vec3.create()
        @color = vec4.fromValues 1, 1, 1, 1
        @alpha = 1
        @offset_scale = vec3.fromValues 1, 1, 1
        @matrix_parent_inverse = mat4.create()
        @scene = null
        @original_scene = null
        @dupli_group = null
        @visible = true
        @render = true
        @_world_position = vec3.create()
        @_sqdist = 0  # Squared distance to camera
        @_flip = false
        @_sqscale = 1 # Globally squared scale, to avoid rendering zero scale
        @parent = null
        @children = []
        @static = false
        @world_matrix = mat4.create()
        @rotation_matrix = mat3.create()
        @normal_matrix = mat3.create()
        @_m3 = mat3.create()
        @probe = null
        @properties = {}
        @animation_strips = []
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

    # Creates or recreates the body in the physics world,
    # or destroys it if physics have been disabled for this object.
    #
    # Usually called after both the object and the physics engine have loaded.
    # But can also be called after changing physics settings.
    instance_physics: (use_visual_mesh=false) ->
        #This function only can be called if the object is in a scene.
        if @visible_mesh
            # Logic for physical submeshes is run for
            # the real "visible" mesh
            @visible_mesh.instance_physics()
            return

        if @body# and @body.world == @scene.world
            remove_body @scene.world, @body
            @scene.rigid_bodies.splice _,1 if (_ = @scene.rigid_bodies.indexOf @)!=-1
            @scene.static_ghosts.splice _,1 if (_ = @scene.static_ghosts.indexOf @)!=-1
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
                    @rotation_order = 'Q'
                    quat.copy @rotation, rot
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

    # Function meant for static meshes or objects that change scale.
    # This is very fast except when a static triangle mesh had a change in scale
    # which is very slow to do every frame (maybe other phy types too)
    update_physics_transform: ->
        @_update_physics_transform_of_children()
        if @body
            ob_to_phy_with_scale [@]
        return

    _update_physics_transform_of_children: ->
        for child in @children
            if child.children.length
                child._update_physics_transform_of_children()
        ob_to_phy_with_scale @children
        return

    _update_matrices:  ->
        rm = @rotation_matrix
        [x, y, z, w] = @rotation
        if @rotation_order != 'Q'
            q = quat.create()
            for i in [2..0] by -1
                switch @rotation_order[i]
                    when 'X'
                        quat.rotateX q, q, x
                    when 'Y'
                        quat.rotateY q, q, y
                    when 'Z'
                        quat.rotateZ q, q, z
            [x, y, z, w] = q

        scl = @scale
        @_flip = false
        @_sqscale = vec3.sqrLen scl
        if @parent?
            @_flip = @parent._flip
            @_sqscale *= @parent._sqscale
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
            ## TODO TODO: Rotation and normal matrices are incorrect, esp after scaling parents and having matrix_parent_inverse
            mat3.mul rm, @parent.rotation_matrix, rm

            # TODO: make normal matrix with inverse transpose instead of this way
            mat3.mul nm, @parent.normal_matrix, nm
            mat4.mul wm, @matrix_parent_inverse, wm
            mat4.mul @world_matrix, @parent.world_matrix, @world_matrix
            #ppos = @parent.world_matrix.subarray 12,15
            #pos = [pos[0] + ppos[0], pos[1] + ppos[1], pos[2] + ppos[2]]

    set_rotation_order: (order) ->
        if order == @rotation_order
            return
        if order != 'Q'
            f = quat['to_euler_'+order]
            if not f?
                throw "Invalid rotation order.
                    Should be one of: Q XYZ XZY YXZ YZX ZXY ZYX."
        q = @rotation
        if @rotation_order != 'Q'
            [x,y,z] = q
            q[0] = q[1] = q[2] = 0
            q[3] = 1
            for i in [2..0] by -1
                switch @rotation_order[i]
                    when 'X'
                        quat.rotateX q, q, x
                    when 'Y'
                        quat.rotateY q, q, y
                    when 'Z'
                        quat.rotateZ q, q, z
        if f?
            f(q,q)
            q[3] = 0
        @rotation_order = order


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


    get_world_position: (out=vec3.create()) ->
        return vec3.copy out, @get_world_matrix().subarray(12,15)

    get_world_rotation: (out=quat.create())  ->
        # TODO: would it be more efficient to convert
        # matrix_parent_inverse into a quat?
        wm = @get_world_matrix()
        quat.fromMat3 out, mat3.fromMat4(mat3.create(), wm)

    get_world_pos_rot: ->
        wm = @get_world_matrix()
        pos = vec3.clone(wm.subarray(12,15))
        rot = quat.fromMat3 quat.create(), mat3.fromMat4(mat3.create(), wm)
        return [pos, rot]

    get_world_matrix: ->
        @parent?.get_world_matrix()
        @_update_matrices()
        return @world_matrix

    # Returns a clone of the object
    # @param [Scene] scene: Destination scene
    # @param [bool] recursive: Whether to clone its children
    clone: (scene=this.scene, recursive=false) ->
        n = Object.create @
        n.children = children = []
        n.position = vec3.clone @position
        n.rotation = vec4.clone @rotation
        n.scale = vec3.clone @scale
        n.dimensions = vec3.clone @dimensions
        n.offset_scale = vec3.clone @offset_scale
        n.world_matrix = mat4.clone @world_matrix
        n.rotation_matrix = mat3.clone @rotation_matrix
        n.normal_matrix = mat3.clone @normal_matrix
        n.color = vec4.clone @color
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
        n.materials = materials = n.materials?[...]
        if n.materials and scene != this.scene
            for i in [0...materials.length]
                mat = materials[i] = materials[i].clone_to_scene scene

        scene?.add_object n, @name
        # Adding children after ensures objects don't need to be sorted
        if recursive
            for child in @children
                child = child.clone(scene, true)
                child.parent = n
                children.push child
        if @body
            n.body = null
            n.instance_physics @_use_visual_mesh
        return n

    remove: (recursive) ->
        @scene.remove_object @, recursive

    instance_probe: ->
        if @probe
            return @probe
        {probe_options} = @properties
        if probe_options?
            if probe_options.type == 'OBJECT'
                ob = @scene.objects[probe_options.object]
                return @probe = ob.probe or ob.instance_probe()
            @probe = new Probe @, probe_options
        else
            @probe = @scene.background_probe
        return @probe

module.exports = {GameObject}
