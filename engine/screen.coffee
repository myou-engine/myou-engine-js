
{Viewport} = require './viewport'
{MainFramebuffer} = require './framebuffer'

class Screen
    constructor: (@context, args...) ->
        @context.screens.push this
        @viewports = []
        @framebuffer = null
        @width = @height = @diagonal = 0
        @pixel_ratio_x = @pixel_ratio_y = 1
        @enabled = true
        @init @context, args...

    add_viewport: (camera) ->
        v = new Viewport @context, this, camera
        @viewports.push v
        return v

    resize: ->

    # Change the aspect ratio of viewports. Useful for very quick changes
    # of the size of the canvas or framebuffer, such as with a CSS animation.
    # Much cheaper than a regular resize, because it doesn't change the
    # resolution.
    resize_soft: (width, height)->
        for v in @viewports
            v.recalc_aspect(true)
        return

    pre_draw: ->

    post_draw: ->

    # From a screen (x,y) pixel position, return the viewport and the
    # (x,y) relative to that viewport. Upper left corner is (0,0)
    get_viewport_coordinates: (x, y) ->
        y = @height - y
        for viewport in @viewports by -1
            [left, bottom, width, height] = viewport.rect
            left *= @width
            width *= @width
            bottom *= @height
            height *= @height
            right = left+width
            top = bottom+height
            if left < x < right and bottom < y < top
                x -= left
                y = @height - (y - bottom)
                return {x, y, viewport}
        return {x, y, viewport: null}



class CanvasScreen extends Screen

    init: (@context) ->
        if @context.canvas_screen?
            throw Error "There's a canvas screen already"
        @context.canvas_screen = this
        @viewports = @context.viewports = []
        @canvas = @context.canvas
        @framebuffer = new MainFramebuffer @context
        @resize(@canvas.clientWidth, @canvas.clientHeight)
        {@auto_resize_to_canvas=true} = @context.options
        window.addEventListener 'resize', =>
            if not @context.vr_screen? and @auto_resize_to_canvas
                @resize_to_canvas()

    resize_to_canvas: (ratio_x=@pixel_ratio_x, ratio_y=@pixel_ratio_y) ->
        return if not @canvas?
        {clientWidth, clientHeight} = @canvas
        if clientWidth == @width and clientHeight == @height and
            ratio_x == @pixel_ratio_x and ratio_y == @pixel_ratio_y
                return
        @resize(clientWidth, clientHeight, ratio_x, ratio_y)

    # Changes the resolution of the canvas and aspect ratio of viewports.
    # It doesn't handle the final size (that's done through HTML styles).
    # usually called when the window is resized.
    resize: (width, height, @pixel_ratio_x=1, @pixel_ratio_y=1)->
        @width = width
        @height = height
        @canvas.width = @framebuffer.size_x = width * @pixel_ratio_x
        @canvas.height = @framebuffer.size_y = height * @pixel_ratio_y
        @diagonal = Math.sqrt(width*width + height*height)
        for v in @viewports
            v.recalc_aspect(false)
        return




module.exports = {Screen, CanvasScreen}
