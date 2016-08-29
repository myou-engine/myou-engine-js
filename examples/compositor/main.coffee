if process.browser
    require 'file?name=index.html!./static_files/myou.html'
{create_canvas, Myou, LogicBlock, sensors, actuators} =
    MyouEngine = require '../../main' # 'myou-engine'
{mat2, mat3, mat4, vec2, vec3, vec4, quat} = MyouEngine.glm

MYOU_PARAMS =
    debug: true
    debug_physics: true
    # Use __dirname when in electron
    data_dir: if process.browser then "./data" else __dirname+"/./data"
    no_mipmaps: false
    timeout: 5000 #time to pause the main_loop
    # background_alpha: 0
    gl_options: {alpha:false, antialias:false}
    no_s3tc: navigator.userAgent.toString().indexOf('Edge/12.')!=-1

canvas = document.getElementById('myou')
myou = new Myou canvas, MYOU_PARAMS

# optional, to access from console
console.log 'MyouEngine and myou accesible from console.'
window.myou = myou
window.MyouEngine = MyouEngine

#resume main_loop
canvas.onmousemove = myou.main_loop.reset_timeout
canvas.ontouchstart = myou.main_loop.reset_timeout
canvas.ontouchmove = myou.main_loop.reset_timeout
canvas.onkeydown = myou.main_loop.reset_timeout

{Compositor, Framebuffer} = MyouEngine
ssao_buf = null
recreate_compositor = ->
    ssao_buf?.destroy()
    viewport = myou.render_manager.viewports[0]
    # TODO: change API to get common_filter_fb?
    myou.render_manager.recalculate_fb_size()
    {common_filter_fb} = myou.render_manager
    
    # Make SSAO buffer 1/4th of main composing buffer
    {size_x, size_y} = common_filter_fb
    ssao_buf = new Framebuffer(myou, {size: [size_x>>2, size_y>>2]})

    buffers = {
        "scene": {buffer: common_filter_fb, size: viewport.get_size_px()}
        # "depth": {buffer: common_filter_fb, texture: common_filter_fb.depth_texture, size: viewport.size}
        "ssao_buf": {buffer: ssao_buf}
        "screen": {buffer: viewport.dest_buffer}
    }
    uniforms = window.example_uniforms = {
        # "test_float": 3,
        # "test_vec3": [1,0,1],
    }
    filters = {
        "FXAA":
            library: MyouEngine.compositor_shaders.FXAA.library
            code: 'return FXAA(scene_sampler, scene_orig_px_size);'
            inputs: ["scene"]
            output: "screen"
    }

    viewport.compositor = \
        new Compositor(myou, {buffers, uniforms, filters})
    viewport.compositor_enabled = true

myou.load_scene('Scene', true).then (scene)->
    recreate_compositor()
    addEventListener 'resize', ->
        recreate_compositor()
    scene.load_visible_objects().then ->
        scene.enable_render()
        scene.enable_physics()
