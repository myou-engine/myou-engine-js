vmath = require 'vmath'
# TODO: Export or remove these globals

cubic_bezier = (t, p0, p1, p2, p3)->
    t2 = t * t
    t3 = t2 * t

    c0 = p0
    c1 = -3.0 * p0 + 3.0 * p1
    c2 = 3.0 * p0 - 6.0 * p1 + 3.0 * p2
    c3 = -p0 + 3.0 * p1 - 3.0 * p2 + p3

    return c0 + t * c1 + t2 * c2 + t3 * c3

wave = (a, b, d, t)->
    # https://www.desmos.com/calculator/gou6pxz4ie
    result = 0.5 * ( (b - a) * Math.sin(Math.PI*t/d - Math.PI*0.5) + b + a )

ease_in_out = (a, b, d=1, t)->
    if t <= 0
        result = a
    else if 0 < t < d
        result = wave a, b, d, t
    else
        result = b
    return result

wave = (a, b, d, t)->
    result = 0.5 * ( (b - a) * Math.sin(Math.PI*t/d - Math.PI*0.5) + b + a )

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

module.exports = {cubic_bezier, next_POT, previous_POT, nearest_POT, ease_in_out, wave}
