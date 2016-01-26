{RenderManager} = require './render'
{XhrLoader} = require './loader'
{Events} = require './events'
{MainLoop} = require './main_loop'

class Myou
    scenes: {}
    loaded_scenes: []
    active_sprites: []
    objects: {}
    actions: {}
    groups: {}
    debug_loader: null
    canvas: null
    root: null
    all_materials: []
    mesh_datas: []
    SHADER_LIB: ''
    all_anim_objects: []

    constructor: (root, MYOU_PARAMS)->
        @root = @canvas = canvas = root
        @MYOU_PARAMS = MYOU_PARAMS
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
        resize_canvas = ->
            render_manager.resize canvas.clientWidth, canvas.clientHeight

        window.addEventListener 'resize', resize_canvas

        size = MYOU_PARAMS.total_size or 0
        initial_scene = MYOU_PARAMS.initial_scene or 'Scene'
        data_dir = MYOU_PARAMS.data_dir or ''
        scripts_dir = MYOU_PARAMS.scripts_dir or ''

        loader = new XhrLoader @,data_dir, scripts_dir
        loader.total += size
        loader.debug = if MYOU_PARAMS.live_server then true else false
        loader.load_scene initial_scene, MYOU_PARAMS.initial_scene_filter
        if MYOU_PARAMS.load_physics_engine
            loader.load_physics_engine()

        @events = new Events root
        @main_loop = new MainLoop @
        @main_loop.run()

create_canvas = (root)->
    canvas = document.createElement 'canvas'
    canvas.style.position = 'absolute'
    canvas.style.width = '100%'
    canvas.style.height = '100vh'
    canvas.setAttribute 'moz-opaque', true
    if root?
        root.insertBefore canvas, root.firstChild
    return canvas

module.exports = {Myou, create_canvas}
