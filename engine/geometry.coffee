
{mat3, vec3, vec4, quat} = require 'gl-matrix'

m3 = mat3.create()
Z_VECTOR = vec3.fromValues 0,0,1
na = vec3.create()
nb = vec3.create()
q = quat.create()

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
    vec3.set na, 1,0,0
    vec3.set nb, 0,1,0
    quat.rotationTo q, Z_VECTOR, v
    vec3.transformQuat na, na, q
    vec3.transformQuat nb, nb, q
    plane_equation out, nb, p
    out[4] = out[0]
    out[5] = out[1]
    out[6] = out[2]
    out[7] = out[3]
    plane_equation out, na, p
    return out

module.exports = {planes_intersection, plane_equation, rect_equation}
