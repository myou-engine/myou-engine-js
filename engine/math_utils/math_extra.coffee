
# TODO: Export or remove these globals

cubic_bezier = (t, p0, p1, p2, p3)->
    t2 = t * t
    t3 = t2 * t

    c0 = p0
    c1 = -3.0 * p0 + 3.0 * p1
    c2 = 3.0 * p0 - 6.0 * p1 + 3.0 * p2
    c3 = -p0 + 3.0 * p1 - 3.0 * p2 + p3

    return c0 + t * c1 + t2 * c2 + t3 * c3

# Gives the next power of two after X if X is not power of two already
# @param x [number] input number
next_POT = (x)->
    x = Math.max(0, x-1)
    return Math.pow(2, Math.floor(Math.log(x)/Math.log(2))+1)

# Gives the previous power of two after X if X is not power of two already
# @param x [number] input number
previous_POT = (x)->
    x = Math.max(0, x)
    return Math.pow(2, Math.floor(Math.log(x)/Math.log(2)))

# Gives the nearest power of two of X
# @param x [number] input number
nearest_POT = (x) ->
    x = Math.max(0, x)
    return Math.pow(2, Math.round(Math.log(x)/Math.log(2)))

module.exports = {cubic_bezier, next_POT, nearest_POT}
