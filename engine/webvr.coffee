
{vec3, vec4} = require 'gl-matrix'

exports.has_HMD = ->
    ctx = this
    new Promise (resolve, reject) ->
        if not navigator.getVRDisplays
            if navigator.getVRDevices
                return reject "This browser only supports an old version of WebVR.
                Use a browser with WebVR 1.0 support"
            return reject "This browser doesn't support WebVR or is not enabled."
        navigator.getVRDisplays().then (displays) ->
            HMD = null
            for display in displays
                if display instanceof VRDisplay and display.capabilities.canPresent
                    HMD = display
                    break
            if not HMD?
                return reject "No HMDs detected."
            resolve true

exports.init = (scene, options={}) ->
    ctx = scene.context
    if ctx._HMD
        return Promise.resolve()
    new Promise (resolve, reject) ->
        if not navigator.getVRDisplays
            if navigator.getVRDevices
                return reject "This browser only supports an old version of WebVR.
                Use a browser with WebVR 1.0 support"
            return reject "This browser doesn't support WebVR or is not enabled."
        navigator.getVRDisplays().then (displays) ->
            HMD = null
            for display in displays
                if display instanceof VRDisplay and display.capabilities.canPresent
                    HMD = display
                    break
            if not HMD?
                throw "No HMDs detected. Conect an HMD, turn it on and try again."
            ctx._vrscene = scene
            ctx._HMD = HMD
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
            scene.make_parent scene.active_camera, viewport1.camera, false
            scene.make_parent scene.active_camera, viewport2.camera, false
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
            if myou._HMD.capabilities.canPresent
                HMD.requestPresent [{source: ctx.canvas}]
                window.addEventListener 'vrdisplaypresentchange', ->
                    if not display.isPresenting
                        exit(ctx)
            resolve()
        .catch reject
            
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
    
