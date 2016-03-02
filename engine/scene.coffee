{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{PhysicsWorld, set_gravity} = require './physics.coffee'

_collision_seq = 0

get_scene = (context, name)->
    # This returns a scene with the supplied name
    # and if it doesn't exist yet, it creates a stub
    # to which can be assigned callbacks
    # and can call .load()
    scene = context.scenes[name] = context.scenes[name] or new Scene context
    scene.name = name
    return scene


class Scene

    constructor: (context)->
        @context = context
        @name = ''
        @loaded = false
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
        @unloaded_material_data = {}
        @active_camera = null
        @loader = null
        @world = null
        @gravity = vec3.create()
        @tree_name = null
        @tree = null
        @_children_are_ordered = true
        @last_render_tick = 0
        @load_callbacks = []
        @logic_ticks = []
        @pre_draw_callbacks = []
        @post_draw_callbacks = []
        @_pending_tasks = 0
        @active_particle_systems = []

    on_physics_engine_loaded: ->
        @world = new PhysicsWorld
        g = @gravity
        set_gravity @world, g[0],g[1],g[2]
        for ob in @children
            ob.instance_physics()
        return

    set_gravity: (gravity)->
        g = @gravity
        vec3.copy g, gravity
        if @world
            set_gravity @world, g[0],g[1],g[2]

    add_object: (ob, name='no_name', parent_name='', parent_bone)->
        ob.scene = @  #TODO: use weak refs

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
            for p in ob.passes
                @mesh_passes[p].push ob
        if ob.type=='LAMP'
            @lamps.push ob
        if ob.type=='ARMATURE'
            @armatures.push ob


    remove_object: (ob, recursive=true)->
        @children.remove ob
        if not ob.static
            @auto_updated_children.remove ob
        delete @objects[ob.name]
        delete @parents[ob.original_name]
        if ob.type=='MESH'
            # TODO: remake this when remaking the pass system
            # NOTE: not removing from translucent pass because we're not using it
            @mesh_passes[0].remove ob
            @mesh_passes[1].remove ob
            @fg_pass and @fg_pass.remove ob
            @bg_pass and @bg_pass.remove ob
            if ob.data
                ob.data.remove ob
        if ob.type=='LAMP'
            @lamps.remove ob
        if ob.type=='ARMATURE'
            @armatures.remove ob

        if ob.body
            remove_body @world, ob.body
            @rigid_bodies.remove ob
            @static_ghosts.remove ob
            # TODO: activate any colliding object to activate the whole island
            # TODO: free phy_mesh btVector3

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
            pos = child.position
            rot = child.rotation
            vec3.sub pos, pos, parent.get_world_position()
            p_rot = quat.invert [], parent.get_world_rotation()
            vec3.transformQuat pos, pos, p_rot
            quat.mul rot, p_rot, rot
        child.parent = parent
        if @children.indexOf(parent) > @children.indexOf(child)
            # When this is set to false, reorder_children() is called
            # in render_manager.draw_viewport
            @_children_are_ordered = false

    clear_parent: (child, keep_transform=true, reorder=true)->
        parent = child.parent
        if parent
            if keep_transform
                # assuming get_world_* always give a clone
                vec3.copy child.position, child.get_world_position()
                quat.copy child.rotation, child.get_world_rotation()
            s = parent.first_child
            if s == child
                parent.first_child = child.next_sibling
            else
                ns = s.next_sibling
                while ns != child
                    s = ns
                    ns = s.next_sibling
                s.next_sibling = child.next_sibling
            child.parent = child.next_sibling = null

    reorder_children: ->
        '''Makes sure all scene children are in order for correct matrix calculations'''
        # TODO: Only the objects marked as unordered need to be resolved here!
        #       (make a new list and append to children)
        children = @children

        reorder = (ob,index)->
            children[index] = ob
            for c in ob.children
                reorder c,index

        index = 0
        objects = @objects
        for name, ob of objects
            if not ob.parent
                reorder ob,index
                index += 1

        @_children_are_ordered = true

    load: ->
        # TODO: get the loader in some other way
        if not @loaded
            loader = scene.loader
            loader.load_scene @name
        # TODO: detect if it's already being loaded

    unload: ->
        for ob in @children[...]
            @remove_object ob, false
            delete @context.objects[ob.name]
        destroy_world @world

        # Reduce itself to a stub by deleting itself and copying callbacks
        stub = @context.scenes[@name] = new Scene @context
        stub.name = @name
        stub.load_callbacks = @load_callbacks
        stub.pre_draw_callbacks = @pre_draw_callbacks
        stub.post_draw_callbacks = @post_draw_callbacks
        stub.logic_ticks = @logic_ticks

        # TODO: unload textures, etc (or defer unloading to next scene load)
        # remove texture.users and garabage collect them after textures
        # of the next scene are enumerated

        for v in render_manager.viewports[...]
            if v.camera.scene == @
                render_manager.viewports.remove v
        if @context.scene == @
            @context.scene = null

    reload: ->
        @unload()
        @loader.load_scene @name

    increment_task_count: ->
        @_pending_tasks += 1

    decrement_task_count: ->
        if @_pending_tasks != 0
            @_pending_tasks -= 1
            if @_pending_tasks == 0 and not @loaded
                @context.loaded_scenes.push @
                @loaded = true
                for f in @load_callbacks
                    f @

module.exports = {Scene, get_scene}
