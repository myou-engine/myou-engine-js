material_module = require './material.coffee'
{Framebuffer} = require './framebuffer.coffee'

###
How to use the compositor:

Declare the following objects:
    * buffers hold a reference to input buffers or textures, and output buffers
      Each item is:
      * {buffer} or {buffer, size} if it's a Framebuffer
      * {texture, size} if it's a texture.
      size is in pixels and optional for framebuffers (defaults to framebuffer size)
    * uniforms will generate uniforms that will be pased to filters
      Note: assumes all uniforms are used in the shader
    * filters will be a dict with all filters that will be executed
      on this compositor. The order of evaluation will be inferred from
      input/output dependencies. TODO: not yet; put in required order.

Each filter has:
    * library: auxiliary GLSL code that the code may use (in a string)
    * inputs: a list of input names, e.g: ["scene"]
      TODO: for now inputs are only buffers, it should accept also uniforms and filters
    * output: the name of a buffer, or null for chaining with another filter
    * code: the inside of a function that will be executed.
        It can use any buffer, uniform or filter using the name declared in
        their respective dict. When referencing a filter, it will use its output.
        It expects to return a vec4.
        Example taking the red channel of the scene:
        "return vec4(scene.r, 0.0, 0.0, 1.0);"

Implicit variables and functions,
all of them handle unused buffer borders as if they didn't exist:
    * aspect_ratio: gives the aspect ratio of the camera
    * get_FOO_from_px(x, y) and
      get_FOO_from_px(vec2) gets the value of the buffer/texture FOO
      in the x/y coordinate in pixels
    * get_FOO_from_coord(x, y) and
      get_FOO_from_coord(vec2) gets the value of the buffer/texture FOO
      in the x/y coordinate in the buffer's viewport, [-1, 1] interval
      e.g: get_FOO_from_coord(0.5, 0.5) gets the value in the middle
    * coord: current texture coordinate of viewport
      (if you want pixels, use gl_FragCoord.xy instead)
    * FOO_sampler: Sampler of buffer/texture FOO
    * FOO_size_f: Size of FOO. Multiply coord by FOO_size_f to get the actual
                  coordinate to be used with texture2D()
    * FOO_orig_px_size: Size of a pixel in FOO.
                  Multiply gl_FragCoord.xy by FOO_orig_px_size to get the actual
                  coordinate to be used with texture2D()

Example:

    buffers = {
        "scene": {buffer: common_filter_fb, size: viewport.get_size_px()}
        "depth": {texture: common_filter_fb.depth_texture, size: viewport.get_size_px()}
        "ssao_buf": {buffer: new Framebuffer(context, size: [128, 128])}
        "screen": {buffer: viewport.dest_buffer}
    }
    uniforms = {
        "test_float": 3,
        "test_vec3": {x: 1, y:2, z:3},
    }
    filters = {
        "invert"
            code: 'return vec4(vec3(1.0)-get_scene_from_coord(coord), 1.0);'
            inputs: ["scene"]
            output: "screen"
    }

    viewport.compositor = new Compositor(context, {buffers, uniforms, filters})
    viewport.compositor_enabled = true
###

# '''
#     Example with big buffer of size 1000 and small buffer of size 700
#     +--------------+   FOO_size_f = vec2(0.7, 0.7);
#     |              |   FOO_size_px = vec2(700, 700);
#     +---------+    |   FOO_px_size = 1/vec2(700, 700);
#     |         |    |   FOO_orig_px_size = FOO_size_f*FOO_px_size; = 1/1000
#     |         |    |
#     |         |    |
#     +---------+----+
# 0,0
#     +--------------+   FOO_size_f = vec2(0.7, 0.7);
#     | +---------+  |   FOO_size_px = vec2(700, 700);
#     | |         |  |   FOO_px_size = 1/vec2(700, 700);
#     | |         |  |   FOO_orig_px_size = FOO_size_f*FOO_px_size
#     | |0.1,0.1  |  |   FOO_offset_f = vec2(0.1, 0.1);
#     | +---------+  |
#     +--------------+
# 0,0
# '''

class Compositor
    compositor_shaders:
        FXAA: require './compositor_shaders/FXAA.coffee'
        SSAO: require './compositor_shaders/SSAO.coffee'

    constructor: (@context, @options)->

        vs_code = """precision highp float;
        precision highp int;
        attribute vec3 vertex;
        varying vec2 coord;

        void main(){
            coord = vertex.xy;
            gl_Position = vec4((vertex.xy*2.0)-vec2(1.0,1.0), 0.0, 1.0);
        }"""
        @buffers = @options.buffers
        # TODO: resolve and concatenate filters with 1:1 intermediate result
        # and measure in different platforms if that's better than flipping buffers
        @filters = for filter_name,filter_options of @options.filters
            uniforms = []
            fs_code = """precision highp float;
            varying vec2 coord;"""
            for name, {buffer} of @buffers
                uniforms = uniforms.concat [
                    {varname: name+'_size_f'}
                    {varname: name+'_size_px'}
                    {varname: name+'_px_size'}
                    {varname: name+'_orig_px_size'}
                    # {varname: name+'_offset_f'}
                    {varname: name+'_sampler', type: material_module.GPU_DYNAMIC_SAMPLER_2DBUFFER}
                ]
                fs_code += """\nuniform vec2
                    #{name}_size_f,
                    #{name}_size_px,
                    #{name}_px_size,
                    #{name}_orig_px_size;
                    //#{name}_offset_f;"""
                # TODO: use inputs (we're adding all buffers for now, except screen and output)
                if name != filter_options.output and buffer != @context.render_manager.main_fb
                    fs_code += """\nuniform sampler2D #{name}_sampler;
                    vec4 get_#{name}_from_px(vec2 co_px){
                        return texture2D(#{name}_sampler, co_px*#{name}_orig_px_size);
                        //return texture2D(#{name}_sampler, co_px*#{name}_orig_px_size + #{name}_offset_f);
                    }
                    vec4 get_#{name}_from_px(float x, float y){
                        return get_#{name}_from_px(vec2(x,y));
                    }
                    vec4 get_#{name}_from_coord(vec2 co){
                        return texture2D(#{name}_sampler, co*#{name}_size_f);
                        //return texture2D(#{name}_sampler, co*#{name}_size_f + #{name}_offset_f);
                    }
                    vec4 get_#{name}_from_coord(float x, float y){
                        return get_#{name}_from_coord(vec2(x,y));
                    }
                    """

            fs_code += '\n' + (filter_options.library or '') + """\n
            vec4 filter(){
                #{filter_options.code}
            }
            void main(){
                gl_FragColor = filter();
            }"""

            for varname of @options.uniforms
                uniforms.push {varname}

            # TODO: Change to Shader and fix stuff
            material = new material_module.Material @context, {
                name: filter_name+((Math.random()*65536)|0)
                uniforms: uniforms
                vertex: vs_code
                fragment: fs_code
            }
            output = @buffers[filter_options.output]
            {vs_code, fs_code, material, output}


        @assign_uniforms()

    assign_uniforms: ->
        {gl} = @context.render_manager
        for {material} in @filters
            # console.log material.name
            material.use()
            {u_custom} = material
            i = -1
            for name, {buffer, size=[buffer.size_x, buffer.size_y]} of @buffers
                size_f = [size[0]/buffer.size_x, size[1]/buffer.size_y]
                # console.log name, size+'', size_f+'', u_custom[i+1], u_custom[i+4]
                u_custom[++i]? and gl.uniform2fv u_custom[i], size_f # size_f
                u_custom[++i]? and gl.uniform2fv u_custom[i], size # size_px
                u_custom[++i]? and gl.uniform2fv u_custom[i], [1/size[0], 1/size[1]] # px_size
                u_custom[++i]? and gl.uniform2fv u_custom[i], [size_f[0]/size[0], size_f[1]/size[1]] # orig_px_size
                # u_custom[++i]? and gl.uniform2fv u_custom[i], [] # offset_f
        @custom_uniform_index = i+1
        return

    compose: ->
        {gl, uniform_functions} = @context.render_manager
        gl.disable gl.DEPTH_TEST
        # Bind quad mesh
        gl.bindBuffer gl.ARRAY_BUFFER, @context.render_manager.quad

        # TODO: For now, we assume that the filters object is ordered
        # but eventually we'll order it in the constructor evaluating dependencies
        for {material, output} in @filters
            prog = material.use()
            # Bind textures
            i = 0
            # Note: relying on having the same order in "for .. of"
            for name, {buffer, texture} of @buffers
                # It may be a Texture instance, a WebGL texture or a buffer
                if output.buffer != buffer
                    texture = texture?.gl_tex or texture or buffer.texture
                    gl.activeTexture gl.TEXTURE0 + i
                    gl.bindTexture gl.TEXTURE_2D, texture
                i++
            # Configure attributes
            @context.render_manager.change_enabled_attributes 1<<material.a_vertex
            gl.vertexAttribPointer material.a_vertex, 3.0, gl.FLOAT, false, 0, 0
            # Assign custom uniforms
            {u_custom} = material
            i = @custom_uniform_index
            for varname, value of @options.uniforms
                # console.log varname, value, u_custom[i]
                uniform_functions[value.length|0] u_custom[i++], value
            # TODO! Offset when drawing to the screen?
            size = output.size or [output.buffer.size_x, output.buffer.size_y]
            output.buffer.enable([0, 0, size[0], size[1]])
            gl.drawArrays gl.TRIANGLE_STRIP, 0, 4
        gl.enable gl.DEPTH_TEST
        return


module.exports = {Compositor}
