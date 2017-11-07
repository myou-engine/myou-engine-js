
{mat3, vec3, vec4, quat} = require 'vmath'

#Constants
Z_VECTOR = vec3.new 0,0,1

#Temporary
m3 = mat3.create()
v1 = vec3.create()
v2 = vec3.create()
q = quat.create()

planes_intersection = (out, a, b, c)->
    # a, b, c are plane equations as vec4
    mat3.fromColumns m3, a, b, c
    mat3.invert m3, m3
    out.x = (m3.m00 * a.w) + (m3.m01 * b.w) + (m3.m02 * c.w)
    out.y = (m3.m03 * a.w) + (m3.m04 * b.w) + (m3.m05 * c.w)
    out.z = (m3.m06 * a.w) + (m3.m07 * b.w) + (m3.m08 * c.w)
    return out

plane_from_norm_point = (out, n, p)->
    # p is a point of the plane
    # n is the normal of the plane (NOTE: must be normalized)
    # returns a vec4
    return vec4.set out, n.x, n.y, n.z, n.x*p.x+n.y*p.y+n.z*p.z

rect_from_dir_point = (out1, out2, d, p)-> # UNTESTED
    # p is a point of the rect
    # d is the director vector of the rect
    # the result will be 2 planes which define the rect, in a
    # 4x2 row-major matrix (or first half of 4x4)
    vec3.set v1, 1,0,0
    vec3.set v2, 0,1,0
    quat.rotationTo q, Z_VECTOR, d
    vec3.transformQuat v1, v1, q
    vec3.transformQuat v2, v2, q
    plane_from_norm_point out1, v2, p
    plane_from_norm_point out2, v1, p
    return

v_dist_point_to_rect = (out, p, rp, dir)->
    # p is a point
    # rp is a point of the rect
    # dir is the director vector of the rect
    vec3.cross out, vec3.sub(v2,p,rp), vec3.normalize v1, dir
    return out

module.exports = {planes_intersection, plane_from_norm_point, rect_from_dir_point, v_dist_point_to_rect}
