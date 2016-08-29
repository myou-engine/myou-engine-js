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
            throw new Error "Euler order "+order+" not supported yet."
    return out

module.exports = glm
