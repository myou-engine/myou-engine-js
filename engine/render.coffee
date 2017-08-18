{mat2, mat3, mat4, vec2, vec3, vec4, quat, color4} = require 'vmath'
timsort = require 'timsort'
{Filter, BoxBlurFilter, ResizeFilter} = require './filters.coffee'
{Framebuffer} = require './framebuffer.coffee'
{Mesh} = require './mesh.coffee'
{Material} = require './material.coffee'
{next_POT} = require './math_utils/math_extra'
VECTOR_MINUS_Z = vec3.new 0,0,-1

# Render manager singleton. Performs all operations related to rendering to screen or to a buffer.
#
# Access it as `render_manager` member of the {Myou} instance.
class RenderManager
    constructor: (context, canvas, glflags)->
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
            gl = window.WebGL

        if not gl
            # Try disabling multisampling
            # (Chrome is not following the specification by rejecting to create the context)
            glflags.antialias = false
            gl = canvas.getContext("webgl", glflags)

        if not gl
            context.MYOU_PARAMS.on_webgl_failed?()
            throw "Error: Can't start WebGL"

        @context = context
        @context.render_manager = @
        @canvas = canvas
        @gl = gl

        @temporary_framebuffers = {}
        @render_tick = 0
        @context_lost_count = 0
        @max_textures = gl.getParameter gl.MAX_TEXTURE_IMAGE_UNITS
        @bound_textures = new Array @max_textures
        @active_texture = -1
        @next_texture = 0
        @frame_start = performance.now()
        @camera_z = vec3.create()
        @no_s3tc = @context.MYOU_PARAMS.no_s3tc
        ba = @context.MYOU_PARAMS.background_alpha
        @background_alpha = if ba? then ba else 1
        @compiled_shaders_this_frame = 0
        @use_frustum_culling = true
        @unbind_textures_on_draw_viewport = true
        @probes = []

        # Temporary variables
        @_cam2world = mat4.create()
        @_cam2world3 = mat3.create()
        @_world2cam = mat4.create()
        @_world2cam3 = mat3.create()
        @_world2cam_mx = mat4.create()
        @_world2cam3_mx = mat3.create()
        @_world2light = mat4.create()
        @projection_matrix_inverse = mat4.create()
        @_model_view_matrix = mat4.create()
        @_m4 = mat4.create()  # note: those are used
        @_m3 = mat3.create()  #       in several methods
        @_v = vec3.create()
        @_cam = null
        @_vp = null
        @_cull_left = vec3.create()
        @_cull_right = vec3.create()
        @_cull_top = vec3.create()
        @_cull_bottom = vec3.create()
        @_polygon_ratio = 1
        @_right_eye_factor = 0
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

    # @private
    # (Re)initializes the GL context.
    initialize: ()->
        gl = @gl
        @extensions =
            standard_derivatives: gl.getExtension 'OES_standard_derivatives'
            texture_float: gl.getExtension 'OES_texture_float'
            texture_float_linear: gl.getExtension 'OES_texture_float_linear'
            texture_half_float: gl.getExtension 'OES_texture_half_float'
            texture_half_float_linear: gl.getExtension 'OES_texture_half_float_linear'
            compressed_texture_s3tc: gl.getExtension 'WEBGL_compressed_texture_s3tc'
            compressed_texture_astc: gl.getExtension 'KHR_texture_compression_astc_ldr' or 'WEBGL_compressed_texture_astc'
            texture_filter_anisotropic: gl.getExtension("EXT_texture_filter_anisotropic") or
                                    gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") or
                                    gl.getExtension("MOZ_EXT_texture_filter_anisotropic")
            lose_context: gl.getExtension "WEBGL_lose_context"
            depth_texture: gl.getExtension "WEBGL_depth_texture"
            shader_texture_lod: gl.getExtension "EXT_shader_texture_lod"
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

        @filters =
            resize: new ResizeFilter @context
            shadow_box_blur: new BoxBlurFilter @context

        @common_shadow_fb = null
        @debug = new Debug @context

        # Initial GL state
        gl.clearDepth 1.0
        gl.enable gl.DEPTH_TEST
        gl.depthFunc gl.LEQUAL
        gl.enable gl.CULL_FACE
        gl.cullFace gl.BACK
        @flip = false
        @cull_face_enabled = true
        # Not premultiplied alpha textures
        gl.blendFunc gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA
        # For premul, use  gl.ONE, gl.ONE_MINUS_SRC_ALPHA
        @attrib_bitmask = 0


        @blank_texture = new @context.Texture {@context},
            formats: raw_pixels: {
                width: 2, height: 2, pixels: 0 for [0...2*2*4]
            }
        @blank_texture.load()

        @white_texture = new @context.Texture {@context},
            formats: raw_pixels: {
                width: 2, height: 2, pixels: 255 for [0...2*2*4]
            }
        @white_texture.load()

        @blank_cube_texture = new @context.Cubemap size: 16, color: {r: 0, g:0, b:0, a:0}

        @blank_textures = []
        @blank_textures[gl.TEXTURE_2D] = @blank_texture
        @blank_textures[gl.TEXTURE_CUBE_MAP] = @blank_cube_texture

        @quad = gl.createBuffer()
        gl.bindBuffer gl.ARRAY_BUFFER, @quad
        gl.bufferData gl.ARRAY_BUFFER, new(Float32Array)([0,1,0,0,0,0,1,1,0,1,0,0]), gl.STATIC_DRAW
        gl.bindBuffer gl.ARRAY_BUFFER, null

        @bg_mesh = new @context.Mesh
        @bg_mesh.load_from_lists([-1,-1,-1, 3,-1,-1, -1,3,-1],[0,1,2])
        @bg_mesh.stride = 3*4
        @bg_mesh.radius = 1e999
        @bg_mesh.materials = [null]
        return

    # @private
    # Handles the "lost context" event.
    clear_context: ->
        @context_lost_count += 1
        for scene in @context.scenes
            for k, t of scene.textures
                t.gl_tex = null
        return

    # @private
    # Restores GL context after a "lost context" event.
    restore_context: ->
        @initialize()
        for scene in @context.scenes
            for k, t of scene.textures
                t.reupload()
        for _,m of @context.all_materials
            m.delete_all_shaders()
        for k, m in @context.mesh_datas
            m.reupload()
        return

    # @private
    # Changes state of face culling depending on `material.double_sided`
    set_cull_face: (enable)->
        if enable
            @gl.enable 2884 # 2884 = gl.CULL_FACE
        else
            @gl.disable 2884


    # Requests full screen status of the canvas. Note that browsers require
    # this function to be called from a user initiated event such as `click` or `keypress`.
    request_fullscreen: ->
        #https://dvcs.w3.org/hg/fullscreen/raw-file/tip/Overview.html#api
        c = @canvas
        (c.requestFullscreen or
         c.mozRequestFullScreen or
         c.webkitRequestFullscreen)()
        # TODO: differences in style if the canvas is not 100%

    # @private
    # @deprecated
    recalculate_fb_size: ->
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
                for sig,shader of mat.shaders
                    if shader.u_fb_size?
                        shader.use()
                        @gl.uniform2f shader.u_fb_size, minx, miny
        return

    # @private
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

    # Binds a texture or cubemap to an unused GL texture slot
    # @param texture [Texture] Texture or [Cubemap]
    # @return [number] Active texture unit number
    # TODO: Check if a shader needs more textures than available
    bind_texture: (texture, avoid_material) ->
        {gl, bound_textures, active_texture, next_texture, max_textures} = @
        if texture.bound_unit == -1
            while avoid_material? and (nt = bound_textures[next_texture])? and\
                    nt.last_used_material == avoid_material
                next_texture = (next_texture+1) % max_textures
            texture.bound_unit = bound_unit = next_texture
            if active_texture != bound_unit
                @active_texture = bound_unit
                gl.activeTexture gl.TEXTURE0 + bound_unit
            old_tex = bound_textures[bound_unit]
            if old_tex?
                old_tex.bound_unit = -1
                if old_tex.gl_target != texture.gl_target
                    # Not sure if this is needed
                    gl.bindTexture old_tex.gl_target, null
            if texture.loaded
                gl.bindTexture texture.gl_target, texture.gl_tex
            else
                gl.bindTexture texture.gl_target, @blank_textures[texture.gl_target].gl_tex
            bound_textures[bound_unit] = texture
            @next_texture = (next_texture+1) % max_textures
        else
            {bound_unit} = texture
            if active_texture != bound_unit
                @active_texture = bound_unit
                gl.activeTexture gl.TEXTURE0 + bound_unit
        return bound_unit

    # Unbinds a texture if it was bound
    unbind_texture: (texture) ->
        {gl, bound_textures} = @
        {bound_unit} = texture
        old_tex = bound_textures[bound_unit]
        if old_tex == texture
            bound_textures[bound_unit] = null
            @active_texture = bound_unit
            gl.activeTexture gl.TEXTURE0 + bound_unit
            gl.bindTexture texture.gl_target, null
            texture.bound_unit = -1
            texture.last_used_material = null
        return

    # Draws all enabled scenes of all the viewports in `render_manager.viewports`.
    # Usually called from {MainLoop}
    draw_all: ->
        # TODO: calculate all matrices first
        # TODO: have a list of objects instead of probes?
        for probe in @probes
            probe.render()

        @frame_start = performance.now()
        @render_tick += 1
        @triangles_drawn = 0
        @meshes_drawn = 0

        for screen in @context.screens when screen.enabled
            screen.pre_draw()
            for viewport in screen.viewports when viewport.camera.scene.enabled
                @draw_viewport viewport, viewport.rect_pix, screen.framebuffer, [0, 1]
            screen.post_draw()

        #@gl.flush()
        @debug.vectors.splice 0 # TODO: have them per scene? preserve for a bunch of frames?
        @compiled_shaders_this_frame = 0

    # @private
    # Draws a mesh.
    draw_mesh: (mesh, mesh2world, pass_=-1, material_override, world2cam_override, projection_override)->
        # TODO: Put all camera matrices into a single argument:
        # world2cam, cam2world, world2cam3, cam2world3 (aka camera.rotation_matrix),
        # projection, projection inverse
        # TODO: check epsilon, probably better to check sum of absolutes instead of sqrLen
        if @_sqscale < 0.000001
            mesh.culled_in_last_frame = true
            return

        gl = @gl
        bound_textures = @bound_textures
        m3 = @_m3
        cam = @_cam

        if @use_frustum_culling
            # Cull object if it's outside camera frustum
            parented_pos = if mesh.parent then  mesh.get_world_position() else mesh.position
            pos = vec3.copy @_v, parented_pos
            vec3.sub pos, pos, cam.position
            r = mesh.radius
            distance_to_camera = vec3.dot pos, @camera_z

            if ((distance_to_camera+r) *
                (vec3.dot(pos, @_cull_top)+r) *
                (vec3.dot(pos, @_cull_left)+r) *
                (vec3.dot(pos, @_cull_right)+r) *
                (vec3.dot(pos, @_cull_bottom)+r)) < 0
                    mesh.culled_in_last_frame = true
                    return
            mesh.culled_in_last_frame = false

        # Select alternative mesh / LoD
        if @_vp?.camera?
            amesh = mesh.last_lod_object
            if not amesh? or @render_tick != mesh.last_lod_tick
                amesh = mesh.get_lod_mesh(@_vp, @context.mesh_lod_min_length_px)
                if not amesh.data
                    return
                mesh.last_lod_tick = @render_tick
        else
            amesh = mesh
            if not amesh.data
                return

        flip_normals = mesh._flip
        if @flip != flip_normals
            if (@flip = flip_normals)
                gl.frontFace 2304 # gl.CW
            else
                gl.frontFace 2305 # gl.CCW

        {x,y,z} = mesh.dimensions
        inv_radius_x = 2/x
        inv_radius_y = 2/y
        inv_radius_z = 2/z

        # Main routine for each submesh
        for mat,submesh_idx in amesh.materials
            if not (pass_ == -1 or mesh.passes[submesh_idx] == pass_)
                continue

            if material_override?
                mat = material_override
            shader = mat.get_shader(mesh)
            if not shader._program?
                continue
            shader.use()

            if mat.double_sided == @cull_face_enabled
                @cull_face_enabled = not @cull_face_enabled
                @set_cull_face @cull_face_enabled

            # Assigning uniforms of the 3 main matrices:
            # model_view_matrix, normal_matrix and projection_matrix
            model_view_matrix = @_model_view_matrix
            mat4.multiply model_view_matrix, world2cam_override or @_world2cam, mesh2world
            gl.uniformMatrix4fv shader.u_model_view_matrix, false, model_view_matrix.toJSON()
            if shader.u_normal_matrix?
                mat3.multiply m3, @_world2cam3, mesh.normal_matrix
                gl.uniformMatrix3fv shader.u_normal_matrix, false, m3.toJSON()
            proj = projection_override or cam.projection_matrix
            gl.uniformMatrix4fv shader.u_projection_matrix, false, proj.toJSON()

            # Enabling textures and assigning their respective uniforms
            # TODO: figure out a way to do object-specific textures
            for {value} in mat._texture_list
                value.last_used_material = mat
            for tex_input in mat._texture_list
                if tex_input.is_probe
                    # this means it's the probe cube texture
                    tex = mesh.probe?.cubemap or @blank_cube_texture
                    tex_input.value = tex
                    tex.last_used_material = mat
                else
                    tex = tex_input.value
                if tex.bound_unit == -1
                    @bind_texture tex, mat

            # Assigning uniforms of vertex modifiers
            mds = shader.modifier_data_store
            for modifier,i in mesh.vertex_modifiers
                modifier.update_uniforms gl, mds[i]

            # Assigning the rest of the uniforms (except
            shader.uniform_assign_func(gl, shader, mesh, this, mat4)

            # TODO: move this elsewhere
            if shader.u_uv_rect?
                [x,y,w,h] = mesh.uv_rect
                x += mesh.uv_right_eye_offset[0] * @_right_eye_factor
                y += mesh.uv_right_eye_offset[1] * @_right_eye_factor
                gl.uniform4f shader.u_uv_rect, x, y, w, h
            if shader.u_mesh_center?
                {x,y,z} = mesh.center
                gl.uniform3f shader.u_mesh_center, x, y, z
                gl.uniform3f shader.u_mesh_inv_dimensions, inv_radius_x, inv_radius_y, inv_radius_z

            # Bind vertex buffer, assign attribute pointers
            data = amesh.data
            stride = data.stride
            array_buffer = data.vertex_buffers[submesh_idx]
            if not array_buffer?
                continue
            gl.bindBuffer gl.ARRAY_BUFFER, array_buffer
            @change_enabled_attributes shader.attrib_bitmask
            for attr in shader.attrib_pointers
                # [location, number of components, type, offset]
                gl.vertexAttribPointer attr[0], attr[1], attr[2], false, stride, attr[3]

            # Bind index buffer, draw
            gl.bindBuffer gl.ELEMENT_ARRAY_BUFFER, data.index_buffers[submesh_idx]
            num_indices = data.num_indices[submesh_idx] # * @_polygon_ratio)|0
            gl.drawElements data.draw_method, num_indices, gl.UNSIGNED_SHORT, 0

            ## TODO: Enable in debug mode, silence after n errors
            # error = gl.getError()
            # if error != gl.NO_ERROR
            #     errcodes = {
            #         '1280': 'INVALID_ENUM',
            #         '1281': 'INVALID_VALUE',
            #         '1282': 'INVALID_OPERATION',
            #         '1205': 'OUT_OF_MEMORY'
            #     }
            #     console.error ('GL Error ' + errcodes[error] + ' when drawing ' + mesh.name +
            #             ' (' + mesh.mesh_name + ') with ' + mat.name)

            # @meshes_drawn += 1
            # @triangles_drawn += num_indices * 0.33333333333333333

        return

    # @private
    # Draws the scene background in a quad,
    # usually after opaque pass and before transparent pass
    draw_background: (scene, world2cam, cam2world, projection_matrix) ->
        @draw_mesh(@bg_mesh, cam2world, -1, scene.world_material, world2cam, projection_matrix)

    # @private
    # Draws a viewport. Usually called from `draw_all`.
    draw_viewport: (viewport, rect, dest_buffer, passes)->
        gl = @gl
        if gl.isContextLost()
            return
        @_cam = cam = viewport.debug_camera or viewport.camera
        @_vp = viewport
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
                    if c.visible and c.render
                        ob.recalculate_bone_matrices()
                        break
            for ob in scene.auto_updated_children
                ob._update_matrices()

        debug = @debug
        filter_fb = @common_filter_fb
        cam2world = @_cam2world
        world2cam = @_world2cam
        world2cam3 = @_world2cam3
        world2cam_mx = @_world2cam_mx
        world2cam3_mx = @_world2cam3_mx
        world2light = @_world2light
        # Create cam2world from camera world matrix but ignoring scale
        cam_rm = mat3.copy @_cam2world3, cam.rotation_matrix
        cam_wm = cam.world_matrix
        cam_zvec = vec3.new cam_wm.m08, cam_wm.m09, cam_wm.m10
        cam_pos = vec3.new cam_wm.m12, cam_wm.m13, cam_wm.m14
        mat4.fromMat3 cam2world, cam_rm
        mat4.setTranslation cam2world, cam_pos
        # Shift position for stereo VR rendering
        eye_shift = vec3.scale @_v, viewport.eye_shift, vec3.len(cam_zvec)
        vec3.transformMat4 cam_pos, eye_shift, cam2world
        @_right_eye_factor = viewport.right_eye_factor
        # Write position again
        mat4.setTranslation cam2world, cam_pos

        mat4.invert world2cam, cam2world
        mat3.fromMat4 world2cam3, world2cam

        mat4.copy world2cam_mx, world2cam
        world2cam_mx.x = -world2cam_mx.x
        world2cam_mx.y = -world2cam_mx.y
        world2cam_mx.z = -world2cam_mx.z
        mat3.fromMat4 world2cam3_mx, world2cam_mx
        vec3.transformMat3 @camera_z, VECTOR_MINUS_Z, cam.rotation_matrix
        # Set plane vectors that will be used for culling objects in perspective
        vec3.transformMat3 @_cull_left, cam.cull_left, cam.rotation_matrix
        v = vec3.copy @_cull_right, cam.cull_left
        v.x = -v.x
        vec3.transformMat3 v, v, cam.rotation_matrix
        vec3.transformMat3 @_cull_bottom, cam.cull_bottom, cam.rotation_matrix
        v = vec3.copy @_cull_top, cam.cull_bottom
        v.y = -v.y
        vec3.transformMat3 v, v, cam.rotation_matrix

        mat4.invert @projection_matrix_inverse, cam.projection_matrix

        # For usage outside this render loop
        mat4.mul cam.world_to_screen_matrix, cam.projection_matrix, world2cam

        # TODO: Is this necessary?
        if @unbind_textures_on_draw_viewport
            # unbind all textures
            for tex, i in @bound_textures when tex?
                tex.bound_unit = -1
                tex.last_used_material = null
                gl.activeTexture gl.TEXTURE0 + i
                gl.bindTexture tex.gl_target, null
                @bound_textures[i] = null
            gl.activeTexture gl.TEXTURE0
            @active_texture = -1
            @next_texture = 0

        {mesh_lod_min_length_px} = @context

        # Render shadow buffers
        for lamp in scene.lamps
            if lamp.shadow_fb?
                mat4.invert world2light, lamp.world_matrix
            if shadows_pending and lamp.shadow_fb? and lamp.render_shadow
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

                for ob in scene.mesh_passes[0]
                    data = ob.get_lod_mesh(viewport, mesh_lod_min_length_px).data
                    if ob.visible and data and not ob.culled_in_last_frame
                        @draw_mesh ob, ob.world_matrix, -1, mat, world2light, lamp._projection_matrix

                lamp.shadow_fb.enable()
                @common_shadow_fb.draw_with_filter @filters.shadow_box_blur



            # Update lamp view pos and direction
            lamp.recalculate_render_data(world2cam, cam2world, world2light)


        # Main drawing code to destination buffer (usually the screen)
        dest_buffer.enable rect

        clear_bits = viewport.clear_bits
        if scene.world_material? and @background_alpha >= 1
            # Don't clear color since we'll be rendering over it
            # TODO: Shouldn't @background_alpha be in the scene?
            clear_bits &= ~gl.COLOR_BUFFER_BIT
        else if clear_bits & gl.COLOR_BUFFER_BIT
            c = scene.background_color
            gl.clearColor c.x,c.y,c.z,@background_alpha
        clear_bits and gl.clear clear_bits

        # TODO: Think better about how to manage passes
        # Add a function for moving objects between passes freely?
        # Use a dynamic number of passes where each pass have a list of pre/post operations?
        # And a sort option

        # PASS -1  (background)
        if scene.bg_pass and scene.bg_pass.length
            for ob in scene.bg_pass
                if ob.visible == true and ob.render
                    @draw_mesh(ob, ob.world_matrix, 0)
            gl.clear gl.DEPTH_BUFFER_BIT

        # PASS 0  (solid objects)
        if passes.indexOf(0) >= 0
            # TODO: profile with timsort, etc
            # scene.mesh_passes[0].sort sort_by_mat_id
            for ob in scene.mesh_passes[0]
                if ob.visible == true and not ob.bg and not ob.fg and ob.render
                    @draw_mesh(ob, ob.world_matrix, 0)

        # Scene background
        if scene.world_material?
            @draw_background(scene, world2cam, cam2world, cam.projection_matrix)

        # PASS 1  (alpha)
        if passes.indexOf(1)>=0 and scene.mesh_passes[1].length
            gl.depthMask false
            gl.enable gl.BLEND
            # Sort by distence to camera
            z = @camera_z
            for ob in scene.mesh_passes[1]
                v = if ob.parent then ob.get_world_position() else ob.position
                x = v.x
                ob._sqdist = - (x*z.x + v.y*z.y + v.z*z.z) - (ob.zindex * (ob.dimensions.x+ob.dimensions.y+ob.dimensions.z)*0.166666)
                # ob._sqdist = -vec3.dot(s,z) - (ob.zindex * (ob.dimensions.x+ob.dimensions.y+ob.dimensions.z)*0.166666)
            timsort.sort scene.mesh_passes[1], (a,b)-> a._sqdist - b._sqdist

            for ob in scene.mesh_passes[1]
                if ob.visible == true and ob.render
                    @draw_mesh(ob, ob.world_matrix, 1)

            gl.disable gl.BLEND
            gl.depthMask true

        if scene.fg_pass and scene.fg_pass.length
            gl.clear gl.DEPTH_BUFFER_BIT
            for ob in scene.fg_pass
                if ob.visible == true and ob.render
                    @draw_mesh(ob, ob.world_matrix, 0)

        # PASS 2  (translucent)
        # Currently it uses the filter FB, so this has to be drawn unfiltered
        if passes.indexOf(2)>=0
            for ob in scene.mesh_passes[2]
                if ob.visible == true and ob.render
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
                    color4.set dob.color, 1, 1, 1, .2
                    gl.enable gl.BLEND
                    gl.disable gl.DEPTH_TEST
                    @draw_mesh dob, dob.world_matrix

                    # visible pass
                    gl.disable gl.BLEND
                    gl.enable gl.DEPTH_TEST
                    color4.set dob.color, 1, 1, 1, 1
                    @draw_mesh dob, dob.world_matrix

            gl.disable gl.DEPTH_TEST
            for dvec in @debug.vectors
                # TODO: draw something else when it's too small (a different arrow?)
                #       and a circle when it's 0
                dob = @debug.arrow
                if dvec.color?
                    color4.copy dob.materials[0].inputs.color.value, dvec.color
                else
                    color4.set dob.materials[0].inputs.color.value, 1,1,1,1
                dob.position = dvec.position
                v3 = dvec.vector
                v2 = vec3.cross vec3.create(), cam.position, v3
                v1 = vec3.normalize vec3.create(), vec3.cross(vec3.create(),v2,v3)
                v2 = vec3.normalize vec3.create(), vec3.cross(v2,v3,v1)
                s = vec3.len v3
                vec3.scale v2,v2,s
                vec3.scale v1,v1,s
                ma = mat4.new v1.x, v1.y, v1.z, 0,
                    v2.x, v2.y, v2.z, 0,
                    v3.x, v3.y, v3.z, 0,
                    dob.position.x, dob.position.y, dob.position.z, 1
                @draw_mesh dob, ma

            dob = @debug.bone
            for ob in scene.armatures
                for b in ob._bone_list
                    mat4.scale(mm4, b.matrix, [b.blength,b.blength,b.blength])
                    @draw_mesh dob, mm4

            gl.enable gl.DEPTH_TEST

    # Draws a cubemap texture.
    # Usually called from {Probe}
    draw_cubemap: (scene, cubemap, position, near, far, background_only) ->
        # TODO
        # * use frustum culling
        # * override LoD detection or set a camera for this
        {gl, use_frustum_culling} = @
        @use_frustum_culling = false

        world2cam = @_world2cam
        proj = mat4.frustum mat4.create(),-near,near,-near,near,near,far
        mat4.invert @projection_matrix_inverse, proj

        @unbind_texture cubemap

        fb = @temporary_framebuffers[cubemap.size]
        if not fb
            fb = @temporary_framebuffers[cubemap.size] = new Framebuffer @context,
                {size: [cubemap.size,cubemap.size], use_depth: true, \
                 color_type: 'UNSIGNED_BYTE', depth_type: 'UNSIGNED_SHORT'}
        fb.enable()
        for side in [0...6]
            fb.bind_to_cubemap_side cubemap, side
            dir = [{x:1.0, y:0.0, z:0.0},{x:-1.0, y:0.0, z:0.0},{x:0.0, y:1.0, z:0.0},
                {x:0.0, y:-1.0, z:0.0},{x:0.0, y:0.0, z:1.0},{x:0.0, y:0.0, z:-1.0}][side]
            up = [{x:0.0, y:-1.0, z:0.0},{x:0.0, y:-1.0, z:0.0},{x:0.0, y:0.0, z:1.0},
                {x:0.0, y:0.0, z:-1.0},{x:0.0, y:-1.0, z:0.0},{x:0.0, y:-1.0, z:0.0}][side]
            dir.x += position.x
            dir.y += position.y
            dir.z += position.z
            mat4.lookAt world2cam, position, dir, up
            mat4.invert @_cam2world, world2cam
            mat3.fromMat4 @_cam2world3, @_cam2world
            mat3.fromMat4 @_world2cam3, world2cam
            {r,g,b} = scene.background_color
            gl.clearColor r,g,b,1
            gl.clear gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT
            if @do_log?
                @do_log = side == 0
            for lamp in scene.lamps
                world2light = mat4.invert @_world2light, lamp.world_matrix
                lamp.recalculate_render_data world2cam, @_cam2world, world2light
            if not background_only
                for ob in scene.mesh_passes[0] when ob.probe?.cubemap != cubemap
                    if ob.visible and ob.data
                        @draw_mesh ob, ob.world_matrix, -1, null, world2cam, proj
            scene.world_material? and @draw_background(scene, world2cam, @_cam2world, proj)
            if @do_log
                @do_log = false
                console.log @debug_uniform_logging_get_log()

        fb.unbind_cubemap()
        fb.disable()
        cubemap.generate_mipmap()
        @use_frustum_culling = use_frustum_culling
        return


    # @nodoc
    # See myou.screenshot_as_blob()
    screenshot_as_blob: (width, height, options={}) ->
        ## Use this to test:
        # $myou.screenshot_as_blob(1024, 768).then((blob)=>{document.body.innerHTML=`<img src="${URL.createObjectURL(blob)}">`})
        new Promise (resolve, reject) =>
            {
                supersampling=2
                camera=@active_camera,
                format='jpeg',
                jpeg_quality=0.97,
            } = options
            # TODO: Tiled rendering, automatically split into tiles
            #       to support very high supersampling
            # create framebuffers
            supersampling = Math.sqrt supersampling
            console.log supersampling
            size = [next_POT(width*supersampling), next_POT(height*supersampling)]
            x_ratio_render = width*supersampling/size[0]
            y_ratio_render = height*supersampling/size[1]
            color_type = 'UNSIGNED_BYTE'
            depth_type = 'UNSIGNED_SHORT'
            render_buffer = new @context.Framebuffer {size, use_depth: true, color_type, depth_type}
            size = [next_POT(width), next_POT(height)]
            x_ratio_output = width/size[0]
            y_ratio_output = height/size[1]
            console.log(x_ratio_render,
                y_ratio_render,
                x_ratio_output,
                y_ratio_output)
            out_buffer = new @context.Framebuffer {size, use_depth: false, color_type, depth_type}
            # create canvas
            canvas = document.createElement 'canvas'
            canvas.style.display = 'none'
            canvas.width = width
            canvas.height = height
            document.body.appendChild canvas
            ctx = canvas.getContext '2d'
            image_data = ctx.createImageData width, height
            # prepare viewports
            # TODO: have option to use buffer aspect in viewport
            #       instead of changing @width @height
            old_w = @width
            old_h = @height
            @width = size[0]
            @height = size[1]
            restore_vp = []
            for v in @viewports
                {dest_buffer, rect} = v
                if v.dest_buffer == @main_fb
                    restore_vp.push {v, dest_buffer, rect}
                    v.dest_buffer = render_buffer
                    v.rect = [rect[0]*x_ratio_render, rect[1]*y_ratio_render,
                              rect[2]*x_ratio_render, rect[3]*y_ratio_render]
                    v.recalc_aspect()
            # render
            @draw_all()
            # restore viewports
            @width = old_w
            @height = old_h
            for {v, dest_buffer, rect} in restore_vp
                v.dest_buffer = dest_buffer
                v.rect = rect
                v.recalc_aspect()
            # resize/flip
            out_buffer.enable()
            filter = @filters.resize
            render_buffer.draw_with_filter filter, {
                flip_y_ratio: y_ratio_render
                scale_inverse: [x_ratio_render/x_ratio_output,
                                y_ratio_render/y_ratio_output]
            }
            # get pixels, draw onto canvas, conver to blob
            {gl} = @
            gl.readPixels 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(image_data.data.buffer)
            ctx.putImageData image_data, 0, 0
            canvas.toBlob (blob) ->
                document.body.removeChild canvas
                out_buffer.destroy()
                render_buffer.destroy()
                resolve blob
            , 'image/'+format, jpeg_quality
            return

    # @nodoc
    # Make a screenshot using the current screen resolution,
    # read raw pixels of specified rect into a typed array
    render_and_read_screen_pixels: (x, y, width, height, pixels) ->
        size = [next_POT(@width), next_POT(@width)]
        x_ratio_render = @width/size[0]
        y_ratio_render = @height/size[1]
        color_type = 'UNSIGNED_BYTE'
        depth_type = 'UNSIGNED_SHORT'
        render_buffer = new @context.Framebuffer {size, use_depth: true, color_type, depth_type}
        old_w = @width
        old_h = @height
        @width = size[0]
        @height = size[1]
        restore_vp = []
        for v in @viewports
            {dest_buffer, rect} = v
            if v.dest_buffer == @main_fb
                restore_vp.push {v, dest_buffer, rect}
                v.dest_buffer = render_buffer
                v.rect = [rect[0]*x_ratio_render, rect[1]*y_ratio_render,
                          rect[2]*x_ratio_render, rect[3]*y_ratio_render]
                v.recalc_aspect()
        # render
        # TODO: scissor to requested area
        @draw_all()
        # restore viewports
        @width = old_w
        @height = old_h
        for {v, dest_buffer, rect} in restore_vp
            v.dest_buffer = dest_buffer
            v.rect = rect
            v.recalc_aspect()
        render_buffer.enable()
        {gl} = @
        gl.readPixels x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels
        render_buffer.destroy()
        return

    # @nodoc
    debug_uniform_logging: ->
        # This function logs calls to uniform functions
        # and it's useful to find uniforms changing when they shouldn't
        # Usage:
        #   if @do_log?
        #     @do_log = true
        #   [do all things]
        #   if @do_log
        #     @do_log = false
        #     console.log @debug_uniform_logging_get_log()
        # and then:
        #   rm.debug_uniform_logging()
        #   rm.debug_uniform_logging_break(number of uniform)
        gl = @gl
        @do_log = false
        @u_log_break = -1
        @u_log_number = 0
        for p in ['uniform1fv', 'uniform2fv', 'uniform3fv', 'uniform4fv']
            gl['_'+p] = gl[p]
            gl[p] = do (p) => (l,v) =>
                if @do_log
                    if @u_log_number == @u_log_break
                        debugger
                        @u_log_break = -1
                    @u_log += "#{@u_log_number++}: #{v}\n"
                return gl["_"+p](l,v)

        for p in ['uniform1v', 'uniform2v', 'uniform3v', 'uniform4v']
            gl['_'+p] = gl[p]
            gl[p] = do (p) => (l,v...) =>
                if @do_log
                    if @u_log_number == @u_log_break
                        debugger
                        @u_log_break = -1
                    @u_log += "#{@u_log_number++}: #{v}\n"
                return gl["_"+p](l,v...)

        for p in ['uniformMatrix3fv', 'uniformMatrix4fv']
            gl['_'+p] = gl[p]
            gl[p] = do (p) => (l,t,v)=>
                if @do_log
                    if @u_log_number == @u_log_break
                        debugger
                        @u_log_break = -1
                    @u_log += "#{@u_log_number++}: #{v}\n"
                return gl["_"+p](l,t,v)
        return

    # @nodoc
    debug_uniform_logging_get_log: ->
        {u_log} = @
        @u_log = ''
        @u_log_number = 0
        u_log

    # @nodoc
    debug_uniform_logging_break: (number) ->
        @u_log_break = number

    # @nodoc
    # This function makes sure that all vectors/matrices are typed arrays
    debug_uniform_type: ()->
        gl = @gl
        for p in ['uniform1fv', 'uniform2fv', 'uniform3fv', 'uniform4fv']
            gl['_'+p] = gl[p]
            gl[p] = do (p) => (l,v)->
                if not v.byteLength?
                    throw "wrong type"
                return gl["_"+p](l,v)

        for p in ['uniformMatrix3fv', 'uniformMatrix4fv']
            gl['_'+p] = gl[p]
            gl[p] = do (p) => (l,t,v)->
                if v.byteLength?
                    throw "wrong type"
                return gl["_"+p](l,t,v)
        return

    # @nodoc
    # This function makes sure that all vectors/matrices are typed arrays
    debug_uniform_nan: ()->
        gl = @gl
        for p in ['uniform1f', 'uniform2f', 'uniform3f', 'uniform4f']
            gl['_'+p] = gl[p]
            gl[p] = do (p) => (l,v...)->
                for i in v
                    if not i? or i!=i
                        debugger
                return gl["_"+p](l,v...)

        for p in ['uniformMatrix3fv', 'uniformMatrix4fv']
            gl['_'+p] = gl[p]
            gl[p] = do (p) => (l,t,v...)->
                for i in v
                    if not i? or i!=i
                        debugger
                return gl["_"+p](l,t,v...)
        return

    # @nodoc
    debug_break_on_any_gl_error: ->
        gl = @gl
        for k,v of gl when typeof v == 'function' and k != 'getError'
            gl['_'+k] = gl[k]
            gl[k] = do (k, gl) => (args...)->
                r = gl["_"+k](args...)
                if error = gl.getError()
                    debugger
                return r
        return


    # @nodoc
    # This method allows to compare performance between few objects
    # and many object with similar total poly count.
    polycount_debug: (ratio=1)->
        total_polys = 0
        for ob in scene.children
            if ob.type == 'MESH' and ob.visible and ob.data and ob.render
                for n in ob.data.num_indices
                    total_polys += n
        inv_ratio = 1-ratio
        removed_polys = 0
        @removed_meshes = []
        for ob in scene.children
            if removed_polys/total_polys > inv_ratio
                return
            if ob.type == 'MESH' and ob.visible and ob.data and ob.render
                for n in ob.data.num_indices
                    removed_polys += n
                ob.visible = false
                scene.mesh_passes[0] _,1 if (_ = scene.mesh_passes[0] ob)!=-1
                scene.mesh_passes[1] _,1 if (_ = scene.mesh_passes[1] ob)!=-1
                @removed_meshes.push ob
        return

    # @nodoc
    # Call after using previous function.
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


# Singleton instanced in {RenderManager} to draw the debug view of objects.
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

        @material = mat = new Material @context, '_debug', {
            material_type: 'PLAIN_SHADER'
            vertex: plain_vs,
            fragment: plain_fs,
            uniforms: [{varname:'color', value: color4.create()}],
        }

        for ob in [box, cylinder, sphere, arrow, bone]
            ob.elements = []
            ob.stride = 4
            ob.materials = [mat]
            ob.color = color4.new 1,1,1,1
            ob.data.draw_method = @context.render_manager.gl.LINES
            ob.scale = {x: 1, y:1, z:1}
            ob._update_matrices()

        @box = box
        @cylinder = cylinder
        @sphere = sphere
        @arrow = arrow
        @bone = bone

        @vectors = []

    # @private
    debug_mesh_from_va_ia: (va, ia)->
        mesh = new Mesh @context
        mesh.stride = 3*4
        mesh.offsets = [0, 0, va.length, ia.length]
        mesh.load_from_va_ia va, ia
        mesh.elements = []
        mesh.materials = [@material]
        mesh.color = color4.new 1,1,1,1 # TODO FIXME plain shader
        mesh.data.draw_method = render_manager.gl.LINES
        mesh.scale = vec3.new 1,1,1
        mesh._update_matrices()
        return mesh

# @nodoc
sort_by_mat_id = (a,b) ->
    id_a = (a.materials[0]?.id) + a._flip<<30 # boolean coerced into 1 or 0
    id_b = (b.materials[0]?.id) + b._flip<<30
    id_a - id_b

module.exports = {
    RenderManager,
    VECTOR_MINUS_Z
}
