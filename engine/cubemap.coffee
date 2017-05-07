 

# TODO: Inherit from abstract texture class?
class Cubemap
    constructor: (@context, options={}) ->
        {gl} = @context.render_manager
        {
            @size=128
            @type=gl.UNSIGNED_BYTE
            @internal_format=gl.RGBA
            @format=gl.RGBA
            @use_filter=true
            @use_mipmap=true
        } = options
        @gl_target = 34067 # gl.TEXTURE_CUBE_MAP
        @gl_tex = null
        @loaded = false
        @instance()

    instance: (data=null) ->
        {gl} = @context.render_manager
        @gl_tex = gl.createTexture()
        gl.bindTexture gl.TEXTURE_CUBE_MAP, @gl_tex
        @set_data()
        if @use_filter
            min_filter = mag_filter = gl.LINEAR
            if @use_mipmap
                min_filter = gl.LINEAR_MIPMAP_NEAREST
        else
            min_filter = mag_filter = gl.NEAREST
            if @use_mipmap
                min_filter = gl.NEAREST_MIPMAP_NEAREST
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, min_filter)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, mag_filter)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        @loaded = true
        return @

    set_data: (data=[null,null,null,null,null,null]) ->
        {gl} = @context.render_manager
        i = gl.TEXTURE_CUBE_MAP_POSITIVE_X
        gl.texImage2D(i++, 0, @internal_format, @size, @size, 0, @format, @type, data[0])
        gl.texImage2D(i++, 0, @internal_format, @size, @size, 0, @format, @type, data[1])
        gl.texImage2D(i++, 0, @internal_format, @size, @size, 0, @format, @type, data[2])
        gl.texImage2D(i++, 0, @internal_format, @size, @size, 0, @format, @type, data[3])
        gl.texImage2D(i++, 0, @internal_format, @size, @size, 0, @format, @type, data[4])
        gl.texImage2D(i++, 0, @internal_format, @size, @size, 0, @format, @type, data[5])
        return @

    fill_color: (color) ->
        [r, g, b, a=1] = color
        r = Math.min(Math.max(0,r*255),255)|0
        g = Math.min(Math.max(0,g*255),255)|0
        b = Math.min(Math.max(0,b*255),255)|0
        a = Math.min(Math.max(0,a*255),255)|0
        pixels = new Uint8Array(@size*@size*4)
        for i in [0...pixels.length] by 4
            pixels[i] = r
            pixels[i+1] = g
            pixels[i+2] = b
            pixels[i+3] = a
        @set_data [pixels, pixels, pixels, pixels, pixels, pixels]
        @bind_and_generate_mipmap()

    bind: ->
        {gl} = @context.render_manager
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, @gl_tex)

    bind_and_generate_mipmap: ->
        {gl} = @context.render_manager
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, @gl_tex)
        gl.generateMipmap gl.TEXTURE_CUBE_MAP

module.exports = {Cubemap}
