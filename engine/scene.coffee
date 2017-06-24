{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{PhysicsWorld, set_gravity, remove_body, destroy_world} = require './physics.coffee'
{load_scene} = require './loader.coffee'
{fetch_objects} = require './fetch_assets.coffee'
{Probe} = require './probe'

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
        @objects = {}
        # Just like objects but used for parenting (no global name collision)
        @parents = {}
        @rigid_bodies = []
        @static_ghosts = []
        @kinematic_characters = []
        @debug_physics = false
        @materials = {}
        @textures = {}
        @active_camera = null
        @physics_enabled = false
        @world = null
        @gravity = vec3.create()
        @background_color = vec4.fromValues 0,0,0,1
        @ambient_color = vec4.fromValues 0,0,0,1
        @world_material = null
        @background_probe = null
        @background_probe_data = null
        @_children_are_ordered = true
        @last_render_tick = 0
        @pre_draw_callbacks = []
        @post_draw_callbacks = []
        @active_particle_systems = []
        @use_physics = true
        @frame_start = 0
        @frame_end = 0
        @anim_fps = 30
        @markers = []
        @markers_by_name = {}
        @extra_data = null
        @data_dir = ''
        @original_scene_name = ''

    set_gravity: (gravity)->
        g = @gravity
        vec3.copy g, gravity
        if @world
            set_gravity @world, g[0],g[1],g[2]

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

    remove_object: (ob, recursive=true)->
        @children.splice _,1 if (_ = @children.indexOf ob)!=-1
        if not ob.static
            @auto_updated_children.splice _,1 if (_ = @auto_updated_children.indexOf ob)!=-1
        delete @objects[ob.name]
        delete @parents[ob.original_name]
        if ob.type=='MESH'
            # TODO: remake this when remaking the pass system
            # NOTE: not removing from translucent pass because we're not using it
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

        if ob.body
            remove_body @world, ob.body
            @rigid_bodies.splice _,1 if (_ = @rigid_bodies.indexOf ob)!=-1
            @static_ghosts.splice _,1 if (_ = @static_ghosts.indexOf ob)!=-1
            # TODO: activate any colliding object to activate the whole island
            # TODO: free phy_mesh btVector3

        @probe?.destroy()

        if recursive
            children = ob.children
            for i in [0...children.length]
                child = l-i-1
                @remove_object children[i]
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
        if @auto_updated_children.indexOf(parent) > @auto_updated_children.indexOf(child)
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
            parent.children.splice _,1 if (_ = parent.children.indexOf child)!=-1

        child.parent = null

    reorder_children: ->
        '''Makes sure all scene children are in order for correct matrix calculations'''
        # TODO: Only the objects marked as unordered need to be resolved here!
        #       (make a new list and append to children)
        children = @auto_updated_children
        index = 0
        reorder = (ob)->
            if not ob.static
                children[index++] = ob
            for c in ob.children
                reorder c
        for ob in @children when not ob.parent
            reorder ob
        @_children_are_ordered = true

    unload: ->
        for ob in @children[...]
            @remove_object ob, false
            delete @context.objects[ob.name]
        if @world? then destroy_world @world

        # Reduce itself to a stub by deleting itself and copying callbacks
        stub = @context.scenes[@name] = new Scene @context
        stub.name = @name
        stub.pre_draw_callbacks = @pre_draw_callbacks
        stub.post_draw_callbacks = @post_draw_callbacks
        stub.logic_ticks = @logic_ticks

        # TODO: unload textures, etc (or defer unloading to next scene load)
        # remove texture.users and garabage collect them after textures
        # of the next scene are enumerated

        for v in @context.render_manager.viewports[...]
            if v.camera.scene == @
                @context.render_manager.viewports.splice _,1 if (_ = @context.render_manager.viewports.indexOf v)!=-1

    reload: ->
        @unload()
        @load()

    load_visible_objects: (options) ->
        visible_objects = for ob in @children when ob.visible then ob
        return fetch_objects(visible_objects, options).then(=>@)

    load_physics_objects: (options) ->
        physics_objects = []
        for ob in @children
            if not ob.data and ob.physics_type!='NO_COLLISION'\
            and /CONVEX_HULL|TRIANGLE_MESH/.test(ob.collision_shape)
                physics_objects.push ob
                phy = ob.physics_mesh
                if phy and not phy.data
                    physics_objects.push phy

        return fetch_objects(physics_objects, options).then(=>@)

    load_visible_and_physics_objects: (options) ->
        objects = []
        for ob in @children
            if (ob.visible or (ob.physics_type!='NO_COLLISION'\
            and /CONVEX_HULL|TRIANGLE_MESH/.test(ob.collision_shape)))
                objects.push ob
                phy = ob.physics_mesh
                if phy and not phy.data
                    objects.push phy
        return fetch_objects(objects, options).then(=>@)

    load_all_objects: (options) ->
        # TODO: This may not work the second time is not called.
        # Meshes should always return data's promises
        return fetch_objects(@children, options).then(=>@)

    load_objects: (list, options={})->
        if not list?.length?
            throw "Invalid arguments, expects (list, options). Did you mean 'load_all_objects()'?"
        # TODO: This may not work the second time is not called.
        # Meshes should always return data's promises
        return fetch_objects(list, options).then(=>@)

    unload_invisible_objects: (options) ->
        invisible_objects = for ob in @children when not ob.visible and ob.data then ob
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
            console.warn "Scene '#{@name}' has no active camera, nothing will be rendered."
        @enabled = true
        return @

    disable_render: ->
        @enabled = false
        return @

    enable_physics: ->
        if not @context.use_physics
            console.warn "enable_physics: Ineffective because options.disable_physics is set to true"
        else if not @use_physics
            console.warn "enable_physics: Ineffective because load_scene() was called with load_physics: false"
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


module.exports = {Scene}
