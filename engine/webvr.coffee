
{vec3, quat, mat4, mat3} = require 'vmath'
{CanvasScreen} = require './screen'

class VRScreen extends CanvasScreen
    init: (@context, @HMD, @scene, options={}) ->
        if @context.vr_screen?
            throw Error "There's a VR screen already"
        {
            use_room_scale_parent=true
            mirror_zoom=1.3
            head0
        } = options
        if use_room_scale_parent and not @scene.active_camera.parent?
            throw Error "use_room_scale_parent requires the camera to have a
                parent. Add a parent or set use_room_scale_parent to false
                for a seated experience controller by the original camera."
        @context.vr_screen = this
        @canvas = @context.canvas
        {@framebuffer} = @context.canvas_screen
        @head_is_tracking = false
        @head = head ? new @context.GameObject
        @head.set_rotation_order 'Q'
        @scene.add_object @head
        # @head.parent_to @scene.active_camera, keep_transform: false
        for ob in @scene.active_camera.children
            ob.parent = @head
        if use_room_scale_parent
            @head.parent_to @scene.active_camera.parent, keep_transform: true
        @frame_data = new VRFrameData
        @old_pm0 = mat4.create()
        @left_orientation = quat.create()
        @right_orientation = quat.create()
        @last_time = performance.now()
        console.log 'HMD is', @HMD.displayName
        if not /Oculus/.test @HMD.displayName
            @is_wmr = true # we'll set it to false when we detect velocity
        @sst = mat4.create()
        @sst_inverse = mat4.create()
        @sst3 = mat3.create()
        if use_room_scale_parent
            @update_room_matrix()
        # @to_Z_up = mat4.new 1,0,0,0, 0,0,1,0, 0,-1,0,0, 0,0,0,1
        # left eye viewport
        camera = left_cam = @scene.active_camera.clone recursive: false
        camera.rotation_order = 'Q'
        mat4.identity camera.matrix_parent_inverse
        quat.identity camera.rotation
        if not use_room_scale_parent
            @scene.make_parent @scene.active_camera, camera
        v = @add_viewport camera
        # v.set_clear false, false
        v.rect = [0, 0, 0.5, 1]
        # right eye viewport
        camera = right_cam = @scene.active_camera.clone recursive: false
        camera.rotation_order = 'Q'
        mat4.identity camera.matrix_parent_inverse
        quat.identity camera.rotation
        if not use_room_scale_parent
            @scene.make_parent @scene.active_camera, camera
        v = @add_viewport camera
        v.set_clear false, false
        v.rect = [0.5, 0, 0.5, 1]
        v.right_eye_factor = 1
        # resize canvas and viewports
        check_size = =>
            if not @context.vr_screen
                return
            left_eye = @HMD.getEyeParameters("left")
            right_eye = @HMD.getEyeParameters("right")
            width = Math.max(left_eye.renderWidth, right_eye.renderWidth) * 2
            height = Math.max(left_eye.renderHeight, right_eye.renderHeight)
            if @width != width or @height != height
                @resize width, height
            # TODO: enable this line when it works somewhere.
            # setTimeout check_size, 1000
        check_size()
        @context.canvas_screen.enabled = false
        for behaviour in @context.enabled_behaviours
            behaviour.on_enter_vr? left_cam, right_cam
        {position, width, height, left, top} = @canvas.style
        @old_canvas_style = {position, width, height, left, top}
        if mirror_zoom and \
            @canvas.style.width == '100vw' and @canvas.style.height == '100vh'
                @set_mirror_zoom mirror_zoom
        # Daydream controller hack
        @gamepad_connected = false #gamepad_connected
        window.addEventListener 'gamepadconnected', =>
            @gamepad_connected = true

    set_mirror_zoom: (zoom) ->
        {renderWidth, renderHeight} = @HMD.getEyeParameters("left")
        ratio = renderWidth/renderHeight
        @canvas.style.position = 'fixed'
        @canvas.style.width = 200*zoom+'vw'
        @canvas.style.height = (100*zoom/ratio) + 'vw'
        @canvas.style.left = "#{-50*zoom+50}vw"
        @canvas.style.top = "calc( -#{50*zoom}vw + #{50*ratio}vh )"

    update_room_matrix: ->
        # @HMD.resetPose()
        hmd_sst = @HMD.stageParameters?.sittingToStandingTransform
        console.log hmd_sst
        if hmd_sst?
            mat4.copyArray @sst, hmd_sst
            # Edge
            # mat4.rotateX @sst, @sst, Math.PI/2
        else
            # Daydream
            # mat4.rotateX @sst, @sst, Math.PI/2
            @sst.m13 = 1.65 # average eye height
            mat4.rotateY @sst, @sst, Math.PI/2
        mat4.invert @sst_inverse, @sst
        mat3.fromMat4 @sst3, @sst
        return

    destroy: ->
        {position, width, height, left, top} = @old_canvas_style
        @canvas.style.position = position
        @canvas.style.width = width
        @canvas.style.height = height
        @canvas.style.left = left
        @canvas.style.top = top
        @context.vr_screen = null
        @context.screens.splice @context.screens.indexOf(this), 1
        @context.canvas_screen.width = 0 # force resize
        @context.canvas_screen.resize_to_canvas()
        @context.canvas_screen.enabled = true
        for ob in @head
            ob.parent = @scene.active_camera.children
        # TODO: Destroy cameras
        for behaviour in @context.enabled_behaviours
            behaviour.on_exit_vr?()
        return

    exit: ->
        @HMD.exitPresent()
        @destroy()

    pre_draw: ->
        {HMD} = this
        # Read pose
        return if not @frame_data? # not sure when this happens
        HMD.getFrameData @frame_data
        # Set position of VR cameras, etc
        {
            pose: {position, orientation, angularVelocity},
            leftProjectionMatrix,
            rightProjectionMatrix,
            leftViewMatrix,
            rightViewMatrix,
        } = @frame_data
        window.pose = @frame_data.pose
        {position: p0, rotation: r0, world_matrix: m0, projection_matrix: pm0} =
            @viewports[0].camera
        {position: p1, rotation: r1, world_matrix: m1, projection_matrix: pm1} =
            @viewports[1].camera
        # if position?
        #     vec3.copyArray p0, position
        #     vec3.copyArray p1, position
        # if orientation?
        #     vec3.copyArray r0, orientation
        #     vec3.copyArray r1, orientation

        if leftViewMatrix? and angularVelocity?
            [avx, avy, avz] = angularVelocity
            has_av = (avx or avy or avz)
            if has_av
                @is_wmr = false
            m4 = mat4.create()
            m3 = mat3.create()
            {sst_inverse} = this
            time = performance.now()
            delta_frames = Math.min 10, (time - @last_time)/11.11111111

            mat4.copyArray m4, leftViewMatrix
            # mat4.rotateX m4, m4, Math.PI/2
            mat4.mul m4, m4, sst_inverse
            mat4.invert m4, m4
            mat3.fromMat4 m3, m4
            quat.fromMat3 r0, m3
            quat.copy @left_orientation, r0
            # TODO: Test with other headsets.
            @head_is_tracking =
                not (p0.x == m4.m12 and p0.y == m4.m13 and p0.z == m4.m14)
            vec3.set p0, m4.m12, m4.m13, m4.m14

            mat4.copyArray m4, rightViewMatrix
            # mat4.rotateX m4, m4, Math.PI/2
            mat4.mul m4, m4, sst_inverse
            mat4.invert m4, m4
            mat3.fromMat4 m3, m4
            quat.fromMat3 r1, m3
            quat.copy @right_orientation, r1
            vec3.set p1, m4.m12, m4.m13, m4.m14

            vec3.lerp @head.position, p0, p1, .5
            quat.slerp @head.rotation, r0, r1, .5

            @last_time = time

        @viewports[0].camera._update_matrices()
        @viewports[1].camera._update_matrices()
        mat4.copyArray pm0, leftProjectionMatrix
        mat4.copyArray pm1, rightProjectionMatrix
        #TODO: detect headset
        # pm0.m09 = -pm0.m09
        # pm1.m09 = -pm1.m09
        if not mat4.equals pm0, @old_pm0
            # culling planes need to be updated
            mat4.invert @viewports[0].camera.projection_matrix_inv, pm0
            @viewports[0].camera._calculate_culling_planes()
            mat4.invert @viewports[1].camera.projection_matrix_inv, pm1
            @viewports[1].camera._calculate_culling_planes()
            mat4.copy @old_pm0, pm0
        return

    post_draw: ->
        @HMD.submitFrame()


displays = null
vrdisplaypresentchange = null

exports.has_HMD = ->
    # NOTE: Firefox gets stuck all the time after calling this,
    # call it only if you're sure you have an HMD or it's not Firefox
    new Promise (resolve, reject) ->
        if not navigator.getVRDisplays
            if navigator.getVRDevices
                return reject "This browser only supports an old version
                    of WebVR. Use a browser with WebVR 1.1 support"
            return reject "This browser doesn't support WebVR
                or is not enabled."
        navigator.getVRDisplays().then (_displays) ->
            displays = _displays
            HMD = null
            for display in displays
                if display instanceof VRDisplay and
                        display.capabilities.canPresent
                    HMD = display
                    break
            if not HMD?
                return reject "No HMDs detected."
            resolve displays

set_neck_model = exports.set_neck_model = (ctx, nm) ->
    ctx.neck_model = nm
    nq = quat.new 0,0,0,1
    quat.rotateX nq, nq, -nm.angle*Math.PI/180 # deg to rad
    nm.orig_neck = vec3.new 0,nm.length, 0
    vec3.transformQuat nm.orig_neck, nm.orig_neck, nq
    nm.neck = vec3.copy vec3.create(), nm.orig_neck

exports.init = (scene, options={}) ->
    reject_reason = ''
    # Detect API support
    if not navigator.getVRDisplays
        if navigator.getVRDevices
            return Promise.reject "This browser only supports an old version
                of WebVR. Use a browser with WebVR 1.1 support"
        return Promise.reject "This browser doesn't support WebVR
                or is not enabled."
    # Find HMD
    ctx = scene.context
    if ctx.vr_screen?.HMD.isPresenting
        return Promise.resolve()
    {HMD} = options
    if not HMD?
        if not displays?
            return Promise.reject "Call hasVR first."
        for display in displays
            if display instanceof VRDisplay and display.capabilities.canPresent
                HMD = display
                break
    if not HMD?
        return Promise.reject "No HMDs detected. Conect an HMD,
            turn it on and try again."

    ctx._vrscene = scene
    # Request present
    if HMD.capabilities.canPresent
        if not HMD.isPresenting
            HMD.requestPresent [{source: ctx.canvas}]
    else
        # TODO: support non-presenting VR displays?
        return Promise.reject "Non-presenting VR displays are not supported"

    # Prepare scene after is presenting
    window.removeEventListener 'vrdisplaypresentchange', vrdisplaypresentchange
    new Promise (resolve, reject) ->
        window.addEventListener 'vrdisplaypresentchange',
            vrdisplaypresentchange = ->
                if HMD.isPresenting
                    try
                        if options.use_VR_position?
                            ctx.use_VR_position = options.use_VR_position
                        if options.neck_model?
                            set_neck_model ctx, options.neck_model
                        if not ctx.vr_screen?
                            new VRScreen ctx, HMD, scene, options
                        resolve()
                    catch e
                        reject(e)
                else
                    window.removeEventListener 'vrdisplaypresentchange',
                        vrdisplaypresentchange
                    ctx.vr_screen?.destroy()
        return
