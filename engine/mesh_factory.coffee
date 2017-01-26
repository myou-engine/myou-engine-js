
{Mesh} = require './mesh.coffee'

class MeshFactory
    constructor: (@context) ->

    make_sphere: (options) ->
        {radius, segments=32, rings=16, flip_normals=false} = options
        segment_angle = Math.PI*2/segments
        ring_angle = Math.PI/rings
        segment_frac = 1/segments
        rings_frac = 1/rings
        vrings = rings + 1 # rings of vertices
        normal_scale = 127
        [a,b,c] = [0,1,2] # face winding order
        if flip_normals
            normal_scale = -127
            [a,b,c] = [2,1,0]
        # 6 floats per vertex (3 for position, 1 for normal, 2 for uv)
        # +1 line of segments because of UVs
        stride = 6
        verts = new Float32Array (segments+1)*vrings*stride
        verts_bytes = new Int8Array verts.buffer
        # Each cap is made of triangles instead of quads
        # so the count is the same as if it's only one cap made of quads
        indices = new Uint16Array segments*(vrings-1)*2*3
        i = 0
        ib = 3*4 # offset of the normal attribute in bytes
        for x in [0...(segments+1)]
            ssin = Math.sin x*segment_angle
            scos = Math.cos x*segment_angle
            for y in [0...vrings]
                rsin = Math.sin y*ring_angle
                cx = ssin * rsin
                cy = scos * rsin
                cz = Math.cos y*ring_angle
                verts[i] = cx * radius
                verts[i+1] = cy * radius
                verts[i+2] = cz * radius
                verts[i+4] = x * segment_frac
                verts[i+5] = 1 - y * rings_frac
                verts_bytes[ib] = cx * normal_scale
                verts_bytes[ib+1] = cy * normal_scale
                verts_bytes[ib+2] = cz * normal_scale
                i += stride
                ib += stride*4
        i = 0
        col_start = 0
        next_col = vrings
        for x in [0...segments]
            for y in [0...vrings-1]
                indices[i+a] = col_start+y
                indices[i+b] = next_col+y
                indices[i+c] = next_col+y+1
                i += 3
                indices[i+a] = next_col+y+1
                indices[i+b] = col_start+y+1
                indices[i+c] = col_start+y
                i += 3
            col_start = next_col
            next_col += vrings
        mesh = new Mesh @context
        mesh.offsets = [0, 0, verts.length, indices.length]
        mesh.stride = stride*4
        mesh.elements = [['normal'], ['uv', 'UVMap']]
        mesh.radius = radius
        mesh.load_from_va_ia(verts, indices)
        return mesh

module.exports = {MeshFactory}
