{vec3, quat, color4} = require 'vmath'
{fetch_objects} = require './fetch_assets'
{Probe} = require './probe'
{World} = require './physics/bullet'

_collision_seq = 0

class Scene
    type: 'SCENE'
    constructor: (context, name)->
        existing = context.scenes[name]
        return existing if existing
        @context = context
        @name = name
        context.scenes[name] = @
        @enabled = false
        @children = []
        @auto_updated_children = []
        @mesh_passes = [[], [], []]
        @lamps = []
        @armatures = []
        @objects = dict()
        # Just like objects but used for parenting (no global name collision)
        @parents = dict()
        @materials = dict()
        @textures = dict()
        @active_camera = null
        @physics_enabled = false
        @world = new World this
        @background_color = color4.new 0,0,0,1
        @ambient_color = color4.new 0,0,0,1
        @bsdf_samples = 16
        @lod_bias = -0.5
        @world_material = null
        @background_probe = null
        @background_probe_data = null
        @probes = []
        @_children_are_ordered = true
        @last_shadow_render_tick = 0
        @last_update_matrices_tick = 0
        @pre_draw_callbacks = []
        @post_draw_callbacks = []
        @use_physics = true
        @frame_start = 0
        @frame_end = 0
        @anim_fps = 30
        @markers = []
        @markers_by_name = dict()
        @extra_data = null
        @data_dir = ''
        @original_scene_name = ''
        @_debug_draw = null

    add_object: (ob, name='no_name', parent_name='', parent_bone)->
        ob.original_scene = ob.original_scene or ob.scene or @
        ob.scene = @

        @children.push ob
        if not ob.static
            @auto_updated_children.push ob

        n = name
        while @context.objects[n]
            _collision_seq += 1
            n = name + '$' + _collision_seq
        ob.name = n
        ob.original_name = name
        @objects[n] = @context.objects[n] = ob
        @parents[name] = ob
        #print "Added", name

        # Objects are always ordered parent-first
        p = @parents[parent_name]
        if p
            ob.parent = p
            p.children.push ob
            if p.type=='ARMATURE' and parent_bone
                ob.parent_bone_index = p._bone_list.indexOf p.bones[parent_bone]

        if ob.type=='MESH'
            for p in [0..2]  # TODO: not having number of passes hardcoded
                if p in ob.passes
                    @mesh_passes[p].push ob
        if ob.type=='LAMP'
            @lamps.push ob
        if ob.type=='ARMATURE'
            @armatures.push ob
        return

    remove_object: (ob, recursive=true)->
        @children.splice _,1 if (_ = @children.indexOf ob) != -1
        if not ob.static
            if (index = @auto_updated_children.indexOf ob) != -1
                @auto_updated_children.splice index,1
        delete @objects[ob.name]
        delete @parents[ob.original_name]
        if ob.type=='MESH'
            # TODO: remake this when remaking the pass system
            # NOTE: not removing from translucent pass because it's unused
            @mesh_passes[0].splice _,1 if (_ = @mesh_passes[0].indexOf ob)!=-1
            @mesh_passes[1].splice _,1 if (_ = @mesh_passes[1].indexOf ob)!=-1
            @fg_pass and @fg_pass.splice _,1 if (_ = @fg_pass.indexOf ob)!=-1
            @bg_pass and @bg_pass.splice _,1 if (_ = @bg_pass.indexOf ob)!=-1
            ob.data?.remove ob
        if ob.type=='LAMP'
            ob.destroy_shadow()
            @lamps.splice _,1 if (_ = @lamps.indexOf ob)!=-1
        if ob.type=='ARMATURE'
            @armatures.splice _,1 if (_ = @armatures.indexOf ob)!=-1

        ob.body.destroy()

        @probe?.destroy()

        for b in ob.behaviours
            b.unassign ob

        if recursive
            for child in ob.children by -1
                @remove_object child
        return

    make_parent: (parent, child, keep_transform=true)->
        if child.parent
            @clear_parent child, keep_transform
        if keep_transform
            {rotation_order} = child
            child.set_rotation_order 'Q'
            pos = child.position
            rot = child.rotation
            vec3.sub pos, pos, parent.get_world_position()
            p_rot = quat.invert quat.create(), parent.get_world_rotation()
            vec3.transformQuat pos, pos, p_rot
            quat.mul rot, p_rot, rot
            child.set_rotation_order rotation_order
        child.parent = parent
        parent.children.push child
        auchildren = @auto_updated_children
        # TODO: should we store the index in the objects
        # to make this check faster?
        if auchildren.indexOf(parent) > auchildren.indexOf(child)
            # When this is set to false, reorder_children() is called
            # in render_manager.draw_viewport
            @_children_are_ordered = false

    clear_parent: (child, keep_transform=true)->
        parent = child.parent
        if parent
            if keep_transform
                {rotation_order} = child
                vec3.copy child.position, child.get_world_position()
                quat.copy child.rotation, child.get_world_rotation()
                child.rotation_order = 'Q'
                child.set_rotation_order rotation_order
            if (index = parent.children.indexOf child) != -1
                parent.children.splice index,1

        child.parent = null

    # Makes sure all scene children are in order for correct matrix calculations
    reorder_children: ->
        # TODO: Only the objects marked as unordered need to be resolved here!
        #       (make a new list and append to children)
        children = @auto_updated_children
        index = 0
        reorder = (ob)->
            if not ob.static
                children[index++] = ob
            for c in ob.children
                reorder c
        # this @children is not a typo
        for ob in @children when not ob.parent
            reorder ob
        @_children_are_ordered = true

    update_all_matrices: ->
        if @_children_are_ordered == false
            @reorder_children()
        # TODO: do this only for visible and modified objects
        #       (also, this is used in LookAt and other nodes)
        for ob in @armatures
            for c in ob.children
                if c.visible and c.render
                    ob.recalculate_bone_matrices()
                    break
        for ob in @auto_updated_children
            ob._update_matrices()
        return

    unload: ->
        for ob in @children[...]
            @remove_object ob, false
            delete @context.objects[ob.name]
        @world.destroy()

        # Reduce itself to a stub by deleting itself and copying callbacks
        stub = @context.scenes[@name] = new Scene @context
        stub.name = @name
        stub.pre_draw_callbacks = @pre_draw_callbacks
        stub.post_draw_callbacks = @post_draw_callbacks
        stub.logic_ticks = @logic_ticks

        # TODO: unload textures, etc (or defer unloading to next scene load)
        # remove texture.users and garabage collect them after textures
        # of the next scene are enumerated

        # TODO: test this
        for screen in @context.screens
            for v,i in screen.viewports by -1
                if v.camera.scene == @
                    screen.viewports.splice i, 1
        return

    reload: ->
        @unload()
        @load()

    # Loads objects that are visible from any point of view, returns a promise
    # @option options [boolean] fetch_textures
    #       Whether to fetch textures when they're not loaded already.
    # @option options [number] texture_size_ratio
    #       Quality of textures specified in ratio of number of pixels.
    # @option options [number] max_mesh_lod
    #       Quality of meshes specified in LoD polycount ratio.
    # @return [Promise]
    load_visible_objects: (options) ->
        visible_objects = for ob in @children when ob.visible then ob
        return fetch_objects(visible_objects, options).then(=>@)

    # Loads the mesh of objects with physic meshes, returns a promise
    # @option options [boolean] fetch_textures
    #       Whether to fetch textures when they're not loaded already.
    # @option options [number] texture_size_ratio
    #       Quality of textures specified in ratio of number of pixels.
    # @option options [number] max_mesh_lod
    #       Quality of meshes specified in LoD polycount ratio.
    # @return [Promise]
    load_physics_objects: (options) ->
        physics_objects = []
        for ob in @children
            phy_mesh = ob.body.get_physics_mesh()
            if phy_mesh? and not phy_mesh.data?
                physics_objects.push phy_mesh

        return fetch_objects(physics_objects, options).then(=>@)

    # Loads objects that are visible from any point of view, and meshes with
    # physics, returns a promise
    # @option options [boolean] fetch_textures
    #       Whether to fetch textures when they're not loaded already.
    # @option options [number] texture_size_ratio
    #       Quality of textures specified in ratio of number of pixels.
    # @option options [number] max_mesh_lod
    #       Quality of meshes specified in LoD polycount ratio.
    # @return [Promise]
    load_visible_and_physics_objects: (options) ->
        objects = []
        for ob in @children
            ob_being_loaded = null
            if ob.visible
                ob_being_loaded = ob
                objects.push ob
            phy_mesh = ob.body.get_physics_mesh()
            if phy_mesh? and phy_mesh != ob_being_loaded and not phy_mesh.data?
                objects.push phy_mesh
        return fetch_objects(objects, options).then(=>@)

    # Loads all objects of the scene, returns a promise
    # @option options [boolean] fetch_textures
    #       Whether to fetch textures when they're not loaded already.
    # @option options [number] texture_size_ratio
    #       Quality of textures specified in ratio of number of pixels.
    # @option options [number] max_mesh_lod
    #       Quality of meshes specified in LoD polycount ratio.
    # @return [Promise]
    load_all_objects: (options) ->
        # TODO: This may not work the second time is not called.
        # Meshes should always return data's promises
        # TODO: Are modifier-based physics objects being loaded with this?
        return fetch_objects(@children, options).then(=>@)


    # Loads a list of objects, returns a promise
    # @param list [array] List of objects to load.
    # @option options [boolean] fetch_textures
    #       Whether to fetch textures when they're not loaded already.
    # @option options [number] texture_size_ratio
    #       Quality of textures specified in ratio of number of pixels.
    # @option options [number] max_mesh_lod
    #       Quality of meshes specified in LoD polycount ratio.
    # @return [Promise]
    load_objects: (list, options={})->
        if not list?.length?
            throw Error "Invalid arguments, expects (list, options). Did you
                        mean 'load_all_objects()'?"
        # TODO: This may not work the second time is not called.
        # Meshes should always return data's promises
        return fetch_objects(list, options).then(=>@)

    unload_invisible_objects: (options) ->
        invisible_objects = for ob in @children when not ob.visible and ob.data
            ob
        @unload_objects invisible_objects, options

    unload_objects: (list, options={}) ->
        # TODO: Cancel/ignore pending fetches!!
        # TODO: Add unique IDs to speed up presence lookup in lists?
        # TODO: Textures will be moved from shader to material.
        # TODO: Have an option for just unloading from GPU?
        {unload_textures=true} = options
        used_textures = []
        if unload_textures
            for _,ob of @context.objects when ob.type=='MESH' and ob not in list
                for mat in ob.materials
                    for tex in mat.last_shader?.textures or []
                        used_textures.push tex
        for ob in list
            ob_data = ob.data
            if ob_data?
                ob_data.splice _,1 if (_ = ob_data.indexOf ob)!=-1
            if unload_textures
                for mat in ob.materials
                    for tex in mat.last_shader?.textures or []
                        if tex not in used_textures
                            tex.unload()
            for lod_ob in ob.lod_objects or []
                lod_ob_data = lod_ob.object.data
                if lod_ob_data?
                    lod_ob_data.splice _,1 if (_ = lod_ob_data.indexOf ob)!=-1
                # We're assuming lod objects have same materials
                # NOTE: should we?
        return

    unload_all: ->
        @unload_objects @children

    enable_objects_render: (list)->
        for ob in list
            ob.render = true
        return

    disable_objects_render: (list)->
        for ob in list
            ob.render = false
        return

    enable_render: ->
        if not @active_camera?
            console.warn "Scene '#{@name}' has no active camera,
                        nothing will be rendered."
        @enabled = true
        return @

    disable_render: ->
        @enabled = false
        return @

    enable_physics: ->
        if not @context.use_physics
            console.warn "enable_physics: Ineffective because
                        options.disable_physics is set to true"
        else if not @use_physics
            console.warn "enable_physics: Ineffective because load_scene() was
                        called with load_physics: false"
        @use_physics = @physics_enabled = true
        return @

    disable_physics: ->
        @physics_enabled = false
        return @

    instance_probe: ->
        if @background_probe
            return @background_probe
        if @background_probe_data?
            @background_probe = new Probe @, @background_probe_data
        return @background_probe

    set_samples: (@bsdf_samples) ->
        for probe in @probes
            probe.set_lod_factor()
        return

    # Returns a DebugDraw instance for this scene, creating it if necessary.
    get_debug_draw: ->
        if not @_debug_draw?
            @_debug_draw = new @context.DebugDraw this
        return @_debug_draw

    # Returns whether it has a DebugDraw instance
    has_debug_draw: -> @_debug_draw?

    # Destroys the DebugDraw instance of this scene, if any
    remove_debug_draw: ->
        if @_debug_draw?
            if @_debug_draw.shape_instances.length != 0
                console.warn "There are debug shape instances in debug draw of
                            #{@name}. The debug draw instance will be deleted
                            nevertheless."
            delete @_debug_draw
            @_debug_draw = null
        return


# Using objects as dicts by disabling hidden object optimization
# @nodoc
dict = ->
    d = {}
    delete d.x
    d

module.exports = {Scene}
