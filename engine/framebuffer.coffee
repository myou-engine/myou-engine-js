{Filter} = require './filters.coffee'

component_types =
    BYTE: 0x1400
    UNSIGNED_BYTE: 0x1401
    SHORT: 0x1402
    UNSIGNED_SHORT: 0x1403
    INT: 0x1404
    UNSIGNED_INT: 0x1405
    FLOAT: 0x1406
    HALF_FLOAT: 0x8D61

# Pass 'UNSIGNED_BYTE' to color_type for 8 bit per component (default is 'FLOAT')
# Pass 'UNSIGNED_SHORT' to depth_type to enable depth texture (default is null)
# TODO: Create specific classes like:
# ByteFramebuffer, FloatFramebuffer, ByteFramebufferWithDepth
# or something like that
class Framebuffer
    constructor: (@context, @options) ->
        {gl, extensions, has_float_fb_support, has_half_float_fb_support} \
            = @context.render_manager
        {
            size
            use_depth=false
            color_type='FLOAT'
            depth_type=null
        } = @options
        [@size_x, @size_y] = size
        @texture = tex = gl.createTexture()
        gl.bindTexture gl.TEXTURE_2D, tex
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE
        @tex_type = component_types[color_type]

        if @tex_type == component_types.FLOAT
            if not (extensions['texture_float_linear'] and
                    has_float_fb_support)
                # Fall back to half_float_linear, then to byte
                # Note: we're assuming we need linear interpolation
                # (because we're using them for variance shadow maps)
                # but that may not be the case at some point
                if extensions['texture_half_float_linear'] and
                        has_half_float_fb_support
                    @tex_type = component_types.HALF_FLOAT
                else
                    @tex_type == component_types.UNSIGNED_BYTE
            
        internal_format = tex_format = gl.RGBA
        gl.texImage2D gl.TEXTURE_2D, 0, internal_format, @size_x, @size_y, 0, tex_format, @tex_type, null

        @depth_texture = null
        if depth_type? and extensions.depth_texture and has_float_fb_support
            depth_tex_type = component_types[depth_type]
            @depth_texture = gl.createTexture()
            gl.bindTexture gl.TEXTURE_2D, @depth_texture
            gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST
            gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST
            gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE
            gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE
            gl.texImage2D gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, @size_x, @size_y, 0, gl.DEPTH_COMPONENT, depth_tex_type, null


        @framebuffer = fb = gl.createFramebuffer()
        gl.bindFramebuffer gl.FRAMEBUFFER, fb
        gl.framebufferTexture2D gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0
        if use_depth
            if @depth_texture
                gl.framebufferTexture2D gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, @depth_texture, 0
            else
                @render_buffer= rb = gl.createRenderbuffer()
                gl.bindRenderbuffer gl.RENDERBUFFER, rb
                gl.renderbufferStorage gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, @size_x, @size_y
                gl.framebufferRenderbuffer gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb
        
        @is_complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE

        gl.bindTexture gl.TEXTURE_2D, null
        gl.bindRenderbuffer gl.RENDERBUFFER, null
        gl.bindFramebuffer gl.FRAMEBUFFER, null

    recreate: ->
        if @framebuffer
            @constructor @context, @options

    enable: (rect=null)->
        {gl} = @context.render_manager
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
        gl.bindFramebuffer gl.FRAMEBUFFER, @framebuffer
        gl.viewport left, top, size_x, size_y
        ## doesn't work for limiting color clearing
        ## unless we enable preserveDrawingBuffer but may be inefficient
        #render_manager.gl.scissor(left, top, size_x, size_y)
        Framebuffer.active_rect = [left, top, size_x, size_y]

    disable: ->
        {gl} = @context.render_manager
        gl.bindFramebuffer gl.FRAMEBUFFER, null

    draw_with_filter: (filter, src_rect)->
        prog = filter.use()
        {gl, quad} = @context.render_manager
        gl.uniform2f gl.getUniformLocation(prog, 'src_size'), @size_x, @size_y
        l = gl.getUniformLocation prog, 'src_rect'
        if l and l._!=-1
            gl.uniform4f l, src_rect[0], src_rect[1], src_rect[2], src_rect[3]
        l = gl.getUniformLocation prog, 'dst_rect'
        if l and l._!=-1
            gl.uniform4fv l, Framebuffer.active_rect
        #gl.uniform2fv gl.getUniformLocation(prog, 'pixel_ratio'), @pixel_ratio
        gl.bindBuffer gl.ARRAY_BUFFER, quad
        gl.activeTexture gl.TEXTURE0
        gl.bindTexture gl.TEXTURE_2D, @texture
        @context.render_manager.change_enabled_attributes 1<<filter.a_vertex
        gl.vertexAttribPointer filter.a_vertex, 3.0, gl.FLOAT, false, 0, 0
        gl.drawArrays gl.TRIANGLE_STRIP, 0, 4

    destroy: ->
        {gl} = @context.render_manager
        gl.deleteRenderbuffer @render_buffer
        gl.deleteFramebuffer @framebuffer

class MainFramebuffer extends Framebuffer

    constructor: (@context)->
        # sizes set in render_manager.resize()
        @framebuffer = null

module.exports = {Framebuffer, MainFramebuffer}
