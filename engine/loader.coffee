{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{Action} = require './animation'
{Group} = require './group'
{Viewport} = require './viewport'
{Camera} = require './camera'
{Lamp} = require './lamp'
{Mesh} = require './mesh'
{Scene, get_scene} = require './scene'
{Curve} = require './curve'
{GameObject} = require './gameobject'
{Armature} = require './armature'
{PHYSICS_ENGINE_URL, physics_engine_init} = require './physics'

NUM_WORKERS_64 = 2
NUM_WORKERS_32 = 1
WEBSOCKET_PORT = 9971
EMULATE_WORKERS = not process.browser or navigator.userAgent.toString().indexOf('Edge/12.') != -1

profile_tex_upload_times = []

# TODO: instead of using this, do script elements have an onload?
script_tag_loaded_callbacks = {}


class Loader

    current_scene: null
    debug: false

    constructor: (context)->
        @context = context

    load: (data) ->
        scene = null
        start = performance.now()

        onload = =>
            scene.enabled = true
            console.log 'Scene "' + scene.name + '" loaded in ' + ((performance.now() - start)*0.001).toFixed(2) + ' seconds'
            @remove_queue_listener 0, onload
            @context.onload_main_scene?()
            @context.onload_main_scene = null
            # Hack! (see below)
            scene.decrement_task_count()

        @add_queue_listener 0, onload
        for d in data
            @load_datablock d
        # Hack!
        # We have to use increment_task_count and decrement_task_count
        # for each task loaded
        scene = @current_scene
        scene.increment_task_count()
        console.log 'Loading scene "'+scene.name+'"'


    load_datablock: (data) ->
        # TODO: This has grown a little too much
        # We should use a map with functions instead of so many ifs...
        if data.scene
            @current_scene = @context.scenes[data.scene]
        if data.type=='SCENE'
            @current_scene = scene = get_scene @context, data.name
            scene.loader = scene.loader or @
            scene.set_gravity data.gravity
            scene.background_color = data.background_color
            scene.debug_physics = data.debug_physics
            scene.active_camera_name = data.active_camera
            scene.stereo = data.stereo
            scene.stereo_eye_separation = data.stereo_eye_separation
            scene.tree_name = data.tree_name

        else if data.type=='MATERIAL'
            @current_scene.unloaded_material_data[data.name] = data
            # only necessary when live updating a material
            old_mat = @current_scene.materials[data.name]
            if old_mat?
                old_mat.destroy()
                for u in old_mat.users
                    u.materials = []

        else if data.type=='SHADER_LIB'
            if @context.render_manager.extensions.compressed_texture_s3tc
                @context.SHADER_LIB = data.code.replace(
                    'normal = 2.0*(vec3(-color.r, color.g, color.b) - vec3(-0.5, 0.5, 0.5));',
                    'normal = 2.0*(vec3(-color.a, -color.g, color.b) - vec3(-0.5, -0.5, 0.5));'
                )
            else
                @context.SHADER_LIB = data.code.replace(
                    'normal = 2.0*(vec3(-color.r, color.g, color.b) - vec3(-0.5, 0.5, 0.5));',
                    'normal = 2.0*(vec3(-color.r, -color.g, color.b) - vec3(-0.5, -0.5, 0.5));'
                ).replace(
                    # The version in packer
                    'normal = normalize(vec3(-color.a, -color.g, color.b) - vec3(-0.5, -0.5, 0.5));',
                    'normal = 2.0*(vec3(-color.r, -color.g, color.b) - vec3(-0.5, -0.5, 0.5));')

        else if data.type=='JSFILE'
            # NOTE: assumes the file always has a line at the end that executes
            # script_tag_loaded_callbacks['filename.js']()
            @current_scene.loader.load_script_with_tag_callback data.uri, -> pass

        else if data.type=='JSCODE'
            window.eval data.code

        else if data.type=='ACTION'
            @context.actions[data.name] = new Action data.name, data.channels, data.markers

        else if data.type=='GROUP'
            @context.groups[data.name] = new Group data.objects, data.offset

        else if data.type=='DELETE'
            for n in data.names
                @current_scene.remove_object @current_scene.objects[n]


        else if data.type=='STOP_RENDER'
            @current_scene.enabled = false

        else if data.type=='START_RENDER'
            @current_scene.enabled = true

        else if data.type=='DEBUG_VIEW'
            vp = @context.render_manager.viewports[0]
            if vp and vp.camera
                if not vp.debug_camera
                    vp.debug_camera = vp.camera.clone()
                    vp.debug_camera.projection_matrix = new(Float32Array)(16)
                    vp.debug_camera.projection_matrix_inv = new(Float32Array)(16)
                    vp.debug_camera.parent = null
                vp.debug_camera.cam_type = data.cam_type
                vp.debug_camera.position = data.position
                vp.debug_camera.rotation = data.rotation
                vp.debug_camera.recalculate_projection()
                vp.debug_camera._update_matrices()

        else if data.type=='NO_DEBUG_VIEW'
            vp = @context.render_manager.viewports[0]
            if vp
                vp.debug_camera = null
        else
            @load_object data

        return

    load_object: (data) ->
        addme = false
        scene = @current_scene
        ob = scene.objects[data.name]
        if data.type == 'MESH'
            if not ob
                ob = new Mesh @context
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
                    ob.uv_multiplier = data.uv_multiplier or 1
                    ob.pack_offset = data.pack_offset
                    ob.packed_file = data.packed_file
                    if ob.hash of @context.mesh_datas
                        # This is duplicated in load_mesh_data
                        ob.data and ob.data.remove ob
                        ob.data = @context.mesh_datas[ob.hash]
                        ob.data.users.push ob
                        # NOTE: cached physics mesh hash is not checked!
                        ob.instance_physics()

                    else if data.visible
                        scene.loader.load_mesh_data ob
            load_mesh_properties ob, data

            if 'alternative_meshes' of data
                alm = data.alternative_meshes
                ob.altmeshes.splice 0
                for d in alm
                    d.visible = data.visible
                    d.materials = data.materials
                    m = new Mesh @context
                    m.name = ob.name
                    m.scene = ob.scene
                    ob.altmeshes.push m
                    load_mesh_properties m,d

                ob.active_mesh_index = data.active_mesh_index

            if 'phy_mesh' of data
                data.phy_mesh.visible = data.visible
                m = ob.physics_mesh = new Mesh @context
                m.visible_mesh = ob
                m.name = ob.name
                m.scene = ob.scene
                load_mesh_properties m, data.phy_mesh

            if data.lod_levels
                ob.lod_objects = []
                for lod_data in data.lod_levels
                    # Add properties that weren't exported because
                    # the base level already have them
                    lod_data.elements = data.elements
                    lod_data.stride = data.stride
                    lod_data.materials = data.materials
                    lod_data.visible = data.visible
                    lod_ob = new Mesh @context
                    lod_ob.scene = ob.scene
                    load_mesh_properties lod_ob, lod_data
                    ob.lod_objects.push
                        factor: lod_data.factor,
                        distance: 1/lod_data.factor,
                        object: lod_ob


            ob.zindex = 1
            if 'zindex' of data
                ob.zindex = data.zindex

        else if data.type == 'CURVE'
            if not ob
                ob = new Curve @context
                ob.name = data.name
                ob.static = data.static or false
                scene.add_object ob, data.name, data.parent, data.parent_bone

            ob.set_curves data.curves, data.resolution, data.nodes
        else if data.type == 'CAMERA'
            if not ob
                ob = new Camera @context
                ob.name = data.name
                ob.static = data.static or false
                scene.add_object ob, data.name, data.parent, data.parent_bone
                if data.name == scene.active_camera_name
                    scene.active_camera = ob
                    if @context.render_manager.viewports.length == 0
                        v = new Viewport @context.render_manager, ob
                    if scene.stereo
                        stereo_manager.enable v
            ob.near_plane = data.clip_start
            ob.far_plane = data.clip_end
            if not @context.render_manager.vrstate
                ob.field_of_view = data.angle
            ob.ortho_scale = data.ortho_scale
            ob.cam_type = data.cam_type
            ob.sensor_fit = data.sensor_fit
            ob.recalculate_projection()

        else if data.type=='LAMP'
            if not ob
                ob = new Lamp @context
                ob.name = data.name
                ob.static = data.static or false
                if data.lamp_type!='POINT' and data.shadow
                    tex_size = if data.tex_size? then data.tex_size else 256
                    ob.init_shadow data.frustum_size, data.clip_start, data.clip_end, closest_pow2(tex_size)

                scene.add_object ob, data.name, data.parent, data.parent_bone
            ob.lamp_type = data.lamp_type
            ob.color.set data.color
            if data.energy?
                ob.energy = data.energy
            ob.falloff_distance = data.falloff_distance

        else if data.type=='ARMATURE'
            if not ob
                ob = new Armature @context
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
                ob = new GameObject @context
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

        vec3.copy ob.position, data.pos
        r = data.rot
        quat.copy ob.rotation, [r[1], r[2], r[3], r[0]]
        ob.rotation_order = data.rot_mode
        vec3.copy ob.scale, data.scale
        vec3.copy ob.offset_scale, data.offset_scale
        ob.visible = data.visible
        ob.mirrors = data.mirrors or 1
        vec3.copy ob.dimensions, data.dimensions # is this used outside physics?
        ob.radius = vec3.len(ob.dimensions) * 0.5
        ob.properties = data.properties or {}
        ob.actions = data.actions or []
        ob.physics_type = data.phy_type
        if @context.MYOU_PARAMS.load_physics_engine
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
        if ob.static
            ob._update_matrices()

        ob.dupli_group = data.dupli_group

    load_texture: (name, path, filter, wrap='R', size=0) ->
        tex = @context.render_manager.textures[name] or null
        if tex?
            return tex
        gl = @context.render_manager.gl
        wrap_const = {'C': gl.CLAMP_TO_EDGE, 'R': gl.REPEAT, 'M': gl.MIRRORED_REPEAT}[wrap]
        if name.startswith 'special:'
            return {'name': name}
        tex = {'tex': gl.createTexture(), 'size': size}
        @context.render_manager.textures[name] = tex
        tex.name = name
        tex.users = [] # materials
        tex.loaded = false

        if path[-4...] == '.crn'
            base = @data_dir + '/textures/'
            if @debug and @context.MYOU_PARAMS.nodejs
                base = '/tmp/textures/'
            src = base + path
            ext = @context.render_manager.extensions.compressed_texture_s3tc

            tex.level_buffers = null
            tex.num_additional_levels = 0

            load_levels = (num_additional_levels, width, height, format, buffers, common_data) ->
                #t = performance.now()
                gl.bindTexture gl.TEXTURE_2D, tex.tex

                if format == 0
                    internal_format = ext.COMPRESSED_RGBA_S3TC_DXT1_EXT
                else
                    internal_format = ext.COMPRESSED_RGBA_S3TC_DXT5_EXT
                buffers_len = buffers.length
                if @context.MYOU_PARAMS.no_mipmaps
                    buffers_len = 1
                for i in [0...buffers_len]
                    data = new Uint8Array buffers[i]
                    gl.compressedTexImage2D gl.TEXTURE_2D, i, internal_format, width>>i, height>>i, 0, data
                    ## TODO: Enable in debug mode, silence after n errors
                    #error = gl.getError()
                    #if error != gl.NO_ERROR
                        #errcodes = {'1280': 'INVALID_ENUM', '1281': 'INVALID_VALUE',
                                    #'1282': 'INVALID_OPERATION', '1205': 'OUT_OF_MEMORY'}
                        #console.log  'GL Error ' + errcodes[error] + ' when loading ' + tex.path + ' size:' + width + 'x' + height + ' level:' + i

                gl_linear_nearest = if filter then gl.LINEAR else gl.NEAREST
                if buffers_len > 1
                    mipmap_filter = {
                        C:  if filter then gl.LINEAR_MIPMAP_NEAREST  else gl.NEAREST_MIPMAP_NEAREST
                        R:  if filter then gl.LINEAR_MIPMAP_LINEAR else gl.NEAREST_MIPMAP_LINEAR
                        }[wrap]
                    gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mipmap_filter
                else
                    gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl_linear_nearest
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl_linear_nearest
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap_const
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap_const

                # We preserve the base buffers in case of lost context
                # (the higher levels can be loaded later)
                tex.level_buffers = buffers
                tex.num_additional_levels = num_additional_levels
                tex.common_data = common_data
                tex.loaded = true
                tex.width = width
                tex.height = height
                tex.format = format

                #profile_tex_upload_times.push [performance.now()-t, name]
                main_loop.reset_timeout()
                return true

            load_565 = (data) ->
                gl.bindTexture gl.TEXTURE_2D, tex.tex
                # Assuming texture is square
                data = new Uint16Array data
                width = height = Math.sqrt data.length
                gl_linear_nearest = if filter then gl.LINEAR else gl.NEAREST
                gl.texImage2D gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_SHORT_5_6_5, data
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl_linear_nearest
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl_linear_nearest
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap_const
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap_const

                # We preserve the base buffers in case of lost context
                # (the higher levels can be loaded later)
                tex.loaded = true
                tex.width = width
                tex.height = height
                main_loop.reset_timeout()
                return true
            if ext
                @add_task src, load_levels, 'load_crunch'
            else
                @add_task src+'.565', load_565, ''

            load_single_level = (width, height, format, buffers) ->
                pass

            reupload = tex.reupload = ->
                if tex.tex
                    gl.deleteTexture tex.tex
                tex.tex = gl.createTexture()
                load_levels n, tex.width, tex.height, tex.format, tex.level_buffers, tex.common_data

            add_level_buffer = (width, height, format, buffer) ->
                if @context.render_manager.context_lost_count
                    return
                gl.deleteTexture tex.tex
                tex.tex = gl.createTexture()
                buffers = tex.level_buffers
                buffers.insert 0, buffer
                load_levels tex.num_additional_levels, width, height, format, buffers, tex.common_data

            tex.load_additional_level = (queue_id=1) =>
                if @context.render_manager.context_lost_count
                    return
                #console.log tex.num_additional_levels, name
                if tex.num_additional_levels
                    n = tex.num_additional_levels = tex.num_additional_levels - 1
                    file_name = src+'.'+n
                    common_data = tex.common_data[...]
                    @add_task file_name, add_level_buffer, 'load_crunch_extra', common_data, queue_id
                    return true
                return false

        else if path[-4...] == '.dds'
            base = @data_dir + '/textures/'
            if @debug and @context.MYOU_PARAMS.nodejs
                base = '/tmp/textures/'
            src = base + path
            ext = @context.render_manager.extensions.compressed_texture_s3tc
            f = (data)->
                gl.bindTexture gl.TEXTURE_2D, tex.tex
                gl.pixelStorei gl.UNPACK_FLIP_Y_WEBGL, true
                mipmaps = uploadDDSLevels gl, ext, data
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR
                x = if mipmaps > 1 then gl.LINEAR_MIPMAP_LINEAR else gl.LINEAR
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, x
                tex.loaded = true
                return true
            @add_task src, f, ''
        else
            @pending_operations += 1
            img = new Image
            #img.crossOrigin = 'anonymous'
            tex.reupload = ->
                if tex.tex
                    gl.deleteTexture tex.tex
                tex.tex = gl.createTexture()
                img.onload()
            img.onload = =>
                gl.bindTexture gl.TEXTURE_2D, tex.tex
                gl.pixelStorei gl.UNPACK_FLIP_Y_WEBGL, true
                gl.texImage2D gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img
                gl_linear_nearest = if filter then gl.LINEAR else gl.NEAREST
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl_linear_nearest
                # TODO: add mipmap options to the GUI
                gl_linear_nearest_mipmap = if filter then gl.LINEAR_MIPMAP_LINEAR else gl.NEAREST_MIPMAP_NEAREST
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl_linear_nearest_mipmap
                gl.generateMipmap gl.TEXTURE_2D
                # TODO: detect which textures need this (mostly walls, floors...)
                # and add a global switch
                ext = @context.render_manager.extensions.texture_filter_anisotropic
                if @context.MYOU_PARAMS.anisotropic_filter and ext
                    gl.texParameterf gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap_const
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap_const
                gl.bindTexture gl.TEXTURE_2D, null
                tex.loaded = true
                # TODO
                #@loaded += size
                #self_.pending_operations -= 1
                #self_.may_have_loaded_all()
            img.onerror = ->
                #self_.loaded += size
                #self_.pending_operations -= 1
                #self_.may_have_loaded_all()
                console.log "Image not found: " + path
            if path[...5]=='data:'
                img.src = path
            else
                base = @data_dir + '/textures/'
                if @debug and @context.MYOU_PARAMS.nodejs
                    base = '/tmp/textures/'
                img.src = base + path
        tex.path = path
        return tex


class WebSocketLoader

    constructor: (address, loader)->
        @pending = ""
        @num_pending = 0
        ws = new(WebSocket)(address)
        @keep_alive_int

        ws.onopen = (x)=>
            console.log "Connected to debug WebSocket"
            f () ->
                ws.send 'keepalive'
            @keep_alive_int = setInterval f,10000

        ws.onmessage = (e)=>
            # If it's a number, it's the number of fragments
            if not @num_pending and e.data[0] != '{' and e.data[0] != '['
                @num_pending = Math.floor e.data
            else if @num_pending
                @pending += e.data
                @num_pending -= 1
            if not @num_pending
                data = JSON.parse @pending or e.data
                @pending = ""
                if hasattr data, 'length'
                    @load data
                else
                    @load_datablock data

        ws.onclose = (x) =>
            console.log x
            x = x or {'code': 1006, 'reason': ''}
            code = ['NORMAL','GOING_AWAY','PROTOCOL_ERROR',
            'UNSUPPORTED','','NO_STATUS','ABNORMAL','INCONSISTENT_DATA',
            '','TOO_LARGE','','','','','','TLS_ERROR'][x.code-1000]
            console.log "Disconnected with code",code,x.reason
            console.log "Reconnecting in 1 second"
            clearInterval @keep_alive_int
            f = -> WebSocketLoader address, loader
            setTimeout f, 1000



class XhrLoader extends Loader

    constructor: (context, data_dir='', workers=null)->
        scripts_dir = data_dir + '/scripts/'
        @context = context
        @loaded = 0
        @total = 0
        @total_loaded = 0

        @physics_engine_loaded = false
        @pending_meshes = {}

        @data_dir = data_dir
        @full_local_path = location.href.split('#')[0].split('/')[...-1].join('/')+'/'
        if scripts_dir.indexOf('/') > 0 # if it's a relative path
            scripts_dir = @full_local_path + scripts_dir
        @scripts_dir = scripts_dir

        @workers = workers = workers or []
        @remaining_tasks = [0] # One per queue
        @queue_listeners = [[]] # One per queue


        @next_task_id = 0
        @task_cb = task_cb = {}  # {id: [callback, callback, ...]}

        prog = document.getElementById 'progress'

        xhrloader = @
        onmessage = (e)->
            data = e.data  # [command or task_id, ...]
            if data[0] == 'log'
                console.log data[1]
            else if data[0] == 'progress'
                # TODO: use progress, with Math.max(prev, current)
                queue_id = data[1]
                loaded = data[2]
                @last_progress[queue_id] = Math.max(@last_progress[queue_id], loaded)
                total_loaded = 0
                for w in workers
                    total_loaded += w.last_progress[queue_id]
                @total_loaded = total_loaded
                if prog
                    prog.style.width = (total_loaded/@context.MYOU_PARAMS.total_size * 448)+'px'
            else if data[0] == 'done'
                queue_id = data[1]
                # remove this?
            else if data[2] == 'error'
                console.log 'error', data[3], data[4], data
            else
                # [id, queue_id, response or 'error', error status, error response]
                queue_id = data[1]
                finished = true
                for f in task_cb[data[0]]
                    finished = finished and f.apply null, data[2]
                if finished
                    @remaining[queue_id] -= 1
                    xhrloader.remaining_tasks[queue_id] -= 1
                    xhrloader.check_queue_finished queue_id

        ext = @context.render_manager.extensions.compressed_texture_s3tc
        worker_code = """
        COMPRESSED_TEXTURE_SUPPORT = """ + ext? + "\n" + """
        importScripts('"""+(scripts_dir or @full_local_path)+"""crunch.js')\n
        """
        if process.browser
            worker_code += require 'raw!./load_worker.coffee'
        else
            #Electron code only
            fs = require('fs')
            path = require('path')
            coffee_compile = require('coffee-script').compile
            dir = path.dirname __filename
            cs_load_worker= fs.readFileSync dir + '/load_worker.coffee', 'utf8'
            worker_code = coffee_compile(cs_load_worker, {bare: true})



        if EMULATE_WORKERS
            worker = new Function("""
            function importScripts(url){
                xhr = new XMLHttpRequest;
                xhr.open('GET', url, false);
                xhr.send();
                window.eval(xhr.response.replace('var Crunch','window.Crunch'));
            }

            """+worker_code+"""

            var fake = {
                onmessage: null,
                postMessage: function(msg){
                    onmessage({data:msg})
                    }
                }

            post_message = function(msg){
                fake.onmessage({data:msg})
                };
            return fake
            """)()

            worker.id = w
            worker.last_progress = [0] # One per queue
            worker.remaining = [0] # One per queue
            worker.onmessage = onmessage
            workers.push worker
            NUM_WORKERS_32 = NUM_WORKERS_64 = 1
            return
        blob = new Blob [worker_code], {'type': 'application/javascript'}
        worker_uri = (window.URL or window.webkitURL).createObjectURL(blob)
        # worker_uri = 'data:application/javascript,' + encodeURIComponent(worker_code)

        num_workers = NUM_WORKERS_32
        if is_64_bit_os
            num_workers = NUM_WORKERS_64
        for w in [0...num_workers]
            worker = new Worker worker_uri
            worker.id = w
            worker.last_progress = [0] # One per queue
            worker.remaining = [0] # One per queue
            worker.onmessage = onmessage
            workers.push worker

    check_queue_finished: (queue_id)->
        remaining = @remaining_tasks[queue_id]
        if remaining == 0
            for k, scene of @context.scenes
                if scene and not scene.world and @physics_engine_loaded
                    scene.on_physics_engine_loaded()
            for f in @queue_listeners[queue_id]
                if f #why?
                    f()
        else if remaining < 0
            raise "Too many finished tasks!"

    add_task: (uri, callback, decoder, extra_data, queue_id=0) ->
        # Decoder can be "text", "json", "" (for arraybuffer) or a function name in load_worker
        id = @next_task_id
        cb_list = @task_cb[id] = @task_cb[id] or []
        cb_list.push callback
        # Eventually it will be better to choose the worker more intelligently
        num_workers = NUM_WORKERS_32
        if is_64_bit_os
            num_workers = NUM_WORKERS_64
        worker = @workers[id % num_workers]
        @remaining_tasks[queue_id] = (@remaining_tasks[queue_id]|0) + 1
        worker.remaining[queue_id] = (worker.remaining[queue_id]|0) + 1
        if not /^http/.test(uri)
            uri = @full_local_path + uri
        if extra_data and extra_data.byteArray?
            worker.postMessage ['get', queue_id, id, uri, decoder, extra_data], [extra_data]
        else
            worker.postMessage ['get', queue_id, id, uri, decoder, extra_data]
        @next_task_id += 1

    add_anon_task: (queue_id) ->
        id = @next_task_id
        @remaining_tasks[queue_id] =  @remaining_tasks[queue_id]|0 + 1
        @next_task_id += 1
        return @next_task_id

    finish_anon_task: (queue_id) ->
        @remaining_tasks[queue_id] -= 1
        @check_queue_finished queue_id

    add_queue_listener: (queue_id, f)->
        l = @queue_listeners[queue_id] = @queue_listeners[queue_id] or []
        l.push f

    remove_queue_listener: (queue_id, f)->
        l = @queue_listeners[queue_id]
        if l
            l.remove f

    load_scene: (scene_name, filter_function)->
        f = (data)=>
            d = JSON.parse data
            if filter_function
                d = filter_function d
            @load d
            if @debug and not debug_loader
                global debug_loader
                host = location.hostname
                if not host or location.protocol == "chrome-extension:"
                    host = "127.0.0.1"
                port = location.port
                if host == "127.0.0.1" or host == "localhost"
                    port = WEBSOCKET_PORT
                debug_loader = new WebSocketLoader "ws://"+host+":"+port+"/ws/", @
                debug_loader.current_scene = @current_scene or scene
                # TODO: show a debug widget
            return true
        base = @data_dir + '/scenes/'
        @add_task base + scene_name + '/all.json', f, 'text'

    load_physics_engine: ()->
        # Add promise if it doesn't exist yet (to be used by any engine instance)
        if not window.global_ammo_promise
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
            script.src = @scripts_dir + PHYSICS_ENGINE_URL
            document.body.appendChild script

        # Callback for when the engine has loaded
        # (will be executed immediately if the promise was already resolved)
        window.global_ammo_promise = global_ammo_promise.then =>
            physics_engine_init()
            @physics_engine_loaded = true
            for k, scene of @context.scenes
                # WARNING: physics can be loaded before or after the scene
                # TODO: Check all physics objects are instanced in both scenarios
                # console.log 'The scene '+k+' did load before the physics engine'
                if scene and not scene.world
                    scene.on_physics_engine_loaded()
            return

    load_script: (uri, func=null)->
        if location.protocol == "chrome-extension:"
            func()
            return
        f = (data)->
            if @context.MYOU_PARAMS.debug
                data="console.log('Loading "+uri+"');\n"+data
            # TODO does try catch (to detect syntax errors) degrade performance?
            window.eval data
            if func
                func()
            return true
        @add_task @data_dir + uri, f, 'text'

    load_script_with_tag_callback: (uri, func=null)->
        script_file_name = uri.split('/').pop(-1).split('?')[0]
        queue_id = 0
        @add_anon_task queue_id
        f = =>
            @finish_anon_task queue_id
            delete script_tag_loaded_callbacks[script_file_name]
            if func
                func()
        script_tag_loaded_callbacks[script_file_name] = f

        script = document.createElement 'script'
        script.type = 'text/javascript'
        script.async = true
        script.src = @data_dir + uri
        document.body.appendChild script


    load_mesh_data: (mesh_object, min_lod=1)->
        if mesh_object.type != 'MESH'
            return false
        file_name = mesh_object.packed_file or mesh_object.hash
        pending_meshes = @pending_meshes

        for alt in mesh_object.altmeshes
            if alt != mesh_object
                @load_mesh_data alt

        # Load LoD
        any_loaded = false
        lod_objects = mesh_object.lod_objects
        last_lod = lod_objects[lod_objects.length-1]
        if last_lod
            min_lod = Math.max(min_lod, last_lod.factor)
        for lod_ob in lod_objects
            if lod_ob.factor <= min_lod
                any_loaded = @load_mesh_data(lod_ob.object) or any_loaded

        # Not load self if only lower LoDs were loaded, or it was already loaded.
        if min_lod < 1 or mesh_object.data
            return any_loaded

        if file_name of pending_meshes
            if pending_meshes[file_name].indexOf mesh_object == -1
                pending_meshes[file_name].push mesh_object
        else
            pending_meshes[file_name] = []
            base = @data_dir + '/scenes/'
            uri = base + mesh_object.scene.name + '/' + file_name + '.mesh'
            packed = (data) ->
                m = mesh_object
                others = pending_meshes[file_name]
                while m
                    m.data and m.data.remove m
                    m.data = @context.mesh_datas[m.hash]
                    if m.data
                        m.data.users.push m
                    else
                        m.load_from_arraybuffer data
                    # Assuming live server don't give packed data
                    m = others.pop()
                delete pending_meshes[file_name]
                return true
            non_packed = (data) ->
                mesh_object.load_from_arraybuffer(data)
                for m in pending_meshes[file_name]
                    # TODO: equal meshes with different materials fail?
                    m.data and m.data.remove m
                    m.data = mesh_object.data
                    m.data.users.push m
                    if not m.body
                        # TODO: remove this from load_from_va_ia
                        # and leave only this?
                        m.instance_physics()
                delete pending_meshes[file_name]
                return true
            if mesh_object.packed_file
                #console.log 'packed'
                @add_task uri, packed, ''
            else
                #console.log 'non packed'
                @add_task uri, non_packed, ''
        return true

set_altmesh = (ob,i) ->
    ob.active_mesh_index = i


module.exports = {XhrLoader, WebSocketLoader, Loader}
