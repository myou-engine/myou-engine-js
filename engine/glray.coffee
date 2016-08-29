{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{Framebuffer} = require './framebuffer.coffee'
{Material} = require './material.coffee'

# TODO: assign different group_ids to mirrored and linked meshes
# TODO: use depth buffer instead of short depth when available
# TODO: make alternate version for when depth buffers AND draw_buffers are available

gl_ray_vs = (max_distance)->
    shader =  """
precision highp float;
uniform mat4 projection_matrix;
uniform mat4 model_view_matrix;
attribute vec3 vertex;
attribute vec4 vnormal;
varying float vardepth;
varying float mesh_id;
void main(){
    vec4 pos = model_view_matrix * vec4(vertex, 1.0);
    pos.z = min(pos.z, #{max_distance.toFixed(20)});
    gl_Position = projection_matrix * pos;
    mesh_id = vnormal.w;
    vardepth = -pos.z;
}
"""
    return shader

# This fragment shader encodes the depth in 2 bytes of the color output
# and the object ID in the other 2 (group_id and mesh_id)
gl_ray_fs = (max_distance) ->
    shader = """
precision highp float;
varying float vardepth;
uniform float mesh_id;
uniform float group_id;

void main(){
    float depth = vardepth * #{(255/max_distance).toFixed(20)};
    float f = floor(depth);
    gl_FragColor = vec4(vec3(mesh_id, group_id, f) * #{1/255}, depth-f);
    //gl_FragColor = vec4(vec3(mesh_id, group_id, 0) * #{1/255}, 1);
}
"""
    return shader

next_group_id = 0
next_mesh_id = 0

asign_group_and_mesh_id = (ob)->
    if next_group_id == 256
        console.log 'ERROR: Max number of meshes exceeded'
        return
    ob.group_id = next_group_id #Math.floor(Math.random() * 256)
    ob.mesh_id = next_mesh_id #Math.floor(Math.random() * 256)

    id = ob.ob_id = (ob.group_id<<8)|ob.mesh_id
    if next_mesh_id == 255
        next_group_id += 1
        next_mesh_id = 0
    else
        next_mesh_id += 1
    return id

class GLRay
    constructor: (@context, options={}) ->
        {@debug_canvas, @width=512, @height=256,
            @max_distance=10, @render_steps=8, @wait_steps=3} = options
        @buffer = new Framebuffer(@context, {size: [@width, @height], color_type: 'UNSIGNED_BYTE', use_depth: true})
        @pixels = new Uint8Array(@width * @height * 4)
        @pixels16 = new Uint16Array(@pixels.buffer)
        @distance = 0
        @alpha_treshold = 0.5
        @step = 0
        @rounds = 0
        @mat = new Material(@context, {
            name: 'gl_ray', vertex: gl_ray_vs(@max_distance), fragment: gl_ray_fs(@max_distance)})
        @m4 = mat4.create()
        @world2cam = mat4.create()
        @world2cam_mx = mat4.create()
        @cam_pos = vec3.create()
        @cam_rot = quat.create()
        @last_cam_pos = vec3.create()
        @last_cam_rot = quat.create()
        @meshes = []
        @sorted_meshes = null
        @mesh_by_id = [] #sparse array with all meshes by group_id<<8|mesh_id
        @debug_x = 0
        @debug_y = 0
        return

    resize: (@width, @height) ->
        @pixels = new Uint8Array(@width * @height * 4)
        @pixels16 = new Uint16Array(@pixels.buffer)
        @buffer.destroy()
        @buffer = new Framebuffer(@context, {size: [@width, @height], color_type: 'UNSIGNED_BYTE', use_depth: true})
        if @debug_canvas
            @debug_canvas.width = @width
            @debug_canvas.height = @height
            @ctx = null
        @step = 0

    init: (scene, camera, add_callback=true) ->
        @add_scene(scene)
        @scene = scene
        @camera = camera
        do_step_callback = (scene, frame_duration)=>
            @do_step()
        if add_callback
            scene.post_draw_callbacks.push do_step_callback

    add_scene: (scene) ->
        for ob in scene.children
            if ob.type == 'MESH'
                id = asign_group_and_mesh_id(ob)
                @mesh_by_id[id] = ob
                if ob.altmeshes?.length
                    for alt in ob.altmeshes when alt.mesh_id?
                        id = asign_group_and_mesh_id(alt)
                        @mesh_by_id[id] = alt

    debug_xy: (x, y) ->
        x = (x*@width)|0
        y = ((1-y)*@height)|0
        @debug_x = x
        @debug_y = y

    get_byte_coords: (x, y) ->
        # same as in the function below for getting x/y in pixels
        # and then the array byte index
        x = (x*(@width-1))|0
        y = ((1-y)*(@height-1))|0
        index = (x + @width*y)<<2
        return {x,y,index}

    pick_object: (x, y) ->
        if @context._HMD
            return null
        # x/y in camera space
        xf = (x*2-1)*@inv_proj_x
        yf = (y*-2+1)*@inv_proj_y
        # x/y in pixels
        x = (x*(@width-1))|0
        y = ((1-y)*(@height-1))|0
        coord = (x + @width*y)<<2
        coord16 = coord>>1
        # mesh_id = @pixels[coord]
        # group_id = @pixels[coord+1]
        depth_h = @pixels[coord+2]
        depth_l = @pixels[coord+3]
        # id = (group_id<<8)|mesh_id
        id = @pixels16[coord16]
        depth = ((depth_h<<8)|depth_l) * @max_distance * 0.000015318627450980392 # 1/255/256
        # First round has wrong camera matrices
        if id == 65535 or depth == 0 or @rounds <= 1
            return null
        object = @mesh_by_id[id]
        if not object
            # TODO: This shouldn't happen!
            return null
        cam = object.scene.active_camera
        point = vec3.create()
        # Assuming perspective projection without shifting
        point[0] = xf*depth
        point[1] = yf*depth
        point[2] = -depth
        vec3.transformQuat(point, point, @last_cam_rot)
        vec3.add(point, point, @last_cam_pos)
        # we do this instead of just passing depth to use the current camera position
        # TODO: move this out of this function to perform it only when it's used?
        distance = vec3.distance(point, cam.position)
        # I don't know why does this happen
        if isNaN distance
            return null
        return {object, point, distance, normal: vec3.clone(point)}

    do_step: ->
        gl = @context.render_manager.gl
        {scene, camera, m4, mat, world2cam, world2cam_mx} = @
        mat.use()
        attr_loc_vertex = mat.a_vertex
        attr_loc_normal = this.mat.attrib_locs.vnormal
        @buffer.enable()
        restore_near = false

        # Clear buffer, save camera matrices, calculate meshes to render
        if @step == 0
            if @context._HMD
                return
            # # Change the far plane when it's too near
            # if @pick_object(0.5,0.5)?.distance < 0.01
            #     old_near = camera.near_plane
            #     camera.near_plane = 0.00001
            #     camera.recalculate_projection()
            #     camera.near_plane = old_near
            #     restore_near = true
            gl.clearColor(1, 1, 1, 1)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
            mat4.copy(world2cam, @context.render_manager._world2cam)
            mat4.copy(world2cam_mx, @context.render_manager._world2cam_mx)
            vec3.copy(@cam_pos, camera.position)
            quat.copy(@cam_rot, camera.rotation)
            # Assuming perspective projection and no shifting
            @inv_proj_x = camera.projection_matrix_inv[0]
            @inv_proj_y = camera.projection_matrix_inv[5]
            @meshes = for m in scene.mesh_passes[0] when m.visible and m.physics_type != 'NO_COLLISION'
                m
            for m in scene.mesh_passes[1] when m.visible and m.alpha >= @alpha_treshold and m.physics_type != 'NO_COLLISION'
                @meshes.push (m)

        gl.uniformMatrix4fv(mat.u_projection_matrix, false, camera.projection_matrix)
        if restore_near
            camera.recalculate_projection()

        # Enable vertex+normal
        @context.render_manager.change_enabled_attributes(1|2)

        # Rendering a few meshes at a time
        part = (@meshes.length / @render_steps | 0) + 1
        if @step < @render_steps
            for mesh in @meshes[@step * part ... (@step + 1) * part]
                data = mesh.last_lod_object?.data or mesh.data
                if data and data.attrib_pointers.length != 0 and not mesh.culled_in_last_frame
                    # We're doing the same render commands as the engine,
                    # except that we only set the attribute and uniforms we use
                    if mat.u_group_id? and mat.group_id != mesh.group_id
                        mat.group_id = mesh.group_id
                        gl.uniform1f(mat.u_group_id, mat.group_id)
                    if mat.u_mesh_id? and mat.mesh_id != mesh.mesh_id
                        mat.mesh_id = mesh.mesh_id
                        gl.uniform1f(mat.u_mesh_id, mat.mesh_id)
                    mesh2world = mesh.world_matrix
                    data = mesh.last_lod_object?.data or mesh.data
                    for submesh_idx in [0...data.vertex_buffers.length]
                        gl.bindBuffer(gl.ARRAY_BUFFER, data.vertex_buffers[submesh_idx])
                        # vertex attribute
                        attr = data.attrib_pointers[submesh_idx][0]
                        gl.vertexAttribPointer(attr_loc_vertex, attr[1], attr[2], false, data.stride, attr[3])
                        # vnormal attribute (necessary for mesh_id), length of attribute 4 instead of 3
                        # and type UNSIGNED_BYTE instead of BYTE
                        attr = data.attrib_pointers[submesh_idx][1]
                        gl.vertexAttribPointer(attr_loc_normal, 4, 5121, false, data.stride, 12)
                        # draw mesh
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, data.index_buffers[submesh_idx])
                        mirrors = mesh.mirrors
                        if mirrors & 1
                            mat4.multiply(m4, world2cam, mesh2world)
                            gl.uniformMatrix4fv(mat.u_model_view_matrix, false, m4)
                            # mat3.multiply(m3, world2cam3, mesh.normal_matrix)
                            # gl.uniformMatrix3fv(mat.u_normal_matrix, false, m3)
                            gl.drawElements(data.draw_method, data.num_indices[submesh_idx], 5123, 0) # gl.UNSIGNED_SHORT
                        if mirrors & 178
                            mat4.multiply(m4, world2cam_mx, mesh2world)
                            gl.uniformMatrix4fv(mat.u_model_view_matrix, false, m4)
                            # mat3.multiply(m3, world2cam3_mx, mesh.normal_matrix)
                            # gl.uniformMatrix3fv(mat.u_normal_matrix, false, m3)
                            gl.frontFace(2304) # gl.CW
                            gl.drawElements(data.draw_method, data.num_indices[submesh_idx], 5123, 0) # gl.UNSIGNED_SHORT
                            gl.frontFace(2305) # gl.CCW
        @step += 1

        # Extract pixels (some time after render is queued, to avoid stalls)
        if @step == @render_steps + @wait_steps
            # t = performance.now()
            gl.readPixels(0, 0, @width, @height, gl.RGBA, gl.UNSIGNED_BYTE, @pixels)
            # console.log((performance.now() - t).toFixed(2) + ' ms')
            @step = 0
            @rounds += 1
            vec3.copy(@last_cam_pos, @cam_pos)
            quat.copy(@last_cam_rot, @cam_rot)
            @draw_debug_canvas()
        return
    
    draw_debug_canvas: ->
        if @debug_canvas?
            if not @ctx
                @debug_canvas.width = @width
                @debug_canvas.height = @height
                @ctx = @debug_canvas.getContext('2d', {alpha: false})
                @imagedata = @ctx.createImageData(@width, @height)
            @imagedata.data.set(@pixels)
            d = @imagedata.data
            i = 3
            for y in [0...@height]
                for x in [0...@width]
                    d[i] = if x == @debug_x or y == @debug_y
                        0
                    else
                        255
                    i += 4
            @ctx.putImageData(@imagedata, 0, 0)
        return

    single_step_pick_object: (x, y) ->
        # @pixels.fill(128)
        {gl} = @context.render_manager
        @step = 0
        coords = @get_byte_coords(x, y)
        @buffer.enable()
        # TODO! TODO! Render only one pixel
        # scissor is not scissoring and readPixels is off by one!!
        # gl.scissor(coords.x, coords.y, 8, 8)
        @do_step()
        while @step != @render_steps + @wait_steps - 1
            @do_step()
        @step = 0
        @rounds += 2
        # gl.readPixels(coords.x, coords.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE,
        #     @pixels.subarray(coords.index, coords.index+4))
        gl.readPixels(0, 0, @width, @height, gl.RGBA, gl.UNSIGNED_BYTE, @pixels)
        # gl.scissor(0, 0, @width, @height)
        @debug_xy x,y
        @pick_object(x, y)

    create_debug_canvas: ->
        if @debug_canvas?
            @destroy_debug_canvas()
        @debug_canvas = document.createElement 'canvas'
        @debug_canvas.width = @width
        @debug_canvas.height = @height
        @debug_canvas.style.position = 'fixed'
        @debug_canvas.style.top = '0'
        @debug_canvas.style.left = '0'
        @debug_canvas.style.transform = 'scaleY(-1)'
        document.body.appendChild @debug_canvas
        @ctx = null

    destroy_debug_canvas: ->
        document.body.removeChild @debug_canvas
        @ctx = null

    debug_random: ->
        for i in [0...1000]
            pick = null
            while pick == null
                pick = @pick_object(Math.random(), Math.random())
        return pick
module.exports = {GLRay}
