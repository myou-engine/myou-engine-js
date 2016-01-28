require 'file?name=index.html!./example.html'

{create_canvas, Myou} = window.myou = require '../main.coffee'

MYOU_PARAMS =
    total_size: 26775095
    debug: false
    live_server: false
    data_dir: "../data/"
    scripts_dir: "../scripts/"
    inital_scene: "Scene"
    load_physics_engine: true
    no_mipmaps: false
    no_s3tc: navigator.userAgent.toString().indexOf('Edge/12.')!=-1

root  = document.getElementById 'myou'
create_canvas root
window.myou_instance = new Myou root, MYOU_PARAMS

window.create_second_instance = ->
    root2  = document.getElementById 'myou2'
    create_canvas root2
    window.myou_instance2 = new Myou root2,Object.create(MYOU_PARAMS)
