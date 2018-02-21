{mat3, mat4, vec3, vec4} = require 'vmath'
timsort = require 'timsort'
{Framebuffer, ByteFramebuffer} = require './framebuffer'
{next_POT} = require './math_utils/math_extra'
{plane_from_norm_point} = require './math_utils/g3'

VECTOR_MINUS_Z = vec3.new 0,0,-1
canvas = undefined # avoid bugs where the global id "canvas" is read

# Render manager singleton. Performs all operations related to rendering to
# screen or to a buffer.
#
# Access it as `render_manager` member of the {Myou} instance.
class RenderManager
    constructor: (@context, @canvas, @gl_flags)->
        @context.render_manager = @
        @gl = null

        @temporary_framebuffers = {}
        @render_tick = 0
        @context_lost_count = 0
        @camera_z = vec3.create()
        @no_s3tc = @context.MYOU_PARAMS.no_s3tc
        ba = @context.MYOU_PARAMS.background_alpha
        @background_alpha = if ba? then ba else 1
        @compiled_shaders_this_frame = 0
        @use_frustum_culling = true
        @show_debug_frustum_culling = false
        @unbind_textures_on_draw_viewport = true
        @probes = []
        # to simulate glClipPlane
        # (it can be all zero but we put -1 in case of hw bugs)
        @clipping_plane = vec4.new(0,0,-1,0)

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
        @_cull_planes = (vec4.create() for [0...6])
        @_polygon_ratio = 1
        @_right_eye_factor = 0
        @triangles_drawn = 0
        @meshes_drawn = 0
        @breaking_on_any_gl_error = false

        @instance_gl_context @gl_flags
        @initialize()

    recreate_gl_canvas: ->
        new_canvas = @canvas.cloneNode()
        @canvas.parentNode.replaceChild new_canvas, @canvas
        @_set_canvas new_canvas
        return

    set_canvas: (new_canvas) ->
        @_set_canvas new_canvas
        @instance_gl_context @gl_flags, clear: @gl?, restore: true

    _set_canvas: (new_canvas) ->
        if new_canvas != @canvas
            # recreate events of root element if it's the canvas
            if @context.root == @canvas
                @context.root = new_canvas
                for b in @context.behaviours
                    b._destroy_events()
                    b._create_events()
            @canvas = @context.canvas_screen.canvas = new_canvas
            @context.vr_screen?.canvas = new_canvas
        return

    instance_gl_context: (@gl_flags, options={}) ->
        {
            reinstance_all=false
            clear=false
            recreate_canvas=false
            restore=false
        } = options
        if clear or reinstance_all
            @clear_context()
        if restore or reinstance_all
            @recreate_gl_canvas()
        else if @gl?
            console.warn "There's already a GL context. Set reinstance_all
                to true to change GL flags."

        if not location?.hash.toString().match /(#|\?|&)webgl1\b/
            gl = @canvas.getContext("webgl2", @gl_flags)
        @context.is_webgl2 = @is_webgl2 = gl?
        if not gl
            try
                gl = @canvas.getContext("webgl", @gl_flags) \
                    or @canvas.getContext("experimental-webgl", @gl_flags)
            catch e
                console.error e

        if not gl
            gl = window.WebGL

        if not gl
            @context.MYOU_PARAMS.on_webgl_failed?()
            throw Error "Error: Can't start WebGL"

        @gl = gl
        if @breaking_on_any_gl_error
            @breaking_on_any_gl_error = false
            @debug_break_on_any_gl_error()
        if restore or reinstance_all
            @restore_context()
        lost = (event) =>
            @context_lost_count += 1
            event.preventDefault()
            @context.MYOU_PARAMS.on_context_lost?()
            @clear_context()
        restored = (event) =>
            @restore_context()
            if @context.MYOU_PARAMS.on_context_restored?
                requestAnimationFrame(@context.MYOU_PARAMS.on_context_restored)
        @canvas.addEventListener "webglcontextlost", lost, false
        @canvas.addEventListener "webglcontextrestored", restored, false
        return


    # @private
    # (Re)initializes the GL context.
    initialize: ()->
        gl = @gl
        @max_textures = gl.getParameter gl.MAX_TEXTURE_IMAGE_UNITS
        @bound_textures = new Array @max_textures
        @active_texture = -1
        @next_texture = 0

        webgl2_ext = if @is_webgl2 then true else null
        @extensions =
            standard_derivatives:
                webgl2_ext or gl.getExtension 'OES_standard_derivatives'
            color_buffer_float: gl.getExtension 'EXT_color_buffer_float'
            texture_float: gl.getExtension 'OES_texture_float'
            texture_float_linear: gl.getExtension 'OES_texture_float_linear'
            texture_half_float: gl.getExtension 'OES_texture_half_float'
            texture_half_float_linear:
                gl.getExtension 'OES_texture_half_float_linear'
            compressed_texture_s3tc:
                gl.getExtension 'WEBGL_compressed_texture_s3tc'
            compressed_texture_astc:
                gl.getExtension 'KHR_texture_compression_astc_ldr' or
                'WEBGL_compressed_texture_astc'
            texture_filter_anisotropic:
                gl.getExtension("EXT_texture_filter_anisotropic") or
                gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") or
                gl.getExtension("MOZ_EXT_texture_filter_anisotropic")
            lose_context: gl.getExtension "WEBGL_lose_context"
            depth_texture: webgl2_ext or gl.getExtension "WEBGL_depth_texture"
            shader_texture_lod:
                webgl2_ext or gl.getExtension "EXT_shader_texture_lod"
            disjoint_timer_query: gl.getExtension "EXT_disjoint_timer_query"
        if @no_s3tc
            @extensions['compressed_texture_s3tc'] = null

        @has_float_texture_support =
            @extensions.texture_float? or @extensions.color_buffer_float?
        @has_float_fb_support = false
        if @has_float_texture_support
            @has_float_fb_support = true
            # TODO: use_depth is probably unnecessary
            # TODO: should we test available depth types?
            fb = new Framebuffer @context,
                {size: [4, 4], color_type: 'FLOAT', use_depth: true}
            @has_float_fb_support = fb.is_complete
            fb.destroy()

        @has_half_float_fb_support = false
        if @extensions.texture_half_float?
            @has_half_float_fb_support = true
            fb = new Framebuffer @context,
                {size: [4, 4], color_type: 'HALF_FLOAT', use_depth: true}
            @has_half_float_fb_support = fb.is_complete
            fb.destroy()

        # By default, shadows will be enabled depending on support for linear
        # interpolation in float textures and float framebuffers
        @enable_shadows =
            (@extensions.texture_float_linear? and @has_float_fb_support) or
            (@extensions.texture_half_float_linear? and
            @has_half_float_fb_support)
        @_shadows_were_enabled = @enable_shadows

        @filters =
            copy: new @context.CopyFilter
            flip: new @context.FlipFilter
            shadow_box_blur: new @context.BoxBlurFilter

        @common_shadow_fb = null
        @tmp_fb0 = null
        @tmp_fb1 = null

        # Initial GL state
        gl.clearDepth 1.0
        gl.enable gl.DEPTH_TEST
        gl.depthFunc gl.LEQUAL
        gl.enable gl.CULL_FACE
        gl.cullFace gl.BACK
        @front_face_is_cw = false
        @cull_face_enabled = true
        # Not premultiplied alpha textures
        gl.blendFunc gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA
        # For premul, use  gl.ONE, gl.ONE_MINUS_SRC_ALPHA
        @attrib_bitmask = 0


        @blank_texture = new @context.Texture {@context},
            formats: raw_pixels: {
                width: 2, height: 2, pixels: 0 for [0...2*2*4] by 1
            }
        @blank_texture.load()

        @white_texture = new @context.Texture {@context},
            formats: raw_pixels: {
                width: 2, height: 2, pixels: 255 for [0...2*2*4] by 1
            }
        @white_texture.load()

        @blank_cube_texture =
            new @context.Cubemap size: 16, color: {r: 0, g:0, b:0, a:0}

        @blank_textures = []
        @blank_textures[gl.TEXTURE_2D] = @blank_texture
        @blank_textures[gl.TEXTURE_CUBE_MAP] = @blank_cube_texture

        @quad = gl.createBuffer()
        gl.bindBuffer gl.ARRAY_BUFFER, @quad
        gl.bufferData gl.ARRAY_BUFFER,
            new(Float32Array)([0,1,0,0,0,0,1,1,0,1,0,0]), gl.STATIC_DRAW
        gl.bindBuffer gl.ARRAY_BUFFER, null

        @bg_mesh = new @context.Mesh
        @bg_mesh.load_from_lists([-1,-1,-1, 3,-1,-1, -1,3,-1],[0,1,2])
        @bg_mesh.stride = 3*4
        @bg_mesh.radius = 1e999
        @bg_mesh.materials = [null]
        @bg_mesh.material_defines = {CORRECTION_NONE: 1}
        
        @last_time_ms = @last_time_ns = 0
        if (ext = @extensions.disjoint_timer_query)?
            @time_queries = []
            for [0...2]
                @time_queries.push (q = ext.createQueryEXT())
                ext.beginQueryEXT ext.TIME_ELAPSED_EXT, q
                ext.endQueryEXT ext.TIME_ELAPSED_EXT
        return

    # @private
    # Unloads all GPU stored objects
    clear_context: ->
        {gl} = @
        # materials, 2D textures
        for _,m of @context.all_materials
            m.delete_all_shaders(true)
            for {value: tex} in m._texture_list when tex?
                gl.deleteTexture tex.gl_tex
                tex.bound_unit = -1
                tex.gl_tex = null
        # cubemaps
        for cubemap in @context.all_cubemaps
            gl.deleteTexture cubemap.gl_tex
            cubemap.bound_unit = -1
            cubemap.gl_tex = null
        # framebuffers
        for framebuffer in @context.all_framebuffers
            framebuffer.destroy(false)
        # meshes
        for _,m of @context.mesh_datas
            m.reupload(false)
        @gl = null
        return

    # @private
    # Restores GL context after a re-created context or a "lost context" event.
    restore_context: ->
        @initialize()
        # materials, 2D textures
        for _,m of @context.all_materials
            m.delete_all_shaders(false)
            for {value: tex} in m._texture_list when tex?
                tex.bound_unit = -1
                tex.gl_tex = null
                tex.upload?()
        # cubemaps
        for cubemap in @context.all_cubemaps
            cubemap.bound_unit = -1
            cubemap.instance()
        # framebuffers
        for framebuffer in @context.all_framebuffers
            framebuffer.recreate()
        # meshes
        for _,m of @context.mesh_datas
            m.reupload(false)
        # render probes
        for _,scene of @context.scenes
            # for lamp in scene.lamps when lamp.shadow_fb?
            #     lamp.init_shadow()
            for {probe, probe_options} in scene.children when probe?
                if probe_options?.type != 'OBJECT' and not probe.auto_refresh
                    probe.render()
        return

    # @private
    # Changes state of face culling depending on `material.double_sided`
    set_cull_face: (enable)->
        if enable
            @gl.enable 2884 # 2884 = gl.CULL_FACE
        else
            @gl.disable 2884


    # Requests full screen status of the canvas. Note that browsers require
    # this function to be called from a user initiated event such as `click` or
    # `keypress`.
    request_fullscreen: ->
        #https://dvcs.w3.org/hg/fullscreen/raw-file/tip/Overview.html#api
        c = @canvas
        (c.requestFullscreen or
         c.mozRequestFullScreen or
         c.webkitRequestFullscreen)()
        # TODO: differences in style if the canvas is not 100%

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
                gl.bindTexture texture.gl_target,
                    @blank_textures[texture.gl_target].gl_tex
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

    # Draws all enabled scenes of all the viewports of all screens
    # Usually called from {MainLoop}
    draw_all: ->
        render_tick = ++@render_tick
        @triangles_drawn = 0
        @meshes_drawn = 0

        # calculate all matrices first
        for screen in @context.screens when screen.enabled
            for {camera: {scene}} in screen.viewports when scene.enabled \
                    and scene.last_update_matrices_tick < @render_tick
                scene.update_all_matrices()

        if (ext = @extensions.disjoint_timer_query)? and render_tick%2
            query = @time_queries[render_tick%2]
            if ext.getQueryObjectEXT query, ext.QUERY_RESULT_AVAILABLE_EXT
                @last_time_ns = ns = ext.getQueryObjectEXT query, ext.QUERY_RESULT_EXT
                @last_time_ms = ns * 0.000001
            ext.beginQueryEXT ext.TIME_ELAPSED_EXT, query
            doing_query = true

        # TODO: have a list of objects instead of probes?
        for probe in @probes
            probe.render()

        for screen in @context.screens when screen.enabled
            screen.pre_draw()
            for viewport in screen.viewports when viewport.camera.scene.enabled
                {effects, requires_float_buffers: usefloat} = viewport
                {width, height} = viewport
                # screen space refraction
                use_pass2 = viewport.camera.scene.mesh_passes[2].length != 0
                if effects.length != 0 or use_pass2
                    @ensure_post_processing_framebuffers width, height, usefloat
                if effects.length != 0
                    rect = [0, 0, width, height]
                    @draw_viewport viewport, rect, @tmp_fb0, [0, 1, 2]
                    source = @tmp_fb0
                    dest = @tmp_fb1
                    source.last_viewport = dest.last_viewport = viewport
                    for i in [0...effects.length-1] by 1
                        result = effects[i].apply source, dest, rect
                        source = result.destination
                        dest = result.temporary
                    last = effects[effects.length-1]
                    result =
                        last.apply source, screen.framebuffer, viewport.rect_pix
                    if result.destination != screen.framebuffer
                        throw Error "The last effect is not allowed to be
                            pass-through (second argument of effect.apply
                            must be destination)."
                else if use_pass2
                    rect = [0, 0, width, height]
                    @draw_viewport \
                        viewport, rect, @tmp_fb0, [0, 1, 2]
                    screen.framebuffer.enable viewport.rect_pix
                    # TODO: Use blitting instead (when available)
                    @tmp_fb0.draw_with_filter @filters.copy, {}
                else
                    @draw_viewport \
                        viewport, viewport.rect_pix, screen.framebuffer, [0, 1]
            screen.post_draw()

        if doing_query
            ext.endQueryEXT ext.TIME_ELAPSED_EXT

        @compiled_shaders_this_frame = 0

    ensure_post_processing_framebuffers: (width, height, use_float) ->
        # TODO: Check all viewports to avoid several resizes
        color_type = if use_float then 'FLOAT' else 'UNSIGNED_BYTE'
        if not @tmp_fb0? or @tmp_fb0.size_x < width or @tmp_fb0.size_y < height\
                or @tmp_fb0.color_type != color_type
            size = [next_POT(width), next_POT(height)]
            @tmp_fb0?.destroy()
            @tmp_fb1?.destroy()
            @tmp_fb0 = new @context.Framebuffer \
                {size, color_type, use_depth: true}
            @tmp_fb1 = new @context.Framebuffer \
                {size, color_type, use_depth: true}
        return

    # @private
    # Draws a mesh.
    draw_mesh: (mesh, mesh2world, pass_=-1, material_override,
        world2cam_override, projection_override)->
        # TODO: Put all camera matrices into a single argument:
        # world2cam, cam2world, world2cam3, cam2world3
        # projection, projection inverse
        # TODO: check epsilon, probably better to check sum of absolutes
        # instead of sqrLen
        if @_sqscale < 0.000001
            mesh.culled_in_last_frame = true
            return

        gl = @gl
        m3 = @_m3
        cam = @_cam

        mesh.culled_in_last_frame = false
        if @use_frustum_culling
            # Cull object if it's outside camera frustum
            parented_pos = if mesh.parent then mesh.get_world_position()
            else mesh.position
            pos4 = vec4.new parented_pos.x, parented_pos.y, parented_pos.z, 1
            r = -mesh.radius
            for plane in @_cull_planes
                if vec4.dot(plane, pos4) < r
                    mesh.culled_in_last_frame = true
                    return
            # TODO: Also check with @clipping_plane!

        # Select alternative mesh / LoD
        if @_vp?.camera?
            amesh = mesh.get_lod_mesh(@_vp,
                @context.mesh_lod_min_length_px, @render_tick)
            if not amesh.data
                return
        else
            amesh = mesh
            if not amesh.data
                return

        flip_normals = mesh._flip
        if @flip_normals
            flip_normals = not flip_normals
        if @front_face_is_cw != flip_normals
            if (@front_face_is_cw = flip_normals)
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
            mvm = @_model_view_matrix
            mat4.multiply mvm, world2cam_override or @_world2cam, mesh2world
            gl.uniformMatrix4fv shader.u_model_view_matrix, false, mvm.toJSON()
            if shader.u_normal_matrix?
                mat3.normalFromMat4 m3, mvm
                gl.uniformMatrix3fv shader.u_normal_matrix, false, m3.toJSON()
            proj = projection_override or cam.projection_matrix
            gl.uniformMatrix4fv shader.u_projection_matrix, false, proj.toJSON()

            # Enabling textures and assigning their respective uniforms
            # TODO: figure out a way to do object-specific textures
            for {value} in mat._texture_list
                value.last_used_material = mat
            for tex_input in mat._texture_list
                # TODO: Simplify this
                if tex_input.is_probe
                    # this means it's the probe cube texture
                    tex = mesh.probe_cube?.cubemap or @blank_cube_texture
                    tex_input.value = tex
                    if tex.is_framebuffer_active
                        tex_input.value = tex =
                            mesh.scene?.background_probe?.cubemap or
                            @blank_cube_texture
                    tex.last_used_material = mat
                else if tex_input.is_reflect
                    # this means it's the probe planar reflection texture
                    tex = mesh.probe_planar?.planar.texture or @blank_texture
                    tex_input.value = tex
                    if tex.is_framebuffer_active
                        tex_input.value = tex = @blank_texture
                    tex.last_used_material = mat
                else if tex_input.is_refract
                    tex = @tmp_fb1?.texture or @blank_texture
                    tex_input.value = tex
                    tex.last_used_material = mat
                else
                    tex = tex_input.value
                if tex.bound_unit == -1
                    @bind_texture tex, mat

            # Assigning uniforms of vertex modifiers
            mds = shader.modifier_data_store
            for modifier,i in mesh.vertex_modifiers
                modifier.update_uniforms gl, mds[i], amesh, submesh_idx

            # Assigning the rest of the uniforms (except
            shader.uniform_assign_func(gl, shader, mesh, this, mat4)

            # TODO: move this elsewhere
            # if shader.u_uv_rect?
            #     [x,y,w,h] = mesh.uv_rect
            #     x += mesh.uv_right_eye_offset[0] * @_right_eye_factor
            #     y += mesh.uv_right_eye_offset[1] * @_right_eye_factor
            #     gl.uniform4f shader.u_uv_rect, x, y, w, h
            if shader.u_mesh_center?
                {x,y,z} = mesh.center
                gl.uniform3f shader.u_mesh_center, x, y, z
                gl.uniform3f shader.u_mesh_inv_dimensions,
                    inv_radius_x, inv_radius_y, inv_radius_z

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
                gl.vertexAttribPointer \
                    attr[0], attr[1], attr[2], false, stride, attr[3]

            # Bind index buffer, draw
            # ELEMENT_ARRAY_BUFFER = 0x8893
            gl.bindBuffer 0x8893, data.index_buffers[submesh_idx]
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
            #     console.error ("GL Error #{errcodes[error]} when drawing
            #             #{mesh.name} (#{mesh.mesh_name}) with #{mat.name}")

            @meshes_drawn += 1
            @triangles_drawn += num_indices * 0.33333333333333333

        return

    # @private
    # Draws the scene background in a quad,
    # usually after opaque pass and before transparent pass
    draw_background: (scene, world2cam, cam2world, projection_matrix) ->
        @draw_mesh(@bg_mesh, cam2world, -1, scene.world_material,
            world2cam, projection_matrix)

    # @private
    # Draws a quad occupying the whole viewport with the specified material.
    draw_quad: (material, scene, world2cam, cam2world, projection_matrix) ->
        @draw_mesh(@bg_mesh, cam2world, -1, material, world2cam,
            projection_matrix)

    # @private
    # Draws a viewport. Usually called from `draw_all`.
    draw_viewport: (viewport, rect, dest_buffer, passes)->
        gl = @gl
        if not gl or gl.isContextLost()
            return
        @_cam = cam = viewport.debug_camera or viewport.camera
        @_vp = viewport
        scene = cam.scene

        # This condition is necessary for when the scene is drawn
        # several times in several viewports
        # TODO: Separate into draw_shadows()
        shadows_pending = false
        if scene.last_shadow_render_tick < @render_tick
            scene.last_shadow_render_tick = @render_tick
            if @enable_shadows
                shadows_pending = true
            else if @_shadows_were_enabled
                for lamp in scene.lamps
                    if lamp.shadow_fb?
                        lamp.destroy_shadow()
                @common_shadow_fb?.destroy()
            @_shadows_were_enabled = @enable_shadows

        cam2world = @_cam2world
        world2cam = @_world2cam
        world2cam3 = @_world2cam3
        world2cam_mx = @_world2cam_mx
        world2cam3_mx = @_world2cam3_mx
        world2light = @_world2light
        # Create cam2world from camera world matrix but ignoring scale/skew
        # NOTE: How am I ignoring scale/skew?
        # And if I'm not ignoring it, why do the lights not change with scale?
        cam_wm = cam.world_matrix
        cam_rm = mat3.rotationFromMat4 @_cam2world3, cam_wm
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
        vec3.transformMat3 @camera_z, VECTOR_MINUS_Z, cam_rm
        # Set plane vectors that will be used for culling objects
        plane_matrix = cam2world
        {cull_planes} = cam
        if @show_debug_frustum_culling
            # NOTE: This only works properly if world scale = 1,1,1
            plane_matrix = viewport.camera.world_matrix
            {cull_planes} = viewport.camera
        p4 = vec4.create()
        n4 = vec4.create()
        for plane,i in cull_planes
            # use this line to test with debug camera on non-debug camera
            # plane_matrix = viewport.camera.world_matrix
            vec4.copy n4, plane
            n4.w = 0
            vec4.scale p4, n4, -plane.w
            p4.w = 1
            vec4.transformMat4 p4, p4, plane_matrix
            vec4.transformMat4 n4, n4, plane_matrix
            plane_from_norm_point @_cull_planes[i], n4, p4

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

        for lamp in scene.lamps
            if lamp.use_shadow
                mat4.invert world2light, lamp.world_matrix
            # Render shadow buffers
            if shadows_pending and lamp.use_shadow and lamp.render_shadow
                if not lamp.shadow_fb?
                    # TODO: enable all at once to decide common fb size
                    lamp.init_shadow()
                size = lamp.shadow_fb.size_x * 2
                if not @common_shadow_fb?
                    @common_shadow_fb = new Framebuffer @context,
                        {size: [size,size], use_depth: true}

                @common_shadow_fb.enable [0, 0, size, size]
                gl.clearColor 1,1,1,1  # TODO: which color should we use?
                gl.clear gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT
                mat = lamp._shadow_material

                for ob in scene.mesh_passes[0]
                    data = ob.get_lod_mesh(viewport, mesh_lod_min_length_px,
                        @render_tick).data
                    if ob.visible and data and not ob.culled_in_last_frame
                        @draw_mesh ob, ob.world_matrix, 0, mat, world2light,
                            lamp._projection_matrix

                mat = lamp._alpha_shadow_material
                tex = mat.inputs.samp

                for ob in scene.mesh_passes[1]
                    if ob.materials[0].alpha_texture? and not ob.properties.no_shadow
                        data = ob.get_lod_mesh(viewport, mesh_lod_min_length_px,
                            @render_tick).data
                        if ob.visible and data and not ob.culled_in_last_frame
                            tex.value = ob.materials[0].alpha_texture
                            @draw_mesh ob, ob.world_matrix, 1, mat, world2light,
                                lamp._projection_matrix

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
            gl.clearColor c.r,c.g,c.b,@background_alpha
        clear_bits and gl.clear clear_bits

        # TODO: Think better about how to manage passes
        # Add a function for moving objects between passes freely?
        # Use a dynamic number of passes where each pass have
        # a list of pre/post operations?
        # And a sort option

        gl.disable gl.BLEND
        gl.depthMask true

        # PASS -1  (background)
        if scene.bg_pass and scene.bg_pass.length
            for ob in scene.bg_pass
                if ob.visible == true
                    @draw_mesh(ob, ob.world_matrix, 0)
            gl.clear gl.DEPTH_BUFFER_BIT

        # PASS 0  (solid objects)
        if passes.indexOf(0) >= 0
            # TODO: profile with timsort, etc
            # scene.mesh_passes[0].sort sort_by_mat_id
            # Sort by distence to camera
            z = @camera_z
            v = vec3.create()
            for ob in scene.mesh_passes[0]
                wm = ob.world_matrix
                vec3.set v, wm.m12, wm.m13, wm.m14
                ob._sqdist = -vec3.dot(v,z) - (ob.zindex * \
                    (ob.dimensions.x+ob.dimensions.y+ob.dimensions.z)*0.166666)
            timsort.sort scene.mesh_passes[0], (a,b)-> b._sqdist - a._sqdist
            for ob in scene.mesh_passes[0]
                if ob.visible == true and not ob.bg and not ob.fg
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
            v = vec3.create()
            for ob in scene.mesh_passes[1]
                ob.get_world_position_into(v)
                ob._sqdist = -vec3.dot(v,z) - (ob.zindex * \
                    (ob.dimensions.x+ob.dimensions.y+ob.dimensions.z)*0.166666)
            timsort.sort scene.mesh_passes[1], (a,b)-> a._sqdist - b._sqdist

            # Sort some meshes, for now just one per frame, with more iterations
            # for nearby meshes (TODO: Calculate which one has more divergence)
            idx = @render_tick % ((scene.mesh_passes[1].length * 1.5)|0)
            idx %= scene.mesh_passes[1].length
            remaining_meshes = 1
            cam_name = cam.name
            ob = scene.mesh_passes[1][idx]
            (ob.last_lod[cam_name]?.mesh ? ob).sort_faces(cam_pos)

            for ob in scene.mesh_passes[1]
                if ob.visible == true
                    @draw_mesh(ob, ob.world_matrix, 1)

            gl.disable gl.BLEND
            gl.depthMask true

        if scene.fg_pass and scene.fg_pass.length
            gl.clear gl.DEPTH_BUFFER_BIT
            for ob in scene.fg_pass
                if ob.visible == true
                    @draw_mesh(ob, ob.world_matrix, 0)

        # PASS 2  (refraction, formerly known as translucent)
        if passes.indexOf(2)>=0 and scene.mesh_passes[2].length != 0
            transp_rect = [0, 0, rect[2], rect[3]]
            dest_buffer.blit_to @tmp_fb1, rect, transp_rect
            for ob in scene.mesh_passes[2]
                if ob.visible == true
                    @draw_mesh ob, ob.world_matrix, 2

        # FOREGROUND_PLANES
        if scene.foreground_planes.length != 0
            gl.depthMask false
            blending = false
            for fg_plane in scene.foreground_planes
                {material, is_alpha} = fg_plane
                if blending != is_alpha
                    if is_alpha
                        gl.enable gl.BLEND
                    else
                        gl.disable gl.BLEND
                @draw_quad material, scene, world2cam, cam2world,
                    cam.projection_matrix
            gl.depthMask true

        scene._debug_draw?._draw gl, cam
        return

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
            fb = @temporary_framebuffers[cubemap.size] =
                new ByteFramebuffer @context,
                    {size: [cubemap.size,cubemap.size], use_depth: true}
        fb.enable()
        dir = vec3.create()
        for side in [0...6]
            fb.bind_to_cubemap_side cubemap, side
            vec3.copy dir, CUBEMAP_DIRECTIONS[side]
            up = CUBEMAP_UP_VECTORS[side]
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
                for ob in scene.mesh_passes[0]
                    if (probe = ob.probe_cube)?
                        if probe.object == ob and probe.cubemap == cubemap
                            continue
                    if ob.visible and ob.data
                        @draw_mesh ob, ob.world_matrix, 0, null, world2cam, proj
            if scene.world_material?
                @draw_background(scene, world2cam, @_cam2world, proj)
            if @do_log
                @do_log = false
                console.log @debug_uniform_logging_get_log()

        fb.unbind_cubemap cubemap
        fb.disable()
        cubemap.generate_mipmap()
        @use_frustum_culling = use_frustum_culling
        return


    # @nodoc
    # See myou.screenshot_as_blob()
    screenshot_as_blob: (width, height, options={}) ->
        ## Use this to test:
        # $myou.screenshot_as_blob(1024, 768).then((blob)=>{
        #   document.body.innerHTML=`<img src="${URL.createObjectURL(blob)}">`})
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
            size = [next_POT(width*supersampling),
                    next_POT(height*supersampling)]
            x_ratio_render = width*supersampling/size[0]
            y_ratio_render = height*supersampling/size[1]
            render_buffer = new @context.ByteFramebuffer {size, use_depth: true}
            size = [next_POT(width), next_POT(height)]
            x_ratio_output = width/size[0]
            y_ratio_output = height/size[1]
            console.log(x_ratio_render,
                y_ratio_render,
                x_ratio_output,
                y_ratio_output)
            out_buffer = new @context.ByteFramebuffer {size, use_depth: false}
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
            scr = @context.canvas_screen
            old_w = scr.width
            old_h = scr.height
            old_fb = scr.framebuffer
            scr.width = size[0]
            scr.height = size[1]
            scr.framebuffer = render_buffer
            restore_vp = []
            for v in scr.viewports
                {rect} = v
                restore_vp.push {v, rect}
                v.rect = [rect[0]*x_ratio_render, rect[1]*y_ratio_render,
                          rect[2]*x_ratio_render, rect[3]*y_ratio_render]
                v.recalc_aspect()
            # render
            @draw_all()
            # restore viewports
            scr.width = old_w
            scr.height = old_h
            scr.framebuffer = old_fb
            for {v, rect} in restore_vp
                v.rect = rect
                v.recalc_aspect()
            # resize/flip
            # sets the current_size_x/y
            render_buffer.enable [0,0,width*supersampling,height*supersampling]
            out_buffer.enable [0,0,width,height]
            render_buffer.draw_with_filter @filters.flip
            # get pixels, draw onto canvas, conver to blob
            {gl} = @
            gl.readPixels 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array(image_data.data.buffer)
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
        scr = @context.canvas_screen
        size = [next_POT(scr.width), next_POT(scr.height)]
        x_ratio_render = scr.width/size[0]
        y_ratio_render = scr.height/size[1]
        render_buffer = new @context.ByteFramebuffer {size, use_depth: true}
        old_w = scr.width
        old_h = scr.height
        old_fb = scr.framebuffer
        scr.width = size[0]
        scr.height = size[1]
        scr.framebuffer = render_buffer
        restore_vp = []
        for v in scr.viewports
            {rect} = v
            restore_vp.push {v, rect}
            v.rect = [rect[0]*x_ratio_render, rect[1]*y_ratio_render,
                      rect[2]*x_ratio_render, rect[3]*y_ratio_render]
            v.recalc_aspect()
        # render
        # TODO: scissor to requested area
        @draw_all()
        # restore viewports
        scr.width = old_w
        scr.height = old_h
        scr.framebuffer = old_fb
        for {v, rect} in restore_vp
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
            gl[p] = do (p) -> (l,v)->
                if not v.byteLength?
                    throw Error "wrong type"
                return gl["_"+p](l,v)

        for p in ['uniformMatrix3fv', 'uniformMatrix4fv']
            gl['_'+p] = gl[p]
            gl[p] = do (p) -> (l,t,v)->
                if v.byteLength?
                    throw Error "wrong type"
                return gl["_"+p](l,t,v)
        return

    # @nodoc
    # This function makes sure that all vectors/matrices are typed arrays
    debug_uniform_nan: ()->
        gl = @gl
        for p in ['uniform1f', 'uniform2f', 'uniform3f', 'uniform4f']
            gl['_'+p] = gl[p]
            gl[p] = do (p) -> (l,v...)->
                for i in v
                    if not i? or i!=i
                        debugger
                return gl["_"+p](l,v...)

        for p in ['uniformMatrix3fv', 'uniformMatrix4fv']
            gl['_'+p] = gl[p]
            gl[p] = do (p) -> (l,t,v...)->
                for i in v
                    if not i? or i!=i
                        debugger
                return gl["_"+p](l,t,v...)
        return

    # @nodoc
    debug_break_on_any_gl_error: ->
        gl = @gl
        if @breaking_on_any_gl_error
            return
        @breaking_on_any_gl_error = true
        for k,v of gl when typeof v == 'function' and k != 'getError'
            gl['_'+k] = gl[k]
            gl[k] = do (k, gl) -> (args...)->
                r = gl["_"+k](args...)
                if gl.getError()
                    debugger
                return r
        return

    debug_mesh_render_time: ->
        if not @_orig_draw_mesh?
            @_orig_draw_mesh = @draw_mesh
            render_tick = -1
            @draw_mesh = (ob, args...) ->
                if render_tick != @render_tick
                    render_tick = @render_tick
                    @draw_times = []
                t1 = performance.now()
                @_orig_draw_mesh ob, args...
                t2 = performance.now()
                @draw_times.push ob: ob.name, time: t2-t1


    # @nodoc
    # This method allows to compare performance between few objects
    # and many object with similar total poly count.
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

CUBEMAP_DIRECTIONS = [{x:1.0, y:0.0, z:0.0},{x:-1.0, y:0.0, z:0.0},
    {x:0.0, y:1.0, z:0.0}, {x:0.0, y:-1.0, z:0.0},
    {x:0.0, y:0.0, z:1.0},{x:0.0, y:0.0, z:-1.0}]
CUBEMAP_UP_VECTORS = [{x:0.0, y:-1.0, z:0.0},{x:0.0, y:-1.0, z:0.0},
    {x:0.0, y:0.0, z:1.0},{x:0.0, y:0.0, z:-1.0},
    {x:0.0, y:-1.0, z:0.0},{x:0.0, y:-1.0, z:0.0}]

# @nodoc
sort_by_mat_id = (a,b) ->
    id_a = (a.materials[0]?.id) + a._flip<<30 # boolean coerced into 1 or 0
    id_b = (b.materials[0]?.id) + b._flip<<30
    id_a - id_b

module.exports = {
    RenderManager,
    VECTOR_MINUS_Z
}
