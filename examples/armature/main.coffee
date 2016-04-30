if process.browser
    require 'file?name=index.html!./static_files/myou.html'
{create_canvas, Myou, LogicBlock, sensors, actuators} =
    MyouEngine = require '../../main' # 'myou-engine'
{mat2, mat3, mat4, vec2, vec3, vec4, quat} = MyouEngine.glm

MYOU_PARAMS =
    total_size: 26775095
    debug: true
    debug_physics: true
    #if browser then ./data -- If electron ../data
    data_dir: if process.browser then "./data" else __dirname+"/./data"
    no_mipmaps: false
    timeout: 5000 #time to pause the main_loop
    disable_physics: true
    # background_alpha: 0
    gl_options: {alpha:false, antialias:true}
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

# Debug info:
db = document.getElementById 'debug'
debug = (msgs)->
    db.style.display = 'block'
    db.innerHTML = ''
    for msg in msgs
        db.innerHTML += msg + '</br>'


# class ArmatureDemo extends LogicBlock
#     init: ->
#
#     tick: (frame_duration)->


myou.load_scene('Scene', false).then (scene)->
    scene.load_visible_objects().then ->
        scene.enable_render()
        # scene.enable_physics()
        # new ArmatureDemo scene
