if process.browser
    require 'file?name=index.html!./static_files/myou.html'
{create_canvas, Myou, LogicBlock, sensors, actuators} =
    window.myou_engine = require '../../main' # 'myou-engine'
{mat2, mat3, mat4, vec2, vec3, vec4, quat} = myou_engine.glm

MYOU_PARAMS =
    total_size: 26775095
    # debug: true
    debug_physics: true
    #if browser then ./data -- If electron ../data
    data_dir: if process.browser then "./data" else "../data"
    inital_scene: "Scene"
    load_physics_engine: false
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

# Debug info:
db = document.getElementById 'debug'
debug = (msgs)->
    db.style.display = 'block'
    db.innerHTML = ''
    for msg in msgs
        db.innerHTML += msg + '</br>'


phy = myou_engine.physics

window.new_loader = require '../../engine/new_loader.coffee'
###
class new_loader extends LogicBlock
    init: (@scene)=>

    tick: (frame_duration)->


nl = new new_loader myou_instance, 'Scene'
###
