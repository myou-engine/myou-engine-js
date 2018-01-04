{mat4, vec3, quat, color3, color4} = require 'vmath'
{Action} = require './animation'
{CanvasScreen} = require './screen'
{Camera} = require './camera'
{Lamp} = require './lamp'
{Mesh} = require './mesh'
{Scene} = require './scene'
{Curve} = require './curve'
{GameObject} = require './gameobject'
{Armature} = require './armature'
{Texture} = require './texture'
{Material} = require './material'
{nearest_POT} = require './math_utils/math_extra'
{load_physics_engine} = require './physics/bullet'

load_scene = (name, filter, options, context) ->
    scene = context.scenes[name]
    if scene
        return Promise.resolve(scene)
    {
        data_dir=context.MYOU_PARAMS.data_dir
        original_scene_name=name
    } = options
    scene = new Scene context, name
    scene.data_dir = data_dir
    scene.original_scene_name = original_scene_name
    url = "#{scene.data_dir}/scenes/#{original_scene_name}/all.json"
    return fetch(url).then (response) ->
        if not response.ok
            return Promise.reject "Scene '#{name}' could not be loaded from URL
                '#{url}' with error '#{response.status} #{response.statusText}'"
        return response.json()
    .then (data) ->
        if filter
            data = filter(data)

        # Parse all the actual scene data
        for d in data
            load_datablock scene, d, context

        context.loaded_scenes.push name
        scene.instance_probe()
        Promise.resolve(scene)

blender_attr_types =
    '-1': 'UNUSED'
    5: 'UV'
    6: 'VCOL'
    18: 'TANGENT'
    14: 'ORCO'

load_datablock = (scene, data, context) ->
    # TODO: This has grown a little too much
    # We should use switch
    if data.type=='SCENE'
        [gx,gy,gz] = data.gravity
        scene.world.set_gravity vec3.new gx,gy,gz
        vec3.copyArray(scene.background_color, data.background_color)
        if data.ambient_color
            vec3.copyArray(scene.ambient_color, data.ambient_color)
        scene.active_camera_name = data.active_camera
        if data.world_material?
            scene.world_material = new Material(context, \
                data.world_material.name, data.world_material, scene)
            # TODO: Remove next line when it makes sense
            data.background_probe.auto_refresh = false
            data.background_probe.background_only = true
            scene.background_probe_data = data.background_probe
        scene.bsdf_samples = data.bsdf_samples if data.bsdf_samples?
        scene.lod_bias = data.bsdf_samples if data.lod_bias?
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
        scene.textures[data.name] = new Texture(scene, data)

    else if data.type=='MATERIAL'
        # Converting blender attributes into myou's definition of varyings
        if not data.varyings?
            data.varyings = for a in data.attributes when a.type < 77
                {
                    type: blender_attr_types[a.type] or "#{a.type}"
                    varname: 'var'+a.varname[3...]
                    attname: (a.name or '').replace(/[^_A-Za-z0-9]/g, '')
                    gltype: a.gltype # Only for 'UNUSED' for now
                }
            data.varyings.push type: 'VIEW_POSITION', varname: 'varposition'
            data.varyings.push type: 'VIEW_NORMAL', varname: 'varnormal'
            data.attributes = null
            data.material_type = data.material_type or 'BLENDER_INTERNAL'

        is_blender278 = false
        # Convert shader params into inputs
        if data.material_type == 'BLENDER_INTERNAL'
            params = {}
            for p in data.params or []
                params[p.name] = p
            input_names = ['', 'diffuse_color', 'diffuse_intensity',
                'specular_color', 'specular_intensity', 'specular_hardness',
                'emit', 'ambient', 'alpha', 'mir']
            input_types = [1, 3, 1, 3, 1, 1, 1, 1, 1, 3]
            for u in data.uniforms
                # We don't check "u.material" so buggy versions of blender with
                # undefined material are interpreted as having the material
                # named "undefined"
                if (u.type>>16) == 7 # GPU_DYNAMIC_GROUP_MAT
                    is_blender278 = true
                    prefix = ''
                    if u.material != data.name
                        prefix = u.material + '_'
                    iname = input_names[u.type&15]
                    u.path = prefix + iname
                    u.value = params[u.material][iname]
                    u.count = input_types[u.type&15]
                    u.type = -1
                    switch u.count
                        when 1
                            u.value = u.value or 0
                        when 3
                            u.value = color3.new((u.value or [0,0,0])...)
                        when 4
                            u.value = color4.new((u.value or [0,0,0,0])...)

        # add multiplier to vertex colors
        if is_blender278
            for v in data.varyings
                if v.type == 'VCOL'
                    v.multiplier = 0.0039215686 # 1/255

        mat = scene.materials[data.name]
        if mat
            # A stub was made when loading a mesh
            # due to the old scene format
            mat.set_data data
        else
            mat = new Material(context, data.name, data, scene)

        if data.material_type == 'BLENDER_INTERNAL'
            # Assuming old format of textures
            # Assign texture settings, check mismatch between users and warn
            for u in data.uniforms
                {type} = u
                if type == 13 or type == 0x40001 or type == 0x40002
                    tex = scene.textures[u.image]
                    if not tex?
                        data_uri = u.filepath or ''
                        if not /^data:/.test data_uri
                            throw Error "Texture #{u.image} not found
                                (in material #{data.name})."
                        # Support for old ramps
                        # console.warn "Obsolete ramp format", u.image
                        {filepath, filter, wrap, size} = u
                        formats = {png: [{width: 0, height: 0, file_size: size,\
                                            file_name: '', data_uri}]}
                        tex = new Texture scene,
                            {name: u.image, formats, wrap, filter}
                        scene.textures[u.image] = tex
                    # Defaults to texture stored settings
                    {wrap, filter, use_mipmap} = tex
                    {wrap=wrap, filter=filter, use_mipmap=use_mipmap} = u
                    # Check for mismatch between material textures and warn
                    if tex.users.length != 0 and \
                            (tex.wrap != wrap or tex.filter != filter or
                            tex.use_mipmap != use_mipmap)
                        other_mat = tex.users[tex.users.length-1]
                        console.warn "Texture #{u.image} have different settings
                            in materials #{other_mat.name} and #{data.name}"
                    # Overwrite settings
                    tex.wrap = wrap
                    tex.filter = filter
                    tex.use_mipmap = use_mipmap
                    tex.users.push mat


    else if data.type=='SHADER_LIB'
        context.SHADER_LIB = data.code
    else if data.type=='JSCODE'
        window.eval data.code

    else if data.type=='ACTION'
        context.actions[data.name] =
            new Action data.name, data.channels, (data.markers or [])

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
                console.warn "Mesh #{data.name} won't be rendered because
                                it has no material."
            ob = new Mesh context
            ob.name = data.name
            ob.static = data.static or false
            ob.passes = data.passes # TODO: allow pass changes
            scene.add_object ob, data.name, data.parent, data.parent_bone

        color4.copyArray ob.color, data.color
        load_mesh_properties = (ob, data) ->
            # NOTE: This condition was used in live mode, but many of these
            # things should be updated regardless
            if ob.hash != data.hash
                # This data should not used on render
                # Only at mesh loading/configuring
                ob.hash = data.hash
                ob.elements = data.elements
                ob.offsets = data.offsets
                ob.stride = data.stride
                ob.mesh_name = data.mesh_name
                ob.materials = for mat_name in data.materials
                    scene.materials[mat_name] or new Material(
                        context, mat_name, null, scene)
                ob.material_defines = data.material_defines or {}
                ob.all_f = data.all_f
                ob.shape_multiplier = data.shape_multiplier or 1
                if data.uv_rect?
                    ob.uv_rect = data.uv_rect
                else
                    ob.uv_rect[2] = ob.uv_rect[3] = data.uv_multiplier or 1
                ob.pack_offset = data.pack_offset
                ob.packed_file = data.packed_file
                if data.bbox?
                    [x,y,z,x2,y2,z2] = data.bbox
                    ob.bound_box = [vec3.new(x,y,z), vec3.new(x2,y2,z2)]
                ob.avg_poly_area = data.avg_poly_area or 10
                ob.avg_poly_length = Math.pow(ob.avg_poly_area,0.5)
                if data.center?
                    vec3.copyArray ob.center, data.center
                if data.bone_index_maps?
                    ob.bone_index_maps = data.bone_index_maps

        load_mesh_properties ob, data

        if data.phy_mesh?
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
                # workaround (TODO: still necessary?)
                lod_data.materials = lod_data.materials or data.materials
                lod_ob = new Mesh context
                lod_ob.scene = ob.scene
                lod_ob.parent = ob.parent # for armature in configure_materials
                load_mesh_properties lod_ob, lod_data
                ob.lod_objects.push
                    factor: lod_data.factor,
                    object: lod_ob,
                    # TODO: make configurable, both globally and per LoD
                    hysteresis: .1,

        if data.zindex?
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
                if not context.canvas_screen?
                    screen = new CanvasScreen(context)
                    screen.add_viewport ob
        else
            throw Error "Live server no longer in use"

    else if data.type=='LAMP'
        if not ob
            ob = new Lamp context
            ob.name = data.name
            ob.static = data.static or false
            ob.use_shadow = data.lamp_type!='POINT' and !!data.shadow
            if ob.use_shadow
                tex_size = nearest_POT(data.tex_size ? 256)
                {maximum_shadow_size} = context.options
                tex_size = Math.min(tex_size, maximum_shadow_size ? Infinity)
                ob.shadow_options =
                    texture_size: tex_size
                    frustum_size: data.frustum_size
                    clip_start: data.clip_start
                    clip_end: data.clip_end
                    # arbitrary conversions performed in blender code
                    # (gpu_lamp_from_blender() in gpu_material.c)
                    bias: data.shadow_bias * 0.02 * 0.25
                    bleed_bias: data.bleed_bias
                if context.render_manager.enable_shadows
                    ob.init_shadow()

            scene.add_object ob, data.name, data.parent, data.parent_bone
        ob.lamp_type = data.lamp_type
        color3.copyArray ob.color, data.color
        if data.energy?
            ob.energy = data.energy
        ob.falloff_distance = data.falloff_distance
        ob.size_x = data.size_x
        ob.size_y = data.size_y

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
        ob.apply_pose_arrays data.pose
    else if data.type=='EMPTY'
        if not ob
            ob = new GameObject context
            ob.name = data.name
            ob.static = data.static or false
            color4.copyArray ob.color, data.color
            scene.add_object ob, data.name, data.parent, data.parent_bone
    else
        console.log "Warning: unsupported type",data.type
        return

    if data.position?
        # current format
        vec3.copyArray ob.position, data.position
        mat4.set ob.matrix_parent_inverse, data.matrix_parent_inverse...
    else
        # old format, that may have matrix_parent_inverse but incorrect
        vec3.copyArray ob.position, data.pos
    r = data.rot
    quat.set ob.rotation, r[1], r[2], r[3], r[0]
    ob.rotation_order = data.rot_mode
    vec3.copyArray ob.scale, data.scale
    ob.visible = data.visible
    vec3.copyArray ob.dimensions, data.dimensions
    ob.radius = data.mesh_radius or vec3.len(ob.dimensions) * 0.5
    ob.properties = data.properties or {}
    ob.animation_strips = data.animation_strips or []
    if not /^(CAMERA|LAMP)$/.test ob.type
        ob.body.type = data.phy_type
    {body} = ob
    body.radius = data.radius
    body.use_anisotropic_friction = data.use_anisotropic_friction
    body.friction_coefficients = data.friction_coefficients
    body.group = data.collision_group
    body.mask = data.collision_mask
    body.shape = data.collision_bounds_type
    body.margin = data.collision_margin
    body.is_compound = data.collision_compound
    body.mass = data.mass
    body.no_sleeping = data.no_sleeping
    body.is_ghost = data.is_ghost
    vec3.copyArray body.linear_factor, data.linear_factor
    vec3.copyArray body.angular_factor, data.angular_factor
    body.form_factor = data.form_factor
    body.friction = data.friction
    body.elasticity = data.elasticity
    body.step_height = data.step_height
    body.jump_force = data.jump_force
    body.max_fall_speed = data.max_fall_speed
    body.instance()
    ob._update_matrices()

    ob.dupli_group = data.dupli_group

module.exports = {
    load_scene
}
