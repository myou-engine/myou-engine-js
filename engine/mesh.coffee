{mat4, vec3} = require 'vmath'
{GameObject} = require './gameobject'
{ShapeKeyModifier, ArmatureModifier} = require './vertex_modifiers'

#   Mesh format:
#
#   Vertex array:
#    it has all vertex data, interleaved with the following structure:
#
#    vertex  X Y Z N  (N = 3 normal bytes and 1 padding byte)
#   [shape1  X Y Z N]
#   [shape1  X Y Z N]
#   [...]
#   [U V] [U V] [...]
#   [colors] [...]
#
#   [bone weights A B C D
#    bone indices A B C D]
#
#   TODO: test in different devices if 4-float attributes is faster
#         (probably not), and if 4-short or 4-byte is (probably yes)
#
#   Indices: Indices relative to each submesh, concatenated together.
#
#   Elements: an array specifying the element order and name if it applies:
#   (first element of each list is the type (normal, uv, shape, bone)
#   [['normal'],
#    ['uv', 'UV1'],
#    ['shape', 'my_shape'],
#    ['bone']
#   ]
#
#   NOTE: While @elements still works, it's obsolete and we're
#         converting it to @layout and @vertex_modifiers on load.
#
#   Offsets:
#
#   [offset of first vertex subarray,
#    offset of first index subarray,
#    offset of second vertex subarray,
#    offset of second index subarray,
#    ...
#    number of vertices,
#    number of indices]

# Safari 9 doesn't have the constants in WebGLRenderingContext
GL_TRIANGLES = 4

face_sort_array = new Float64Array 4
face_sort_array32 = new Uint32Array face_sort_array.buffer
iarray_temporary = new Uint32Array 4*3

# MeshData contains all data of a mesh object that is loaded separately
# from the object itself. Available as `mesh_object.data`.
class MeshData
    constructor: (@context)->
        @type = 'MESH'
        @users = []
        @hash = ''
        @varray = null  # Vertex array with all submeshes
        @iarray = null  # Submesh-based indices
        @varray_byte = null
        # One of each per material
        @vertex_buffers = []
        @index_buffers = []
        @num_indices = []
        @stride = 0
        @offsets = [] # only used in tri mesh physics for now
        @draw_method = GL_TRIANGLES
        @phy_convex_hull = null
        @phy_mesh = null

    # @private
    # Restores GPU data after context is lost.
    reupload: (delete_buffers) ->
        if (user0 = @users[0])?
            @remove user0, delete_buffers
            new_data = user0.load_from_va_ia @varray, @iarray
            for u in @users
                u.data.remove u, delete_buffers
                u.data = new_data
        return

    # Removes the data from an object, and deletes itself
    # if there are no other objects using it.
    remove: (ob, delete_buffers=true)->
        idx = @users.indexOf ob
        while idx != -1
            @users.splice idx,1
            idx = @users.indexOf ob
        if @users.length == 0
            if delete_buffers
                gl = @context.render_manager.gl
                for buf in @vertex_buffers
                    gl.deleteBuffer buf
                for buf in @index_buffers
                    gl.deleteBuffer buf
            delete @context.mesh_datas[@hash]
        ob.data = null

    clone: ->
        d = Object.create this
        d.users = []
        if (va = d.varray)?
            d.varray = new Float32Array va
            d.varray_byte =
                new Uint8Array va.buffer, va.byteOffset, va.byteLength
        d.iarray = new Uint16Array d.iarray if d.iarray?
        d.vertex_buffers = d.vertex_buffers[...]
        d.index_buffers = d.index_buffers[...]
        d.num_indices = d.num_indices[...]
        return d




# Mesh object class.
#
# For information on using a Blender mesh go
# [here](../extra/Tutorials/Using a Blender mesh.md)
#
# To learn how to create a mesh from code go
# [here](../extra/Advanced tutorials/Creating a mesh from code.md)
class Mesh extends GameObject

    constructor: (context)->
        super context
        @type = 'MESH'
        @data = null
        @materials = []
        @material_defines = {} # TODO: Function to change these
        @passes = [0]
        @armature = null
        @uv_rect = [0, 0, 1, 1] # x, y, w, h
        @uv_right_eye_offset = [0, 0]
        @culled_in_last_frame = false
        @center = vec3.create()
        @sort_vector = vec3.create()
        @last_lod = {}

        # Populated when loading, used in load_from_va_ia()
        # Not used on render.
        @hash = ''
        @elements = [] # obsolete, now it's @layout and @vertex_modifiers
        @layout = []
        @vertex_modifiers = []
        @offsets = []
        @stride = 0
        @mesh_id = 0
        @all_f = false
        @bone_index_maps = []
        @sort_sign = -1 # 1 is front to back, -1 is back to front

        @mesh_name = '' # only for debug purposes

    # @private
    # Loads data from a freshly loaded ArrayBuffer. Used in loader.
    load_from_arraybuffer: (data, buffer_offset=0)->
        # ASSUMING LITTLE ENDIAN
        vlen = @offsets[@offsets.length-2] # 4 byte units
        ilen = @offsets[@offsets.length-1] # 2 byte units
        offset = (@pack_offset or 0) + buffer_offset
        try
            va = new Float32Array data, offset, vlen
            ia = new Uint16Array data, offset + vlen * 4, ilen
        catch e
            e = Error "Mesh #{@name} is corrupt"
            throw e
        @context.main_loop.add_frame_callback =>
            @load_from_va_ia va, ia

    # Loads mesh data from arrays or arraybuffers containing
    # vertices and indices. Automatically sets submesh offsets.
    # @param vertices [Array<number>] Raw vertex buffer data.
    # @param vertices [Array<number>] Raw indices.
    load_from_lists: (vertices, indices)->
        @offsets = [0, 0, vertices.length, indices.length]
        @load_from_va_ia new Float32Array(vertices), new Uint16Array(indices)

    # @private
    # Loads mesh from appropately typed arrays and already set offsets.
    load_from_va_ia: (va, ia)->
        @data?.remove @
        data = @data = @context.mesh_datas[@hash] = new MeshData @context
        if @properties.mesh_draw_method?
            data.draw_method = @properties.mesh_draw_method
        data.hash = @hash
        data.users.push @
        data.varray = va
        data.iarray = ia
        data.varray_byte = bytes =
            new Uint8Array va.buffer, va.byteOffset, va.byteLength
        # If mesh has a mesh_id, we'll assign it to the 4th byte of the normal
        # (usually both mesh_id and that byte are 0)
        if @mesh_id
            mesh_id = @mesh_id|0
            if bytes[15] != mesh_id
                i = 15
                while i < bytes.length
                    bytes[i] = mesh_id
                    i+=@stride
        # Upload mesh
        offsets = data.offsets = @offsets
        num_submeshes = (offsets.length/2) - 1
        gl = @context.render_manager.gl
        for i in [0...num_submeshes]
            i2 = i*2
            vb = gl.createBuffer()
            gl.bindBuffer gl.ARRAY_BUFFER, vb
            gl.bufferData gl.ARRAY_BUFFER,
                va.subarray(offsets[i2], offsets[i2+2]), gl.STATIC_DRAW
            data.vertex_buffers.push vb
            ib = gl.createBuffer()
            if offsets[i2+1] != offsets[i2+3]
                gl.bindBuffer gl.ELEMENT_ARRAY_BUFFER, ib
                gl.bufferData gl.ELEMENT_ARRAY_BUFFER,
                    ia.subarray(offsets[i2+1], offsets[i2+3]), gl.STATIC_DRAW
            # else
                # If it's empty it means it will assigned from the parent mesh
                # pass #TODO
            data.index_buffers.push ib
            data.num_indices.push offsets[i2+3] - offsets[i2+1]
        data.stride = @stride

        @context.main_loop?.reset_timeout()
        # This forces the mesh to be uploaded
        # ZERO_MATRIX = mat4.new 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1
        # @context.render_manager.draw_mesh(@, ZERO_MATRIX, -1, false)
        return data

    # Updates index arrays. Usually used after faces are sorted.
    update_iarray: ->
        if not @data
            return
        offsets = @offsets
        num_submeshes =  offsets.length/2 - 1
        ia = @data.iarray
        gl = @context.render_manager.gl
        for i in [0...num_submeshes]
            i2 = i*2
            gl.bindBuffer gl.ELEMENT_ARRAY_BUFFER, @data.index_buffers[i]
            gl.bufferData gl.ELEMENT_ARRAY_BUFFER, ia.subarray(offsets[i2+1],
                offsets[i2+3]), gl.STATIC_DRAW
        return

    # @private
    # This method ensures that layout, vertex_modifiers and _signature exist.
    # This is used and only necessary in Material for assets in the old format.
    ensure_layout_and_modifiers: ->
        if @_signature
            return

        layout = [{name: 'vertex', type: 'f', count: 3, offset: 0}]
        stride = 3 * 4  # 4 floats * 4 bytes per float

        @_shape_names = []
        shape_type = 'f'
        for e in @elements
            etype = e[0]
            switch etype
                when 'normal'
                    layout.push {name: 'vnormal', type: 'b', count: 3, \
                                offset: stride}
                    stride += 4
                when 'shape'
                    num = @_shape_names.length
                    layout.push {name: 'shape'+num, type: 'f', count: 3, \
                                offset: stride}
                    layout.push {name: 'shapenor'+num, type: 'b', count: 3, \
                                offset: stride + 12}
                    @_shape_names.push e[1]
                    shape_type = 'f'
                    stride += 4 * 4
                when 'shape_b'
                    num = @_shape_names.length
                    layout.push {name: 'shape'+num, type: 'b', count: 3, \
                                offset: stride}
                    layout.push {name: 'shapenor'+num, type: 'b', count: 3, \
                                offset: stride + 4}
                    @_shape_names.push e[1]
                    shape_type = 'b'
                    stride += 2 * 4
                when 'tangent'
                    layout.push {name: 'tangent', type: 'b', count: 4, \
                                offset: stride}
                    stride += 4
                when 'uv'
                    # NOTE: invalid characters will be replaced when
                    # this is implemented on export.
                    # The only allowed characters are [_A-Za-z0-9]
                    name = 'uv_'+e[1].replace(/[^_A-Za-z0-9]/g, '')
                    layout.push {name, type: 'f', count: 2, offset: stride}
                    stride += 2 * 4
                when 'uv_s'
                    layout.push {name: 'uv_'+e[1], type: 'H', count: 2, \
                                offset: stride}
                    #o_uvs_s.push [e[1], stride]
                    stride += 2 * 2
                when 'color'
                    name = 'vc_'+e[1].replace(/[^_A-Za-z0-9]/g, '')
                    layout.push {name, type: 'B', count: 4, offset: stride}
                    stride += 4
                when 'weights'
                    @armature = @parent
                    for {object} in @lod_objects
                        object.armature = @parent
                    layout.push {name: 'weights', type: 'f', count: 4, \
                                offset: stride}
                    stride += 4 * 4
                    layout.push {name: 'b_indices', type: 'B', count: 4, \
                                offset: stride}
                    stride += 4  # 4 byte indices
                else
                    console.log "Unknown element" + etype

        @_signature = JSON.stringify(layout) + JSON.stringify(@material_defines)
        vertex_modifiers = []
        if @_shape_names.length != 0
            # New shape keys format
            keys = {}
            for name,index in @_shape_names
                keys[name] = {value: 0, index}
            vertex_modifiers.push new ShapeKeyModifier {
                count: @_shape_names.length
                data_type: shape_type
                keys: keys
            }
        if @armature and @parent_bone_index == -1
            bone_count = 0
            for map in @bone_index_maps
                bone_count = Math.max bone_count, map.length
            if bone_count == 0
                bone_count = @armature.deform_bones.length
            vertex_modifiers.push new ArmatureModifier {
                data_type: 'f'
                bone_count: bone_count
            }
        @layout = layout
        @vertex_modifiers = vertex_modifiers.concat @vertex_modifiers
        for vm,i in @vertex_modifiers
            @_signature += "#{i}:#{vm.signature},"
        return

    # Returns a LoD version of the mesh that has enough detail for its visual
    # size.
    # @param [Viewport] Viewport
    # @param [number] min_length_px:
    #       The minimum length of the average polygon, in screen pixels
    # @param [number] render_tick
    #       Frame number, so the same frame is not calculated twice.
    get_lod_mesh: (viewport, min_length_px, render_tick) ->
        # TODO: put min_length_px and render_tick in camera?
        amesh = @
        if @lod_objects.length != 0
            {camera} = viewport
            camera = viewport.debug_camera ? camera
            # remember previous mesh and
            # avoid doing the same calculation several times
            last_lod_data = @last_lod[camera.name]
            if not last_lod_data?
                @last_lod[camera.name] = last_lod_data =
                    mesh: null
                    render_tick: -1
            previous_mesh = last_lod_data.mesh
            if last_lod_data.render_tick == render_tick
                return previous_mesh
            last_lod_data.render_tick = render_tick

            cwm = camera.world_matrix
            cam_pos = vec3.new(cwm.m12,cwm.m13,cwm.m14)
            # Approximation to nearest point to the surface:
            # We clamp the camera position to the object's bounding box
            #    we transform the point with the inverse matrix
            #    we clamp with dimensions
            #    we clamp with radius
            #    we transform back with matrix
            # that's the approximate near distance
            # TODO: Optimize
            inv = mat4.invert(mat4.create(), @world_matrix)
            if not inv? or not @bound_box
                # Return highest loaded LoD
                return @ if @data?
                for {object} in @lod_objects when object.data?
                    return object
                return @
            p = vec3.transformMat4 vec3.create(), cam_pos, inv
            p = vec3.max p, p, @bound_box[0]
            p = vec3.min p, p, @bound_box[1]

            # TODO: What was wrong with this?
#             len = vec3.len p
#             if len > @radius
#                 vec3.scale p, p, @radius/len
            vec3.transformMat4 p, p, @world_matrix

            distance_to_camera = vec3.dist p, cam_pos

            # world scale: assuming all three axes have same scale as X
            {m00, m01, m02} = @world_matrix
            world_scale = Math.sqrt m00*m00 + m01*m01 + m02*m02

            # number that converts a length to screen pixels
            poly_length_to_visual_size =
                (viewport.units_to_pixels/distance_to_camera) * world_scale

            # we'll going to find the biggest length
            # that is small enough on screen
            biggest_length = @avg_poly_length
            amesh = @

            for lod in @lod_objects by -1 # from highest to lowest
                h_ratio = 1
                if amesh == previous_mesh
                    # hysteresis: ratio of distance the mesh can go
                    # further away before popping back to a lower LoD
                    h_ratio += lod.hysteresis
                ob = lod.object
                ob_apl = ob.avg_poly_length
                visual_size_px = ob_apl * poly_length_to_visual_size * h_ratio
                if not amesh.data? or \
                        (ob_apl > biggest_length \
                        and visual_size_px < min_length_px)
                    biggest_length = ob_apl
                    amesh = ob

            last_lod_data.mesh = amesh
        return amesh

    # Returns a clone of the object
    # @option options scene [Scene] Destination scene
    # @option options recursive [bool] Whether to clone its children
    # @option options behaviours [bool] Whether to clone its behaviours
    clone: (options) ->
        clone = super options
        clone.uv_rect = @uv_rect[...]
        clone.uv_right_eye_offset = @uv_right_eye_offset[...]
        clone.last_lod = {}
        return clone

    sort_faces: (camera_position)->
        return if not @data
        BIG_ENDIAN = 0
        offsets = @offsets
        num_submeshes = (offsets.length/2) - 1
        {varray, iarray, stride} = @data
        stride >>= 2
        v = vec3.create()
        vt = vec3.create()
        # we scale this vector so we avoid dividing triangle positions by 3
        camera_position3 = vec3.clone camera_position
        m4 = mat4.clone @world_matrix
        mat4.invert m4, m4
        vec3.transformMat4 camera_position3, camera_position3, m4
        vec3.scale camera_position3, camera_position3, 3
        cp3x = camera_position3.x
        cp3y = camera_position3.y
        cp3z = camera_position3.z
        sign = @sort_sign
        # # Find out the furthest possible distance we can find, so that's 2**16
        # vec3
        for i in [0...num_submeshes]
            i2 = i<<1
            va = varray.subarray offsets[i2], offsets[i2+2]
            ia = iarray.subarray offsets[i2+1], offsets[i2+3]
            num_triangles = (ia.length*.3333333333333333)|0
            if face_sort_array.length < num_triangles
                face_sort_array = new Float64Array num_triangles
                face_sort_array32 = new Uint32Array face_sort_array.buffer
                iarray_temporary = new Uint32Array ia.length
            j2 = j3 = 0
            for j in [0...num_triangles]
                v0 = ia[j3] * stride
                v1 = ia[j3+1] * stride
                v2 = ia[j3+2] * stride
                # vec3.set v, va[v0], va[v0+1], va[v0+2]
                # vec3.set vt, va[v1], va[v1+1], va[v1+2]
                # vec3.add v, v, vt
                # vec3.set vt, va[v2], va[v2+1], va[v2+2]
                # vec3.add v, v, vt
                # sqr_dist = vec3.sqrDist v, camera_position3
                x = va[v0]
                y = va[v0+1]
                z = va[v0+2]
                x += va[v1]
                y += va[v1+1]
                z += va[v1+2]
                x += va[v2] - cp3x
                y += va[v2+1] - cp3y
                z += va[v2+2] - cp3z
                sqr_dist = x*x + y*y + z*z
                face_sort_array[j] = sqr_dist * sign
                face_sort_array32[j2+BIG_ENDIAN] = j
                j2 += 2
                j3 += 3
            face_sort_array.subarray(0, num_triangles).sort()
            iarray_temporary.set ia
            j3 = 0
            for j2 in [BIG_ENDIAN...num_triangles*2] by 2
                t = face_sort_array32[j2]
                t3 = t+(t<<1)
                ia[j3] = iarray_temporary[t3]
                ia[j3+1] = iarray_temporary[t3+1]
                ia[j3+2] = iarray_temporary[t3+2]
                j3 += 3
        @update_iarray()
        return

module.exports = {Mesh}
