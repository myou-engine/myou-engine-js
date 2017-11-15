
sh = require 'cubemap-sh'

_temp_framebuffers = {}

# Cubemap texture, currently only for rendering environment maps and probes,
# not loaded from a file yet.
#
# See {Texture} for more information.
class Cubemap
    # @nodoc
    type: 'TEXTURE'
    # @nodoc
    texture_type: 'cubemap'
    # Size of each face of the cubemap
    size: 128
    # GL texture type (default: gl.UNSIGNED_BYTE)
    gl_type: 0

    constructor: (@context, options={}) ->
        {gl} = @context.render_manager
        {
            @size=128
            @gl_type=gl.UNSIGNED_BYTE
            @gl_internal_format=gl.RGBA
            @gl_format=gl.RGBA
            @use_filter=true
            @use_mipmap=true
            @color
        } = options
        @gl_target = 34067 # gl.TEXTURE_CUBE_MAP
        @gl_tex = null
        @coefficients = (new Float32Array(3) for [0...9])
        @loaded = false
        @bound_unit = -1
        @last_used_material = null
        @is_framebuffer_active = false
        @context.all_cubemaps.push this
        @instance()


    instance: (data=null) ->
        {gl} = @context.render_manager
        @gl_tex = gl.createTexture()
        @loaded = true # bind_texture requires this
        @context.render_manager.bind_texture @
        if @color?
            @fill_color(@color)
        else
            @set_data(data or undefined)
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
        return @

    set_data: (data=[null,null,null,null,null,null]) ->
        {gl} = @context.render_manager
        i = gl.TEXTURE_CUBE_MAP_POSITIVE_X
        {gl_internal_format: ifmt, size, gl_format, gl_type} = this
        gl.texImage2D(i++, 0, ifmt, size, size, 0, gl_format, gl_type, data[0])
        gl.texImage2D(i++, 0, ifmt, size, size, 0, gl_format, gl_type, data[1])
        gl.texImage2D(i++, 0, ifmt, size, size, 0, gl_format, gl_type, data[2])
        gl.texImage2D(i++, 0, ifmt, size, size, 0, gl_format, gl_type, data[3])
        gl.texImage2D(i++, 0, ifmt, size, size, 0, gl_format, gl_type, data[4])
        gl.texImage2D(i++, 0, ifmt, size, size, 0, gl_format, gl_type, data[5])
        if @use_mipmap?
            gl.generateMipmap gl.TEXTURE_CUBE_MAP
        return @

    fill_color: (color) ->
        # NOTE: This was made for test purposes.
        # It's much better to use render_to_cubemap and clear color
        {r, g, b, a=1} = color
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

    bind: ->
        @context.render_manager.bind_texture @

    generate_mipmap: ->
        {gl} = @context.render_manager
        @context.render_manager.bind_texture @
        gl.generateMipmap gl.TEXTURE_CUBE_MAP
        return @

    # Render all cubemap faces to a framebuffer with a size of at least
    # 3*size by 2*size.
    #
    # The format is six faces in a 3*2 mosaic like this:
    #
    #       | -X -Y -Z
    #       | +X +Y +Z
    #     0,0 --------
    #
    # You can see the OpenGL cube texture convention here:
    # http://stackoverflow.com/questions/11685608/convention-of-faces-in-opengl-cubemapping
    # @param fb [framebuffer] Destination framebuffer.
    # @param size [number] Size of each face.
    # @return [Cubemap] self
    render_to_framebuffer: (fb, size=@size) ->
        {gl, quad} = @context.render_manager
        # TODO: Simplify all this by converting to filter
        # and remove render_manager.quad
        material = get_resize_material(@context, @)
        shader = material.shaders.shader
        fb.enable [0, 0, size*3, size*2]
        material.inputs.cube.value = @
        material.inputs.size.value = size
        shader.use()
        @context.render_manager.bind_texture @
        shader.uniform_assign_func(gl, shader, null, null, null)
        gl.bindBuffer gl.ARRAY_BUFFER, quad
        @context.render_manager.change_enabled_attributes shader.attrib_bitmask
        gl.vertexAttribPointer shader.attrib_pointers[0][0], 3.0, gl.FLOAT, false, 0, 0
        gl.drawArrays gl.TRIANGLE_STRIP, 0, 4
        # Test this with:
        # $myou.scenes.Scene.post_draw_callbacks.push(function({
        #     $myou.objects.Cube.probe.cubemap.render_to_framebuffer(
        #     $myou.render_manager.main_fb)
        # })
        return @

    # Gets the pixels of the six cube faces.
    # @param faces [Array<Uint8Array>] An array of six Uint8Array (enough to hold amount of pixels*4) to write into
    read_faces: (faces, size=@size) ->
        {gl} = @context.render_manager
        fb = _temp_framebuffers[size]
        if not fb?
            fb = new @context.ByteFramebuffer size: [size*4, size*2]
            _temp_framebuffers[size] = fb
        @render_to_framebuffer fb, size
        for pixels,i in faces
            x = size * (i%3)
            y = size * ((i>=3)|0)
            gl.readPixels(x, y, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
        return

    # Generate spherical harmonics for diffuse shading
    generate_spherical_harmonics: (size=@size)->
        faces = (new Uint8Array(size*size*4) for [0...6])
        @read_faces(faces, size)
        [posx, posy, posz, negx, negy, negz] = faces
        @coefficients = sh [posx, negx, posy, negy, posz, negz], size, 4
        # See spherical_harmonics_L2() in original shader and
        # in shader_lib_extractor.py
        # result is very similar to Blender but not quite the same
        m=[0.282095,0.488603,0.488603,0.488603,
           1.092548,1.092548,0.315392,1.092548,0.546274]
        for c,i in @coefficients[1...]
            inv = 1/m[i]
            c[0] *= inv
            c[1] *= inv
            c[2] *= inv
        return @

    destroy: ->
        if @gl_tex
            @context.render_manager.gl.deleteTexture @gl_tex
        @gl_tex = null
        @loaded = false
        @context.all_cubemaps.splice @context.all_cubemaps.indexOf(this), 1




resize_material = null
# @nodoc
get_resize_material = (context, any_cubemap) ->
    if resize_material?
        return resize_material
    resize_material = new context.Material '_cubemap_resize', {
        material_type: 'PLAIN_SHADER',
        vertex: 'attribute vec3 vertex;
            void main(){ gl_Position = vec4(vertex.xy*2.0-1.0, -1.0, 1.0); }',
        fragment: '''
            precision highp float;
            uniform samplerCube cube;
            uniform float size;
            void main() {
                float hsize = size * 0.5;
                float size2 = size * 2.0;
                vec3 co = vec3(gl_FragCoord.xy-vec2(hsize), -hsize);
                if(gl_FragCoord.y < size){
                    if(gl_FragCoord.x < size){
                        gl_FragColor = textureCube(cube, vec3(co.z, -co.y, -co.x));
                    }else if(gl_FragCoord.x < size2){
                        co.x -= size;
                        gl_FragColor = textureCube(cube, vec3(co.x, co.z, co.y));
                    }else{
                        co.x -= size2;
                        gl_FragColor = textureCube(cube, vec3(co.x, -co.y, co.z));
                    }
                }else{
                    co.y -= size;
                    if(gl_FragCoord.x < size){
                        gl_FragColor = textureCube(cube, vec3(-co.z, -co.y, co.x));
                    }else if(gl_FragCoord.x < size2){
                        co.x -= size;
                        gl_FragColor = textureCube(cube, vec3(co.x, -co.z, -co.y));
                    }else{
                        co.x -= size2;
                        gl_FragColor = textureCube(cube, vec3(-co.x, -co.y, -co.z));
                    }
                }
            }
        ''',
        uniforms: [
            {varname: 'size', value: 128},
            {varname: 'cube', value: any_cubemap},
        ],
        # double_sided: true,
    }
    fake_mesh = {
        _signature:'shader'
        layout: [{"name":"vertex","type":"f","count":3,"offset":0}]
        vertex_modifiers: []
        material_defines: {}
    }
    resize_material.get_shader fake_mesh
    return resize_material


module.exports = {Cubemap}
