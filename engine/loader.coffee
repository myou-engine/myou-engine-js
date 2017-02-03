{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{Action} = require './animation.coffee'
{Group} = require './group.coffee'
{Viewport} = require './viewport.coffee'
{Camera} = require './camera.coffee'
{Lamp} = require './lamp.coffee'
{Mesh} = require './mesh.coffee'
{Scene} = require './scene.coffee'
{Curve} = require './curve.coffee'
{GameObject} = require './gameobject.coffee'
{Armature} = require './armature.coffee'
{physics_engine_url, physics_engine_init, PhysicsWorld, set_gravity} = require './physics.coffee'
{fetch_objects} = require './fetch_assets.coffee'
{Texture} = require './texture.coffee'


load_scene = (name, filter, use_physics, context) ->
    scene = context.scenes[name]
    if scene
        return Promise.resolve(scene)
    scene = new Scene context, name
    #TODO: check if scene has some physic object
    url = "#{context.MYOU_PARAMS.data_dir}/scenes/#{name}/all.json"
    return fetch(url).then((data)->data.json()).then (data)=>
        if filter
            data = filter(data)

        use_physics = use_physics and context.use_physics
        if use_physics
            scene.use_physics = true
        # Parse all the actual scene data
        for d in data
            load_datablock scene, d, context

        context.loaded_scenes.push name

        if use_physics
            load_physics_engine().then ->
                scene.world = new PhysicsWorld
                g = scene.gravity
                set_gravity scene.world, g[0],g[1],g[2]
                for ob in scene.children
                    ob.instance_physics()
                return Promise.resolve(scene)
        else
            return Promise.resolve(scene)

load_datablock = (scene, data, context) ->
    # TODO: This has grown a little too much
    # We should use switch
    if data.type=='SCENE'
        scene.set_gravity data.gravity
        vec3.copy(scene.background_color, data.background_color)
        if data.ambient_color
            vec3.copy(scene.ambient_color, data.ambient_color)
        scene.debug_physics = context.MYOU_PARAMS.debug_physics or data.debug_physics
        scene.active_camera_name = data.active_camera
        scene.tree_name = data.tree_name
        scene.frame_start = data.frame_start if data.frame_start?
        scene.frame_end = data.frame_end if data.frame_end?
        scene.anim_fps = data.fps if data.fps?
        if data.markers?
            scene.markers = data.markers
            scene.markers_by_name = {}
            for m in scene.markers
                scene.markers_by_name[m.name] = m
        scene.sequencer_strips = data.sequencer_strips or []
        scene.extra_data = data.extra_data

    else if data.type=='TEXTURE'
        context.textures[data.name] = new Texture(context, data)

    else if data.type=='MATERIAL'
        if not data.fragment.splice?
            data.fragment = [context.SHADER_LIB, data.fragment]
        scene.unloaded_material_data[data.name] = data
        # only necessary when live updating a material
        old_mat = scene.materials[data.name]
        if old_mat?
            old_mat.destroy()
            for u in old_mat.users
                u.materials = []
    else if data.type=='SHADER_LIB'
        context.SHADER_LIB = data.code
    else if data.type=='JSCODE'
        window.eval data.code

    else if data.type=='ACTION'
        context.actions[data.name] = new Action data.name, data.channels, (data.markers or []), scene

    else if data.type=='EMBED_MESH'
        context.embed_meshes[data.hash] = data
    else if data.type=='GROUP'
        # TODO
    else
        load_object data, scene

    return


load_object = (data, scene) ->
    context = scene.context
    addme = false
    ob = scene.objects[data.name]
    if data.type == 'MESH'
        if not ob
            if data.materials.length == 0
                console.warn "Mesh #{data.name} won't be rendered because it has no material."
            ob = new Mesh context
            ob.name = data.name
            ob.static = data.static or false
            ob.passes = data.passes # TODO: allow pass changes
            scene.add_object ob, data.name, data.parent, data.parent_bone

        vec4.copy ob.color, data.color
        load_mesh_properties = (ob, data)=>
            if ob.hash != data.hash
                # This data should not used on render
                # Only at mesh loading/configuring
                ob.hash = data.hash
                ob.elements = data.elements
                ob.offsets = data.offsets
                ob.stride = data.stride
                ob.mesh_name = data.mesh_name
                ob.material_names = data.materials
                ob.all_f = data.all_f
                ob.shape_multiplier = data.shape_multiplier or 1
                if data.uv_rect?
                    vec3.copy ob.uv_rect, data.uv_rect
                else
                    ob.uv_rect[2] = ob.uv_rect[3] = data.uv_multiplier or 1
                ob.pack_offset = data.pack_offset
                ob.packed_file = data.packed_file
                if data.bbox?
                    ob.bound_box = [vec3.clone(data.bbox),vec3.clone(data.bbox[3...])]
                ob.avg_poly_area = data.avg_poly_area or 10
                ob.avg_poly_length = Math.pow(ob.avg_poly_area,0.5)
                vec3.copy ob.center, data.center or [0,0,0]

        load_mesh_properties ob, data

        if 'alternative_meshes' of data
            alm = data.alternative_meshes
            ob.altmeshes.splice 0
            for d in alm
                d.visible = data.visible
                d.materials = data.materials
                m = new Mesh context
                m.name = ob.name
                m.scene = ob.scene
                ob.altmeshes.push m
                load_mesh_properties m,d

            ob.active_mesh_index = data.active_mesh_index

        if data.phy_mesh?
            # it will be used in the decision of whether this mesh must be loaded or not
            data.phy_mesh.visible = data.visible
            m = ob.physics_mesh = new Mesh context
            m.visible_mesh = ob
            m.name = ob.name
            m.scene = ob.scene
            load_mesh_properties m, data.phy_mesh

        if data.avg_poly_area
            ob.avg_poly_area = data.avg_poly_area
            ob.avg_poly_length = Math.pow(data.avg_poly_area,0.5)

        if data.lod_levels
            ob.lod_objects = []
            for lod_data in data.lod_levels
                # Add properties that weren't exported because
                # the base level already have them
                lod_data.elements = data.elements
                lod_data.stride = data.stride
                lod_data.materials = data.materials
                lod_data.visible = data.visible
                lod_ob = new Mesh context
                lod_ob.scene = ob.scene
                lod_ob.parent = ob.parent # for armature in configure_materials
                load_mesh_properties lod_ob, lod_data
                ob.lod_objects.push
                    factor: lod_data.factor,
                    object: lod_ob


        ob.zindex = 1
        if 'zindex' of data
            ob.zindex = data.zindex

    else if data.type == 'CURVE'
        if not ob
            ob = new Curve context
            ob.name = data.name
            ob.static = data.static or false
            scene.add_object ob, data.name, data.parent, data.parent_bone

        ob.set_curves data.curves, data.resolution, data.nodes
    else if data.type == 'CAMERA'
        options = {
            near_plane: data.clip_start
            far_plane: data.clip_end
            field_of_view: data.angle
            ortho_scale: data.ortho_scale
            aspect_ratio: 4/3 # TODO: Export it.
            cam_type: data.cam_type
            sensor_fit: data.sensor_fit
        }
        if not ob
            ob = new Camera context, options
            ob.name = data.name
            ob.static = data.static or false
            scene.add_object ob, data.name, data.parent, data.parent_bone
            if data.name == scene.active_camera_name
                scene.active_camera = ob
                if context.render_manager.viewports.length == 0
                    v = new Viewport context.render_manager, ob
        else
            throw "Live server no longer in use"

    else if data.type=='LAMP'
        if not ob
            ob = new Lamp context
            ob.name = data.name
            ob.static = data.static or false
            if data.lamp_type!='POINT' and data.shadow
                tex_size = closest_pow2(if data.tex_size? then data.tex_size else 256)
                tex_size = Math.min(tex_size, context.MYOU_PARAMS.maximum_shadow_size or Infinity)
                ob.shadow_options =
                    texture_size: tex_size
                    frustum_size: data.frustum_size
                    clip_start: data.clip_start
                    clip_end: data.clip_end
                if context.render_manager.enable_shadows
                    ob.init_shadow()

            scene.add_object ob, data.name, data.parent, data.parent_bone
        ob.lamp_type = data.lamp_type
        ob.color.set data.color
        if data.energy?
            ob.energy = data.energy
        ob.falloff_distance = data.falloff_distance

    else if data.type=='ARMATURE'
        if not ob
            ob = new Armature context
            ob.name = data.name
            ob.static = data.static or false
            scene.add_object ob, data.name, data.parent, data.parent_bone
        if data.bones
            ob.bones = {}
            ob.children = []
            ob.unfc = data.unfc
            ob.add_bones data.bones
        ob.apply_pose data.pose
    else if data.type=='EMPTY'
        if not ob
            ob = new GameObject context
            ob.name = data.name
            ob.static = data.static or false
            vec4.copy ob.color, data.color
            scene.add_object ob, data.name, data.parent, data.parent_bone
    else
        console.log "Warning: unsupported type",data.type
        return

    if 'particles' of data
        ob.particle_systems = []
        for p in data.particles
            if 'formula' of p
                #string function to code
                p.formula = (new Function('return ' + p.formula))()
            ob.particle_systems.push {'properties':p}

    if data.position?
        # current format
        vec3.copy ob.position, data.position
        mat4.copy ob.matrix_parent_inverse, data.matrix_parent_inverse
    else
        # old format, that may have matrix_parent_inverse but incorrect
        vec3.copy ob.position, data.pos
    r = data.rot
    quat.set ob.rotation, r[1], r[2], r[3], r[0]
    ob.rotation_order = data.rot_mode
    vec3.copy ob.scale, data.scale
    vec3.copy ob.offset_scale, data.offset_scale
    ob.visible = data.visible
    ob.mirrors = data.mirrors or 1
    vec3.copy ob.dimensions, data.dimensions # is this used outside physics?
    ob.radius = data.mesh_radius or vec3.len(ob.dimensions) * 0.5
    ob.properties = data.properties or {}
    ob.actions = data.actions or []
    ob.animation_strips = data.animation_strips or []
    ob.physics_type = data.phy_type
    if context.use_physics
        ob.physical_radius = data.radius
        ob.anisotropic_friction = data.use_anisotropic_friction
        ob.friction_coefficients = data.friction_coefficients
        ob.collision_group = data.collision_group
        ob.collision_mask = data.collision_mask
        ob.collision_shape = data.collision_bounds_type
        ob.collision_margin = data.collision_margin
        ob.collision_compound = data.collision_compound
        ob.mass = data.mass
        ob.no_sleeping = data.no_sleeping
        ob.is_ghost = data.is_ghost
        vec3.copy ob.linear_factor, data.linear_factor
        vec3.copy ob.angular_factor, data.angular_factor
        ob.form_factor = data.form_factor
        ob.friction = data.friction
        ob.elasticity = data.elasticity
        ob.step_height = data.step_height
        ob.jump_force = data.jump_force
        ob.max_fall_speed = data.max_fall_speed
        if scene.world
            ob.instance_physics()
    ob._update_matrices()

    ob.dupli_group = data.dupli_group

load_physics_engine = ()->
    # Add promise if it doesn't exist yet (to be used by any engine instance)
    if not window.global_ammo_promise
        if Ammo?
            window.global_ammo_promise = Promise.resolve()
        else
            window.global_ammo_promise = new Promise (resolve, reject) ->
                check_ammo_is_loaded = ->
                    if not Ammo?
                        if window.Module?.allocate
                            reject("There was an error initializing physics")
                        else
                            setTimeout(check_ammo_is_loaded, 300)
                    else
                        resolve()
                setTimeout(check_ammo_is_loaded, 300)

            script = document.createElement 'script'
            script.type = 'text/javascript'
            script.async = true

            if process.browser
                physics_engine_url = require("file?name=/libs/ammo.asm.js!./libs/ammo.asm.js")
            else
                dirname =  __dirname.replace(/\\/g, '/')
                physics_engine_url = 'file://' + dirname + "/libs/ammo.asm.js"

            script.src = physics_engine_url
            document.body.appendChild script

    # Callback for when the engine has loaded
    # (will be executed immediately if the promise was already resolved)
    return window.global_ammo_promise.then ->
        physics_engine_init()
        return

module.exports = {
    load_scene
}
