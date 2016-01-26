require 'file?name=example.html!./example.html'

{create_canvas, Myou} = window.myou = require '../main.coffee'

MYOU_PARAMS =
    total_size: 26775095
    debug: false
    live_server: false
    data_dir: "http://127.0.0.1:8000/data/"
    scripts_dir: "http://127.0.0.1:8000/scripts/"
    inital_scene: "Scene"
    load_physics_engine: true
    no_mipmaps: false
    no_s3tc: navigator.userAgent.toString().indexOf('Edge/12.')!=-1

root  = document.getElementById 'app'

create_canvas root
window.myou_instance = new Myou root, MYOU_PARAMS
