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

    window.glray = new myou_engine.GLRay myou_instance, document.getElementById('glray')
    glray.init myou_instance.scenes['Scene'], myou_instance.objects['Camera']

# Debug info:
db = document.getElementById 'debug'
debug = (msgs)->
    db.style.display = 'block'
    db.innerHTML = ''
    for msg in msgs
        db.innerHTML += msg + '</br>'


phy = myou_engine.physics
class TouchDemo extends LogicBlock
    init: (@scene)=>
        #finger collisions with the scene objects
        @collisions = []
        @touches = []
        @events = @context.events
        @touch_gestures_over = new sensors.TouchGesturesOver @context, @scene.name
        @touching_objects = []

    tick: (frame_duration)->
        msgs = ['TOUCHES:'+ @events.touch.touches]
        cam = @scene.active_camera
        frame_duration = @context.main_loop.frame_duration

        # Capturing gestures over objects (sensor)
        tgo = @touch_gestures_over.eval 1

        # Releasing objects when the gesture ends
        # and appliying last linear_velocity (actuator)
        for ob_name of @tgo
            # if the gesture ends in the object.
            if not tgo[ob_name]?
                ob = @scene.objects[ob_name]
                ob.physics_type = ob.original_physics_type
                ob.touching = false
                ob.instance_physics()
                phy.set_linear_velocity(ob.body,vec3.scale(ob.linear_velocity,ob.linear_velocity,1000))
        @tgo = tgo

        # Appliying gestures over objects (actuator)
        if @events.touch.touches
            for ob_name, gestures of tgo
                ob = @scene.objects[ob_name]

                # Initializing gesture.
                # The object should not be affected by gravity or collisions during the gesture
                # Because of that, the objet.physics_type should be STATIC.
                if not ob.touching
                    ob.original_gesture_distance = vec3.dist(cam.position,ob.position)
                    ob.original_physics_type = ob.physics_type
                    ob.touching = true
                    ob.physics_type = 'STATIC'
                    ob.instance_physics()

                gesture_offset = vec3.dist(cam.position,ob.position)/ob.original_gesture_distance

                angle = gestures.rel_rot
                if angle
                    #TODO: optimize
                    #rot_from = Y axis transformed with cam.rotation
                    rot_from = [0,1,0]
                    vec3.transformQuat rot_from, rot_from,cam.rotation

                    #rot_to = Y axis rotated angle in the Z axis
                    rot_to = [0,1,0]
                    vec3.rotateZ rot_to, rot_to, [0,0,0], -angle
                    # Transform rot_to with the cam_rotation
                    vec3.transformQuat rot_to, rot_to, cam.rotation

                    # q = quat from rot_from to rot_to
                    q = quat.rotationTo [], rot_from, rot_to

                    # Applying q to the object rotation.
                    quat.mul ob.rotation, q, ob.rotation


                rel_pos = vec3.scale(gestures.rel_pos, gestures.rel_pos, gesture_offset)
                if rel_pos
                    #adding relative position to the object.
                    vec3.add ob.position, ob.position, rel_pos

                    #saving linear velocity to be applied in the gesture ending.
                    ob.linear_velocity = ob.linear_velocity or [0,0,0]
                    vec3.copy ob.linear_velocity, gestures.linear_velocity


                #Pinch gesture moves the object back/forth
                rel_pinch = gestures.rel_pinch * gesture_offset
                if rel_pinch
                    # v = Position relative to camera
                    v = vec3.sub ob.position, ob.position, cam.position

                    #back/forth movement
                    vec3.scale v, v, 1-rel_pinch

                    #movement constraint
                    l = vec3.len(v)
                    l = Math.max(Math.min(l,12.5),ob.radius)
                    vec3.normalize(v,v)
                    vec3.scale(v,v,l)

                    # Adding camera position to get the world position
                    vec3.add v, v, cam.position

                if rel_pos or angle or rel_pinch
                    phy.update_ob_physics ob

            # Collecting multitouch info to be printed in the debug info area.
            @touches = @events.get_touch_events()
            @collisions = []

            for touch in @touches
                c =  sensors.pointer_over touch, cam, 1
                if c?
                    c.push touch
                    @collisions.push c

            #printing fingers
            fingers = []
            for f in @touches
                fingers.push f.id
            msgs.push fingers

            # printing collision
            if @collisions.length
                msgs.push ''
                msgs.push 'TOUCHING:'
                for c in @collisions
                    msgs.push c[3].id + ':' + c[0].owner.name
        debug msgs


window.td = new TouchDemo myou_instance, 'Scene'
