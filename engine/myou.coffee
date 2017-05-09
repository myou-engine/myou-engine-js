{RenderManager} = require './render'
{Loader} = require './loader'
{Events} = require './events'
{MainLoop} = require './main_loop'
loader = require './loader'
vr = require './webvr'
{MeshFactory} = require './mesh_factory'

physics = require './physics'
sensors = require './sensors'
actuators = require './actuators'
{fetch_objects} = require './fetch_assets'
{Action, Animation, LoopedAnimation, FiniteAnimation} = require './animation'
{Viewport} = require './viewport'
{Texture} = require './texture'

{Armature} = require './armature'
{Camera} = require './camera'
{Compositor} = require './compositor'
{Curve} = require './curve'
{Framebuffer} = require './framebuffer'
{Cubemap} = require './cubemap'
{GameObject} = require './gameobject'
{GLRay} = require './glray'
{Lamp} = require './lamp'
{Material} = require './material'
{Mesh} = require './mesh'
{ParticleSystem} = require './particles'
{Scene} = require './scene'

context_dependent_modules = {
    Armature, Camera, Compositor, Curve, Framebuffer, Cubemap,
    GameObject, GLRay, Lamp, Material, Mesh, ParticleSystem, Scene
}

# Using objects as dicts by disabling hidden object optimization
dict = ->
    d = {}
    delete d.x
    d

class Myou
    physics:physics
    sensors:sensors
    actuators:actuators
    fetch_objects:fetch_objects
    Action:Action
    Animation:Animation
    LoopedAnimation:LoopedAnimation
    FiniteAnimation:FiniteAnimation
    Viewport:Viewport
    Texture:Texture

    constructor: (root, options)->
        if not root?
            throw "Missing root DOM element, got null or undefined"
        if not options?
            throw "Missing options"
        @scenes = dict()
        @loaded_scenes = []
        @active_sprites = []
        @objects = dict()
        @actions = dict()
        @groups = dict()
        @log = []
        @video_textures = dict()
        @debug_loader = null
        @canvas = null
        @root = null
        @all_materials = []
        @mesh_datas = dict()
        @embed_meshes = dict()
        @SHADER_LIB = ''
        @active_animations = dict()

        @root = root
        @options = @MYOU_PARAMS = options
        @use_physics = not options.disable_physics
        @hash = Math.random()
        @initial_scene_loaded = false
        @mesh_lod_min_length_px = 13

        # VR
        @_HMD = @_vrscene = null
        @use_VR_position = true


        # Adding context to context_dependent_modules
        for name,cls of context_dependent_modules
            @[name] = cls.bind cls, @

        # The root element needs to be positioned, so the mouse events (layerX/Y) are
        # registered correctly, and the canvas is scaled inside
        if getComputedStyle?(root).position == 'static'
            root.style.position = 'relative'

        #The canvas could be inside other element (root) used to get the mouse events
        canvas = @canvas = if root.tagName == 'CANVAS'
            root
        else
            root.querySelector 'canvas'
        @main_loop = new MainLoop @
        render_manager = new RenderManager(
            @,
            canvas,
            canvas.clientWidth,
            canvas.clientHeight,
            options.gl_options or {antialias: true, alpha: false}
        )

        @update_canvas_rect()

        resize_canvas = =>
            if not @_HMD?
                render_manager.resize canvas.clientWidth, canvas.clientHeight
            @update_canvas_rect()

        window.addEventListener 'resize', resize_canvas

        data_dir = options.data_dir or './data'
        data_dir = options.data_dir = data_dir.replace(/\/$/g, '')

        @events = new Events root, options.event_options
        @mesh_factory = new MeshFactory @
        @main_loop.run()

    load_scene: (name, options={load_physics: true}) ->
        if typeof options != 'object'
            options = {load_physics: options}
        return loader.load_scene(name, null, options, @)

    update_canvas_rect:  =>
        @canvas_rect = @canvas.getClientRects()[0]
        @canvas.rect = @canvas_rect

    hasVR: vr.has_HMD
    initVR: vr.init
    exitVR: vr.exit


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

create_full_window_canvas = ->
    document.body.style.margin = '0 0 0 0'
    document.body.style.height = '100vh'
    canvas = create_canvas document.body, 'canvas'
    canvas.style.marginBottom = '-100px'
    return canvas

module.exports = {Myou, create_canvas, create_full_window_canvas}
