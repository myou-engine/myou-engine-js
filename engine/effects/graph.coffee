
{vec2} = require 'vmath'
{next_POT} = require '../math_utils/math_extra'

class GraphEffect
    constructor: (@context, mix=.1) ->
        @edge = new @context.ExprFilter 2,
            "mix(step(source_coord.y, a), b, #{mix.toFixed 7})"
        @buffer = null
        @requires_float_source = true
        @requires_float_destination = true

    on_viewport_update: (@viewport) ->
        {width, height} = @viewport
        @buffer?.destroy()
        @buffer = new @context.Framebuffer {size: [width, 1]}

    apply: (source, temporary, rect) ->
        [x,y,w,h] = rect
        source.blit_to @buffer, [x, y+(h>>1), w, 1], [x, y, w, 1]
        destination = temporary
        @edge.set_buffers source
        @edge.apply @buffer, destination, rect
        return {destination, temporary: source}

    on_viewport_remove: ->
        @buffer.destroy()


module.exports = {GraphEffect}
