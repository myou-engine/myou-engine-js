
{mat3, vec3, vec4} = require 'gl-matrix'

m3 = mat3.create()

planes_intersection = (out, m)->
    # m is the 4x3 row-major matrix defined by 3 plane equations.
    mat3.fromMat4 m3, m
    mat3.invert m3, m3
    out[0] = (m3[0] * m[3]) + (m3[1] * m[7]) + (m3[2] * m[11])
    out[1] = (m3[3] * m[3]) + (m3[4] * m[7]) + (m3[5] * m[11])
    out[2] = (m3[6] * m[3]) + (m3[7] * m[7]) + (m3[8] * m[11])
    return out

plane_equation = (out, n, p)->
    # p is a point of the plane
    # n is the normal of the plane
    # returns a vec4
    return vec4.set out, n[0], n[1], n[2], n[0]*p[0]+n[1]*p[1]+n[2]*p[2]

rect_equation = (out, v, p)-> # UNTESTED
    # p is a point of the rect
    # v is the director vector of the rect
    # the result will be 2 planes which define the rect, in a
    # 4x2 row-major matrix (or first half of 4x4)
    out[0] = 1/v[0]
    out[1] = -1/v[1]
    out[2] = 0
    out[3] = p[1]/v[1] - p[0]/v[0]
    out[4] = 0
    out[5] = 1/v[1]
    out[6] = -1/v[2]
    out[7] = p[2]/v[2] - p[1]/v[1]
    return out

module.exports = {planes_intersection, plane_equation, rect_equation}
