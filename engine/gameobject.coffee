{mat2, mat3, mat4, vec2, vec3, vec4, quat, color4} = require 'vmath'
{Animation} = require './animation'
{Cubemap} = require './cubemap'
{Probe} = require './probe'
fetch_assets = require './fetch_assets'
{
    update_ob_physics,

    BoxShape, SphereShape, CylinderShape, ConeShape, CapsuleShape,
    ConvexShape, TriangleMeshShape, CompoundShape,
    get_convex_hull_edges, add_child_shape, ob_to_phy_with_scale,

    RigidBody, StaticBody, CharacterBody,
    add_body, remove_body,

    allow_sleeping, make_ghost,
    set_linear_factor, set_angular_factor

} = require './physics'

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
        @offset_scale = vec3.new 1, 1, 1
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
        @_m3 = mat3.create()
        @probe = null
        @properties = {}
        @animation_strips = []
        @animations = {}
        @name = null
        @original_name = null
        @lod_objects = []
        @parent_bone_index = -1
        @behaviours = {}
        # Physics
        @body = null
        @shape = null
        @physics_type = 'NO_COLLISION'
        if @context.use_physics
            @physical_radius = 1
            @anisotropic_friction = false
            @friction_coefficients = vec3.new 1, 1, 1
            @collision_group = 1   # [1, 0, 0, 0, 0, 0, 0, 0]
            @collision_mask = 255  # [1, 1, 1, 1, 1, 1, 1, 1]
            @collision_shape = null
            @collision_margin = 0
            @collision_compound = false
            @mass = 0
            @no_sleeping = false
            @is_ghost = false
            @linear_factor = vec3.new 1, 1, 1
            @angular_factor = vec3.new 1, 1, 1
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


            # half extents
            he = @phy_he
            dim = @dimensions
            if dim.x == 0 and dim.y == 0 and dim.z == 0
                he = vec3.scale he, @scale, @physical_radius
            else
                vec3.scale he, dim, 0.5

            switch @collision_shape
                when 'BOX'
                    shape = new BoxShape he.x, he.y, he.z, @collision_margin
                    @phy_debug_mesh = @context.render_manager.debug.box
                when 'SPHERE'
                    radius = Math.max he.x, he.y, he.z
                    shape = new SphereShape radius, @collision_margin
                    @phy_debug_mesh = @context.render_manager.debug.sphere
                when 'CYLINDER'
                    radius = Math.max he.x, he.y
                    shape = new CylinderShape radius, he.z*2, @collision_margin
                    @phy_debug_mesh = @context.render_manager.debug.cylinder
                when 'CONE'
                    radius = Math.max he.x, he.y
                    shape = new ConeShape radius, he.z*2, @collision_margin
                    @phy_debug_mesh = @context.render_manager.debug.cone
                when 'CAPSULE'
                    radius = Math.max he.x, he.y
                    shape = new CapsuleShape radius, he.z, @collision_margin
                    @phy_debug_mesh = @context.render_manager.debug.cylinder
                when 'CONVEX_HULL', 'TRIANGLE_MESH'

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

                    if (is_hull = @collision_shape == 'CONVEX_HULL')
                        shape = data.phy_convex_hull
                    else
                        shape = data.phy_mesh

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
                            vec3.scale scale, scale, p.scale.z
                            p = p.parent
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
                            data.phy_mesh = shape
                else
                    console.warn "Warning: Unknown shape", @collision_shape

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
                    add_child_shape comp, shape, {x: 0, y:0, z:0}, {x: 0, y:0, z:0, w:1}
                    shape = comp
            else
                @collision_compound = false

            if shape
                posrot = @get_world_pos_rot()
                pos = posrot[0]
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
                    @rotation_order = 'Q'
                    quat.copy @rotation, rot
                    body = new RigidBody mass, shape, pos, rot, @friction, @elasticity, @form_factor
                    set_linear_factor body, @linear_factor
                    set_angular_factor body, {x: 0, y:0, z:0}
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
                        Math.PI * 2 #slope
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
        {x, y, z, w} = @rotation
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
        rm.m00 = w*w + x*x - y*y - z*z
        rm.m01 = 2 * (x * y + z * w)
        rm.m02 = 2 * (x * z - y * w)
        rm.m03 = 2 * (x * y - z * w)
        rm.m04 = w*w - x*x + y*y - z*z
        rm.m05 = 2 * (z * y + x * w)
        rm.m06 = 2 * (x * z + y * w)
        rm.m07 = 2 * (y * z - x * w)
        rm.m08 = w*w - x*x - y*y + z*z

        pos = @position
        ox = @offset_scale.x
        oy = @offset_scale.y
        oz = @offset_scale.z

        # Assumes objects are evaluated in order,
        # Parents before children

        wm = @world_matrix
        wm.m00 = rm.m00*ox*scl.x
        wm.m01 = rm.m01*oy*scl.x
        wm.m02 = rm.m02*oz*scl.x
        wm.m04 = rm.m03*ox*scl.y
        wm.m05 = rm.m04*oy*scl.y
        wm.m06 = rm.m05*oz*scl.y
        wm.m08 = rm.m06*ox*scl.z
        wm.m09 = rm.m07*oy*scl.z
        wm.m10 = rm.m08*oz*scl.z
        wm.m12 = pos.x
        wm.m13 = pos.y
        wm.m14 = pos.z

        if @parent
            bi = @parent_bone_index
            if bi >= 0
                bone = @parent._bone_list[bi]
                m3 = mat3.fromMat4(@_m3, bone.ol_matrix)
                mat3.mul(rm, m3, rm)
                mat3.mul(nm, m3, nm)
                mat4.mul(@world_matrix, bone.ol_matrix, @world_matrix)

            ## TODO: Rotation matrix is incorrect, esp after scaling parents and having matrix_parent_inverse
            ## Should only be used for the camera, calculated after the wm
            mat3.mul rm, @parent.rotation_matrix, rm
            mat4.mul wm, @matrix_parent_inverse, wm
            mat4.mul wm, @parent.world_matrix, wm
            #pwm = @parent.world_matrix
            #ppos  =vec3.new(pwm.m12,pwm.m13,pwm.m14)
            #pos = [pos.x + ppos.x, pos.y + ppos.y, pos.z + ppos.z]

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
            {x,y,z} = q
            q.x = q.y = q.z = 0
            q.w = 1
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
            q.w = 0
        @rotation_order = order


    update_matrices_recursive: ->
        @parent?.update_matrices_recursive()
        @_update_matrices()

    get_world_position: (out=vec3.create()) ->
        wm = @get_world_matrix()
        return vec3.set out, wm.m12, wm.m13, wm.m14

    get_world_rotation: (out=quat.create())  ->
        # TODO: would it be more efficient to convert
        # matrix_parent_inverse into a quat?
        @get_world_matrix()
        quat.fromMat3 out, @rotation_matrix

    get_world_pos_rot: ->
        pos = vec3.create()
        rot = quat.create()
        @get_world_position_rotation(pos, rot)
        return [pos, rot]

    get_world_position_rotation: (out_pos, out_rot) ->
        wm = @get_world_matrix()
        vec3.set out_pos, wm.m12, wm.m13, wm.m14
        quat.fromMat3 out_rot, @rotation_matrix
        return

    get_world_matrix: ->
        @parent?.get_world_matrix()
        @_update_matrices()
        return @world_matrix

    translate: (vector, relative_object) ->
        if relative_object? or @parent?
            vector = vec3.clone vector
            q = quat.create()
        if relative_object?
            relative_object.get_world_rotation q
            vec3.transformQuat vector, vector, q
        if @parent?
            @parent.get_world_rotation q
            quat.invert q, q
            vec3.transformQuat vector, vector, q
        vec3.add @position, @position, vector


    add_behaviour: (behaviour)->
        behaviour.assign @

    remove_behaviour: (behaviour)->
        behaviour.unassign @

    add_behavior: (behaviour)->
        behaviour.assign @

    remove_behavior: (behaviour)->
        behaviour.unassign @

    # Returns a clone of the object
    # @param [Scene] scene: Destination scene
    # @param [bool] recursive: Whether to clone its children
    clone: (scene=this.scene, options={}) ->
        {
            recursive=false
            behaviours=true
        } = options
        n = Object.create @
        n.children = children = []
        n.position = vec3.clone @position
        n.rotation = vec4.clone @rotation
        n.scale = vec3.clone @scale
        n.dimensions = vec3.clone @dimensions
        n.offset_scale = vec3.clone @offset_scale
        n.world_matrix = mat4.clone @world_matrix
        n.rotation_matrix = mat3.clone @rotation_matrix
        n.color = color4.clone @color
        n.properties = Object.create @properties
        n.actions = @actions[...]
        n.passes = @passes and @passes[...]
        n.avg_poly_area = @avg_poly_area
        n.avg_poly_length = @avg_poly_length
        n.behaviours = []

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
        if behaviours
            for b in @behaviours
                b.assign n
        # Adding children after ensures objects don't need to be sorted
        if recursive
            for child in @children
                child = child.clone(scene, {recursive: true})
                child.parent = n
                children.push child
        if @body
            n.body = null
            n.instance_physics @_use_visual_mesh
        return n

    remove: (recursive) ->
        if @properties.probe_options?
            @probe?.destroy()
        @scene.remove_object @, recursive

    instance_probe: ->
        if @probe
            return @probe
        {probe_options} = @properties
        if probe_options?
            if probe_options.type == 'OBJECT'
                ob = @scene.objects[probe_options.object]
                if not ob?
                    if probe_options.object != ''
                        console.error "Object '#{@name}' tries to use probe object '#{probe_options.object}' which doesn't exist."
                    return @probe = @scene.background_probe
                return @probe = ob.probe or ob.instance_probe()
            @probe = new Probe @, probe_options
        return @probe

module.exports = {GameObject}
