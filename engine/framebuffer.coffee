{Filter} = require './filters.coffee'

HALF_FLOAT_OES = 0x8D61

class Framebuffer

    constructor: (@render_manager, size_x, size_y, tex_type=@render_manager.gl.FLOAT, tex_format=@render_manager.gl.RGBA) ->
        @context = @render_manager.context
        gl = @render_manager.gl
        @size_x = size_x
        @size_y = size_y
        @texture = tex = gl.createTexture()
        gl.bindTexture gl.TEXTURE_2D, tex
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE
        @tex_type = tex_type
        internal_format = @tex_format = tex_format

        if not tex_type?
            tex_type = gl.FLOAT
        if not tex_format?
            tex_format = gl.RGBA

        if tex_type == gl.FLOAT
            if not @render_manager.extensions['texture_float_linear']
                # Fall back to float_linear, then to byte
                # Note: we're assuming we need linear interpolation
                # (because we're using them for variance shadow maps)
                # but that may not be the case at some point
                if @render_manager.extensions['texture_half_float_linear']
                    tex_type = HALF_FLOAT_OES
                else
                    tex_type == gl.UNSIGNED_BYTE
            
        gl.texImage2D gl.TEXTURE_2D, 0, internal_format, size_x, size_y, 0, tex_format, tex_type, null

        @render_buffer= rb = gl.createRenderbuffer()
        gl.bindRenderbuffer gl.RENDERBUFFER, rb
        gl.renderbufferStorage gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size_x, size_y

        @framebuffer = fb = gl.createFramebuffer()
        gl.bindFramebuffer gl.FRAMEBUFFER, fb
        gl.framebufferTexture2D gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0
        gl.framebufferRenderbuffer gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb

        gl.bindTexture gl.TEXTURE_2D, null
        gl.bindRenderbuffer gl.RENDERBUFFER, null
        gl.bindFramebuffer gl.FRAMEBUFFER, null

    recreate: ()->
        if @framebuffer
            @constructor @size_x, @size_y, @tex_type, @tex_format

    enable: (rect=null)->
        if not rect?
            left = top = 0
            size_x = @size_x
            size_y = @size_y
        else
            left = rect[0]
            top = rect[1]
            size_x = rect[2]
            size_y = rect[3]
        @current_size_x = size_x
        @current_size_y = size_y
        @render_manager.gl.bindFramebuffer @render_manager.gl.FRAMEBUFFER, @framebuffer
        @render_manager.gl.viewport left, top, size_x, size_y
        ## doesn't work for limiting color clearing
        ## unless we enable preserveDrawingBuffer but may be inefficient
        #render_manager.gl.scissor(left, top, size_x, size_y)
        Framebuffer.active_rect = [left, top, size_x, size_y]

    disable: ()->
        @render_manager.gl.bindFramebuffer @render_manager.gl.FRAMEBUFFER, null

    draw_with_filter: (filter, src_rect)->
        prog = filter.use()
        gl = @render_manager.gl
        gl.uniform2f gl.getUniformLocation(prog, 'src_size'), @size_x, @size_y
        l = gl.getUniformLocation prog, 'src_rect'
        if l and l._!=-1
            gl.uniform4f l, src_rect[0], src_rect[1], src_rect[2], src_rect[3]
        l = gl.getUniformLocation prog, 'dst_rect'
        if l and l._!=-1
            gl.uniform4fv l, Framebuffer.active_rect
        #gl.uniform2fv gl.getUniformLocation(prog, 'pixel_ratio'), @pixel_ratio
        gl.bindBuffer gl.ARRAY_BUFFER, @render_manager.quad
        gl.activeTexture gl.TEXTURE0
        gl.bindTexture gl.TEXTURE_2D, @texture
        @render_manager.change_enabled_attributes 1<<filter.a_vertex
        gl.vertexAttribPointer filter.a_vertex, 3.0, gl.FLOAT, false, 0, 0
        gl.drawArrays gl.TRIANGLE_STRIP, 0, 4

    destroy: ()->
        @render_manager.gl.deleteRenderbuffer @render_buffer
        @render_manager.gl.deleteFramebuffer @framebuffer

class MainFramebuffer extends Framebuffer

    constructor: (@render_manager)->
        # sizes set in render_manager.resize()
        @framebuffer = null

module.exports = {Framebuffer, MainFramebuffer}
