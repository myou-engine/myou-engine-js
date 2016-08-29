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
      get_FOO_from_px(vec2) gets the value of the buffer FOO
      in the x/y coordinate in pixels
    * get_FOO_from_coord(x, y) and
      get_FOO_from_coord(vec2) gets the value of the buffer FOO
      in the x/y coordinate in the buffer's viewport, [-1, 1] interval
      e.g: get_FOO_from_coord(0.5, 0.5) gets the value in the middle
    * coord: current texture coordinate of viewport
      (if you want pixels, use gl_FragCoord.xy instead)
        
Full example:

    buffers = {
        "scene": {buffer: common_filter_fb, size: viewport.size}
        "depth": {texture: common_filter_fb.depth_texture, size: viewport.size}
        "ssao_buf": {buffer: new Framebuffer(context, 128, 128)}
        "screen": {buffer: viewport.dest_buffer}
    }
    uniforms = {
        "test_float": 3,
        "test_vec3": [1,2,3],
    }
    filters = {
        "SSAO":
            libraries: require('some_glsl_library')
            code: require('glsl-ssao')
            inputs: ["scene", "depth"]
            output: "ssao_buf"
        "FXAA":
            code: require('glsl-fxaa')
            inputs: ["ssao_buf", "scene"]
            output: null # not to be stored in a buffer
        "color_grading"
            code: require('glsl-grading')
            inputs: ["FXAA"]
            output: "screen"
    }

    viewport.compositor = new Compositor(context, {buffers, uniforms, filters})
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
    constructor: (@context, @options)->
        
        vs_code = """precision highp float;
        precision highp int;
        attribute vec3 vertex;
        varying vec2 coord;

        void main(){
            coord = vertex.xy;
            gl_Position = vec4((vertex.xy*2.0)-vec2(1.0,1.0), 0.0, 1.0);
        }"""
        uniforms = []
        @buffers = @options.buffers
        # TODO: resolve and concatenate filters with 1:1 intermediate result
        # and measure in different platforms if that's better than flipping buffers
        @filters = for filter_name,filter_options of @options.filters
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
                    vec4 get_#{name}_from_coord(vec2 co){
                        return texture2D(#{name}_sampler, co*#{name}_size_f);
                        //return texture2D(#{name}_sampler, co*#{name}_size_f + #{name}_offset_f);
                    }
                    """
            
            fs_code += '\n' + (filter_options.library or '') + """\n
            vec4 filter(){
                #{filter_options.code}
            }
            void main(){
                gl_FragColor = filter();
            }"""
            
            material = new material_module.Material @context, {
                name: filter_name+((Math.random()*65536)|0)
                uniforms: uniforms
                vertex: vs_code
                fragment: fs_code
            }
            output = @buffers[filter_options.output]
            {vs_code, fs_code, material, output}
        
        for varname of @options.uniforms
            uniforms.push {varname}
        
        @assign_uniforms()
    
    assign_uniforms: ->
        {gl} = @context.render_manager
        for {material} in @filters
            material.use()
            {u_custom} = material
            i = -1
            for name, {buffer, size=[buffer.size_x, buffer.size_y]} of @buffers
                size_f = [size[0]/buffer.size_x, size[1]/buffer.size_y]
                console.log name, size+'', size_f+'', u_custom[i+1]
                u_custom[++i]? and gl.uniform2fv u_custom[i], size_f # size_f
                u_custom[++i]? and gl.uniform2fv u_custom[i], size # size_px
                u_custom[++i]? and gl.uniform2fv u_custom[i], [1/size[0], 1/size[1]] # px_size
                u_custom[++i]? and gl.uniform2fv u_custom[i], [size_f[0]/size[0], size_f[1]/size[1]] # orig_px_size
                # u_custom[++i]? and gl.uniform2fv u_custom[i], [] # offset_f
        @custom_uniform_index = i+1
        return
    
    compose: ->
        {gl, uniform_functions} = @context.render_manager
        # Bind textures
        # TODO: Should we unbind the texture of the output buffer?
        i = 0
        for name, {buffer, texture} of @buffers
            texture = texture or buffer.texture
            gl.activeTexture gl.TEXTURE0 + i++
            gl.bindTexture gl.TEXTURE_2D, texture
        # Bind quad mesh
        gl.bindBuffer gl.ARRAY_BUFFER, @context.render_manager.quad
                
        # TODO: For now, we assume that the filters object is ordered
        # but eventually we'll order it in the constructor evaluating dependencies
        for {material, output} in @filters
            prog = material.use()
            # Configure attributes
            @context.render_manager.change_enabled_attributes 1<<material.a_vertex
            gl.vertexAttribPointer material.a_vertex, 3.0, gl.FLOAT, false, 0, 0
            # Assign custom uniforms
            {u_custom} = material
            i = @custom_uniform_index
            for varname, value of @options.uniforms
                uniform_functions[value.length|0] u_custom[i++], value
            # TODO! Offset when drawing to the screen?
            size = output.size or [output.buffer.size_x, output.buffer.size_y]
            output.buffer.enable([0, 0, size[0], size[1]])
            gl.drawArrays gl.TRIANGLE_STRIP, 0, 4
        return


module.exports = {Compositor}
