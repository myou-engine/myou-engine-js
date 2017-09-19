
{vec2, vec3} = require 'vmath'
tv3 = vec3.create()
tvv3 = vec3.create()
tv2 = vec2.create()

rect_from_points = (out, a, b)->
    if a.x == b.x and a.y == b.y
        return false
    else if a.x == b.x
        out.x = 1
        out.y = 0
        out.z = a.x
    else if a.y == b.y
        out.x = 0
        out.y = 1
        out.z = a.y
    else
        bax = (a.x - b.x)
        bay = (a.y - b.y)
        out.x = 1/bax
        out.y = - 1/bay
        out.z = a.y/bay - a.x/bax
    return out

rects_intersection = (out, ra, rb)->
    t = rb.x/ra.x
    y = (t * ra.z - rb.z) / (rb.y - t * ra.y)
    x = (-ra.z - ra.y * y) / ra.x
    out.x = -x
    out.y = -y
    return out

segments_intersection = (out, sa, sb)->
    # Segments (sa and sb) are defined by arrays of two points
    [sa0, sa1] = sa
    [sb0, sb1] = sb
    ra = rect_from_points tv3, sa0, sa1
    rb = rect_from_points tvv3, sb0, sb1
    if not ra? and not rb? # both are points
        if sa0.x == sb0.x and sa0.y == sb0.y #sa == sb
            out.x = sa0.x
            out.y = sa0.y
        else #sa != sb
            return false # no intersection

    else if not ra? # sa is a point
        if rb.x * sa0.x + rb.y * sa0.y + rb.z == 0 # sa in rb
            out.x = sa0.x
            out.y = sa0.y
        else
            return false
    else if not rb? # sb is a point
        if ra.x * sb0.x + ra.y * sb0.y + ra.z == 0 # sb in ra
            out.x = sb0.x
            out.y = sb0.y
        else
            return false
    else
        ma = (sa1.y - sa0.y) / (sa1.x - sa0.x)
        mb = (sb1.y - sb0.y) / (sb1.x - sb0.x)
        if ma == mb # parallel segments or cosegments
            return false
        else
            i = rects_intersection tv2, ra, rb
        if (sa1.x >= i.x >= sa0.x) or (sa1.x <= i.x <= sa0.x)
            out.x = i.x
            out.y = i.y
    return out

module.exports = {rect_from_points, rects_intersection, segments_intersection}
