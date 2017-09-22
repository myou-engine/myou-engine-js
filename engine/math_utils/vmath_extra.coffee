vmath = require 'vmath'

# http://stackoverflow.com/questions/1031005/is-there-an-algorithm-for-converting-quaternion-rotations-to-euler-angle-rotatio

threeaxisrot = (out, r11, r12, r21, r31, r32) ->
    out.x = Math.atan2( r31, r32 )
    out.y = Math.asin ( r21 )
    out.z = Math.atan2( r11, r12 )

vmath.quat.to_euler = (out={x: 0, y:0, z:0}, q, order='XYZ') ->
    {x, y, z, w} = q
    switch order
        when 'XYZ'
            threeaxisrot(out, 2*(x*y + w*z),
                            w*w + x*x - y*y - z*z,
                           -2*(x*z - w*y),
                            2*(y*z + w*x),
                            w*w - x*x - y*y + z*z)
        else
            throw new Error "Use to_euler_"+order+" instead."
    return out

# NOTE: It uses Blender's convention for euler rotations:
# XYZ means that to convert back to quat you must rotate Z, then Y, then X

vmath.quat.to_euler_XYZ = (out, q) ->
    {x, y, z, w} = q
    threeaxisrot(out, 2*(x*y + w*z),
                    w*w + x*x - y*y - z*z,
                    -2*(x*z - w*y),
                    2*(y*z + w*x),
                    w*w - x*x - y*y + z*z)
    return out

vmath.quat.to_euler_XZY = (out, q) ->
    {x, y, z, w} = q
    threeaxisrot(out, -2*(x*z - w*y),
                    w*w + x*x - y*y - z*z,
                    2*(x*y + w*z),
                    -2*(y*z - w*x),
                    w*w - x*x + y*y - z*z)
    return out

vmath.quat.to_euler_YXZ = (out, q) ->
    {x, y, z, w} = q
    threeaxisrot(out, -2*(x*y - w*z),
                    w*w - x*x + y*y - z*z,
                    2*(y*z + w*x),
                    -2*(x*z - w*y),
                    w*w - x*x - y*y + z*z)
    return out

vmath.quat.to_euler_YZX = (out, q) ->
    {x, y, z, w} = q
    threeaxisrot(out, 2*(y*z + w*x),
                    w*w - x*x + y*y - z*z,
                    -2*(x*y - w*z),
                    2*(x*z + w*y),
                    w*w + x*x - y*y - z*z)
    return out

vmath.quat.to_euler_ZXY = (out, q) ->
    {x, y, z, w} = q
    threeaxisrot(out, 2*(x*z + w*y),
                    w*w - x*x - y*y + z*z,
                    -2*(y*z - w*x),
                    2*(x*y + w*z),
                    w*w - x*x + y*y - z*z)
    return out

vmath.quat.to_euler_ZYX = (out, q) ->
    {x, y, z, w} = q
    threeaxisrot(out, -2*(y*z - w*x),
                    w*w - x*x - y*y + z*z,
                    2*(x*z + w*y),
                    -2*(x*y - w*z),
                    w*w + x*x - y*y - z*z)
    return out

vmath.vec3.signedAngle = (a, b, n) ->
    {scale, dot, cross, normalize, angle, create} = vmath.vec3
    result = angle a, b
    c = cross create(), a, b
    if dot(n, c) < 0
        result *= -1

    return result

vmath.vec3.copyArray = (out, arr) ->
    out.x = arr[0]
    out.y = arr[1]
    out.z = arr[2]
    return out

vmath.quat.copyArray = (out, arr) ->
    out.x = arr[0]
    out.y = arr[1]
    out.z = arr[2]
    out.w = arr[3]
    return out

vmath.color3.copyArray = (out, arr) ->
    out.r = arr[0]
    out.g = arr[1]
    out.b = arr[2]
    return out

vmath.color4.copyArray = (out, arr) ->
    out.r = arr[0]
    out.g = arr[1]
    out.b = arr[2]
    out.a = arr[3]
    return out

vmath.mat4.fromMat3 = (out, m) ->
    out.m00 = m.m00
    out.m01 = m.m01
    out.m02 = m.m02
    out.m03 = 0
    out.m04 = m.m03
    out.m05 = m.m04
    out.m06 = m.m05
    out.m07 = 0
    out.m08 = m.m06
    out.m09 = m.m07
    out.m10 = m.m08
    out.m11 = 0
    out.m12 = 0
    out.m13 = 0
    out.m14 = 0
    out.m15 = 1
    return out

vmath.mat4.copyArray = (out, arr) ->
    out.m00 = arr[0]
    out.m01 = arr[1]
    out.m02 = arr[2]
    out.m03 = arr[3]
    out.m04 = arr[4]
    out.m05 = arr[5]
    out.m06 = arr[6]
    out.m07 = arr[7]
    out.m08 = arr[8]
    out.m09 = arr[9]
    out.m10 = arr[10]
    out.m11 = arr[11]
    out.m12 = arr[12]
    out.m13 = arr[13]
    out.m14 = arr[14]
    out.m15 = arr[15]
    return out

vmath.mat4.setTranslation = (out, v) ->
    out.m12 = v.x
    out.m13 = v.y
    out.m14 = v.z
    return out

vmath.mat4.fromVec4Columns = (out, a, b, c, d) ->
    out.m00 = a.x
    out.m01 = a.y
    out.m02 = a.z
    out.m03 = a.w
    out.m04 = b.x
    out.m05 = b.y
    out.m06 = b.z
    out.m07 = b.w
    out.m08 = c.x
    out.m09 = c.y
    out.m10 = c.z
    out.m11 = c.w
    out.m12 = d.x
    out.m13 = d.y
    out.m14 = d.z
    out.m15 = d.w
    return out

vmath.mat3.fromColumns = (out, a, b, c) ->
    out.m00 = a.x
    out.m01 = a.y
    out.m02 = a.z
    out.m03 = b.x
    out.m04 = b.y
    out.m05 = b.z
    out.m06 = c.x
    out.m07 = c.y
    out.m08 = c.z
    return out

vmath.quat.setAxisAngle = (out, axis, rad) ->
  rad = rad * 0.5
  s = Math.sin(rad)
  out.x = s * axis.x
  out.y = s * axis.y
  out.z = s * axis.z
  out.w = Math.cos(rad)
  return out

# export function getAxisAngle(out_axis, q) {


module.exports = vmath