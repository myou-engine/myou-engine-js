
# Texture.formats is an object with the following format:
# * Each key is the format name in lower case:
#   png, jpeg, rgb565, dxt1, dxt5, etc1, pvrtc, atc, crunch
# * The value is a list of objects, ordered from low quality
#   to high quality, with these fields:
#   {width, height, file_size, file_name, data_uri}
#   file_name is the file name relative to data_dir/textures/
#   data_uri is a "data:" URI containing the whole image
#   file_name or data_uri must be present, but not both.
# Example:
# {
#     png: [
#         {width: 16, height: 16, file_name: 'foo-16x16.png'},
#         {width: 256, height: 256, file_name: 'foo.png'},
#     ]
# }
# Look at image.py in the exporter for more info.

class Texture
    constructor: (@context, tex_data) ->
        @type = 'TEXTURE'
        {
            @name
            @formats # See above
            @wrap='R' # Clamp, Repeat or Mirrored
            @filter=true # enable bilinear filtering
            @use_mipmap=true # TODO: currently not exported!
        } = tex_data
        @gl_tex = null
        @loaded = false
        @promise = null
        @promised_data = null
        @users = [] # materials
        @ob_user_names = [] # names of object users, TODO: temporary until #9 is fixed 
        # These hold the data for the current texture, and they
        # change after another texture is loaded
        @type = '' # One of: image, video, buffers, compressed
        @width = @height = 0
        @image = null
        @video = null
        @buffers = []
        @offset = 0
        @gl_format = @gl_internal_format = @gl_type = 0
        if not @name
            debugger

    load: ->
        # TODO: better define how we do this
        # For now we'll load the low res texture,
        # and if it was already loaded, give the promise
        # for the high res one.
        # When loading a scene, this will be called only once,
        # even when used many times.
        {gl, extensions} = @context.render_manager
        # # We're using @restore() for now, which does this for us
        # if not @gl_tex?
        #     @gl_tex = gl.createTexture()
        base = @context.MYOU_PARAMS.data_dir + '/textures/'
        {jpeg, png, rgb565, dxt1, dxt5, etc1, etc2, pvrtc, astc, mp4, ogv, ogg, webm, mov} = @formats
        image_list = jpeg or png
        # TODO!! Select format depending on browser support
        # TODO!! Or add all files as <source> inside the <video>
        video_list = mp4 or ogg or ogv or webm or mov
        # (also, if both images and videos are available,
        # should the image be shown until the video starts?)

        # Trying formats from best to worst
        if astc? and extensions.compressed_texture_astc
            # NOTE: Assuming a single element in the list
            if @promise
                return @promise
            @promise = new Promise (resolve, reject) =>
                fetch(base+astc[0].file_name).then((data)->data.arrayBuffer()).then (buffer) =>
                    console.log "Loading astc texture #{@name}"
                    @context.main_loop.add_frame_callback =>
                        {@width, @height} = astc[0]
                        @type = 'compressed'
                        @offset = 16
                        @gl_internal_format = astc[0].format_enum
                        @buffers = [buffer]
                        @use_mipmap = false
                        @restore() #TODO: use @upload and @configure instead when possible
                        resolve @
                .catch reject
        else if image_list?[0] #if jpeg or png
            if not @loaded
                data = image_list[0] # Lowest quality
            else
                data = image_list[image_list.length-1] # Highest quality
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
                        @type = 'buffers'
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
                        @restore() #TODO: use @upload and @configure instead when possible
                        resolve @
                else
                    @image = new Image
                    @image.onload = =>
                        @context.main_loop.add_frame_callback =>
                            {@width, @height} = @image
                            @type = 'image'
                            @restore() #TODO: use @upload and @configure instead when possible
                            resolve @
                    @image.onerror = =>
                        # TODO: Distinguish between not found, timeout and malformed?
                        reject "Image not found: " + (data.file_name or @name)
                    @image.src = data.data_uri or (base + data.file_name)
        else if rgb565?
            # TODO: Test this part
            # NOTE: Assuming a single element in the list
            if @promise?
                return @promise
            @promise = new Promise (resolve, reject) =>
                fetch(base+rgb565[0].file_name).then((data)->data.arrayBuffer()).then (buffer) =>
                    @context.main_loop.add_frame_callback =>
                        # If there's no width or height, assume it's square
                        {@width, @height} = rgb565[0]
                        @type = 'buffers'
                        @gl_format = @gl_internal_format = gl.RGB
                        @gl_type = gl.UNSIGNED_SHORT_5_6_5
                        if not @width or not @height
                            @width = @height = Math.sqrt(buffer.byteLength>>1)
                        @buffers = [buffer]
                        @restore() #TODO: use @upload and @configure instead when possible
                        resolve @
                .catch reject
        else if video_list?[0]
            # TODO: Will we need more than one video data?
            data = video_list[0]
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
                    @type = 'video'
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
                    @restore() #TODO: use @upload and @configure instead when possible

                    # update_texture will be called on each game engine frame (in main_loop)
                    # but it only will update the texture if video.currentTime has been changed.
                    update_texture = =>
                        if @video.currentTime != @video.lastTime
                            @video.lastTime = @video.currentTime
                            @upload()
                    @video.update_texture = update_texture
                    resolve @
                @video.onerror = =>
                    # TODO: Distinguish between not found, timeout and malformed?
                    reject "Video not found: " + (data.file_name or @name)
        else
            @promise = Promise.reject("Texture #{@name} has no supported formats")
        return @promise

    # Use this after context is lost
    restore: ->
        {gl} = @context.render_manager
        if @gl_tex?
            gl.deleteTexture @gl_tex
        @gl_tex = gl.createTexture()
        @upload()
        @configure()

    upload: ->
        {gl} = @context.render_manager
        gl.bindTexture gl.TEXTURE_2D, @gl_tex
        switch @type
            when 'buffers'
                for buffer, i in @buffers
                    gl.texImage2D(gl.TEXTURE_2D, i, @gl_internal_format, @width>>i, @height>>i, 0,
                        @gl_format, @gl_type, new Uint16Array(@buffers[0]))
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
        gl.bindTexture gl.TEXTURE_2D, null

    configure: ->
        {gl, extensions} = @context.render_manager
        gl.bindTexture gl.TEXTURE_2D, @gl_tex
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
        gl.bindTexture gl.TEXTURE_2D, null
        @loaded = true

    destroy: ->
        if @gl_tex
            @context.render_manager.gl.deleteTexture @gl_tex
        @gl_tex = null
        @loaded = false
        @promise = null
        @promised_data = null
        @type = ''
        @width = @height = 0
        @image = null
        @video = null
        @buffers = []
        @gl_format = @gl_internal_format = @gl_type = 0

    is_power_of_two: ->
        {width, height} = @
        if not width or not height
            return false
        log2w = Math.log(width)/Math.log(2)
        log2h = Math.log(height)/Math.log(2)
        return (log2w|0) == log2w and (log2h|0) == log2h

get_texture_from_path_legacy = (name, path, filter, wrap, file_size=0, context) ->
    # This assumes we already checked context.textures
    formats = {}
    is_data_uri = /^data:/.test path
    if is_data_uri
        # this is true for old exports
        extension = 'png'
    else
        extension = path.split('.').pop()
    if extension == 'crn'
        # TODO: crunch support
        path += (extension = '565')
    if extension == '565'
        formats.rgb565 = [{width: 0, height: 0, file_size, file_name: path}]
    else
        # Non crn, rgb565 or dds textures:
        extension = extension.toLowerCase().replace(/^jpg$/, 'jpeg').replace(/^og(m|v)$/, 'ogg')
        file_name = data_uri = ''
        if is_data_uri
            data_uri = path
        else
            file_name = path
        formats[extension] = [{width: 0, height: 0, file_size, file_name, data_uri}]
    tex = new Texture context, {name, formats, wrap, filter}
    context.textures[name] = tex
    return tex

module.exports = {Texture, get_texture_from_path_legacy}
