{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{GameObject} = require './gameobject.coffee'
{Material} = require './material.coffee'
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
#   The following attributes are used only when loading to populate attrib_pointers.
#
#   Elements: an array specifying the element order and name if it applies:
#   (first element of each list is the type (normal, uv, shape, bone)
#   [['normal'],
#    ['uv', 'UV1'],
#    ['shape', 'my_shape'],
#    ['bone']
#   ]
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
GL_BYTE = 0x1400
GL_UNSIGNED_BYTE = 0x1401
GL_SHORT = 0x1402
GL_UNSIGNED_SHORT = 0x1403
GL_INT = 0x1404
GL_UNSIGNED_INT = 0x1405
GL_FLOAT = 0x1406

# Global list of MeshDatas identified by hash
# (TODO put in RenderManager)
mesh_datas = {}

class MeshData
    constructor: (@context)->
        @type = 'MESH'
        @users = []
        @hash = ''
        @varray = null  # Vertex array with all submeshes
        @iarray = null  # Submesh-based indices
        # One of each per material
        @vertex_buffers = []
        @index_buffers = []
        @num_indices = []
        # List of (lists of attribute pointers), one per material
        # pointer = [location, number of components, type, offset]
        @attrib_pointers = []
        @attrib_bitmasks = []  # an int for each submesh
        @stride = 0
        @draw_method = GL_TRIANGLES
        @phy_convex_hull = null
        @phy_mesh = null

    reupload: ->
        if @users[0]
            new_data = @users[0].load_from_va_ia @varray, @iarray
            for u in @users
                u.data.remove u
                u.data = new_data
                u.configure_materials()
        return

    remove: (ob)->
        @users.remove ob.data
        if @users.length==0
            delete @context.meshes[@hash]


class Mesh extends GameObject

    constructor: (@context)->
        super @context
        @type = 'MESH'
        @data = null
        @materials = []
        @material_names = []
        @passes = [0]
        @shapes = {} # {'shape_name', influence}
        @_shape_names = []
        @armature = null
        @sort_dot = 0
        #TODO move to MeshData
        @custom_uniform_values = []
        @active_mesh_index = 0
        @altmeshes = []
        @last_lod_object = null
        @culled_in_last_frame = false

        # Populated when loading, used in load_from_va_ia()
        # Not used on render.
        @hash = ''
        @elements = []
        @offsets = []
        @stride = 0
        @mesh_id = 0
        @all_f = false

        @mesh_name = '' # only for debug purposes

    load_from_arraybuffer: (data)->
        # ASSUMING LITTLE ENDIAN
        vlen = @offsets[@offsets.length-2] # 4 byte units
        ilen = @offsets[@offsets.length-1] # 2 byte units
        offset = @pack_offset or 0
        va = new Float32Array data, offset, vlen
        ia = new Uint16Array data, offset + vlen * 4, ilen
        @context.main_loop.add_frame_callback =>
            @load_from_va_ia va, ia


    load_from_lists: (vertices, indices)->
        @offsets = [0, 0, vertices.length, indices.length]
        @load_from_va_ia new Float32Array(vertices), new Uint16Array(indices)

    load_from_va_ia: (va, ia)->
        if @data?
            @data.remove @
        data = @data = mesh_datas[@hash] = new MeshData @context
        data.hash = @hash
        data.users.push @
        data.varray = va
        data.iarray = ia
        # If mesh has a mesh_id, we'll assign it to the 4th byte of the normal (usually 0)
        if @mesh_id
            mesh_id = @mesh_id|0
            bytes = new Uint8Array va.buffer, va.byteOffset, va.byteLength
            if bytes[15] != mesh_id
                i=0
                while i < bytes.length
                    bytes[i] = mesh_id
                    i+=@stride
        # Upload mesh
        offsets = @offsets
        num_submeshes = (offsets.length/2) - 1
        gl = @context.render_manager.gl
        for i in [0...num_submeshes]
            i2 = i*2
            vb = gl.createBuffer()
            gl.bindBuffer gl.ARRAY_BUFFER, vb
            gl.bufferData gl.ARRAY_BUFFER, va.subarray(offsets[i2], offsets[i2+2]), gl.STATIC_DRAW
            data.vertex_buffers.push vb
            ib = gl.createBuffer()
            if offsets[i2+1] != offsets[i2+3]
                gl.bindBuffer gl.ELEMENT_ARRAY_BUFFER, ib
                gl.bufferData gl.ELEMENT_ARRAY_BUFFER, ia.subarray(offsets[i2+1], offsets[i2+3]), gl.STATIC_DRAW
            # else
                # If it's empty it means it will assigned from the parent mesh
                # pass #TODO
            # for m in @altmeshes
            #     # TODO: set the ib of the altmeshes without it
            #     pass #TODO
            data.index_buffers.push ib
            data.num_indices.push offsets[i2+3] - offsets[i2+1]
        data.stride = @stride
        if @scene
            # If it has materials (some mesh was already loaded), configure again
            if @materials.length !=0
                @configure_materials()

        #@phy_mesh = null # only necessary for live server, otherwise it may cause bugs
        if @scene and @scene.world
            @instance_physics()
        @context.main_loop?.reset_timeout()
        return data

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
            gl.bufferData gl.ELEMENT_ARRAY_BUFFER, ia.subarray(offsets[i2+1], offsets[i2+3]), gl.STATIC_DRAW
        return

    configure_materials: (materials=[])->

        if materials.length < @material_names.length
            # If frame is too long, it was compiling other materials, exit early.
            # console.log render_manager.frame_start, performance.now()
            scene = @scene
            for mname in @material_names
                if (@context.render_manager.frame_start + 33) < performance.now() or @context.render_manager.compiled_shaders_this_frame > 1
                    break
                if mname == 'UNDEFINED_MATERIAL'
                    console.warn 'Mesh '+@name+' has undefined material'
                data = scene.unloaded_material_data[mname]
                if data
                    # time = performance.now()
                    scene.materials[mname] = new Material @context, data, scene
                    # @context.log.push 'material loaded: ' + mname + ' in ' +( performance.now() - time)*0.001
                    delete scene.unloaded_material_data[mname]
                mat = scene.materials[mname]
                if mat
                    materials.push mat
                else
                    # Abort
                    break
        else if materials.length > @material_names.length
            @material_names = for m in materials then m.name

        for m in materials
            m.users.remove @
            m.users.push @
            # TODO: remove before re-assignment


        @materials = materials

        @_shape_names = []
        o_shapes = []
        o_shapes_b = []
        o_tangent = []
        o_particles = []
        o_uvs = []
        o_uvs_s = []
        o_colors = []
        o_weights = 0
        o_b_indices = 0
        stride = 3 * 4  # 4 floats * 4 bytes per float
        weights6 = false
        for e in @elements
            etype = e[0]
            if etype == 'normal'
                stride += if @all_f then  3*4  else 4
            else if etype == 'shape'
                o_shapes.push stride
                @shapes[e[1]] = 0
                @_shape_names.push e[1]
                stride += 4 * 4
            else if etype == 'shape_b'
                o_shapes_b.push stride
                @shapes[e[1]] = 0
                @_shape_names.push e[1]
                stride += 2 * 4
            else if etype == 'tangent'
                o_tangent.push stride
                stride += if @all_f then  4*4  else 4
            else if etype == 'particles'
                for i in [0...e[1]]
                    o_particles.push stride
                    stride += 3 * 4
            else if etype == 'uv'
                o_uvs.push [e[1], stride]
                stride += 2 * 4
            else if etype == 'uv_s'
                o_uvs_s.push [e[1], stride]
                stride += 2 * 2
            else if etype == 'color'
                o_colors.push [e[1], stride]
                stride += 4
            else if etype == 'weights'
                @armature = @parent
                o_weights = stride
                stride += 4 * 4
                o_b_indices = stride
                stride += if @all_f then  4*4  else 4  # 4 byte indices
            else if etype == 'weights6' and not @parent_bone
                weights6 = true
                @armature = @parent
                o_weights = stride
                stride += 4 * 4
                o_weights2 = stride
                stride += 2 * 4
                o_b_indices = stride
                stride += if @all_f then  4*4  else 4  # 4 byte indices
                o_b_indices2 = stride
                stride += if @all_f then  4*4  else 4  # 4 byte indices
            else
                console.log "Unknown element" + etype
        # Special case of no named UV layer in texture
        # (The first layer can be used named and unnamed at the same time)
        # TODO: active layer instead of first?
        if o_uvs.length
            o_uvs.push ['0', o_uvs[0][1]]

        if o_colors.length
            o_colors.push ['0', o_colors[0][1]]

        {attrib_pointers} = @data
        {attrib_bitmasks} = @data
        mi = 0
        for mat,mat_idx in materials
            # vertexAttribPointers:
            # [location, number of components, type, offset]
            attribs = [[mat.a_vertex, 3, GL_FLOAT, 0]]

            a_normal = mat.attrib_locs["vnormal"]
            gl_float_byte = if @all_f then GL_FLOAT else GL_BYTE
            gl_float_unsigned_byte = if @all_f then GL_FLOAT else GL_UNSIGNED_BYTE
            if a_normal != -1
                attribs.push [a_normal, 3, gl_float_byte, 12]

            i = 0
            for o in o_shapes
                attribs.push [mat.attrib_locs["shape"+i], 3, GL_FLOAT, o]
                attribs.push [mat.attrib_locs["shapenor"+i], 3, GL_BYTE, o+12]
                i += 1
            for o in o_shapes_b
                attribs.push [mat.attrib_locs["shape"+i], 3, GL_BYTE, o]
                attribs.push [mat.attrib_locs["shapenor"+i], 3, GL_BYTE, o+4]
                i += 1

            if o_tangent.length and mat.attrib_locs["tangent"]
                attribs.push [mat.attrib_locs["tangent"], 4, gl_float_byte, o_tangent]

            i = 0
            for o in o_particles
                attribs.push [mat.attrib_locs["particle"+i], 3, GL_FLOAT, o]
                i += 1

            for uv in o_uvs
                # uv = ['shape_name', offset in bytes]
                varname = mat.uv_layer_attribs[uv[0]]
                if varname
                    attribs.push [mat.attrib_locs[varname], 2, GL_FLOAT, uv[1]]

            for uv in o_uvs_s
                varname = mat.uv_layer_attribs[uv[0]]
                if varname
                    attribs.push [mat.attrib_locs[varname], 2, GL_UNSIGNED_SHORT, uv[1]]

            for color in o_colors
                varname = mat.color_attribs[color[0]]
                if varname
                    attribs.push [mat.attrib_locs[varname], 4, GL_UNSIGNED_BYTE, color[1]]

            if @armature
                attribs.push([mat.attrib_locs['weights'], 4, GL_FLOAT, o_weights])
                if weights6
                    attribs.push([mat.attrib_locs['weights2'], 2, GL_FLOAT, o_weights2])
                attribs.push([mat.attrib_locs['b_indices'], 4, gl_float_unsigned_byte, o_b_indices])
                if weights6
                    attribs.push([mat.attrib_locs['b_indices2'], 2, gl_float_unsigned_byte, o_b_indices2])

            bitmask = 0
            for attr in reversed attribs
                if attr[0] != -1
                    bitmask |= 1<<attr[0]
                else
                    attribs.pop attribs.indexOf attr
            if not attrib_pointers[mat_idx]
                attrib_pointers.push attribs
                attrib_bitmasks.push bitmask
            else
                # We do it this way because the same data may be shared
                # between meshes with different materials
                # (we're assuming they're compatible)
                attrib_pointers[mat_idx] = attribs
                attrib_bitmasks[mat_idx] = bitmask
            mi += 1

        num_values = 0
        for m in @materials
            num_values = Math.max num_values, m.u_custom.length
        if @custom_uniform_values.length == 0
            @custom_uniform_values = cuv = []
            for i in [0...num_values]
                cuv.push null
        return true

module.exports = {Mesh}
