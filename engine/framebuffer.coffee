{vec4} = require 'gl-matrix'
{Filter} = require './filters.coffee'

class FbTexture
    constructor: (@gl_tex, @gl_target) ->
        @loaded = true
        @bound_unit = -1

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

# Framebuffer class. Use it for off-screen rendering, by creating a {Viewport}
# with a framebuffer as `dest_buffer`.
# Also used internally for cubemaps, filters, post-processing effects, etc.
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
        if not @size_x or not @size_y
            throw "Invalid framebuffer size"
        @texture = new FbTexture gl.createTexture(), gl.TEXTURE_2D
        @context.render_manager.bind_texture @texture
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
            @depth_texture = new FbTexture gl.createTexture(), gl.TEXTURE_2D
            @context.render_manager.bind_texture @depth_texture
            gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST
            gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST
            gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE
            gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE
            gl.texImage2D gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, @size_x, @size_y, 0, gl.DEPTH_COMPONENT, depth_tex_type, null


        @framebuffer = fb = gl.createFramebuffer()
        gl.bindFramebuffer gl.FRAMEBUFFER, fb
        gl.framebufferTexture2D gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, @texture.gl_tex, 0
        if use_depth
            if @depth_texture
                gl.framebufferTexture2D gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, @depth_texture.gl_tex, 0
            else
                @render_buffer = rb = gl.createRenderbuffer()
                gl.bindRenderbuffer gl.RENDERBUFFER, rb
                gl.renderbufferStorage gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, @size_x, @size_y
                gl.framebufferRenderbuffer gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb

        @is_complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE

        @context.render_manager.unbind_texture @texture
        @context.render_manager.unbind_texture @depth_texture if @depth_texture?
        gl.bindRenderbuffer gl.RENDERBUFFER, null
        gl.bindFramebuffer gl.FRAMEBUFFER, null

    # @private
    # Remakes the framebuffer after a lost context
    recreate: ->
        if @framebuffer
            @constructor @context, @options

    # Sets the framebuffer as the active one for further rendering operations.
    # @param rect [Array<number>] Viewport rect in pixels: X position, Y position, width, height.
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
        @context.render_manager.unbind_texture @texture if @texture?
        @context.render_manager.unbind_texture @depth_texture if @depth_texture?
        gl.bindFramebuffer gl.FRAMEBUFFER, @framebuffer
        gl.viewport left, top, size_x, size_y
        ## doesn't work for limiting color clearing
        ## unless we enable preserveDrawingBuffer but may be inefficient
        #render_manager.gl.scissor(left, top, size_x, size_y)
        vec4.set Framebuffer.active_rect, left, top, size_x, size_y

    # Disables the buffer by setting the main screen as output.
    disable: ->
        {gl} = @context.render_manager
        gl.bindFramebuffer gl.FRAMEBUFFER, null

    draw_with_filter: (filter, src_rect)->
        prog = filter.use()
        {gl, quad} = @context.render_manager
        unit = @context.render_manager.bind_texture @texture
        gl.uniform1i gl.getUniformLocation(prog, 'source'), unit
        gl.uniform2f gl.getUniformLocation(prog, 'src_size'), @size_x, @size_y
        l = gl.getUniformLocation prog, 'src_rect'
        if l and l._!=-1
            gl.uniform4f l, src_rect[0], src_rect[1], src_rect[2], src_rect[3]
        l = gl.getUniformLocation prog, 'dst_rect'
        if l and l._!=-1
            gl.uniform4fv l, Framebuffer.active_rect
        #gl.uniform2fv gl.getUniformLocation(prog, 'pixel_ratio'), @pixel_ratio
        gl.bindBuffer gl.ARRAY_BUFFER, quad
        @context.render_manager.change_enabled_attributes filter.attrib_bitmask
        gl.vertexAttribPointer filter.attrib_pointers[0][0], 3.0, gl.FLOAT, false, 0, 0
        gl.drawArrays gl.TRIANGLE_STRIP, 0, 4

    bind_to_cubemap_side: (cubemap, side) ->
        # NOTE: It has to be enabled
        {gl} = @context.render_manager
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_CUBE_MAP_POSITIVE_X+side, cubemap.gl_tex, 0)

    unbind_cubemap: ->
        {gl} = @context.render_manager
        gl.framebufferTexture2D gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, @texture.gl_tex, 0

    get_framebuffer_status: ->
        {gl} = @context.render_manager
        switch gl.checkFramebufferStatus(gl.FRAMEBUFFER)
            when gl.FRAMEBUFFER_COMPLETE
                'COMPLETE'
            when gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
                'INCOMPLETE_ATTACHMENT'
            when gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS
                'INCOMPLETE_DIMENSIONS'
            when gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT
                'INCOMPLETE_MISSING_ATTACHMENT'

    # Deletes the buffer from GPU memory.
    destroy: ->
        {gl} = @context.render_manager
        gl.deleteTexture @texture.gl_tex if @texture?
        gl.deleteTexture @depth_texture.gl_tex if @depth_texture?
        gl.deleteRenderbuffer @render_buffer if @render_buffer?
        gl.deleteFramebuffer @framebuffer

# Screen framebuffer target. Usually instanced as `render_manager.main_fb`.
class MainFramebuffer extends Framebuffer

    constructor: (@context)->
        # sizes set in render_manager.resize()
        @texture = @depth_texture = null
        @framebuffer = null
        @is_complete = true

Framebuffer.active_rect = new vec4.create()

module.exports = {Framebuffer, MainFramebuffer}
