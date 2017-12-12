# /* This line allows us to set the editor to "GLSL"

library = ''' \n\n /**/
precision highp float;
uniform sampler2D source;
uniform sampler2D depth_sampler;
uniform sampler2D bgl_LuminanceTexture; // luminance texture needed to discard ao on highlighted areas
uniform vec2 source_size;
varying vec2 source_coord;
uniform float radius, strength, zrange;

#define PI    3.14159265

float near = 1.0; //Z-near
float far = 100.0; //Z-far

const float samples = 8.0; //samples on the first ring
const float rings = 6.0; //ring count

vec2 rand(in vec2 coord) //generating random noise
{
    float noiseX = (fract(sin(dot(coord ,vec2(12.9898,78.233))) * 43758.5453));
    float noiseY = (fract(sin(dot(coord ,vec2(12.9898,78.233)*2.0)) * 43758.5453));
    return vec2(noiseX,noiseY)*0.004;
}

float readDepth(in vec2 coord)
{
    return (2.0 * near) / (far + near - texture2D(depth_sampler, coord ).x * (far-near));
}

float compareDepths( in float depth1, in float depth2 )
{
    float aoCap = 1.0;
    float depthTolerance = 0.0000;
    float diff = sqrt(clamp(1.0-(depth1-depth2) / (zrange/(far-near)),0.0,1.0));
    float ao = min(aoCap,max(0.0,depth1-depth2-depthTolerance) * strength) * diff;
    return ao;
}

void main(void)
{
    float depth = readDepth(source_coord);
    float d;

    float aspect = source_size.x/source_size.y;
    vec2 noise = rand(source_coord);

    float w = (radius / source_size.x)/clamp(depth,0.05,1.0)+(noise.x*(1.0-noise.x));
    float h = (radius / source_size.y)/clamp(depth,0.05,1.0)+(noise.y*(1.0-noise.y));

    float pw;
    float ph;

    float ao;
    float s;
    float fade = 1.0;

    for (float i = 0.0 ; i < rings; i += 1.0)
    {
    	fade *= 0.5;
        // NOTE: "samples" was "samples*i" but it's not allowed
        for (float j = 0.0 ; j < samples; j += 1.0)
        {
            float step = PI*2.0 / (samples);
            pw = (cos(j*step)*i);
            ph = (sin(j*step)*i)*aspect;
            d = readDepth( vec2(source_coord.s+pw*w,source_coord.t+ph*h));
            ao += compareDepths(depth,d)*fade;
            s += 1.0*fade;
        }
    }

    ao /= s;
    ao = 1.0-ao;

    vec3 color = texture2D(source, source_coord).rgb;
    float luminance = color.r*0.2126+color.g*0.7152+color.b*0.0722 > 0.8 ? 1.0 : 0.0;

    luminance = clamp(max(0.0,luminance-0.2)+max(0.0,luminance-0.2)+max(0.0,luminance-0.2),0.0,1.0);

    gl_FragColor = vec4(color*mix(vec3(ao),vec3(1.0),luminance),1.0);
}
'''

{BaseFilter} = require '../filters'
{FilterEffect} = require './base'

class SSAOFilter extends BaseFilter
    constructor: (context, @radius, @zrange, @strength) ->
        super context, 'ssao'
        @fragment = library
        @uniforms = [
            {varname: 'radius', value: @radius}
            {varname: 'strength', value: @strength}
            {varname: 'zrange', value: @zrange}
        ]
        @add_depth()

class SSAOEffect extends FilterEffect
    constructor: (context, @radius=10, @zrange=2, @strength=100) ->
        super context
        @filter = new SSAOFilter(@context, @radius, @zrange, @strength)

    apply: (source, temporary, rect) ->
        destination = temporary
        @filter.apply source, destination, rect
        return {destination, temporary: source}


module.exports = {SSAOEffect}
