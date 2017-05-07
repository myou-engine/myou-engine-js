 



srgb_to_linearrgb = (out, color) ->
    for c,i in color
        if c < 0.04045
            c = Math.max(c,0) * (1.0 / 12.92)
        else
            c = Math.pow((c + 0.055)*(1.0/1.055), 2.4)
        out[i] = c
    return out

linearrgb_to_srgb = (out, color) ->
    for c,i in color
        if c < 0.0031308
            c = Math.max(c,0) * 12.92
        else
            c = 1.055 * Math.pow(c, 1.0/2.4) - 0.055
        out[i] = c
    return out

module.exports = {srgb_to_linearrgb, linearrgb_to_srgb}
