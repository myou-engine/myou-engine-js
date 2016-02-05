require 'file?name=index.html!./example.html'
{create_canvas, Myou, LogicBlock} = window.myou_engine = require '../main'
{mat2, mat3, mat4, vec2, vec3, vec4, quat} = myou_engine.glm
{pointer_over} = require '../engine/sensors'

MYOU_PARAMS =
    total_size: 26775095
    debug: false
    live_server: false
    data_dir: "../data/"
    inital_scene: "Scene"
    load_physics_engine: true
    no_mipmaps: false
    timeout: 5000 #time to pause the main_loop
    # background_alpha: 0
    # gl_options: {alpha:true, antialias:true}
    no_s3tc: navigator.userAgent.toString().indexOf('Edge/12.')!=-1

canvas = document.getElementById('myou')
window.myou_instance = new Myou canvas, MYOU_PARAMS

#resume main_loop
canvas.onmousemove = myou_instance.main_loop.reset_timeout
canvas.ontouchstart = myou_instance.main_loop.reset_timeout
canvas.ontouchmove = myou_instance.main_loop.reset_timeout
canvas.onkeydown = myou_instance.main_loop.reset_timeout

window.create_second_instance = ->
    #creating 2nd instance and canvas2
    canvas2 = document.getElementById('myou2')
    canvas2.style.display = 'inline-block'
    window.myou_instance2 = new Myou canvas2, MYOU_PARAMS

    #2nd instance logic
    new TouchDemo myou_instance2, 'Scene'

    canvas2.onmousemove = myou_instance2.main_loop.reset_timeout
    canvas2.ontouchstart = myou_instance2.main_loop.reset_timeout
    canvas2.ontouchmove = myou_instance2.main_loop.reset_timeout
    canvas2.onkeydown = myou_instance2.main_loop.reset_timeout

    #Resizing canvas1
    canvas.style.height = '50vh'
    myou_instance.update_canvas_rect()
    myou_instance.render_manager.resize myou_instance.canvas.rect.width, myou_instance.canvas.rect.height


window.enable_gl_ray = ->
    gl_ray_canvas = document.getElementById('glray')
    gl_ray_canvas.style.display = 'inline-block'
    gl_ray_canvas.style.transform = 'scale(-1)'

    window.glray = new myou_engine.GLRay(myou_instance, document.getElementById('glray'))
    glray.init myou_instance.scenes['Scene'], myou_instance.objects['Camera']

db = document.getElementById('debug')
debug = (msgs)->
    db.innerHTML = ''
    for msg in msgs
        db.innerHTML += msg + '</br>'


phy = myou_engine.physics
class TouchDemo extends LogicBlock
    init: (scene)=>
        @ob = scene.objects.roorh_phy

        #scaling factor
        @fx = 1
        @fy = @ob.scale[1]/@ob.scale[0]
        @fz = @ob.scale[2]/@ob.scale[0]

        #scale vector to be used on the actuators.
        @scale = vec3.create()

        #finger collisions with the scene objects
        @collisions = []
        @touches = []

    sensors: (scene, frame_duration)->
        if @events.touch.touches
            cam = scene.objects.Camera
            @touches = @events.get_touch_events()

            @collisions = []

            for touch in @touches
                {x, y} = touch
                c =  pointer_over x, y, cam, 1
                if c?
                    c.push(touch)
                    @collisions.push(c)

    actuators: (scene, frame_duration)->
        msgs = ['TOUCHES:'+ @events.touch.touches]
        if @events.touch.touches

            #printing fingers
            fingers = []
            for f in @touches
                fingers.push f.id
            msgs.push fingers

            #scaling and rotating roorh
            {ob, scale} = @
            s = @events.touch.rel_pinch*2/@context.canvas_rect.height
            scale[0] = s*@fx
            scale[1] = s*@fy
            scale[2] = s*@fz
            vec3.add(ob.scale,ob.scale,scale)
            quat.rotateY(ob.rotation, ob.rotation, @events.touch.rel_rot)
            ob.instance_physics()

            #printing collision
            if @collisions.length
                msgs.push ''
                msgs.push 'TOUCHING:'
                for c in @collisions
                    msgs.push c[3].id + ':' + c[0].owner.name
        debug(msgs)


new TouchDemo myou_instance, 'Scene'
