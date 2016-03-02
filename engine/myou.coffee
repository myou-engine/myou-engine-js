{RenderManager} = require './render.coffee'
{XhrLoader} = require './loader.coffee'
{Events} = require './events.coffee'
{MainLoop} = require './main_loop.coffee'

class Myou

    constructor: (root, MYOU_PARAMS)->
        @scenes= {}
        @loaded_scenes= []
        @active_sprites= []
        @objects= {}
        @actions= {}
        @groups= {}
        @debug_loader= null
        @canvas= null
        @root= null
        @all_materials= []
        @mesh_datas= []
        @SHADER_LIB= ''
        @all_anim_objects= []
        @root = @canvas = canvas = root
        @MYOU_PARAMS = MYOU_PARAMS
        @hash = Math.random()
        # The root element needs to be positioned, so the mouse events (layerX/Y) are
        # registered correctly, and the canvas is scaled inside
        if getComputedStyle(root).position == 'static'
            root.style.position = 'relative'

        #The canvas could be inside other element (root) used to get the mouse events
        if canvas.tagName != 'CANVAS'
            canvas = @canvas = root.querySelector 'canvas'

        render_manager = new RenderManager(
            @,
            canvas,
            canvas.clientWidth,
            canvas.clientHeight,
            MYOU_PARAMS.gl_options or {antialias: true, alpha: false}
        )

        @update_canvas_rect()

        resize_canvas = =>
            render_manager.resize canvas.clientWidth, canvas.clientHeight
            @update_canvas_rect()

        window.addEventListener 'resize', resize_canvas

        size = MYOU_PARAMS.total_size or 0
        initial_scene = MYOU_PARAMS.initial_scene or 'Scene'
        data_dir = MYOU_PARAMS.data_dir or './data'

        loader = new XhrLoader @, data_dir
        loader.total += size
        loader.debug = if MYOU_PARAMS.live_server then true else false
        loader.load_scene initial_scene, MYOU_PARAMS.initial_scene_filter
        if MYOU_PARAMS.load_physics_engine
            loader.load_physics_engine()

        @events = new Events root
        @main_loop = new MainLoop @
        @main_loop.run()

    on_scene_ready_queue: {}

    on_scene_ready: (scene_name, callback)->
        scene_ready = @scenes[scene_name]? and (not @MYOU_PARAMS.load_physics_engine or Ammo?)
        if scene_ready
            while @on_scene_ready_queue[scene_name].length
                @on_scene_ready_queue[scene_name].shift()()
            if callback?
                callback()
        else
            if callback?
                if @on_scene_ready_queue[scene_name]?
                        @on_scene_ready_queue[scene_name].push(callback)
                else
                    @on_scene_ready_queue[scene_name] = [callback]

            for k,s of @on_scene_ready_queue
                if s.length
                    window.requestAnimationFrame(=> @on_scene_ready(k))

    update_canvas_rect:  =>
        @canvas_rect = @canvas.getClientRects()[0]
        @canvas.rect = @canvas_rect

create_canvas = (root)->
    canvas = document.createElement 'canvas'
    if root?
        canvas.style.position = 'relative'
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        root.insertBefore canvas, root.firstChild
    return canvas

module.exports = {Myou, create_canvas}
