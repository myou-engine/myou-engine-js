
{mat3, vec3, vec4, quat} = require 'vmath'

#Constants
Z_VECTOR = vec3.new 0,0,1

#Temporary
m3 = mat3.create()
v1 = vec3.create()
v2 = vec3.create()
q = quat.create()

# Calculates the instersection between three planes, in the same format as given
# by plane_from_norm_point.
#
# @param out [vec3] Output vector
# @param a [vec4] Plane
# @param b [vec4] Plane
# @param c [vec4] Plane
# @return [vec3] Output vector
planes_intersection = (out, a, b, c)->
    # a, b, c are plane equations as vec4
    mat3.fromColumns m3, a, b, c
    mat3.invert m3, m3
    out.x = - ((m3.m00 * a.w) + (m3.m01 * b.w) + (m3.m02 * c.w))
    out.y = - ((m3.m03 * a.w) + (m3.m04 * b.w) + (m3.m05 * c.w))
    out.z = - ((m3.m06 * a.w) + (m3.m07 * b.w) + (m3.m08 * c.w))
    return out

# Calculates a plane from a normal and a point in the plane.
# Gives the plane equation in form Ax + By + Cy + D = 0,
# where A,B,C,D is given as vec4 {x,y,z,w} respectively.
#
# @param out [vec4] Output vector
# @param n [vec3] Is the normal of the plane (NOTE: must be normalized)
# @param p [vec3] Is a point of the plane
# @return [vec4] Output vector
plane_from_norm_point = (out, n, p)->
    return vec4.set out, n.x, n.y, n.z, -(n.x*p.x+n.y*p.y+n.z*p.z)

rect_from_dir_point = (out1, out2, d, p)-> # UNTESTED
    # p is a point of the rect
    # d is the director vector of the rect, NORMALIZED
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

tmp4a = vec4.create()
tmp4b = vec4.create()
intersect_vector_plane = (out, origin, vector, plane) ->
    # out is vec3
    # origin is vec3
    # vector is vec3 NORMALIZED
    # plane is vec4
    rect_from_dir_point tmp4a, tmp4b, vector, origin
    planes_intersection out, tmp4a, tmp4b, plane

v_dist_point_to_rect = (out, p, rp, dir)->
    # p is a point
    # rp is a point of the rect
    # dir is the director vector of the rect
    vec3.cross out, vec3.sub(v2,p,rp), vec3.normalize v1, dir
    return out

project_vector_to_plane = (out, v, n)->
    #it requires normalized normal vector (n)
    l = - vec3.dot v, n
    v_proj_n = vec3.scale v1, n, l
    vec3.add out, v_proj_n, v
    return out

reflect_vector = (out, v, n)->
    l = -2*vec3.dot v, n
    v_proj_n = vec3.scale v1, n, l
    vec3.add out, v_proj_n, v
    return out

module.exports = {
    planes_intersection, plane_from_norm_point,
    rect_from_dir_point, intersect_vector_plane,
    v_dist_point_to_rect,
    project_vector_to_plane, reflect_vector
}
