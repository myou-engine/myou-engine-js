require 'file?name=index.html!./example.html'
{create_canvas, Myou, LogicBlock} = window.myou_engine = require '../main.coffee'
{mat2, mat3, mat4, vec2, vec3, vec4, quat} = myou_engine.glm

MYOU_PARAMS =
    total_size: 26775095
    debug: false
    live_server: false
    data_dir: "../data/"
    inital_scene: "Scene"
    load_physics_engine: true
    no_mipmaps: false
    # background_alpha: 0
    # gl_options: {alpha:true, antialias:true}
    no_s3tc: navigator.userAgent.toString().indexOf('Edge/12.')!=-1

window.myou_instance = new Myou document.getElementById('myou'), MYOU_PARAMS

window.create_second_instance = ->
    window.myou_instance2 = new Myou document.getElementById('myou2'), MYOU_PARAMS
    document.getElementById('myou').style.height = '50vh'
    myou_instance.canvas.rect.update()
    myou_instance.render_manager.resize myou_instance.canvas.rect.width, myou_instance.canvas.rect.height

window.enable_gl_ray = ->
    gl_ray_canvas = document.getElementById('glray')
    gl_ray_canvas.style.display = 'inline-block'
    gl_ray_canvas.style.transform = 'scale(-1)'

    window.glray = new myou_engine.GLRay(myou_instance, document.getElementById('glray'))
    glray.init myou_instance.scenes['Scene'], myou_instance.objects['Camera']

phy = myou_engine.physics
class TouchDemo extends LogicBlock
    init: (scene)=>
        @ob = scene.objects.roorh_phy
        @fx = 1
        @fy = @ob.scale[1]/@ob.scale[0]
        @fz = @ob.scale[2]/@ob.scale[0]
        @scale = vec3.create()

    actuators: (scene, frame_duration)->
        if @events.touch.touches
            {ob, scale} = @
            s = @events.touch.rel_pinch*2/@context.canvas_rect.height
            scale[0] = s*@fx
            scale[1] = s*@fy
            scale[2] = s*@fz
            vec3.add(ob.scale,ob.scale,scale)
            quat.rotateY(ob.rotation, ob.rotation, @events.touch.rel_rot)
            ob.instance_physics()

new TouchDemo myou_instance, 'Scene'
