{RenderManager} = require './render'
{MainLoop} = require './main_loop'
loader = require './loader'
vr = require './webvr'
{MeshFactory} = require './mesh_factory'
{fetch_objects} = require './fetch_assets'
{Action, Animation, LoopedAnimation, FiniteAnimation, PingPongAnimation} =
    require './animation'
{Viewport} = require './viewport'
{Texture} = require './texture'
{Armature} = require './armature'
{Camera} = require './camera'
{Curve} = require './curve'
effects = require './effects/index'
filters = require './filters'
{Framebuffer, ByteFramebuffer, ShortFramebuffer, FloatFramebuffer} =
    require './framebuffer'
{Cubemap} = require './cubemap'
{GameObject} = require './gameobject'
{GLRay} = require './glray'
{Lamp} = require './lamp'
{Material} = require './material'
{Mesh} = require './mesh'
{Scene} = require './scene'
{DebugDraw} = require './debug_draw'
{Button, Axis, Axes2, InputSource, InputManager} = require './input'

context_dependent_modules = {
    GameObject, Mesh, Armature, Curve, Camera, Lamp,
    Framebuffer, ByteFramebuffer, ShortFramebuffer, FloatFramebuffer,
    Cubemap, GLRay, Material, Scene, DebugDraw,
    Button, Axis, Axes2, InputSource,
}

# This is the main engine class.
# You need to instance it to start using the engine.
# The engine instance is frequently referred internally as `context`.
#
# It instances and contains several singletons like `render_manager` and
# `main_loop`.
class Myou
    # @nodoc
    fetch_objects: fetch_objects
    Action: Action
    Animation: Animation
    LoopedAnimation: LoopedAnimation
    FiniteAnimation: FiniteAnimation
    PingPongAnimation: PingPongAnimation
    Viewport: Viewport
    Texture: Texture
    # @property [Object<GameObject>]
    #           Object with all game objects in memory. The key is the name.
    objects: null
    # @property [MainLoop] Main loop singleton.
    main_loop: null
    # @property [RenderManager] Render manager singleton.
    render_manager: null
    # @property [number]
    # Minimum length of the average poligon for LoD calculation, in pixels.
    mesh_lod_min_length_px: 13
    # @property [Array<Viewport>] viewports
    # List of viewports of the canvas screen. Convenience reference to
    # myou.canvas_screen.viewports (use myou.canvas_screen to operate on these).
    viewports: []

    constructor: (root, options)->
        if not root?
            throw Error "Missing root DOM element, got null or undefined"
        if not options?
            throw Error "Missing options"
        @screens = []
        @behaviours = @behaviors = []
        @canvas_screen = null
        @vr_screen = null
        @scenes = dict()
        @loaded_scenes = []
        @objects = dict()
        @actions = dict()
        @video_textures = dict()
        @debug_loader = null
        @canvas = null
        @all_materials = dict()
        @mesh_datas = dict()
        @embed_meshes = dict()
        @active_animations = dict()
        @all_cubemaps = []
        @all_framebuffers = []
        @enabled_behaviours = []
        @root = root
        @options = @MYOU_PARAMS = options
        @hash = Math.random()
        @initial_scene_loaded = false
        @is_webgl2 = false
        @webpack_flags = global_myou_engine_webpack_flags ? null

        # VR
        @_HMD = @_vrscene = null
        @use_VR_position = true

        # Adding context to context_dependent_modules
        for name,cls of context_dependent_modules
            @[name] = cls.bind cls, @
        for name,cls of filters
            @[name] = cls.bind cls, @
        for name,cls of effects
            @[name] = cls.bind cls, @

        # The root element needs to be positioned, so the mouse events
        # (layerX/Y) are registered correctly, and the canvas is scaled inside
        if getComputedStyle?(root).position == 'static'
            root.style.position = 'relative'

        # The canvas could be inside other element (root)
        # used to get the mouse events
        canvas = @canvas = if root.tagName == 'CANVAS'
            root
        else
            root.querySelector 'canvas'

        @update_root_rect = =>
            rect = @root.getClientRects()[0]
            if rect
                @root_rect = {
                    top: rect.top + pageYOffset
                    left: rect.left + pageXOffset
                }
            else
                @root_rect = {top: 0, left: 0}

        window.addEventListener 'resize', @update_root_rect
        @update_root_rect()

        @main_loop = new MainLoop @
        new RenderManager(
            @,
            canvas,
            options.gl_options or {antialias: true, alpha: false}
        )

        data_dir = options.data_dir or './data'
        data_dir = options.data_dir = data_dir.replace(/\/$/g, '')

        @mesh_factory = new MeshFactory @
        @input_manager = new InputManager @
        @has_created_debug_view = false
        @main_loop.run()

    update_layout: ->
        @canvas_screen.resize_to_canvas()
        @update_root_rect()

    load_scene: (name, options={}) ->
        return loader.load_scene(name, null, options, @)

    hasVR: vr.has_HMD
    initVR: vr.init
    exitVR: vr.exit

    # Makes a screenshot and returns a blob containing it
    # @param width [number] Width of the desired screenshot in pixels
    # @param height [number] Height of the desired screenshot in pixels
    # @option options supersampling [number]
    #       Amount of samples per pixel for antialiasing
    # @option options format [string] Image format such as "png" or "jpeg"
    # @option options jpeg_quality [number]
    #       Quality for compressed formats like jpeg and webp. Between 0 and 1.
    # @return [Promise] Promise resolving a [Blob]
    screenshot_as_blob: (width, height, options={}) ->
        @render_manager.screenshot_as_blob width, height, options

    # Change WebGL context flags, by replacing the canvas by a new one.
    # Note that it will remove DOM events (except events.coffee) and may take
    # a while to re-upload all GPU data.
    change_gl_flags: (gl_flags) ->
        @render_manager.instance_gl_context gl_flags, true

    enable_debug_camera: (viewport_number=0)->
        viewport = @canvas_screen.viewports[viewport_number]
        if viewport.enable_debug_camera()
            @has_created_debug_view = not viewport.camera.scene.has_debug_draw()

    disable_debug_camera: (viewport_number=0)->
        if @canvas_screen.viewports[viewport_number].disable_debug_camera()
            if @has_created_debug_view
                viewport.camera.scene.remove_debug_draw()



# Convenience function for creating an HTML canvas element
# and adding it to another element.
#
# @param root [HTMLElement] HTML element to insert the canvas into.
# @param id [string] Element ID attribute to assign.
# @param className [string] Element class attribute to assign.
# @return [HTMLCanvasElement] Canvas element.
create_canvas = (root, id, className='MyouEngineCanvas')->
    canvas = document.createElement 'canvas'
    if root?
        canvas.style.position = 'relative'
        canvas.style.width = '100vw'
        canvas.style.height = '100vh'
        root.insertBefore canvas, root.firstChild
        canvas.id = id
        canvas.className = className
    return canvas

# Convenience function for creating an HTML canvas element
# that fills the whole viewport.
#
# Ideal for a HTML file with no elements in the body.
#
# @return [HTMLCanvasElement] Canvas element.
create_full_window_canvas = ->
    document.body.style.margin = '0 0 0 0'
    document.body.style.height = '100vh'
    canvas = create_canvas document.body, 'canvas'
    canvas.style.marginBottom = '-100px'
    return canvas

# Using objects as dicts by disabling hidden object optimization
# @nodoc
dict = ->
    d = {}
    delete d.x
    d

module.exports = {Myou, create_canvas, create_full_window_canvas}
