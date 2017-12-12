{vec2, mat4} = require 'vmath'
{glsl100to300} = require './material'

class BaseFilter
    constructor: (@context, @name) ->
        @fragment = '#error Filter has no fragment shader'
        @uniforms = []
        @material = null
        @use_derivatives = false
        @library = []

    get_material: ->
        if @material?
            return @material
        {blank_texture} = @context.render_manager
        return @material = new @context.Material '_filter_'+@name, {
            material_type: 'PLAIN_SHADER',
            vertex: '''
                attribute vec3 vertex;
                uniform vec2 source_size, source_scale, source_size_inverse;
                varying vec2 source_coord;
                varying vec2 coord, pixel_corner;
                void main(){
                    source_coord = vertex.xy*source_scale;
                    coord = vertex.xy;
                    gl_Position = vec4(vertex.xy*2.0-1.0, 0.0, 1.0); }''',
            fragment: if @use_derivatives and @context.is_webgl2
                glsl100to300 @fragment
            else
                @fragment
            uniforms: [
                {varname: 'source', value: blank_texture},
                # Add this input explicitely when needed
                {varname: 'source_size', value: vec2.new(128, 128)},
                {varname: 'source_size_inverse', value: vec2.new(1/128, 1/128)},
                {varname: 'source_scale', value: vec2.new(1, 1)},
            ].concat @uniforms,
        }

    add_depth: ->
        {blank_texture} = @context.render_manager
        @uniforms.push {varname: 'depth_sampler', value: blank_texture},
            {varname: 'depth_scale', value: vec2.new(1, 1)},
            {varname: 'projection_matrix_inverse', value: mat4.create()}
        @library.push '''
            uniform sampler2D depth_sampler;
            uniform vec2 depth_scale;
            uniform mat4 projection_matrix_inverse;
            float get_depth_no_scale(vec2 co){
                float z = texture2D(depth_sampler, co).r;
                vec4 v = projection_matrix_inverse * vec4(0., 0., z, 1.);
                return -v.z/v.w;
            }
            float get_depth(vec2 co){
                return get_depth_no_scale(co*depth_scale);
            }
        '''

    set_input: (name, value) ->
        if not value?
            throw Error "Invalid value"
        input = @get_material().inputs[name]
        if not input?
            throw Error "Filter has no input '#{name}'. Inputs are:
                '#{Object.keys(@get_material().inputs).join "', '"}'"
        input.value = value

    apply: (source, destination, rect, inputs, options={}) ->
        {clear=false} = options
        if not source.texture?
            throw Error "Source must be a regular framebuffer"
        if clear
            destination.clear()
        destination.enable rect
        destination.last_viewport = source.last_viewport
        source.draw_with_filter this, inputs

class CopyFilter extends BaseFilter
    constructor: (context) ->
        super context, 'copy'
        @fragment = '''
            precision highp float;
            uniform sampler2D source;
            varying vec2 source_coord;
            void main() {
                gl_FragColor = texture2D(source, source_coord);
            }
        '''

class FlipFilter extends BaseFilter
    constructor: (context) ->
        super context, 'flip'
        @fragment = '''
            precision highp float;
            uniform sampler2D source;
            uniform vec2 source_scale;
            varying vec2 source_coord;
            void main() {
                vec2 co = source_coord;
                co.y = source_scale.y - co.y;
                gl_FragColor = texture2D(source, co);
            }
        '''

class BoxBlurFilter extends BaseFilter
    constructor: (context) ->
        super context, 'boxblur'
        @fragment = """
            precision highp float;
            uniform sampler2D source;
            uniform vec2 source_size_inverse;
            varying vec2 source_coord;
            void main() {
                float x = source_coord.x, y = source_coord.y;
                float px = source_size_inverse.x, py = source_size_inverse.y;
                gl_FragColor = (
                    texture2D(source, vec2(x-px,y-py))+
                    texture2D(source, vec2(x-px,y))+
                    texture2D(source, vec2(x-px,y+py))+
                    texture2D(source, vec2(x   ,y-py))+
                    texture2D(source, vec2(x   ,y))+
                    texture2D(source, vec2(x   ,y+py))+
                    texture2D(source, vec2(x+px,y-py))+
                    texture2D(source, vec2(x+px,y))+
                    texture2D(source, vec2(x+px,y+py))
                )*#{1/9};
            }
        """

class Block2x2Blur extends BaseFilter
    constructor: (context, options) ->
        {
            use_depth_as_alpha=false
        } = options ? {}
        super context, '2x2blur'
        out = 'texture2D(source, co)'
        if use_depth_as_alpha
            @add_depth()
            # TODO: Assuming depth is same size as source!!
            out = 'vec4(texture2D(source, co).rgb, get_depth_no_scale(co))'
        @fragment = """
            precision highp float;
            uniform sampler2D source;
            uniform vec2 source_size, source_size_inverse;
            varying vec2 source_coord;
            #{@library.join '\n'}
            vec2 round2(vec2 v){
                #ifdef round
                return vec2(round(v.x), round(v.y));
                #else
                return vec2(floor(v.x+.5), floor(v.y+.5));
                #endif
            }
            void main() {
                vec2 cosa = vec2(0.05224489795918367);
                vec2 co = (round2(source_coord * source_size / 2.)-.5)
                            * 2. * source_size_inverse;
                gl_FragColor = #{out};
            }
        """

class MipmapBiasFilter extends BaseFilter
    constructor: (context, @bias) ->
        super context, 'mipmapbias'
        @fragment = """
            //#extension GL_OES_standard_derivatives : enable
            //#extension GL_EXT_shader_texture_lod : enable
            precision highp float;
            uniform sampler2D source;
            uniform vec2 source_size_inverse;
            varying vec2 source_coord;
            uniform float bias;
            void main() {
                gl_FragColor =
                    texture2D(source, source_coord, #{@bias.toFixed 7});
            }
        """

class DirectionalBlurFilter extends BaseFilter
    constructor: (context, options) ->
        super context, 'directionalblur'
        {
            use_vec4=false
            use_depth_as_alpha=false
        } = options ? {}
        conversion = depth_code = inputs = ''
        if use_depth_as_alpha
            @add_depth()
            inputs = 'varying vec2 coord;'
            depth_code = '''
                float depth = (
                    get_depth(coord-vector)+
                    get_depth(coord)*2.0+
                    get_depth(coord+vector)
                ) * 0.25;
            '''
            conversion = '.rgb, depth'
        else if use_vec4
            conversion = '.rgb, 1.0'
        @fragment = """
            precision highp float;
            uniform sampler2D source;
            varying vec2 source_coord;
            uniform vec2 vector;
            #{inputs}
            #{@library.join '\n'}
            void main() {
                #{depth_code}
                gl_FragColor = vec4(((
                    texture2D(source, source_coord-vector)+
                    texture2D(source, source_coord)*2.0+
                    texture2D(source, source_coord+vector)
                ) * 0.25)#{conversion});
            }
        """
        @vector = vec2.new(0,0)
        @uniforms.push {varname: 'vector', value: @vector}

class ExprFilter extends BaseFilter
    constructor: (context, @num_inputs=2, @expression="a+b", options={}) ->
        super context, 'expr'
        {
            use_vec4=false,
            use_depth=false,
            functions='',
            debug_vector=null,
            use_derivatives,
        } = options
        names = 'abcdefghijkl'
        @use_derivatives = use_derivatives ? /\bdFd[xy]\b/.test @expression
        if use_vec4
            type = 'vec4'
            swizzle = ''
            {expression} = this
        else
            type = 'vec3'
            swizzle = '.rgb'
            expression = "vec4(#{@expression}, 1.0);"
        {blank_texture} = @context.render_manager
        unf_lines = []
        sample = []
        for i in [0...@num_inputs] by 1
            letter = names[i]
            if i == 0
                tex = "texture2D(source, source_coord)"
            else
                unf_lines.push """
                    uniform sampler2D #{letter}_texture;
                    uniform vec2 #{letter}_scale;
                """
                @uniforms.push \
                    {varname: letter+'_texture', value: blank_texture},
                    {varname: letter+'_scale', value: vec2.new(1,1)}
                tex = "texture2D(#{letter}_texture, coord*#{letter}_scale)"
            sample.push "    #{type} #{letter} = #{tex}#{swizzle};"
        if use_depth
            @add_depth()
            sample.push "    float depth = get_depth(coord);"
        if debug_vector?
            unf_lines.push 'uniform vec4 v;'
            @uniforms.push {varname: 'v', value: debug_vector},
        code = [
            """
                precision highp float;
                uniform sampler2D source;
            """
            unf_lines...
            @library...
            """
                varying vec2 source_coord;
                varying vec2 coord;
                float sq(float n){return n*n;}
                #{functions}
                void main() {
            """
            sample...
            """
                    gl_FragColor = #{expression};
                }
            """
        ]
        @fragment = code.join '\n'


    set_buffers: (buffers...) ->
        # TODO: move this logic to filter.apply
        # to accept an array of sources as input?
        letters = 'bcdefghijkl'
        {inputs} = @get_material()
        if @num_inputs - 1 != buffers.length
            throw Error "Expected #{@num_inputs-1} buffers"
        for buffer,i in buffers
            letter = letters[i]
            scale = inputs[letter+'_scale'].value
            scale.x = buffer.current_size_x/buffer.size_x
            scale.y = buffer.current_size_y/buffer.size_y
            inputs[letter+'_texture'].value = buffer.texture ? \
                do -> throw Error "Buffer #{letter} has no texture"
        return

class FunctionFilter extends ExprFilter
    constructor: (context, function_="vec4 f(x,y){return x+y}", options={}) ->
        options.functions = function_
        [_, type, name, argstr] =
            function_.match /^(vec3|vec4)\s+(\w+)\((.+?)\)/
        options.use_vec4 = type == 'vec4'
        options.use_derivatives = /\bdFd[xy]\b/.test function_
        args = []
        num_inputs = 0
        letters = 'abcdefghijkl'
        for arg in argstr.split ','
            arg = (' '+arg).replace /\s+/g, ' '
            [_, t, n] = arg.split ' '
            if n == 'depth'
                options.use_depth = true
            else
                n = letters[num_inputs++]
            args.push n
        super context, num_inputs, name+"(#{args.join ','})", options


module.exports = {
    BaseFilter, CopyFilter, FlipFilter, BoxBlurFilter, Block2x2Blur,
    MipmapBiasFilter, DirectionalBlurFilter, ExprFilter, FunctionFilter,
}
