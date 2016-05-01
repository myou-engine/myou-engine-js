if process.browser
    require 'file?name=index.html!./static_files/myou.html'
{create_canvas, Myou, LogicBlock, sensors, actuators} =
    MyouEngine = require '../../main' # 'myou-engine'
{mat2, mat3, mat4, vec2, vec3, vec4, quat} = MyouEngine.glm

MYOU_PARAMS =
    total_size: 26775095
    # debug: true
    debug_physics: true
    #if browser then ./data -- If electron ../data
    data_dir: if process.browser then "./data" else __dirname+"/./data"
    no_mipmaps: false
    timeout: 0 # disabled
    # background_alpha: 0
    gl_options: {alpha:false, antialias:true}
    no_s3tc: navigator.userAgent.toString().indexOf('Edge/12.')!=-1

canvas = document.getElementById('myou')
myou = new Myou canvas, MYOU_PARAMS

# optional, to access from console
console.log 'MyouEngine and myou accesible from console.'
window.myou = myou
window.MyouEngine = MyouEngine

myou.load_scene('Scene', true).then (scene)->
    scene.load_visible_objects().then ->
        scene.enable_render()
        scene.enable_physics()
        myou.initVR(scene)
        v = vec3.create()
        q = quat.create()
        scene.pre_draw_callbacks.push (scene, frame_duration) ->
            v[2] = myou.events.keys_pressed[KEYS.S] - myou.events.keys_pressed[KEYS.W]
            v[0] = myou.events.keys_pressed[KEYS.D] - myou.events.keys_pressed[KEYS.A]
            cam = scene.active_camera
            vrcam = myou.objects.Camera$1 # FIXME: cam.children is empty
            if vrcam and (v[0] or v[2])
                vec3.transformQuat v, v, vrcam.get_world_rotation(q)
                vec3.scale v, v, frame_duration * 0.001
                vec3.add cam.position, cam.position, v
