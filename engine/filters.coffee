{Shader} = require './material.coffee'
{vec2} = require 'vmath'

class FilterBase
    constructor: (@context, @name) ->
        @name = 'base'
        @fragment = ''
        @uniforms = []
        @material = null
        throw "Abstract class or missing constructor."

    get_material: ->
        if @material?
            return @material
        return @material = new @context.Material '_filter_'+@name, {
            material_type: 'PLAIN_SHADER',
            vertex: '''
                attribute vec3 vertex;
                uniform vec2 source_size;
                varying vec2 source_coord, source_size_inverse;
                void main(){
                    source_coord = vertex.xy*source_size;
                    source_size_inverse = vec2(1.0)/source_size;
                    gl_Position = vec4(vertex.xy*2.0-1.0, 0.0, 1.0); }''',
            fragment: @fragment
            uniforms: [
                {varname: 'source', value: @context.render_manager.blank_texture},
                {varname: 'source_size', value: vec2.new(128, 128)},
            ].concat @uniforms,
        }

class ResizeFilter extends FilterBase
    constructor: (@context) ->
        @name = 'resize'
        # Avoiding negative numbers in modulo because it's implementation specific
        @fragment = '''
            precision highp float;
            uniform sampler2D source;
            uniform vec2 scale_inverse, source_size;
            uniform float flip_y_ratio;
            varying vec2 source_coord, source_size_inverse;
            void main() {
                vec2 coord = source_coord * scale_inverse;
                if(flip_y_ratio != 0.0){
                    coord.y = source_size.y * flip_y_ratio - coord.y;
                }
                gl_FragColor = texture2D(source, coord*source_size_inverse);
            }
        '''
        @uniforms = [
            {varname: 'scale_inverse', value: [1,1]},
            {varname: 'flip_y_ratio', value: 0},
        ]
        @material = null

class BoxBlurFilter extends FilterBase
    constructor: (@context) ->
        @name = 'boxblur'
        # Avoiding negative numbers in modulo because it's implementation specific
        @fragment = """
            precision highp float;
            uniform sampler2D source;
            uniform vec2 source_size;
            varying vec2 source_coord, source_size_inverse;
            void main() {
                float px = source_size_inverse.x, py = source_size_inverse.y;
                float x = source_coord.x * px, y = source_coord.y * py;
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
        @uniforms = [
        ]
        @material = null

module.exports = {
    FilterBase, ResizeFilter, BoxBlurFilter,
}
