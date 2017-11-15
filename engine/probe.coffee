{mat4, vec3, vec4, quat} = require 'vmath'
{nearest_POT} = require './math_utils/math_extra'
{plane_from_norm_point} = require './math_utils/g3'

range_mat = mat4.new .5,0,0,0, 0,.5,0,0, 0,0,.5,0, .5,.5,.5,1

class Probe
    constructor: (@object, options) ->
        {@context, @scene} = @object
        if @object.type == 'SCENE'
            @scene = @object
            @object = null
        {
            @type
            object
            @auto_refresh
            @compute_sh
            @double_refresh
            @same_layers
            @size
            @sh_quality
            @clip_start
            @clip_end
            @parallax_type
            @parallax_volume
            @reflection_plane
            @background_only = false
        } = options
        @size = nearest_POT @size
        @target_object = object
        @cubemap = @planar = @reflection_camera = null
        switch @type
            when 'CUBEMAP', 'CUBE'
                @cubemap = new @context.Cubemap {@size}
                @cubemap.loaded = false
            when 'PLANE'
                @planar = new @context.ByteFramebuffer size: [@size,@size], use_depth: true
                # TODO: Detect actual viewport camera
                cam = @scene.active_camera
                # we're not using clone because
                # this copies its parameters but not the parent
                @reflection_camera = new @context.Camera cam
                @reflection_camera.scene = @scene
                @reflection_camera.rotation_order = 'Q'
                # TODO: Use a real viewport by having a BufferScreen
                @fake_vp =
                    camera: @reflection_camera
                    eye_shift: vec3.new 0,0,0
                    clear_bits: 16384|256
                    units_to_pixels: 1
            else
                throw Error "Inavlid probe type: " + @type
        @position = vec3.create()
        @rotation = quat.create()
        @normal = vec3.create()
        @view_normal = vec3.create()
        @planarreflectmat = mat4.create()
        @set_lod_factor()
        @scene.probes.push @
        if @auto_refresh
            @context.render_manager.probes.push @
        else
            @render()
        @clip_start = Math.max @clip_start, 0.0001


    set_lod_factor: ->
        {bsdf_samples} = @scene
        if not @context.is_webgl2
            bsdf_samples = 1
        @lodfactor = 0.5 * Math.log( ( @size*@size / bsdf_samples ) ) / Math.log(2)
        @lodfactor -= @scene.lod_bias

    render: ->
        if @cubemap?
            if @size != @cubemap.size
                @size = nearest_POT @size
                @cubemap.size = @size
                @cubemap.set_data()
                @set_lod_factor()
            @object?.get_world_position_into(@position)
            @context.render_manager.draw_cubemap(@scene, @cubemap,
                @position, @clip_start, @clip_end, @background_only)
            # TODO: Detect if any material uses this!
            if @compute_sh
                @cubemap.generate_spherical_harmonics(@sh_quality)
            @cubemap.loaded = true
        else if @planar?
            @object?.get_world_position_rotation_into(@position, @rotation)
            # plane normal
            vec3.set @normal, 0, 0, 1
            vec3.transformQuat @normal, @normal, @rotation
            # reflect camera
            # TODO: Detect actual viewport camera
            cam = @scene.active_camera
            rcam = @reflection_camera
            wm = mat4.copy rcam.world_matrix, cam.world_matrix
            # NOTE: Blender PBR calculates a reflection matrix instead of this
            # (it's probably simpler, by reflecting an identity matrix
            # with a plane equation, but this was done and it works)
            inv_obj = mat4.invert mat4.create(), @object.world_matrix
            mat4.mul wm, inv_obj, wm
            # handness is inverted
            wm.m02 = -wm.m02
            wm.m06 = -wm.m06
            wm.m10 = -wm.m10
            wm.m14 = -wm.m14
            mat4.mul wm, @object.world_matrix, wm
            mat4.copy rcam.projection_matrix, cam.projection_matrix

            # set planarreflectmat (range_mat * projection * view of reflection)
            mat4.invert @planarreflectmat, rcam.world_matrix
            mat4.mul @planarreflectmat, rcam.projection_matrix, @planarreflectmat
            mat4.mul @planarreflectmat, range_mat, @planarreflectmat

            # get view position and normal to calculate clipping plane
            # TODO: optimize?
            wmi = mat4.invert(mat4.create(), rcam.world_matrix)
            view_pos = vec3.create()
            vec3.transformMat4 view_pos, @position, wmi
            view_nor = vec4.new @normal.x, @normal.y, @normal.z, 0
            vec4.transformMat4 view_nor, view_nor, wmi

            # render camera
            rm = @context.render_manager
            rm.flip_normals = true
            plane_from_norm_point rm.clipping_plane, view_nor, view_pos
            # NOTE: plane_from_norm_point gives a ABC=D plane,
            # while glClipPlane expects an ABCD=0 plane
            rm.clipping_plane.w = -rm.clipping_plane.w
            rm.draw_viewport @fake_vp, [0,0,@size,@size], @planar, [0,1]
            vec4.set rm.clipping_plane, 0,0,-1,999990
            rm.flip_normals = false

    destroy: ->
        @scene.probes.splice _,1 if (_ = @scene.probes.indexOf @)!=-1
        if @auto_refresh
            @context.render_manager.probes.splice _,1 if (_ = @context.render_manager.probes.indexOf @)!=-1
        @cubemap?.destroy()
        @planar?.destroy()
        @cubemap = @planar = null


module.exports = {Probe}
