window.PI_2 = Math.PI * 2

window.closest_pow2 = (n)->
    return Math.pow(2, Math.round(Math.log(n)/Math.log(2)))

window.interpolate = (t, p0, p1, p2, p3)->
    t2 = t * t
    t3 = t2 * t

    c0 = p0
    c1 = -3.0 * p0 + 3.0 * p1
    c2 = 3.0 * p0 - 6.0 * p1 + 3.0 * p2
    c3 = -p0 + 3.0 * p1 - 3.0 * p2 + p3

    return c0 + t * c1 + t2 * c2 + t3 * c3

window.randInt = (min, max) ->
    range = max - min
    rand = Math.floor(Math.random() * (range + 1))
    return min + rand

window.clamp = (value, min, max) ->
    Math.max(min, Math.min(max, value))
