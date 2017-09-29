
{Viewport} = require './viewport'
{Framebuffer, MainFramebuffer} = require './framebuffer'

class Screen
    constructor: (@context, args...) ->
        @context.screens.push this
        @viewports = []
        @framebuffer = null
        @width = @height = @diagonal = 0
        @enabled = true
        @init @context, args...

    add_viewport: (camera) ->
        v = new Viewport @context, this, camera
        @viewports.push v
        return v

    resize: ->

    # Change the aspect ratio of viewports. Useful for very quick changes
    # of the size of the canvas or framebuffer, such as with a CSS animation.
    # Much cheaper than a regular resize, because it doesn't change the resolution.
    resize_soft: (width, height)->
        for v in @viewports
            v.recalc_aspect(true)
        return

    pre_draw: ->

    post_draw: ->



class CanvasScreen extends Screen

    init: (@context) ->
        if @context.canvas_screen?
            throw "There's a canvas screen already"
        @context.canvas_screen = this
        @viewports = []
        @canvas = @context.canvas
        @framebuffer = new MainFramebuffer @context
        @resize(@canvas.clientWidth, @canvas.clientHeight)
        {@auto_resize_to_canvas=true} = @context.options
        window.addEventListener 'resize', =>
            if not @context.vr_screen? and @auto_resize_to_canvas
                @resize_to_canvas()

    resize_to_canvas: ->
        @resize(@canvas.clientWidth, @canvas.clientHeight)

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
