planes_intersection = (m)->
    # m is the matrix defined by 3 plane equations.

    a = [m[0], m[1], m[2],
         m[4], m[5], m[6],
         m[8], m[9], m[10]]

    inva = []
    mat3.invert inva, a
    r = [0,0,0]

    r[0] =  (inva[0] * m[3]) + (inva[1] * m[7]) + (inva[2] * m[11])
    r[1] =  (inva[3] * m[3]) + (inva[4] * m[7]) + (inva[5] * m[11])
    r[2] =  (inva[6] * m[3]) + (inva[7] * m[7]) + (inva[8] * m[11])

    return r


plane_eq = (n,p)->
    # p is a point of the plane
    # n is the normal of the plane
    return [n[0], n[1], n[2], n[0]*p[0]+n[1]*p[1]+n[2]*p[2]]

rect_eq = (v,p)-> # UNTESTED
    # p is a point of the rect
    # v is the director vector of the rect
    # the result will be 2 planes which define the rect

    p1 = [1/v[0], -1/v[1], 0, p[1]/v[1] - p[0]/v[0]]
    p2 = [1/v[1], -1/v[1], 0, p[2]/v[2] - p[1]/v[1]]

    return [p1, p2]

mid_point = (a,b) ->
    return [(a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5]

module.exports = {planes_intersection, plane_eq, rect_eq, mid_point}
