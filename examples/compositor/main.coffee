if process.browser
    require 'file?name=index.html!./static_files/myou.html'
{create_canvas, Myou, LogicBlock, sensors, actuators} =
    MyouEngine = require '../../main' # 'myou-engine'
{mat2, mat3, mat4, vec2, vec3, vec4, quat} = MyouEngine.glm

MYOU_PARAMS =
    # debug: true
    # debug_physics: true
    # Use __dirname when in electron
    data_dir: if process.browser then "./data" else __dirname+"/./data"
    no_mipmaps: false
    timeout: 5000 #time to pause the main_loop
    # background_alpha: 0
    gl_options: {alpha:false, antialias:false}
    no_s3tc: navigator.userAgent.toString().indexOf('Edge/12.')!=-1
    # disable_physics: true

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

# TODO remove
myou.main_loop.timeout_time=99999999999999999999
myou.main_loop.reset_timeout()

{Compositor, Framebuffer} = MyouEngine
ssao_buf = null
ssao_enabled = true
recreate_compositor = ->
    ssao_buf?.destroy()
    viewport = myou.render_manager.viewports[0]
    # TODO: change API to get common_filter_fb?
    myou.render_manager.recalculate_fb_size()
    {common_filter_fb} = myou.render_manager
    
    # Make SSAO buffer 1/4th of main composing buffer
    {size_x, size_y} = common_filter_fb
    ssao_buf = new Framebuffer(myou, size: [size_x>>2, size_y>>2], color_type: 'UNSIGNED_BYTE')

    buffers = {
        "scene": {buffer: common_filter_fb, size: viewport.get_size_px()}
        "depth": {buffer: common_filter_fb, texture: common_filter_fb.depth_texture, size: viewport.get_size_px()}
        "ssao_buf": {buffer: ssao_buf}
        "screen": {buffer: viewport.dest_buffer}
    }
    uniforms = window.example_uniforms = {
        ssao_radius: 0.4,
        ssao_power: 3,
        # "test_vec3": [1,0,1],
    }
    if ssao_enabled
        filters = {
            "SSAO":
                library: MyouEngine.compositor_shaders.SSAO.library
                code: 'return SSAO(scene_sampler, depth_sampler, scene_size_f, scene_size_px);'
                inputs: ['scene', 'depth']
                output: 'ssao_buf'

            "FXAA":
                library: 'uniform float ssao_power;\n'+MyouEngine.compositor_shaders.FXAA.library
                code: ''' #line 69
                    vec4 color = FXAA(scene_sampler, scene_orig_px_size);
                    float ssao1 = get_ssao_buf_from_coord(coord+ssao_buf_px_size*vec2(0.5,-0.5)).r;
                    float ssao2 = get_ssao_buf_from_coord(coord+ssao_buf_px_size*vec2(-0.5,-0.5)).r;
                    float ssao3 = get_ssao_buf_from_coord(coord+ssao_buf_px_size*vec2(-0.5,0.5)).r;
                    float ssao4 = get_ssao_buf_from_coord(coord+ssao_buf_px_size*vec2(0.5,0.5)).r;
                    float ssao12 = (ssao1+ssao2)*0.5;
                    float ssao23 = (ssao2+ssao3)*0.5;
                    float ssao34 = (ssao3+ssao4)*0.5;
                    float ssao41 = (ssao4+ssao1)*0.5;
                    float ssao = min(ssao12, min(ssao23, min(ssao34, ssao41)));
                    return color * ssao;'''
                inputs: ['ssao_buf', 'scene', 'depth']
                output: 'screen'
        }
    else
        filters = {
            "FXAA":
                library: MyouEngine.compositor_shaders.FXAA.library
                code: 'return FXAA(scene_sampler, scene_orig_px_size);'
                inputs: ['scene', 'depth']
                output: 'screen'
        }

    viewport.compositor = \
        new Compositor(myou, {buffers, uniforms, filters})
    viewport.compositor_enabled = true

addEventListener 'keydown', (e) ->
    if e.keyCode == KEYS['1']
        ssao_enabled = !ssao_enabled
        recreate_compositor()
, true

myou.load_scene('Scene', true).then (scene)->
    recreate_compositor()
    addEventListener 'resize', ->
        recreate_compositor()
    scene.load_visible_objects().then ->
        scene.enable_render()
        scene.enable_physics()
        new TouchDemo scene


# Debug info:
db = document.getElementById 'debug'
debug = (msgs)->
    db.style.display = 'block'
    db.innerHTML = ''
    for msg in msgs
        db.innerHTML += msg + '</br>'


phy = MyouEngine.physics
class TouchDemo extends LogicBlock
    init: ->
        #finger collisions with the scene objects
        @collisions = []
        @touches = []
        @events = @context.events
        @touch_gestures_over = new sensors.TouchGesturesOver @scene
        @touching_objects = []

    tick: (frame_duration)->
        msgs = ['TOUCHES:'+ @events.touch.touches]
        cam = @scene.active_camera
        frame_duration = @context.main_loop.frame_duration

        # Capturing gestures over objects (sensor)
        tgo = @touch_gestures_over.eval 1

        # Releasing objects when the gesture ends
        # and appliying last linear_velocity (actuator)
        for ob_name of @old_tgo
            # if the gesture ends in the object.
            if not tgo[ob_name]?
                ob = @scene.objects[ob_name]
                ob.physics_type = ob.original_physics_type
                ob.touching = false
                ob.instance_physics()
                phy.set_linear_velocity(ob.body,vec3.scale(ob.linear_velocity,ob.linear_velocity,1000))
        @old_tgo = tgo

        # Appliying gestures over objects (actuator)
        @events.mouse.cancel_wheel = false
        if @events.touch.touches or @events.mouse.any_button
            @events.mouse.cancel_wheel = true
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
                    q = quat.rotationTo quat.create(), rot_from, rot_to
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
                rel_pinch = (gestures.rel_pinch) * gesture_offset
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
            @touches.push @events.mouse
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
