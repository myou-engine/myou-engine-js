
# Main texture class (see also {Cubemap}). It allows creating and managing
# texture images and videos in many formats and multiple sizes.
#
# The `formats` option is an object with the following format:
# - Each key is the format name in lower case:
#   png, jpeg, rgb565, dxt1, dxt5, etc1, pvrtc, atc, crunch, etc
# - The value is a list of objects, ordered from low quality
#   to high quality, with these fields:
#   {width, height, file_size, file_name, data_uri, pixels}
# - `file_name` is the file name relative to data_dir/textures/
# - `data_uri` is a "data:" URI containing the whole image
# - `pixels` is an array or typed array with the pixels in unsigned byte RGBA format.
# - `file_name`, `data_uri` or `pixels` must be present, but not more than one.
#
# Example:
#
#     {
#         png: [
#             {width: 16, height: 16, file_name: 'foo-16x16.png'},
#             {width: 256, height: 256, file_name: 'foo.png'},
#         ]
#         raw_pixels: [
#             # raw RGBA pixels
#             {width: 256, height: 256, pixels: [0,0,0,0, ...]},
#         ]
#     }
#
# @param scene [Scene]
# @option options [String] name
# @option options [Object] formats See above.
# @option options [String] wrap One of 'C', 'R' or 'M', for Clamp, Repeat or Mirrored, respectively.
# @option options [Boolean] filter Whether to enable bilinear filtering
# @option options [Boolean] use_mipmap Whether to enable mipmapping. If the loaded format doesn't have mipmaps, they will be generated.
class Texture
    constructor: (@scene, options) ->
        @type = 'TEXTURE'
        {@context} = @scene
        {
            @name
            @formats # See above
            @wrap='R' # Clamp, Repeat or Mirrored
            @filter=true # enable bilinear filtering
            @use_mipmap=true # TODO: currently not exported!
        } = options
        @gl_target = 3553 # gl.TEXTURE_2D
        @gl_tex = null
        @bound_unit = -1
        @loaded = false
        @promise = null
        # If it tries to load the same data as @promised_data,
        # it won't load it again but instead return the existing promise
        @promised_data = null
        @users = [] # materials
        # These hold the data for the current texture, and they
        # change after another texture is loaded
        @texture_type = '' # One of: image, video, buffers, compressed
        @width = @height = 0
        @image = null
        @video = null
        @buffers = []
        @offset = 0
        @gl_format = @gl_internal_format = @gl_type = 0

    # Loads a texture if it's not loaded already.
    #
    # `size_ratio` is a number between 0 and 1 to chooses which
    # texture resolution will be loaded. For example an image of one
    # megapixel, with a size_ratio of 0.1 will try to load the version
    # closest to 100k pixels.
    #
    # @option options [number] size_ratio See above.
    # @return [Promise]
    load: (options={}) ->
        {gl, extensions} = @context.render_manager
        {
            size_ratio = 1
        } = options
        # TODO: If there's a pending promise, it should be rejected or
        # delegated if possible

        base = @scene.data_dir + '/textures/'
        {raw_pixels, jpeg, png, rgb565, dxt1, dxt5, etc1, etc2,
         pvrtc, astc, mp4, ogv, ogg, webm, mov} = @formats
        image_list = jpeg or png
        # TODO!! Select format depending on browser support
        # TODO!! Or add all files as <source> inside the <video>
        video_list = mp4 or ogg or ogv or webm or mov
        # (also, if both images and videos are available,
        # should the image be shown until the video starts?)

        # Trying formats from best to worst download times
        # TODO: Refactor process of selecting and promising data
        if raw_pixels?
            if not raw_pixels.width?
                raw_pixels = @select_closest_format raw_pixels, size_ratio
            if @promised_data == raw_pixels
                return @promise
            @promised_data = raw_pixels
            @promise = new Promise (resolve, reject) =>
                {@width=0, @height=0, pixels} = raw_pixels
                if @width==0 or @height==0
                    reject "Texture #{name} has no width or height."
                buffer = pixels.buffer or (new Uint8Array(pixels)).buffer
                @texture_type = 'buffers'
                @gl_format = @gl_internal_format = gl.RGBA
                @gl_type = gl.UNSIGNED_BYTE
                @buffers = [buffer]
                @upload()
                resolve @
        else if astc? and extensions.compressed_texture_astc
            # NOTE: Assuming a single element in the list
            if @promise
                return @promise
            @promise = new Promise (resolve, reject) =>
                fetch(base+astc[0].file_name).then((data)->data.arrayBuffer()).then (buffer) =>
                    console.log "Loading astc texture #{@name}"
                    @context.main_loop.add_frame_callback =>
                        {@width, @height} = astc[0]
                        @texture_type = 'compressed'
                        @offset = 16
                        @gl_internal_format = astc[0].format_enum
                        @buffers = [buffer]
                        @use_mipmap = false
                        @upload()
                        resolve @
                .catch =>
                    @promised_data = null
                    reject()
        else if image_list?[0] #if jpeg or png
            data = @select_closest_format image_list, size_ratio
            if @promised_data == data
                return @promise
            @promised_data = data
            @promise = new Promise (resolve, reject) =>
                if getPixels?
                    type = 'image/png'
                    if jpeg
                        type = 'image/jpeg'
                    f = data.file_name+(new Error).stack.split('\n')[1]
                    # TODO Move out of here
                    if readFileForGetPixels? and not data.data_uri and base[0] != '/'
                        data.data_uri = readFileForGetPixels(base + data.file_name)
                    # get-pixels expects a file uri, an url, a data uri or a node buffer
                    getPixels data.data_uri or (base + data.file_name), type, (err, pixels) =>
                        if err?
                            return reject "Image not found: " + (data.file_name or @name)
                        @buffers = [pixels.data.buffer]
                        [@width, @height] = pixels.shape
                        @texture_type = 'buffers'
                        @gl_format = @gl_internal_format = gl.RGBA
                        @gl_type = gl.UNSIGNED_BYTE
                        # flip vertically
                        pixels = new Uint32Array(@buffers[0])
                        line = new Uint32Array(@width)
                        for i in [0...@height>>1]
                            line1 = pixels.subarray @width*i, @width*(i+1)
                            line2 = pixels.subarray @width*(@height-i-1), @width*(@height-i)
                            line.set line1
                            line1.set line2
                            line2.set line
                        @upload()
                        resolve @
                else
                    @image = new Image
                    @image.onload = =>
                        @context.main_loop.add_frame_callback =>
                            {@width, @height} = @image
                            if not @is_power_of_two()
                                @loaded = false
                                reject "Texture #{@name} has non-power-of-two size #{@width}x#{@height}"
                            @texture_type = 'image'
                            @upload()
                            resolve @
                    @image.onerror = =>
                        # TODO: Distinguish between not found, timeout and malformed?
                        @promised_data = null
                        reject "Image not found: " + (data.file_name or @name)
                    @image.src = data.data_uri or (base + data.file_name)
        else if rgb565?
            # TODO: Test this part, or remove
            data = @select_closest_format rgb565, size_ratio
            if @promised_data == data
                return @promise
            @promised_data = data
            @promise = new Promise (resolve, reject) =>
                fetch(base+data.file_name).then((data)->data.arrayBuffer()).then (buffer) =>
                    @context.main_loop.add_frame_callback =>
                        # If there's no width or height, assume it's square
                        {@width, @height} = data
                        @texture_type = 'buffers'
                        @gl_format = @gl_internal_format = gl.RGB
                        @gl_type = gl.UNSIGNED_SHORT_5_6_5
                        if not @width or not @height
                            @width = @height = Math.sqrt(buffer.byteLength>>1)
                        @buffers = [buffer]
                        @upload()
                        resolve @
                .catch reject
        else if video_list?[0]
            data = @select_closest_format video_list, size_ratio
            if @promised_data == data
                return @promise
            @promised_data = data
            @promise = new Promise (resolve, reject) =>
                @video = document.createElement 'video'
                @video.id = @name
                @video.preload = 'auto'
                @video.src = data.data_uri or (base + data.file_name)
                @video.lastTime = null
                # You can access to the video from context.video_textures
                # then you can play, pause, etc..
                @context.video_textures[@name] = @video

                # This will be executed when enough of the video data has been buffered
                # that it can be played without interruption
                @video.addEventListener 'canplaythrough', =>
                    # The video has width and height, but they're 0
                    # since it was not added to the document.
                    # So if you need that information, add it to the data
                    {@width, @height} = data
                    @texture_type = 'video'
                    if not @is_power_of_two() and (@use_mipmap or @wrap != 'C')
                        if @width and @height
                            @use_mipmap = false
                            @wrap = 'C'
                            console.warn "Video texture '#{@name}' wrap has been forced
                                to 'clamp' and disabled mipmaps because the size is not power of two."
                            console.warn "Resize it, or set it to 'clamp' and disable mipmaps to silence this warning."
                        else
                            console.warn "Video texture '#{@name}' may not work
                                correctly if the size is not power of two."
                            console.warn "Specify the size, or set to 'clamp' and disable mipmaps to silence this warning."
                    @upload()

                    # update_texture will be called on each game engine frame (in main_loop)
                    # but it only will update the texture if video.currentTime has been changed.
                    update_texture = =>
                        if @video.currentTime != @video.lastTime
                            @video.lastTime = @video.currentTime
                            @update()
                    @video.update_texture = update_texture
                    resolve @
                @video.onerror = =>
                    # TODO: Distinguish between not found, timeout and malformed?
                    reject "Video not found: " + (data.file_name or @name)
        else
            @promise = Promise.reject("Texture #{@name} has no supported formats")
        return @promise

    # @private
    # Recreates, uploads and configures texture in GPU
    upload: ->
        {gl} = @context.render_manager
        if @bound_unit != -1
            @context.render_manager.unbind_texture @
        if @gl_tex?
            gl.deleteTexture @gl_tex
        @gl_tex = gl.createTexture()
        @update()
        @configure()

    # @private
    # Updates texture data in GPU (uploads texture data)
    update: ->
        {gl} = @context.render_manager
        @loaded = true # bind_texture requires this
        @context.render_manager.bind_texture @
        switch @texture_type
            when 'buffers'
                T = Uint16Array
                if @gl_type == gl.UNSIGNED_BYTE
                    T = Uint8Array
                for buffer, i in @buffers
                    gl.texImage2D(gl.TEXTURE_2D, i, @gl_internal_format, @width>>i, @height>>i, 0,
                        @gl_format, @gl_type, new T(@buffers[0]))
                if @buffers.length == 1 and @use_mipmap
                    gl.generateMipmap gl.TEXTURE_2D
            when 'compressed'
                for buffer, i in @buffers
                    gl.compressedTexImage2D(gl.TEXTURE_2D, i, @gl_internal_format,
                        @width>>i, @height>>i, 0, new Uint8Array(@buffers[0], @offset))
                if @buffers.length == 1 and @use_mipmap
                    console.error "Compressed texture #{@name} doesn't have requested mipmaps."
            when 'image'
                gl.pixelStorei gl.UNPACK_FLIP_Y_WEBGL, true
                # TODO: Use gl.RGB when there's no alpha? Would other format be better?
                gl.texImage2D gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, @image
                if @use_mipmap
                    gl.generateMipmap gl.TEXTURE_2D
            when 'video'
                # TODO: Is this inefficient to do every frame?
                # Should UVs be inverted instead?
                gl.pixelStorei gl.UNPACK_FLIP_Y_WEBGL, true
                # TODO: Use gl.RGB?
                gl.texImage2D gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, @video
                if @use_mipmap
                    gl.generateMipmap gl.TEXTURE_2D
        return

    # Unloads all texture data that has been generated with load()
    unload: ->
        if @bound_unit != -1
            @context.render_manager.unbind_texture @
        if @gl_tex?
            @context.render_manager.gl.deleteTexture @gl_tex
        @image?.src = @video?.src = ''
        @gl_tex = null
        @loaded = false
        @texture_type = ''
        @width = @height = 0
        @image = @video = null
        @buffers = []
        @offset = 0
        @gl_format = @gl_internal_format = @gl_type = 0

    # @private
    # Sets the GL texture parameters
    configure: ->
        {gl, extensions} = @context.render_manager
        @loaded = true # bind_texture requires this
        @context.render_manager.bind_texture @
        gl_linear_nearest = if @filter then gl.LINEAR else gl.NEAREST
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl_linear_nearest
        # TODO: add mipmap options to the GUI
        if @use_mipmap
            gl_linear_nearest_mipmap = if @filter then gl.LINEAR_MIPMAP_LINEAR else gl.NEAREST_MIPMAP_NEAREST
            gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl_linear_nearest_mipmap
        else
            gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl_linear_nearest
        # TODO: detect which textures need this (mostly walls, floors...)
        # and add a global switch
        ext = extensions.texture_filter_anisotropic
        if @context.MYOU_PARAMS.anisotropic_filter and ext
            # TODO: detect max anisotropy, make configurable
            gl.texParameterf gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT or 0x84FE, 4
        wrap_const = {'C': gl.CLAMP_TO_EDGE, 'R': gl.REPEAT, 'M': gl.MIRRORED_REPEAT}[@wrap[0]]
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap_const
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap_const
        return @

    destroy: ->
        @unload()

    # Tells if both dimensions of the image are power of two.
    # @return [Boolean]
    is_power_of_two: ->
        {width, height} = @
        if not width or not height
            return false
        log2w = Math.log(width)/Math.log(2)
        log2h = Math.log(height)/Math.log(2)
        return (log2w|0) == log2w and (log2h|0) == log2h

    # @private
    # @nodoc
    select_closest_format: (format_list, ratio) ->
        highest = format_list[format_list.length-1]
        {width, height} = highest
        if ratio == 1 or not width or not height
            return highest
        target_pixels = width*height*ratio
        winner_delta = width*height
        winner = null
        for f in format_list
            delta = Math.abs(target_pixels - (f.width*f.height))
            if winner_delta > delta
                winner_delta = delta
                winner = f
        # TODO: With formats with intermediate resolutions (mipmaps),
        # choose which one of them to load
        return winner


module.exports = {Texture}
