# /* This allows us to set the editor to "GLSL"

# NVIDIA FXAA by Timothy Lottes
# http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
# - WebGL port by @supereggbert
# http://www.glge.org/demos/fxaa/

# TODO: separate GLSL code into files to avoid linter errors, etc

library = ''' #line 8 /**/
    #define FXAA_REDUCE_MIN   (1.0/128.0)
    #define FXAA_REDUCE_MUL   (1.0/8.0)
    #define FXAA_SPAN_MAX     8.0
    vec4 FXAA(sampler2D sampler, vec2 orig_px_size){
        vec3 rgbNW = texture2D(sampler, (gl_FragCoord.xy + vec2( -1.0, -1.0 ))*orig_px_size).xyz;
        vec3 rgbNE = texture2D(sampler, (gl_FragCoord.xy + vec2( 1.0, -1.0 ))*orig_px_size).xyz;
        vec3 rgbSW = texture2D(sampler, (gl_FragCoord.xy + vec2( -1.0, 1.0 ))*orig_px_size).xyz;
        vec3 rgbSE = texture2D(sampler, (gl_FragCoord.xy + vec2( 1.0, 1.0 ))*orig_px_size).xyz;
        vec4 rgbaM  = texture2D(sampler, gl_FragCoord.xy*orig_px_size);
        vec3 rgbM  = rgbaM.xyz;
        vec3 luma = vec3( 0.299, 0.587, 0.114 );
        float lumaNW = dot( rgbNW, luma );
        float lumaNE = dot( rgbNE, luma );
        float lumaSW = dot( rgbSW, luma );
        float lumaSE = dot( rgbSE, luma );
        float lumaM  = dot( rgbM,  luma );
        float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );
        float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );
        vec2 dir;
        dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
        dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
        float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );
        float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );
        dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),
            max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
                dir * rcpDirMin));
        vec4 rgbA = (1.0/2.0) * (
            texture2D(sampler, (gl_FragCoord.xy + dir * (1.0/3.0 - 0.5))*orig_px_size) +
            texture2D(sampler, (gl_FragCoord.xy + dir * (2.0/3.0 - 0.5))*orig_px_size));
        vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (
            texture2D(sampler, (gl_FragCoord.xy + dir * (0.0/3.0 - 0.5))*orig_px_size) +
            texture2D(sampler, (gl_FragCoord.xy + dir * (3.0/3.0 - 0.5))*orig_px_size));
        float lumaB = dot(rgbB, vec4(luma, 0.0));
        if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {
            return rgbA;
        } else {
            return rgbB;
        }
    }
'''

{BaseFilter} = require '../filters'
{FilterEffect} = require './base'

class FXAAFilter extends BaseFilter
    constructor: (context) ->
        super context, 'fxaa'
        @fragment = """
            precision highp float;
            #{library}
            uniform sampler2D source;
            varying vec2 source_coord, source_size_inverse;
            void main() {
                gl_FragColor = FXAA(source, source_size_inverse);
            }
        """

class FXAAEffect extends FilterEffect
    constructor: (context) ->
        super context, new FXAAFilter context

module.exports = {FXAAEffect}
