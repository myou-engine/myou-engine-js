texture = require './texture.coffee'

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

# Loads textures of material (given a name), return a promise
fetch_textures_of_material = (scene, mat, ob_name="") ->
    if mat.last_shader
        Promise.all [texture.promise for texture in mat.last_shader.textures]
    else
        # Useful when you only want to request textures to be loaded without compiling the shader
        # TODO: Do we need to draw the texture with a dummy shader
        # to force it to be actually loaded?
        Promise.all(for u in mat.data.uniforms \
            when (u.type == 13 or u.type == 262146 or u.type == 262145) and scene
                # 2D image, see constants in material.py
                tex = mat.scene.textures[u.image]
                if not tex?
                    if not u.filepath
                        throw "Texture #{u.image} not found (in material #{mat_name})."
                    tex = texture.get_texture_from_path_legacy u.image, u.filepath, u.filter, u.wrap, u.size, scene
                tex.load()
                tex.ob_user_names.push ob_name
        )

# Load a mesh of a mesh type object, return a promise
fetch_mesh = (mesh_object, options={}) ->
    {max_mesh_lod=1} = options
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
            max_mesh_lod = Math.max max_mesh_lod, last_lod.factor
        for lod_ob in lod_objects
            if lod_ob.factor <= max_mesh_lod
                lod_promises.push fetch_mesh(lod_ob.object)

        # Not load self if only lower LoDs were loaded, or it was already loaded.
        if (max_mesh_lod < 1 and lod_promises.length != 0) or mesh_object.data
            return resolve Promise.all(lod_promises)

        fetch_promise = if file_name of fetch_promises
            fetch_promises[file_name]
        else
            embed_mesh = context.embed_meshes[mesh_object.hash]
            if embed_mesh?
                buffer = (new Uint32Array(embed_mesh.int_list)).buffer
                embed_mesh.int_list = null # No longer needed, free space
                console.log 'loaded as int list'
                Promise.resolve(buffer)
            else
                scene = mesh_object.original_scene or mesh_object.scene
                base = scene.data_dir + '/scenes/'
                uri = base + scene.original_scene_name + '/' + file_name + '.mesh'
                fetch(uri).then (response)->
                    if not response.ok
                        return Promise.reject "Mesh '#{mesh_object.name}' could not be loaded from URL '#{uri}' with error '#{response.status} #{response.statusText}'"
                    response.arrayBuffer()


        fetch_promises[file_name] = fetch_promise

        fetch_promise.then (data) ->
            mesh_data = context.mesh_datas[mesh_object.hash]
            if mesh_data
                # It was loaded before, replace if not the same
                if mesh_object.data != mesh_data
                    mesh_object.data?.remove mesh_object
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
            return
        .catch (e) ->
            reject e
        return
    promise.mesh_object = mesh_object
    return promise


# This returns a promise of all things necessary to display the object
# (meshes, textures, materials)
fetch_objects = (object_list, options={}) ->
    render = options.render or true
    if not object_list.length
        return Promise.resolve()

    promises = []
    for ob in object_list
        ob.render = render
        if ob.type == 'MESH'
            {scene} = ob
            promises.push fetch_mesh(ob, options)
            for mat in ob.materials
                # TODO: we'll assume here there's only one shader per material for now
                shader = mat.last_shader
                if not shader and mat.scene?
                    # TODO: add this back when we can ensure
                    # it is drawn at least once, to force loading into the GPU
                    ###
                    if scene.enabled and scene.context.main_loop.enabled
                        # TODO: compile material even though is not
                        # going to be used
                        promise = material_promises[mat_name]
                        if not promise
                            container = {}
                            promise = material_promises[mat_name] = new Promise (resolve, reject) ->
                                do (mat_name) -> container = {resolve, reject}
                            promise.functions = container
                        promises.push promise
                    ###
                    promises.push fetch_textures_of_material scene, mat, ob.name

    Promise.all promises




set_altmesh = (ob,i) ->
    ob.active_mesh_index = i


module.exports = {
    material_promises,
    fetch_textures_of_material,
    fetch_mesh, fetch_objects
}
