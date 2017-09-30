{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'vmath'
{cubic_bezier} = require './math_utils/math_extra'
{GameObject} = require './gameobject.coffee'

class Curve extends GameObject

    constructor: (context)->
        super context
        @type = 'CURVE'

    instance_physics: ->
        # For now, use debug mesh for drawing the curve
        # and disable physics
        # pass

    set_curves: (curves, resolution, nodes=false)->
        #The nodes could be precalculed while exporting
        @curves = curves
        @calculated_curves = []
        indices = []
        vertices = []
        n = 0
        @origins = origins = []
        for c in curves
            cn = 0
            c_indices = []
            c_vertices = []

            for i in [0...Math.floor((c.length/9) - 1)]
                i9 = i*9
                p0x = c[i9+3]
                p0y = c[i9+4]
                p0z = c[i9+5]
                p1x = c[i9+6]
                p1y = c[i9+7]
                p1z = c[i9+8]
                p2x = c[i9+9]
                p2y = c[i9+10]
                p2z = c[i9+11]
                p3x = c[i9+12]
                p3y = c[i9+13]
                p3z = c[i9+14]

                for j in [0...resolution]
                    x = cubic_bezier j/resolution, p0x, p1x, p2x, p3x
                    y = cubic_bezier j/resolution, p0y, p1y, p2y, p3y
                    z = cubic_bezier j/resolution, p0z, p1z, p2z, p3z

                    vertices.push x, y, z
                    indices.append n
                    indices.append n+1

                    #sub_curve vertices and indices
                    c_vertices.push x, y, z
                    c_indices.append cn
                    c_indices.append cn+1

                    n += 1
                    cn += 1


            c_vertices.extend [p3x, p3y, p3z]
            cva = new Float32Array c_vertices
            cia = new Uint16Array c_indices
            @calculated_curves.append {'ia':cia, 'va':cva}
            vertices.extend [p3x, p3y, p3z]
            n += 1
        va = @va = new Float32Array vertices
        ia = @ia = new Uint16Array indices
        # @phy_debug_mesh = render_manager.debug.debug_mesh_from_va_ia va, ia
        @phy_he = {x: 1, y:1, z:1}

        curve_index = 0
        for c in @calculated_curves
            if nodes
                c.nodes = nodes[curve_index]
            else
                c.nodes = @get_nodes curve_index
            c.la = @get_curve_edges_length curve_index
            c.da = @get_curve_direction_vectors curve_index
            c.curve = @
            c.length = 0
            for e in c.la
                c.length+=e
            curve_index += 1

    closest_point: (q, scale={x: 1, y:1, z:1}) ->
        # winning point
        wp = vec3.create()
        wn = vec3.create()  # normal
        ds = Infinity       # distance squared

        # temp vars
        p1 = vec3.create()
        p2 = vec3.create()
        np1 = vec3.create() # normal of plane of p1
        np2 = vec3.create()
        d1 = vec3.create() # q - p1
        d2 = vec3.create()
        p = vec3.create()

        va = @va
        ia = @ia
        for i in [0...Math.floor(ia.length * 0.5)]
            i2 = i*2
            vec3.mul p1, va.subarray(ia[i2]*3, ia[i2]*3+3), scale
            vec3.mul p2, va.subarray(ia[i2+1]*3, ia[i2+1]*3+3), scale
            # calculate planes (todo: use tangents for that)
            vec3.sub np1, p2, p1
            vec3.sub np2, p1, p2
            # dot products = squared distance to planes
            vec3.sub d1, q, p1
            vec3.sub d2, q, p2
            dp1 = vec3.dot np1, d1
            dp2 = vec3.dot np2, d2
            sum = dp1 + dp2
            # clamp (0,1) and get point
            f = max(0, min(1, dp1/sum))
            vec3.lerp p, p1, p2, f
            ds_ = vec3.sqrDist p, q
            if ds_ < ds
                ds = ds_
                vec3.copy wp, p
                vec3.sub wn, p2, p1

        vec3.normalize wn, wn
        return [wp, wn]

    get_curve_edges_length: (curve_index) ->
        scale = @scale
        curve = @calculated_curves[curve_index]
        ia = curve.ia
        va = curve.va
        l = []
        for i in [0...Math.floor(ia.length * 0.5)]
            p1 = vec3.create()
            p2 = vec3.create()
            i2 = i*2
            vec3.mul p1, va.subarray(ia[i2]*3, ia[i2]*3+3), scale
            vec3.mul p2, va.subarray(ia[i2+1]*3, ia[i2+1]*3+3), scale
            l.append vec3.dist(p1, p2)
        return new Float32Array l

    get_curve_direction_vectors: (curve_index)->
        scale = @scale
        curve = @calculated_curves[curve_index]
        ia = curve.ia
        va = curve.va
        l = []
        for i in [0...Math.floor(ia.length * 0.5)]
            p1 = vec3.create()
            p2 = vec3.create()
            i2 = i*2
            vec3.mul p1, va.subarray(ia[i2]*3, ia[i2]*3+3), scale
            vec3.mul p2, va.subarray(ia[i2+1]*3, ia[i2+1]*3+3), scale
            l=l.concat vec3.normalize(vec3.create(),vec3.sub(vec3.create(),p2, p1))
        return new Float32Array l

    get_nodes: (main_curve_index=0, precission=0.0001)->
        main_curve = @calculated_curves[main_curve_index]

        nodes = {}
        for i in [0...Math.floor(main_curve.ia.length * 0.5)]
            i2 = i*2
            main_p = main_curve.va.subarray main_curve.ia[i2]*3, main_curve.ia[i2]*3+3
            ci = 0
            for curve in @calculated_curves
                if ci != main_curve_index
                    for ii in [0...Math.floor(curve.ia.length * 0.5)]
                        ii2 = ii*2
                        p = curve.va.subarray curve.ia[ii2]*3, curve.ia[ii2]*3+3
                        d = vec3.dist main_p,p
                        if d < precission
                            if not (i in nodes)
                                nodes[i]=[[ci,ii]]
                            else
                                nodes[i].append [ci,ii]
            ci += 1

                                #nodes[node_vertex_index] = [attached_curve_index, attached_vertex_index]
        return nodes

module.exports = {Curve}
