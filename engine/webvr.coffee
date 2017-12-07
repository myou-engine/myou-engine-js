
{vec3, quat, mat4} = require 'vmath'
{CanvasScreen} = require './screen'

class VRScreen extends CanvasScreen
    init: (@context, @HMD, @scene) ->
        if @context.vr_screen?
            throw Error "There's a VR screen already"
        @context.vr_screen = this
        @canvas = @context.canvas
        {@framebuffer} = @context.canvas_screen
        @frame_data = new VRFrameData
        old_pm0 = mat4.create()
        # left eye viewport
        camera = @scene.active_camera.clone()
        camera.rotation_order = 'Q'
        quat.identity camera.rotation
        @scene.make_parent @scene.active_camera, camera
        v = @add_viewport camera
        # v.set_clear false, false
        v.rect = [0, 0, 0.5, 1]
        # right eye viewport
        camera = @scene.active_camera.clone()
        camera.rotation_order = 'Q'
        quat.identity camera.rotation
        @scene.make_parent @scene.active_camera, camera
        v = @add_viewport camera
        v.set_clear false, false
        v.rect = [0.5, 0, 0.5, 1]
        v.right_eye_factor = 1
        # resize canvas and viewports
        leftEye = @HMD.getEyeParameters("left")
        rightEye = @HMD.getEyeParameters("right")
        @resize(Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2,
                Math.max(leftEye.renderHeight, rightEye.renderHeight))
        @context.canvas_screen.enabled = false

    destroy: ->
        @context.vr_screen = null
        @context.screens.splice @context.screens.indexOf(this), 1
        @context.canvas_screen.resize_to_canvas()
        @context.canvas_screen.enabled = true
        return

    exit: -> @destroy()

    pre_draw: ->
        {HMD} = this
        # Read pose
        HMD.getFrameData @frame_data
        # Set position of VR cameras, etc
        {
            pose: {position, orientation},
            leftProjectionMatrix,
            rightProjectionMatrix,
        } = @frame_data
        {position: p0, rotation: r0, projection_matrix: pm0} =
            @viewports[0].camera
        {position: p1, rotation: r1, projection_matrix: pm1} =
            @viewports[1].camera
        if position?
            vec3.copyArray p0, position
            vec3.copyArray p1, position
        if orientation?
            vec3.copyArray r0, orientation
            vec3.copyArray r1, orientation
        mat4.copyArray pm0, leftProjectionMatrix
        mat4.copyArray pm1, rightProjectionMatrix
        # TODO: untested
        if not mat4.equals pm0, old_pm0
            # culling planes need to be updated
            mat4.invert @viewports[0].camera.projection_matrix_inv, pm0
            @viewports[0].camera._calculate_culling_planes()
            mat4.invert @viewports[1].camera.projection_matrix_inv, pm1
            @viewports[1].camera._calculate_culling_planes()
            mat4.copy old_pm0, pm0
        return

    post_draw: ->
        @HMD.submitFrame()


displays = []
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
    HMD = null
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
            try
                HMD.requestPresent [{source: ctx.canvas}]
            catch e
                throw e
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
                            new VRScreen ctx, HMD, scene
                        resolve()
                    catch e
                        reject(e)
                else
                    window.removeEventListener 'vrdisplaypresentchange',
                        vrdisplaypresentchange
                    ctx.vr_screen?.destroy()
        return
