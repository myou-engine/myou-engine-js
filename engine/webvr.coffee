
{vec3, vec4} = require 'gl-matrix'

exports.init = (scene) ->
    ctx = scene.context
    new Promise (resolve, reject) ->
        if not navigator.getVRDisplays
            return reject "This browser doesn't support WebVR or is not enabled."
        navigator.getVRDisplays().then (displays) ->
            HMD = null
            for display in displays
                if display instanceof VRDisplay
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
            ctx.render_manager.resize(
                Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2
                Math.max(leftEye.renderHeight, rightEye.renderHeight))
            # TODO: fix frustum culling in VR
            ctx.render_manager.use_frustum_culling = false
            if myou._HMD.capabilities.canPresent
                HMD.requestPresent [{source: ctx.canvas}]
            
