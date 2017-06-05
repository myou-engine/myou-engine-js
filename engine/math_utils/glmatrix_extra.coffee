glm = require 'gl-matrix'

# http://stackoverflow.com/questions/1031005/is-there-an-algorithm-for-converting-quaternion-rotations-to-euler-angle-rotatio

threeaxisrot = (out, r11, r12, r21, r31, r32) ->
    out[0] = Math.atan2( r31, r32 )
    out[1] = Math.asin ( r21 )
    out[2] = Math.atan2( r11, r12 )

glm.quat.to_euler = (out=[0,0,0], q, order='XYZ') ->
    [x, y, z, w] = q
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

glm.quat.to_euler_XYZ = (out, q) ->
    [x, y, z, w] = q
    threeaxisrot(out, 2*(x*y + w*z),
                    w*w + x*x - y*y - z*z,
                    -2*(x*z - w*y),
                    2*(y*z + w*x),
                    w*w - x*x - y*y + z*z)
    return out

glm.quat.to_euler_XZY = (out, q) ->
    [x, y, z, w] = q
    threeaxisrot(out, -2*(x*z - w*y),
                    w*w + x*x - y*y - z*z,
                    2*(x*y + w*z),
                    -2*(y*z - w*x),
                    w*w - x*x + y*y - z*z)
    return out

glm.quat.to_euler_YXZ = (out, q) ->
    [x, y, z, w] = q
    threeaxisrot(out, -2*(x*y - w*z),
                    w*w - x*x + y*y - z*z,
                    2*(y*z + w*x),
                    -2*(x*z - w*y),
                    w*w - x*x - y*y + z*z)
    return out

glm.quat.to_euler_YZX = (out, q) ->
    [x, y, z, w] = q
    threeaxisrot(out, 2*(y*z + w*x),
                    w*w - x*x + y*y - z*z,
                    -2*(x*y - w*z),
                    2*(x*z + w*y),
                    w*w + x*x - y*y - z*z)
    return out

glm.quat.to_euler_ZXY = (out, q) ->
    [x, y, z, w] = q
    threeaxisrot(out, 2*(x*z + w*y),
                    w*w - x*x - y*y + z*z,
                    -2*(y*z - w*x),
                    2*(x*y + w*z),
                    w*w - x*x + y*y - z*z)
    return out

glm.quat.to_euler_ZYX = (out, q) ->
    [x, y, z, w] = q
    threeaxisrot(out, -2*(y*z - w*x),
                    w*w - x*x - y*y + z*z,
                    2*(x*z + w*y),
                    -2*(x*y - w*z),
                    w*w + x*x - y*y - z*z)
    return out

glm.vec3.signedAngle = (a, b, n) ->
    {scale, dot, cross, normalize, angle, create} = glm.vec3
    result = angle a, b
    c = cross create(), a, b
    if dot(n, c) < 0
        result *= -1

    return result

module.exports = glm
