
{mat3, vec3, vec4, quat} = require 'gl-matrix'

#Constants
Z_VECTOR = vec3.fromValues 0,0,1

#Temporal
m3 = mat3.create()
v1 = vec3.create()
v2 = vec3.create()
q = quat.create()

planes_intersection = (out, m)->
    # m is the 4x3 row-major matrix defined by 3 plane equations.
    mat3.fromMat4 m3, m
    mat3.invert m3, m3
    out[0] = (m3[0] * m[3]) + (m3[1] * m[7]) + (m3[2] * m[11])
    out[1] = (m3[3] * m[3]) + (m3[4] * m[7]) + (m3[5] * m[11])
    out[2] = (m3[6] * m[3]) + (m3[7] * m[7]) + (m3[8] * m[11])
    return out

plane_from_norm_point = (out, n, p)->
    # p is a point of the plane
    # n is the normal of the plane
    # returns a vec4
    return vec4.set out, n[0], n[1], n[2], n[0]*p[0]+n[1]*p[1]+n[2]*p[2]

rect_from_dir_point = (out, d, p)-> # UNTESTED
    # p is a point of the rect
    # d is the director vector of the rect
    # the result will be 2 planes which define the rect, in a
    # 4x2 row-major matrix (or first half of 4x4)
    vec3.set v1, 1,0,0
    vec3.set v2, 0,1,0
    quat.rotationTo q, Z_VECTOR, d
    vec3.transformQuat v1, v1, q
    vec3.transformQuat v2, v2, q
    plane_from_norm_point out, v2, p
    out[4] = out[0]
    out[5] = out[1]
    out[6] = out[2]
    out[7] = out[3]
    plane_from_norm_point out, v1, p
    return out

v_dist_point_to_rect = (out, p, rp, dir)->
    # p is a point
    # rp is a point of the rect
    # dir is the director vector of the rect
    vec3.cross out, vec3.sub(v2,p,rp), vec3.normalize v1, dir
    return out


module.exports = {planes_intersection, plane_from_norm_point, rect_from_dir_point, v_dist_point_to_rect}
