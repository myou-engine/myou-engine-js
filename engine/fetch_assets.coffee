fetch_promises = {}  # {file_name: promise}
material_promises = {} # {mat_name: promise}


## Uncomment this to find out why a politician lies
# Promise._all = Promise._all or Promise.all
# Promise.all = (list) ->
#     for l in list
#         if not l
#             debugger
#     politician = Promise._all list
#     politician.list = list
#     politician


# Creates a texture and returns a promise for when the source is loaded
fetch_texture = (name, path, filter, wrap='R', size=0, context) ->
    tex = context.render_manager.textures[name] or null
    if tex?
        return tex.promise

    promise = new Promise (resolve, reject) ->
        gl = context.render_manager.gl
        wrap_const = {'C': gl.CLAMP_TO_EDGE, 'R': gl.REPEAT, 'M': gl.MIRRORED_REPEAT}[wrap]
        if name.startswith 'special:'
            tex = {name}
            resolve tex
            return
        tex = {tex: gl.createTexture(), size, path}
        context.render_manager.textures[name] = tex
        tex.name = name
        tex.users = [] # materials
        tex.loaded = false

        #Non crn or dds textures:
        img = new Image
        tex.reupload = ->
            if tex.tex
                gl.deleteTexture tex.tex
            tex.tex = gl.createTexture()
            img.onload()

        img.onload = =>
            context.main_loop.add_frame_callback =>
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
                ext = context.render_manager.extensions.texture_filter_anisotropic
                if context.MYOU_PARAMS.anisotropic_filter and ext
                    gl.texParameterf gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap_const
                gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap_const
                gl.bindTexture gl.TEXTURE_2D, null
                tex.loaded = true
                resolve tex

        img.onerror = ->
            reject "Image not found: " + path

        if path[...5]=='data:'
            img.src = path
        else
            base = context.MYOU_PARAMS.data_dir + '/textures/'
            img.src = base + path
        return
    context.render_manager.texture_promises.push promise
    promise.texture = tex
    tex.promise = promise
    return promise

# Loads textures of material (given a name), return a promise
fetch_textures_of_material = (scene, mat_name) ->
    mat = scene.materials[mat_name]
    if mat
        Promise.all [texture.promise for texture in mat.textures]
    else
        # Useful when you only want to request textures to be loaded without compiling the shader
        data = scene.unloaded_material_data[mat_name]
        if data
            Promise.all(for u in data.uniforms \
                when u.type == 13 and scene # 2D image
                    fetch_texture u.image, u.filepath, u.filter, u.wrap, u.size, scene.context
            )
        else
            Promise.reject "Couldn't find material '#{mat_name}'"

# Load a mesh of a mesh type object, return a promise
fetch_mesh = (mesh_object, min_lod=1) ->
    promise = new Promise (resolve, reject) ->
        if mesh_object.type != 'MESH'
            reject 'object is not a mesh'
        {context} = mesh_object
        file_name = mesh_object.packed_file or mesh_object.hash

        for alt in mesh_object.altmeshes
            if alt != mesh_object
                fetch_mesh alt

        # Load LoD
        lod_promises = []
        lod_objects = mesh_object.lod_objects
        last_lod = lod_objects[lod_objects.length-1]
        if last_lod
            min_lod = Math.max min_lod, last_lod.factor
        for lod_ob in lod_objects
            if lod_ob.factor <= min_lod
                lod_promises.push fetch_mesh(lod_ob.object)

        # Not load self if only lower LoDs were loaded, or it was already loaded.
        if (min_lod < 1 and lod_promises.length != 0) or mesh_object.data
            return Promise.all lod_promises

        fetch_promise = if file_name of fetch_promises
            fetch_promises[file_name]
        else
            base = context.MYOU_PARAMS.data_dir + '/scenes/'
            uri = base + mesh_object.scene.name + '/' + file_name + '.mesh'
            fetch(uri).then((data)->data.arrayBuffer())

        fetch_promise.then (data) ->
            new Promise (resolve, reject) ->
                mesh_data = context.mesh_datas[mesh_object.hash]
                if mesh_data
                    # It was loaded before, replace if not the same
                    if mesh_object.data != mesh_data
                        mesh_object.data.remove mesh_object
                        mesh_object.data = mesh_data
                        mesh_object.data.users.push mesh_object
                    resolve(mesh_object)
                else
                    # If there was no mesh_data, actually load it
                    # (load_from_arraybuffer will populate mesh_datas)
                    context.main_loop.add_frame_callback =>
                        mesh_object.load_from_arraybuffer data
                        if mesh_object.physics_type != 'NO_COLLISION' and mesh_object.scene.world
                            #TODO: Remove without resolving the promise too early
                            context.main_loop.add_frame_callback =>
                                mesh_object.instance_physics()
                                resolve(mesh_object)
                        else
                            resolve(mesh_object)
        .then ->
            resolve(mesh_object)
    promise.mesh_object = mesh_object
    return promise


# This returns a promise of all things necessary to display the object
# (meshes, textures, materials)
fetch_objects = (object_list) ->
    promises = []
    for ob in object_list
        if ob.type == 'MESH'
            {scene} = ob
            ob.visible = true
            promises.push fetch_mesh(ob)
            for mat_name in ob.material_names
                mat = scene.materials[mat_name]
                # Check if material was already loaded; if it was, we'll assume
                # it was rendered at this point, even though it may not
                if not mat
                    if scene.enabled
                        # TODO: compile material even though is not
                        # going to be used
                        promise = material_promises[mat_name]
                        if not promise
                            container = {}
                            promise = material_promises[mat_name] = new Promise (resolve, reject) ->
                                do (mat_name) -> container = {resolve, reject}
                            promise.functions = container
                        promises.push promise
                    promises.push fetch_textures_of_material scene, mat_name

    Promise.all promises




set_altmesh = (ob,i) ->
    ob.active_mesh_index = i


module.exports = {
    material_promises,
    fetch_texture, fetch_textures_of_material,
    fetch_mesh, fetch_objects
}
