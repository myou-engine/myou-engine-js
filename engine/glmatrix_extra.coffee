glm = require 'gl-matrix'
glm.quat.to_euler = (out=[0,0,0], quat, order='YZX') ->
    if order != 'YZX'
        throw new Error "Euler order "+order+" not supported yet."
    # It will return YZX euler. TODO: implement other orders
    x = quat[0]
    y = quat[1]
    z = quat[2]
    w = quat[3]

    test = x*y + z*w;
    if test > 0.499 # singularity at north pole
        heading = 2 * Math.atan2 x,w
        attitude = Math.PI/2
        bank = 0

    else if test < -0.499 # singularity at south pole
        heading = -2 * Math.atan2 x,w
        attitude = - Math.PI/2
        bank = 0

    else if isNaN heading
        sqx = x*x
        sqy = y*y
        sqz = z*z
        heading = Math.atan2 2*y*w - 2*x*z , 1 - 2*sqy - 2*sqz # Heading
        attitude = Math.asin 2*test  # attitude
        bank = Math.atan2 2*x*w - 2*y*z , 1 - 2*sqx - 2*sqz # bank

    out[1] = heading
    out[2] = attitude
    out[0] = bank

    return out

module.exports = glm
