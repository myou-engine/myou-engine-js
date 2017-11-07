{vec2} = require 'vmath'

class BaseFilter
    constructor: (@context, @name) ->
        @fragment = '#error Filter has no fragment shader'
        @uniforms = []
        @material = null

    get_material: ->
        if @material?
            return @material
        return @material = new @context.Material '_filter_'+@name, {
            material_type: 'PLAIN_SHADER',
            vertex: '''
                attribute vec3 vertex;
                uniform vec2 source_size, source_scale;
                varying vec2 source_coord, source_size_inverse;
                varying vec2 coord, pixel_corner;
                void main(){
                    source_coord = vertex.xy*source_scale;
                    coord = vertex.xy;
                    source_size_inverse = vec2(1.0)/source_size;
                    gl_Position = vec4(vertex.xy*2.0-1.0, 0.0, 1.0); }''',
            fragment: @fragment
            uniforms: [
                {varname: 'source', value: @context.render_manager.blank_texture},
                # Add this input explicitely when needed
                # {varname: 'source_depth', value: @context.render_manager.blank_texture},
                {varname: 'source_size', value: vec2.new(128, 128)},
                {varname: 'source_scale', value: vec2.new(1, 1)},
            ].concat @uniforms,
        }

    set_input: (name, value) ->
        if not value?
            throw "Invalid value"
        @get_material().inputs[name].value = value

    apply: (source, destination, rect, inputs, options={}) ->
        {clear=false} = options
        if not source.texture?
            throw "Source must be a regular framebuffer"
        if clear
            destination.clear()
        destination.enable rect
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
            varying vec2 source_coord, source_size_inverse;
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

class MipmapBiasFilter extends BaseFilter
    constructor: (@context, @bias) ->
        super context, 'mipmapbias'
        @fragment = """
            //#extension GL_OES_standard_derivatives : enable
            //#extension GL_EXT_shader_texture_lod : enable
            precision highp float;
            uniform sampler2D source;
            varying vec2 source_coord, source_size_inverse;
            uniform float bias;
            void main() {
                gl_FragColor = texture2D(source, source_coord, #{@bias.toFixed 7});
            }
        """

class RadialBlurFilter extends BaseFilter
    constructor: (@context, @bias) ->
        super context, 'radialblur'
        @fragment = """
            precision highp float;
            uniform sampler2D source;
            varying vec2 source_coord;
            uniform vec2 vector;
            void main() {
                gl_FragColor = vec4(((
                    texture2D(source, source_coord-vector)+
                    texture2D(source, source_coord)*2.0+
                    texture2D(source, source_coord+vector)
                ) * 0.25).rgb, 1.0);
            }
        """
        @uniforms = [
            {varname: 'vector', value: vec2.new(0,0)},
        ]

class ExprFilter extends BaseFilter
    constructor: (@context, @num_inputs=2, @expression="a+b") ->
        super context, 'expr'
        names = 'abcdefghijkl'
        code = ["""
            precision highp float;
            uniform sampler2D source;
        """]
        for i in [1...@num_inputs] by 1
            code.push """
                uniform sampler2D #{names[i]}_texture;
                uniform vec2 #{names[i]}_scale;
            """
        code.push """
            varying vec2 source_coord;
            varying vec2 coord;
            vec3 vpow(vec3 v, float p){
                return vec3(pow(v.r, p), pow(v.g, p), pow(v.b, p));
            }
            void main() {
                vec3 a = texture2D(source, source_coord).rgb;
        """
        for i in [1...@num_inputs] by 1
            code.push "
                vec3 b = texture2D(#{names[i]}_texture, coord*#{names[i]}_scale).rgb;
            "
        code.push """
                gl_FragColor = vec4(#{@expression}, 1.0);
            }
        """
        @fragment = code.join '\n'
        @uniforms = [
            {varname: 'b_texture', value: @context.render_manager.blank_texture},
            {varname: 'b_scale', value: vec2.new(1,1)},
        ]



module.exports = {
    BaseFilter, CopyFilter, FlipFilter, BoxBlurFilter,
    MipmapBiasFilter, RadialBlurFilter, ExprFilter
}
