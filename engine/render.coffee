{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{Filter, box_filter_code} = require './filters.coffee'
{Compositor, box_filter_code} = require './filters.coffee'
{Framebuffer, MainFramebuffer} = require './framebuffer.coffee'
{Mesh} = require './mesh.coffee'
{Material} = require './material.coffee'
MIRROR_MASK_X = 2|16|32|128 #178
MIRROR_MASK_Y = 4|16|64|128 #212
MIRROR_MASK_Z = 8|32|64|128 #232
VECTOR_MINUS_Z = vec3.fromValues 0,0,-1


class RenderManager
    constructor: (context, canvas, width, height, glflags)->
        try
            gl = canvas.getContext("webgl", glflags) or canvas.getContext("experimental-webgl", glflags)
        catch e
            null

        if not gl
            # MSIE <= 10 with the ActiveX WebGL plugin
            if navigator.appName == "Microsoft Internet Explorer"
                iecanvas = document.createElement 'object'
                iecanvas.type = "application/x-webgl"
                canvas.parentNode.replaceChild iecanvas, canvas
                canvas = iecanvas
                gl = canvas.getContext("webgl", glflags) or canvas.getContext("experimental-webgl", glflags)

        if not gl
            context.MYOU_PARAMS.on_webgl_failed?()
            throw "Error: Can't start WebGL"

        @context = context
        @context.render_manager = @
        @canvas = canvas
        @gl = gl
        if vec3.create().byteLength == 24
            # TODO: convert only when necessary?
            gl.tmp2 = new Float32Array 2
            gl.tmp3 = new Float32Array 3
            gl.tmp4 = new Float32Array 4
            gl.tmp9 = new Float32Array 9
            gl.tmp16 = new Float32Array 16
            gl._uniform2fv = gl.uniform2fv
            gl.uniform2fv = (l, v) -> @tmp2.set(v);@_uniform2fv l, @tmp2
            gl._uniform3fv = gl.uniform3fv
            gl.uniform3fv = (l, v) -> @tmp3.set(v);@_uniform3fv l, @tmp3
            gl._uniform4fv = gl.uniform4fv
            gl.uniform4fv = (l, v) -> @tmp4.set(v);@_uniform4fv l, @tmp4
            gl._uniformMatrix3fv = gl.uniformMatrix3fv
            gl.uniformMatrix3fv = (l, t, v) -> @tmp9.set(v);@_uniformMatrix3fv l, t, @tmp9
            gl._uniformMatrix4fv = gl.uniformMatrix4fv
            gl.uniformMatrix4fv = (l, t, v) -> @tmp16.set(v);@_uniformMatrix4fv l, t, @tmp16
        @width = width
        @height = height
        @main_fb = new MainFramebuffer @context
        @viewports = []
        @render_tick = 0
        @context_lost_count = 0
        @bound_textures = []
        @frame_start = performance.now()
        @pixel_ratio_x = pixel_ratio_y = 1
        @camera_z = vec3.create()
        @lod_factor = 1
        @no_s3tc = @context.MYOU_PARAMS.no_s3tc
        ba = @context.MYOU_PARAMS.background_alpha
        @background_alpha = if ba? then ba else 1
        @compiled_shaders_this_frame = 0
        @use_frustum_culling = true

        # Temporary variables
        @_cam2world = mat4.create()
        @_world2cam = mat4.create()
        @_world2cam3 = mat3.create()
        @_world2cam_mx = mat4.create()
        @_world2cam3_mx = mat3.create()
        @_world2light = mat4.create()
        @_m4 = mat4.create()  # note: those are used
        @_m3 = mat3.create()  #       in several methods
        @_v = vec3.create()
        @_cam = null
        @_cull_left = vec3.create()
        @_cull_right = vec3.create()
        @_cull_top = vec3.create()
        @_cull_bottom = vec3.create()
        @_polygon_ratio = 1
        @triangles_drawn = 0
        @meshes_drawn = 0

        lost = (event)->
            event.preventDefault()
            @context.MYOU_PARAMS.on_context_lost?()
            render_manager.clear_context()
        restored = (event)->
            render_manager.restore_context()
            @context.MYOU_PARAMS.on_context_restored? and requestAnimationFrame(@context.MYOU_PARAMS.on_context_restored)
        canvas.addEventListener "webglcontextlost", lost, false
        canvas.addEventListener "webglcontextrestored", restored, false
        @initialize()

    initialize: ()->
        gl = @gl
        @extensions =
            standard_derivatives: gl.getExtension 'OES_standard_derivatives'
            texture_float: gl.getExtension 'OES_texture_float'
            texture_float_linear: gl.getExtension 'OES_texture_float_linear'
            texture_half_float: gl.getExtension 'OES_texture_half_float'
            texture_half_float_linear: gl.getExtension 'OES_texture_half_float_linear'
            compressed_texture_s3tc: gl.getExtension 'WEBGL_compressed_texture_s3tc'
            texture_filter_anisotropic: gl.getExtension("EXT_texture_filter_anisotropic") or
                                    gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") or
                                    gl.getExtension("MOZ_EXT_texture_filter_anisotropic")
            lose_context: gl.getExtension "WEBGL_lose_context"
            depth_texture: gl.getExtension "WEBGL_depth_texture"
        if @no_s3tc
            @extensions['compressed_texture_s3tc'] = null
        
        @has_float_fb_support = false
        if @extensions.texture_float?
            @has_float_fb_support = true
            # TODO: use_depth is probably unnecessary
            # TODO: should we test available depth types?
            fb = new Framebuffer @context, {size: [4, 4], color_type: 'FLOAT', use_depth: true}
            @has_float_fb_support = fb.is_complete
            fb.destroy()

        @has_half_float_fb_support = false
        if @extensions.texture_half_float?
            @has_half_float_fb_support = true
            fb = new Framebuffer @context, {size: [4, 4], color_type: 'HALF_FLOAT', use_depth: true}
            @has_half_float_fb_support = fb.is_complete
            fb.destroy()

        # By default, shadows will be enabled depending on
        # support for linear interpolation in float textures and float framebuffers
        @enable_shadows = (@extensions.texture_float_linear? and @has_float_fb_support) or \
            (@extensions.texture_half_float_linear? and @has_half_float_fb_support)
        @_shadows_were_enabled = @enable_shadows

        @shadow_box_filter = new Filter @, box_filter_code, 'box_filter'

        @common_shadow_fb = null
        @debug = new Debug @context

        # Initial GL state
        gl.clearDepth 1.0
        gl.enable gl.DEPTH_TEST
        gl.depthFunc gl.LEQUAL
        gl.enable gl.CULL_FACE
        gl.cullFace gl.BACK
        @cull_face_enabled = true
        # Not premultiplied alpha textures
        gl.blendFunc gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA
        # For premul, use  gl.ONE, gl.ONE_MINUS_SRC_ALPHA
        @attrib_bitmask = 0

        @blank_texture = tex = gl.createTexture()
        gl.bindTexture gl.TEXTURE_2D, tex
        gl.texImage2D gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0])
        gl.bindTexture gl.TEXTURE_2D, null
        
        @quad = gl.createBuffer()
        gl.bindBuffer gl.ARRAY_BUFFER, @quad
        gl.bufferData gl.ARRAY_BUFFER, new(Float32Array)([0,1,0,0,0,0,1,1,0,1,0,0]), gl.STATIC_DRAW
        gl.bindBuffer gl.ARRAY_BUFFER, null
        
        @uniform_functions = [
            (l,v) -> gl.uniform1f l,v
            (l,v) -> gl.uniform1f l,v
            (l,v) -> gl.uniform2fv l,v
            (l,v) -> gl.uniform3fv l,v
            (l,v) -> gl.uniform4fv l,v
        ]

        @white_texture = tex = gl.createTexture()
        gl.bindTexture gl.TEXTURE_2D, tex
        gl.texImage2D gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([1,1,1,1])
        gl.bindTexture gl.TEXTURE_2D, null

        @resize @width, @height, @pixel_ratio_x, @pixel_ratio_y

    clear_context: ->
        @context_lost_count += 1
        for k, t of @textures
            t.gl_tex = null
        return

    restore_context: ->
        @initialize()
        for k, t of @context.textures
            t.reupload()
        for m in @context.all_materials
            m.reupload()
        for k, m in @context.mesh_datas
            m.reupload()
        return

    set_cull_face: (enable)->
        if enable
            @gl.enable 2884 # 2884 = gl.CULL_FACE
        else
            @gl.disable 2884

    resize: (width, height, pixel_ratio_x=1, pixel_ratio_y=1)->
        @width = width
        @height = height
        @canvas.width = @main_fb.size_x = width * pixel_ratio_x
        @canvas.height = @main_fb.size_y = height * pixel_ratio_y
        @pixel_ratio_x = pixel_ratio_x
        @pixel_ratio_y = pixel_ratio_y
        @screen_size = [width, height]
        @largest_side = Math.max(width, height)
        @smallest_side = Math.min(width, height)
        @diagonal = Math.sqrt(width*width + height*height)
        filter_fb_needed = false
        for v in @viewports
            v.recalc_aspect()
            if v.post_processing_enabled
                filter_fb_needed = true

        if filter_fb_needed and @viewports.length != 0
            @recalculate_fb_size()

    resize_soft: (width, height)->
        for v in @viewports
            v.camera.aspect_ratio = width/height
            v.camera.recalculate_projection()
        return

    request_fullscreen: ->
        #https://dvcs.w3.org/hg/fullscreen/raw-file/tip/Overview.html#api
        c = @canvas
        (c.requestFullscreen or
         c.mozRequestFullScreen or
         c.webkitRequestFullscreen)()
        # TODO: differences in style if the canvas is not 100%

    recalculate_fb_size: ->
        next_POT = (x)->
            x = Math.max(0, x-1)
            return Math.pow(2, Math.floor(Math.log(x)/Math.log(2))+1)
        # For nearest POT: pow(2, round(log(x)/log(2)))

        # Framebuffer needs to be power of two (POT), so we'll find out the
        # smallest POT that can be used by all viewports
        minx = miny = 0
        for v in @viewports
            minx = Math.max(minx, v.rect_pix[2])
            miny = Math.max(miny, v.rect_pix[3])
        minx = next_POT(minx)
        miny = next_POT(miny)
        if @common_filter_fb and (@common_filter_fb.width!=minx or @common_filter_fb.height!=miny)
            @common_filter_fb.destroy()
            @common_filter_fb = null
        if not @common_filter_fb
            @common_filter_fb = new Framebuffer @context,
                {size: [minx, miny], color_type: 'UNSIGNED_BYTE', depth_type: 'UNSIGNED_SHORT', use_depth: true}
        if not @common_filter_fb.is_complete
            throw "Common filter framebuffer is not complete"

        # Write fb_size to all materials that require it
        for k, scene of @context.scenes
            for kk, mat of scene.materials
                if mat.u_fb_size?
                    mat.use()
                    @gl.uniform2f mat.u_fb_size, minx, miny
        return

    change_enabled_attributes: (bitmask)->
        gl = @gl
        previous = @attrib_bitmask
        mask = previous&~bitmask
        i = 0
        while mask!=0
            if mask&1
                gl.disableVertexAttribArray i
            i += 1
            mask >>= 1
        mask = bitmask&~previous
        i = 0
        while mask!=0
            if mask&1
                gl.enableVertexAttribArray i
            i += 1
            mask >>= 1
        @attrib_bitmask = bitmask

    draw_all: ()->
        # TODO: skip disabled scenes

        @frame_start = performance.now()
        @render_tick += 1
        @triangles_drawn = 0
        @meshes_drawn = 0
        {_HMD} = @context
        if _HMD?
            pose = _HMD.getPose()
            if pose.position and @context.use_VR_position
                vec3.copy @viewports[0].camera.position, pose.position
                vec3.copy @viewports[1].camera.position, pose.position
            if pose.orientation
                quat.copy @viewports[0].camera.rotation, pose.orientation
                quat.copy @viewports[1].camera.rotation, pose.orientation


        for viewport in @viewports when viewport.camera.scene.enabled
            if viewport.compositor_enabled
                rect = viewport.rect_pix
                src_rect = [0, 0, rect[2], rect[3]]
                @draw_viewport(viewport, src_rect, @common_filter_fb, [0, 1])
                viewport.compositor.compose()
                # Draw translucid pass (post processing is required because it uses the filter fb)
                if viewport.camera.scene.mesh_passes[2].length
                    # TODO: how to properly do this?
                    old_clear_bits = viewport.clear_bits
                    viewport.clear_bits = 256
                    @draw_viewport(viewport, src_rect, viewport.dest_buffer, [2])
                    viewport.clear_bits = old_clear_bits
            else
                @draw_viewport viewport, viewport.rect_pix, viewport.dest_buffer, [0, 1]

        if pose?
            _HMD.submitFrame pose

        #@gl.flush()
        @debug.vectors.clear() # TODO: have them per scene? preserve for a bunch of frames?
        @compiled_shaders_this_frame = 0

    # Returns: whether the frame should countinue
    draw_mesh: (mesh, mesh2world, pass_=-1)->
        gl = @gl
        bound_textures = @bound_textures
        m4 = @_m4
        m3 = @_m3
        cam = @_cam

        # Cull object if it's outside camera frustum
        parented_pos = if mesh.parent then  mesh.get_world_position() else mesh.position
        pos = vec3.copy @_v, parented_pos
        if mesh.mirrors == 2
            pos[0] = -pos[0]
        vec3.sub pos, pos, cam.position
        r = mesh.radius
        distance_to_camera = vec3.dot pos, @camera_z

        if @use_frustum_culling and ((distance_to_camera+r) *
            (vec3.dot(pos, @_cull_top)+r) *
            (vec3.dot(pos, @_cull_left)+r) *
            (vec3.dot(pos, @_cull_right)+r) *
            (vec3.dot(pos, @_cull_bottom)+r)) < 0
                mesh.culled_in_last_frame = true
                return true
        mesh.culled_in_last_frame = false

        # Select alternative mesh / LoD
        amesh = mesh.get_lod_mesh(cam.field_of_view, distance_to_camera)
        if not amesh.data
            return true

        # Reconfigure materials of mesh if they're missing
        if amesh.materials.length != amesh.material_names.length
            amesh.configure_materials()
            return
        
        flip_normals = mesh.scale[0]*mesh.scale[1]*mesh.scale[2] < 0
        
        # Main routine for each submesh
        submesh_idx = -1

        for mat in amesh.materials
            submesh_idx += 1
            if not (pass_ == -1 or mesh.passes[submesh_idx] == pass_)
                continue


            mat.use()

            if mat.double_sided == @cull_face_enabled
                @cull_face_enabled = not @cull_face_enabled
                @set_cull_face @cull_face_enabled

            # # mesh_id/group_id are not used during regular rendering
            # if mat.u_group_id? and mat.group_id != mesh.group_id:
            #     mat.group_id = mesh.group_id
            #     gl.uniform1f(mat.u_group_id, mat.group_id)

            gl.uniformMatrix4fv mat.u_projection_matrix, false, cam.projection_matrix
            # not doing this mirrored can make something fail (shadows?)
            gl.uniformMatrix4fv mat.u_inv_model_view_matrix, false, @_cam2world

            if mat.u_var_object_matrix?
                gl.uniformMatrix4fv mat.u_var_object_matrix, false, mesh2world

            if mat.u_var_inv_object_matrix?
                mat4.invert m4, mesh2world
                gl.uniformMatrix4fv mat.u_var_inv_object_matrix, false, m4

            if mat.u_color?
                gl.uniform4fv mat.u_color, mesh.color

            if mat.u_ambient?
                gl.uniform4fv mat.u_ambient, mesh.scene.ambient_color

            shading_params = mat.shading_params[0]
            if mat.u_diffcol?
                gl.uniform3fv mat.u_diffcol, shading_params.diffuse_color
            if mat.u_diffint?
                gl.uniform1f mat.u_diffint, shading_params.diffuse_intensity
            if mat.u_speccol?
                gl.uniform3fv mat.u_speccol, shading_params.specular_color
            if mat.u_specint?
                gl.uniform1f mat.u_specint, shading_params.specular_intensity
            if mat.u_hardness?
                gl.uniform1f mat.u_hardness, shading_params.specular_hardness
            if mat.u_emit?
                gl.uniform1f mat.u_emit, shading_params.emit
            if mat.u_alpha?
                gl.uniform1f mat.u_alpha, shading_params.alpha

            # TODO: would it be better to generate
            # a JS function that is called with all assignments at once?
            # (including also all other uniforms)
            for i in [0...mat.u_custom.length]
                cv = mesh.custom_uniform_values[i]
                if cv
                    if cv.length?
                        @uniform_functions[cv.length] mat.u_custom[i], cv
                    else
                        gl.uniform1f mat.u_custom[i], cv

            for lavars in mat.lamps
                lamp = lavars[0]
                gl.uniform3fv lavars[1], lamp._view_pos
                gl.uniform3fv lavars[2], lamp.color
                # if gl.getError() != gl.NO_ERROR:
                #     console.error('Error with', mesh.name, mat.name)
                gl.uniform4fv lavars[3], lamp._color4
                gl.uniform1f lavars[4], lamp.falloff_distance
                gl.uniform3fv lavars[5], lamp._dir
                gl.uniformMatrix4fv lavars[6], false, lamp._cam2depth
                gl.uniform1f lavars[7], lamp.energy

            for i in [0...mat.textures.length]
                tex = mat.textures[i]
                if tex.loaded
                    gl_tex = tex.gl_tex
                else
                    gl_tex = @blank_texture
                #if tex.name == 'special:fb':
                    #gl.activeTexture(gl.TEXTURE0 + i)
                    #active_texture = i
                    #gl.bindTexture(gl.TEXTURE_2D, filter_fb.texture)

                #else
                if bound_textures[i] != gl_tex
                    if active_texture != i
                        gl.activeTexture gl.TEXTURE0 + i
                        active_texture = i
                    gl.bindTexture gl.TEXTURE_2D, gl_tex
                    bound_textures[i] = gl_tex

            if mat.u_shapef.length != 0
                i = 0
                for shape in mesh._shape_names
                    # shape = ['shape_name', offset in bytes, [attribute locations]]
                    influence = mesh.shapes[shape]
                    gl.uniform1f mat.u_shapef[i], influence
                    i += 1
                # Set unused shape slots to 0
                while i<mat.u_shapef.length
                    gl.uniform1f mat.u_shapef[i], 0
                    i += 1
                if amesh.shape_multiplier != mat.shape_multiplier
                    mat.shape_multiplier = amesh.shape_multiplier
                    gl.uniform1f mat.u_shape_multiplier, amesh.shape_multiplier

            if amesh.uv_multiplier != mat.uv_multiplier
                mat.uv_multiplier = amesh.uv_multiplier
                gl.uniform1f mat.u_uv_multiplier, amesh.uv_multiplier

            if mesh.armature? and mesh.parent_bone_index == -1
                bones = mesh.armature.deform_bones
                ## Commented lines sets a float array instead of a matrix array
                ## Useful for reducing calls
                ## (TODO: flatten list at source and compare performance)
                #flat = new Float32Array(mat.u_bones.length)
                #i = 0
                #while i < Math.floor(mat.num_bone_uniforms/16):
                    #j = i * 16
                    #cosa.subarray(j).set(m)
                    #i+=1
                #gl.uniform1fv(mat.u_bones[j], flat)

                for i in [0...mat.num_bone_uniforms]
                    m = bones[i].ol_matrix
                    gl.uniformMatrix4fv mat.u_bones[i], false, m

            data = amesh.data
            attrib_pointers = data.attrib_pointers[submesh_idx]
            attrib_bitmasks = data.attrib_bitmasks[submesh_idx]
            stride = data.stride
            array_buffer = data.vertex_buffers[submesh_idx]
            if not array_buffer?
                continue
            gl.bindBuffer gl.ARRAY_BUFFER, array_buffer
            @change_enabled_attributes attrib_bitmasks
            for attr in attrib_pointers
                # [location, number of components, type, offset]
                gl.vertexAttribPointer attr[0], attr[1], attr[2], false, stride, attr[3]

            gl.bindBuffer gl.ELEMENT_ARRAY_BUFFER, data.index_buffers[submesh_idx]
            mirrors = mesh.mirrors
            num_indices = data.num_indices[submesh_idx]
            # num_indices = (data.num_indices[submesh_idx] * @_polygon_ratio)|0
            if mirrors & 1
                mat4.multiply m4, @_world2cam, mesh2world
                gl.uniformMatrix4fv mat.u_model_view_matrix, false, m4
                mat3.multiply m3, @_world2cam3, mesh.normal_matrix
                gl.uniformMatrix3fv mat.u_normal_matrix, false, m3
                if flip_normals
                    gl.frontFace 2304 # gl.CW
                    gl.drawElements data.draw_method, num_indices, gl.UNSIGNED_SHORT, 0
                    gl.frontFace 2305 # gl.CCW
                else
                    gl.drawElements data.draw_method, num_indices, gl.UNSIGNED_SHORT, 0
            if mirrors & 178
                mat4.multiply m4, @_world2cam_mx, mesh2world
                gl.uniformMatrix4fv mat.u_model_view_matrix, false, m4
                mat3.multiply m3, @_world2cam3_mx, mesh.normal_matrix
                gl.uniformMatrix3fv mat.u_normal_matrix, false, m3
                gl.frontFace 2304 # gl.CW
                gl.drawElements data.draw_method, num_indices, gl.UNSIGNED_SHORT, 0
                gl.frontFace 2305 # gl.CCW
            ## TODO: Enable in debug mode, silence after n errors
            # error = gl.getError()
            # if error != gl.NO_ERROR
            #     errcodes = {
            #         '1280': 'INVALID_ENUM',
            #         '1281': 'INVALID_VALUE',
            #         '1282': 'INVALID_OPERATION',
            #         '1205': 'OUT_OF_MEMORY'
            #     }
            #     console.log ('GL Error ' + errcodes[error] + ' when drawing ' + mesh.name +
            #            ' (' + mesh.mesh_name + ') with ' + mesh.material_names[submesh_idx])

            ## shells technique for strand rendering (WIP)
            #h = mat.u_strand
            #if h?:
                #steps = 10
                #i = 0
                #while i < steps:
                    ##gl.uniform1f(h, 1-(Math.pow(steps-i, 2)/(steps*steps)))
                    #gl.uniform1f(h, (i+1)/steps)
                    #gl.drawElements(data.draw_method, data.num_indices[submesh_idx], gl.UNSIGNED_SHORT, 0)
                    #i+=1
                #gl.uniform1f(h, 0)

            # @meshes_drawn += 1
            # @triangles_drawn += num_indices * 0.33333333333333333

        return true

    draw_viewport: (viewport, rect, dest_buffer, passes)->
        gl = @gl
        if gl.isContextLost()
            return
        @_cam = cam = viewport.debug_camera or viewport.camera
        scene = cam.scene

        m4 = @_m4
        m3 = @_m3

        # This condition is necessary for when the scene is drawn
        # several times in several viewports
        shadows_pending = false
        if scene.last_render_tick < @render_tick
            scene.last_render_tick = @render_tick
            if @enable_shadows
                shadows_pending = true
            else if @_shadows_were_enabled
                for lamp in scene.lamps
                    if lamp.shadow_fb?
                        lamp.destroy_shadow()
                @common_shadow_fb?.destroy()
            @_shadows_were_enabled = @enable_shadows

            if scene._children_are_ordered == false
                scene.reorder_children()
            # TODO: do this only for visible and modified objects
            #       (also, this is used in LookAt and other nodes)
            for ob in scene.armatures
                for c in ob.children
                    if c.visible
                        ob.recalculate_bone_matrices()
                        break
            for ob in scene.auto_updated_children
                ob._update_matrices()

        debug = @debug
        filter_fb = @common_filter_fb

        cam2world = mat4.copy @_cam2world, cam.world_matrix
        world2cam = @_world2cam
        world2cam3 = @_world2cam3
        world2cam_mx = @_world2cam_mx
        world2cam3_mx = @_world2cam3_mx
        world2light = @_world2light
        # Shift position for stereo VR rendering
        vec3.transformMat4 cam2world.subarray(12), viewport.eye_shift, cam2world

        mat4.invert world2cam, cam2world
        mat3.fromMat4 world2cam3, world2cam

        mat4.copy world2cam_mx, world2cam
        world2cam_mx[0] = -world2cam_mx[0]
        world2cam_mx[1] = -world2cam_mx[1]
        world2cam_mx[2] = -world2cam_mx[2]
        mat3.fromMat4 world2cam3_mx, world2cam_mx
        vec3.transformMat3 @camera_z, VECTOR_MINUS_Z, cam.rotation_matrix
        # Set plane vectors that will be used for culling objects in perspective
        vec3.transformMat3 @_cull_left, cam.cull_left, cam.rotation_matrix
        v = vec3.copy @_cull_right, cam.cull_left
        v[0] = -v[0]
        vec3.transformMat3 v, v, cam.rotation_matrix
        vec3.transformMat3 @_cull_bottom, cam.cull_bottom, cam.rotation_matrix
        v = vec3.copy @_cull_top, cam.cull_bottom
        v[1] = -v[1]
        vec3.transformMat3 v, v, cam.rotation_matrix

        # For usage outside this render loop
        mat4.mul cam.world_to_screen_matrix, cam.projection_matrix, world2cam

        @bound_textures.clear()
        active_texture = -1

        # Render shadow buffers
        for lamp in scene.lamps
            if shadows_pending and lamp.shadow_options? and lamp.render_shadow
                if not lamp.shadow_fb?
                    # TODO: enable all at once to decide common fb size
                    lamp.init_shadow()
                size = lamp.shadow_fb.size_x * 2
                if not @common_shadow_fb?
                    @common_shadow_fb = new Framebuffer @context, {size: [size,size], use_depth: true}

                @common_shadow_fb.enable [0, 0, size, size]
                gl.clearColor 1,1,1,1  # TODO: which color should we use?
                gl.clear gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT
                mat = lamp._shadow_material
                mat.use()
                mat4.invert world2light, lamp.world_matrix

                for ob in scene.mesh_passes[0]
                    data = ob.get_lod_mesh(cam).data
                    if ob.visible and data and data.attrib_pointers.length != 0 and not ob.culled_in_last_frame
                        mat4.multiply m4, world2light, ob.world_matrix
                        #draw_mesh ob, ob.world_matrix, world2light, mat
                        gl.uniformMatrix4fv mat.u_model_view_matrix, false, m4
                        gl.uniformMatrix4fv mat.u_projection_matrix, false, lamp._projection_matrix

                        for i in [0...data.vertex_buffers.length]
                            gl.bindBuffer gl.ARRAY_BUFFER, data.vertex_buffers[i]
                            @change_enabled_attributes 1
                            # Vertex attributes are always the same (3 floats)
                            # change this if this is no longer true
                            # (done this way to avoid unconfigured materials,
                            # alternatively we may continue the loop)
                            # attr = data.attrib_pointers[i][0] # Vertex attribute
                            # gl.vertexAttribPointer attr[0], attr[1], attr[2], false, data.stride, attr[3]
                            gl.vertexAttribPointer 0, 3, 5126, false, data.stride, 0
                            gl.bindBuffer gl.ELEMENT_ARRAY_BUFFER, data.index_buffers[i]
                            gl.drawElements data.draw_method, data.num_indices[i], gl.UNSIGNED_SHORT, 0

                lamp.shadow_fb.enable()
                @common_shadow_fb.draw_with_filter @shadow_box_filter, [0, 0, size, size]

            if lamp.shadow_fb?
                # Calculate and save cam2depth matrix for this lamp
                mat4.multiply m4, world2light, cam2world
                mat4.multiply lamp._cam2depth, lamp._depth_matrix, m4

            # Update lamp view pos and direction
            vec3.transformMat4 lamp._view_pos, lamp.world_matrix.subarray(12,15), world2cam
            mat4.multiply m4, world2cam, lamp.world_matrix
            lamp._dir[0] = -m4[8]
            lamp._dir[1] = -m4[9]
            lamp._dir[2] = -m4[10]


        # Main drawing code to destination buffer (usually the screen)
        dest_buffer.enable rect

        clear_bits = viewport.clear_bits
        if clear_bits & gl.COLOR_BUFFER_BIT
            c = scene.background_color
            gl.clearColor c[0],c[1],c[2],@background_alpha
        clear_bits and gl.clear clear_bits

        # TODO: Think better about how to manage passes
        # Add a function for moving objects between passes freely?
        # Use a dynamic number of passes where each pass have a list of pre/post operations?
        # And a sort option

        # PASS -1  (background)
        if scene.bg_pass and scene.bg_pass.length
            for ob in scene.bg_pass
                if ob.visible == true
                    @draw_mesh(ob, ob.world_matrix, 0)
            gl.clear gl.DEPTH_BUFFER_BIT

        # PASS 0  (solid objects)
        if passes.indexOf(0) >= 0
            for ob in scene.mesh_passes[0]
                if ob.visible == true and not ob.bg and not ob.fg
                    @draw_mesh(ob, ob.world_matrix, 0)


        # PASS 1  (alpha)
        if passes.indexOf(1)>=0 and scene.mesh_passes[1].length
            gl.depthMask false
            gl.enable gl.BLEND
            # Sort by distence to camera
            z = @camera_z
            for ob in scene.mesh_passes[1]
                v = if ob.parent then ob.get_world_position() else ob.position
                x = v[0]
                if ob.mirrors == 2
                    x = -x
                ob._sqdist = - (x*z[0] + v[1]*z[1] + v[2]*z[2]) - (ob.zindex * (ob.dimensions[0]+ob.dimensions[1]+ob.dimensions[2])*0.166666)
                # ob._sqdist = -vec3.dot(s,z) - (ob.zindex * (ob.dimensions[0]+ob.dimensions[1]+ob.dimensions[2])*0.166666)
            timsort_sqdist scene.mesh_passes[1]

        for ob in scene.mesh_passes[1]
            if ob.visible == true
                @draw_mesh(ob, ob.world_matrix, 1)

                #if ob.dupli_group?
                    #for sphere in groups[ob.dupli_group]
                        #mat4.multiply m4, world2cam, ob.world_matrix
                        #mat4.multiply m4, m4, sphere.world_matrix
                        #@draw_mesh sphere, ob.world_matrix, m4

        if scene.mesh_passes[1].length
            gl.disable gl.BLEND
            gl.depthMask true

        if scene.fg_pass and scene.fg_pass.length
            gl.clear gl.DEPTH_BUFFER_BIT
            for ob in scene.fg_pass
                if ob.visible == true
                    @draw_mesh(ob, ob.world_matrix, 0)

        # PASS 2  (translucent)
        # Currently it uses the filter FB, so this has to be drawn unfiltered
        if passes.indexOf(2)>=0
            for ob in scene.mesh_passes[2]
                if ob.visible == true
                    @draw_mesh ob, ob.world_matrix, 2


        # Debug physics and vectors (TODO: move vector to debug properties?)
        if @context.MYOU_PARAMS.debug
            mm4 = mat4.create()
            for ob in scene.children
                dob = ob.phy_debug_mesh
                if dob
                    if dob!=ob
                        posrot = ob.get_world_pos_rot()
                        dob.position = posrot[0]
                        dob.rotation = posrot[1]
                        dob.scale = ob.phy_he
                        dob._update_matrices()
                        # TODO: It's better to have a separate debug mesh
                        # than recalculating the matrices of the same mesh

                    # occluded pass
                    dob.color=vec4.clone [1,1,1,0.2]
                    gl.enable gl.BLEND
                    gl.disable gl.DEPTH_TEST
                    @draw_mesh dob, dob.world_matrix

                    # visible pass
                    gl.disable gl.BLEND
                    gl.enable gl.DEPTH_TEST
                    dob.color=vec4.clone [1,1,1,1]
                    @draw_mesh dob, dob.world_matrix

            gl.disable gl.DEPTH_TEST
            for dvec in @debug.vectors
                # TODO: draw something else when it's too small (a different arrow?)
                #       and a circle when it's 0
                dob = @debug.arrow
                dob.color = vec4.clone dvec[2]
                dob.position = dvec[1]
                v3 = dvec[0]
                v2 = vec3.cross [0,0,0], cam.position, v3
                v1 = vec3.normalize [0,0,0], vec3.cross([0,0,0],v2,v3)
                v2 = vec3.normalize [0,0,0], vec3.cross(v2,v3,v1)
                s = vec3.len v3
                vec3.scale v2,v2,s
                vec3.scale v1,v1,s
                ma = [v1[0], v1[1], v1[2], 0,
                    v2[0], v2[1], v2[2], 0,
                    v3[0], v3[1], v3[2], 0,
                    dob.position[0], dob.position[1], dob.position[2], 1]
                @draw_mesh dob, ma

            dob = @debug.bone
            for ob in scene.armatures
                for b in ob._bone_list
                    mat4.scale(mm4, b.matrix, [b.blength,b.blength,b.blength])
                    @draw_mesh dob, mm4

            gl.enable gl.DEPTH_TEST

    type_debug: ()->
        # This function makes sure that all vectors/matrices are typed arrays
        gl = @gl
        for p in ['uniform1fv', 'uniform2fv', 'uniform3fv', 'uniform4fv']
            gl['_'+p] = gl[p]
            gl[p] = (l,v)->
                if not v.byteLength?
                    throw "wrong type"
                return gl["_"+p](l,v)

        for p in ['uniformMatrix3fv', 'uniformMatrix4fv']
            gl['_'+p] = gl[p]
            gl[p] = (l,t,v)->
                if v.byteLength?
                    throw "wrong type"
                return gl["_"+p](l,t,v)
        return

    polycount_debug: (ratio=1)->
        total_polys = 0
        for ob in scene.children
            if ob.type == 'MESH' and ob.visible and ob.data
                for n in ob.data.num_indices
                    total_polys += n
        inv_ratio = 1-ratio
        removed_polys = 0
        @removed_meshes = []
        for ob in scene.children
            if removed_polys/total_polys > inv_ratio
                return
            if ob.type == 'MESH' and ob.visible and ob.data
                for n in ob.data.num_indices
                    removed_polys += n
                ob.visible = false
                scene.mesh_passes[0].remove ob
                scene.mesh_passes[1].remove ob
                @removed_meshes.push ob
        return

    restore_polycount_debug: ()->
        for ob in @removed_meshes
            added_passes = []
            for pa in ob.passes
                if not added_passes[pa] and pa < 5
                    scene.mesh_passes[pa].push ob
                    added_passes[pa]=true
            ob.visible = true
        return



#Shader for debug shapes

plain_vs = """
        precision highp float;
        precision highp int;
        uniform mat4 model_view_matrix;
        uniform mat4 projection_matrix;
        attribute vec3 vertex;
        void main()
        {
            vec4 pos = projection_matrix * model_view_matrix * vec4(vertex, 1.0);
            pos.z -= 0.0005;
            gl_Position = pos;
        }"""
plain_fs = "precision mediump float;uniform vec4 color;void main(){gl_FragColor = color;}"



class Debug

    constructor: (@context)->
        @vectors = []
        if not @context.MYOU_PARAMS.debug
            return
        sin=Math.sin
        cos=Math.cos

        # Generate and save generic shapes for debug_physics
        box = new Mesh @context
        d=[1,1,1,
            1,-1,1,
            -1,-1,1,
            -1,1,1,
            1,1,-1,
            1,-1,-1,
            -1,-1,-1,
            -1,1,-1]
        box.load_from_lists(d, [0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,
                    0,4,1,5,2,6,3,7])

        cylinder = new Mesh @context
        d=[]
        idx=[]
        a=(3.1416*2)/16
        for i in [0...16]
            d=d.concat [sin(a*i),cos(a*i),1]
            d=d.concat [sin(a*i),cos(a*i),-1]
            idx=idx.concat [i*2,(i*2+2)%32,i*2+1,(i*2+3)%32,]
            if i%2==0
                idx=idx.concat [i*2,i*2+1,]
        cylinder.load_from_lists d, idx

        sphere = new Mesh @context
        d = []
        idx = []
        for i in [0...16]
            d = d.concat sin(a*i),cos(a*i),0
            idx = idx.concat i, (i+1)%16
        for i in [0...16]
            d = d.concat 0,sin(a*i),cos(a*i)
            idx = idx.concat i+16, (i+1)%16+16
        for i in [0...16]
            d = d.concat sin(a*i),0,cos(a*i)
            idx = idx.concat i+32, (i+1)%16+32
        sphere.load_from_lists d, idx

        arrow = new Mesh @context
        d = [0,0,0,  0,0,1,  0,0.07,0.7,  0,-0.07,0.7,]
        arrow.load_from_lists d, [0,1,1,2,1,3]

        bone = new Mesh @context
        d = [0,0,0,
             -0.1, 0.1, -0.1,
              0.1, 0.1, -0.1,
              0.1, 0.1,  0.1,
             -0.1, 0.1,  0.1,
             0,1,0,1,
             ]
        bone.load_from_lists(d, [0,1,0,2,0,3,0,4,1,2,2,3,3,4,4,1,
                           5,1,5,2,5,3,5,4])

        @material = mat = new Material @context, {
            name: '_debug',
            vertex: plain_vs,
            fragment: plain_fs,
            uniforms: [{'type':5,'varname':'color'}],
        }

        for ob in [box, cylinder, sphere, arrow, bone]
            ob.elements = []
            ob.stride = 4
            ob.configure_materials [mat]
            ob.color = vec4.create 1,1,1,1
            ob.data.draw_method = @context.render_manager.gl.LINES
            ob.scale = [1,1,1]
            ob._update_matrices()

        @box = box
        @cylinder = cylinder
        @sphere = sphere
        @arrow = arrow
        @bone = bone

        @vectors = []


    debug_mesh_from_va_ia: (va, ia)->
        mesh = new Mesh @context
        mesh.stride = 3*4
        mesh.offsets = [0, 0, va.length, ia.length]
        mesh.load_from_va_ia va, ia
        mesh.elements = []
        mesh.configure_materials [@material]
        mesh.color = vec4.create 1,1,1,1
        mesh.data.draw_method = render_manager.gl.LINES
        mesh.scale = [1,1,1]
        mesh._update_matrices()
        return mesh

#TODO: TimSort

module.exports = {
    RenderManager,
    MIRROR_MASK_X
    MIRROR_MASK_Y,
    MIRROR_MASK_Z,
    VECTOR_MINUS_Z
}
