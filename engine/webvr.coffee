
{vec3, vec4} = require 'gl-matrix'

displays = []
navigator.getVRDisplays?().then (_displays) ->
    displays = _displays
vrdisplaypresentchange = null

exports.has_HMD = ->
    ctx = this
    new Promise (resolve, reject) ->
        if not navigator.getVRDisplays
            if navigator.getVRDevices
                return reject "This browser only supports an old version of WebVR.
                Use a browser with WebVR 1.1 support"
            return reject "This browser doesn't support WebVR or is not enabled."
        navigator.getVRDisplays().then (_displays) ->
            displays = _displays
            HMD = null
            for display in displays
                if display instanceof VRDisplay and display.capabilities.canPresent
                    HMD = display
                    break
            if not HMD?
                return reject "No HMDs detected."
            resolve true

set_neck_model = exports.set_neck_model = (ctx, nm) ->
    ctx.neck_model = nm
    nq = quat.fromValues 0,0,0,1
    quat.rotateX nq, nq, -nm.angle*Math.PI/180 # deg to rad
    nm.orig_neck = vec3.fromValues 0,nm.length, 0
    vec3.transformQuat nm.orig_neck, nm.orig_neck, nq
    nm.neck = vec3.copy vec3.create(), nm.orig_neck

exports.init = (scene, options={}) ->
    reject_reason = ''
    # Detect API support
    if not navigator.getVRDisplays
        if navigator.getVRDevices
            return Promise.reject "This browser only supports an old version of WebVR.
            Use a browser with WebVR 1.1 support"
        return Promise.reject "This browser doesn't support WebVR or is not enabled."
    # Find HMD
    ctx = scene.context
    if ctx._HMD?.isPresenting
        return Promise.resolve()
    HMD = null
    for display in displays
        if display instanceof VRDisplay and display.capabilities.canPresent
            HMD = display
            break
    if not HMD?
        return Promise.reject "No HMDs detected. Conect an HMD, turn it on and try again."
    
    ctx._vrscene = scene
    ctx._HMD = HMD
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
        window.addEventListener 'vrdisplaypresentchange', vrdisplaypresentchange = ->
            if HMD.isPresenting
                try
                    if options.use_VR_position?
                        ctx.use_VR_position = options.use_VR_position
                    if options.neck_model?
                        set_neck_model ctx, options.neck_model
                    viewport1 = null
                    for v,i in ctx.render_manager.viewports
                        if v.camera == scene.active_camera
                            viewport1 = v
                            viewport2 = v.clone()
                            viewport2.set_clear false, false
                            # ctx.render_manager.viewports.splice(i+1, 0, viewport2)
                            break
                    if not viewport1?
                        throw "Couldn't find viewport"
                    leftEye = HMD.getEyeParameters("left")
                    rightEye = HMD.getEyeParameters("right")
                    viewport1.camera = viewport1.camera.clone()
                    viewport2.camera = viewport2.camera.clone()
                    scene.make_parent scene.active_camera, viewport1.camera
                    scene.make_parent scene.active_camera, viewport2.camera
                    {fieldOfView} = leftEye
                    vec4.set viewport1.camera.fov_4,
                        fieldOfView.upDegrees
                        fieldOfView.rightDegrees
                        fieldOfView.downDegrees
                        fieldOfView.leftDegrees
                    vec3.copy viewport1.eye_shift, leftEye.offset
                    viewport1.rect = [0, 0, 0.5, 1]
                    {fieldOfView} = rightEye
                    vec4.set viewport2.camera.fov_4,
                        fieldOfView.upDegrees
                        fieldOfView.rightDegrees
                        fieldOfView.downDegrees
                        fieldOfView.leftDegrees
                    vec3.copy viewport2.eye_shift, rightEye.offset
                    viewport2.rect = [0.5, 0, 0.5, 1]
                    if options.ipd_mm
                        viewport1.eye_shift[0] = -options.ipd_mm * 0.001 * 0.5
                        viewport2.eye_shift[0] = options.ipd_mm * 0.001 * 0.5
                    ctx.render_manager.resize(
                        Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2
                        Math.max(leftEye.renderHeight, rightEye.renderHeight))
                    # TODO: fix frustum culling in VR
                    ctx.render_manager.use_frustum_culling = false
                    resolve()
                catch e
                    reject(e)
            else
                window.removeEventListener 'vrdisplaypresentchange', vrdisplaypresentchange
                exit(ctx)
        return

exports.exit = exit = (ctx=this) ->
    if ctx._HMD
        # TODO: detect the proper viewport, undo changes
        ctx.render_manager.viewports.pop()
        v = ctx.render_manager.viewports[0]
        v.rect = [0, 0, 1, 1]
        vec3.set v.eye_shift, 0,0,0
        v.camera = v.camera.scene.active_camera
        ctx.render_manager.resize(window.innerWidth, window.innerHeight)
        ctx._HMD = null
