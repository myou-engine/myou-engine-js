require 'file?name=index.html!./example.html'

{create_canvas, Myou} = window.myou_engine = require '../main.coffee'

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

window.enable_gl_ray = ->
    gl_ray_canvas = document.getElementById('glray')
    gl_ray_canvas.style.display='inline-block'
    gl_ray_canvas.style.transform='scale(-1)'

    window.glray = new myou_engine.GLRay(myou_instance, document.getElementById('glray'))
    glray.init myou_instance.scenes['Scene'], myou_instance.objects['Camera']
