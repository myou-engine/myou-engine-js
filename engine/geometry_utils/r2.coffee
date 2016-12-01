
{vec2, vec3} = require 'gl-matrix'
tv3 = vec3.create()
tvv3 = vec3.create()
tv2 = vec2.create()

rect_from_points = (out, a, b)->
    if a[0] == b[0] and a[1] == b[1]
        return false
    else if a[0] == b[0]
        out[0] = 1
        out[1] = 0
        out[2] = a[0]
    else if a[1] == b[1]
        out[0] = 0
        out[1] = 1
        out[2] = a[1]
    else
        bax = (a[0] - b[0])
        bay = (a[1] - b[1])
        out[0] = 1/bax
        out[1] = - 1/bay
        out[2] = a[1]/bay - a[0]/bax
    return out

rects_intersection = (out, ra, rb)->
    t = rb[0]/ra[0]
    y = (t * ra[2] - rb[2]) / (rb[1] - t * ra[1])
    x = (-ra[2] - ra[1] * y) / ra[0]
    out[0] = -x
    out[1] = -y
    return out

segments_intersection = (out, sa, sb)->
    # Segments (sa and sb) are defined by arrays of two points
    ra = rect_from_points tv3, sa[0], sa[1]
    rb = rect_from_points tvv3, sb[0], sb[1]
    if not ra? and not rb? # both are points
        if sa[0][0] == sb[0][0] and sa[0][1] == sb[0][1] #sa == sb
            out[0] = sa[0][0]
            out[1] = sa[0][1]
        else #sa != sb
            return false # no intersection

    else if not ra? # sa is a point
        if rb[0] * sa[0][0] + rb[1] * sa[0][1] + rb[2] == 0 # sa in rb
            out[0] = sa[0][0]
            out[1] = sa[0][1]
        else
            return false
    else if not rb? # sb is a point
        if ra[0] * sb[0][0] + ra[1] * sb[0][1] + ra[2] == 0 # sb in ra
            out[0] = sb[0][0]
            out[1] = sb[0][1]
        else
            return false
    else
        ma = (sa[1][1] - sa[0][1]) / (sa[1][0] - sa[0][0])
        mb = (sb[1][1] - sb[0][1]) / (sb[1][0] - sb[0][0])
        if ma == mb # parallel segments or cosegments
            return false
        else
            i = rects_intersection tv2, ra, rb
        if (sa[1][0] >= i[0] >= sa[0][0]) or (sa[1][0] <= i[0] <= sa[0][0])
            out[0] = i[0]
            out[1] = i[1]
    return out

module.exports = {rect_from_points, rects_intersection, segments_intersection}
