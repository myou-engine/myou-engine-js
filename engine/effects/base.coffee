
class BaseEffect
    constructor: (@context) ->
        @requires_float_source = false
        @requires_float_destination = false

    on_viewport_update: (@viewport) ->
        # Called after it's added and when viewport changes size.
        # All buffers should be created here

    apply: (source, temporary, rect) ->
        # Example of passthrough effect
        return {destination: source, temporary}

    on_viewport_remove: ->
        # Remove buffers here

class FilterEffect extends BaseEffect
    constructor: (context, @filter) ->
        super context

    apply: (source, temporary, rect) ->
        destination = temporary
        @filter.apply source, destination, rect
        return {destination, temporary: source}

class CopyEffect extends FilterEffect
    constructor: (context) ->
        super context, new context.CopyFilter

module.exports = {BaseEffect, FilterEffect, CopyEffect}
