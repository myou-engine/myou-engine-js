# /* This line allows us to set the editor to "GLSL"


exports.library = ''' #line 4 /**/
#define PI    3.14159265

float near = 0.1; //Z-near
float far = 100.0; //Z-far

const int samples = 8; //samples on the first ring
const int rings = 6; //ring count
uniform float ssao_radius;
uniform float ssao_power;

vec2 rand(in vec2 coord) //generating random noise
{
	float noiseX = (fract(sin(dot(coord ,vec2(12.9898,78.233))) * 43758.5453));
	float noiseY = (fract(sin(dot(coord ,vec2(12.9898,78.233)*2.0)) * 43758.5453));
	return vec2(noiseX,noiseY)*0.004;
}

float readDepth(sampler2D sampler, in vec2 coord)
{
	return (2.0 * near) / (far + near - texture2D(sampler, coord ).x * (far-near));
}

float compareDepths( in float depth1, in float depth2 )
{
	float aoCap = 1.0;
	float aoMultiplier = 100.0;
	float depthTolerance = 0.0000;
	float aorange = 2.0;// units in space the AO effect extends to (this gets divided by the camera far range
	float diff = sqrt(clamp(1.0-(depth1-depth2) / (aorange/(far-near)),0.0,1.0));
	float ao = min(aoCap,max(0.0,depth1-depth2-depthTolerance) * aoMultiplier) * diff;
	return ao;
}

vec4 SSAO(sampler2D colorSampler, sampler2D depthSampler, vec2 inBufferSize, vec2 inBufferSizePx)
{
	vec2 inCoord = coord*inBufferSize;
	float depth = readDepth(depthSampler, inCoord);
	float d;
	
	float aspect = 1.0;
	vec2 noise = rand(coord);
	
	float w = (ssao_radius / ssao_buf_size_px.x)/clamp(depth,0.05,1.0)+(noise.x*(1.0-noise.x));
	float h = (ssao_radius / ssao_buf_size_px.y)/clamp(depth,0.05,1.0)+(noise.y*(1.0-noise.y));
	
	float pw;
	float ph;

	float ao = 0.0;
	float s = 0.0;
	float fade = 0.5;
	float samples_f = float(samples);
	
	// ao += clamp(distance(inCoord*ssao_buf_size_px, ssao_buf_size_px*0.5)*0.001, 0.0, 1.0);
	// return vec4(vec3(ao), 1.0);
	float i_f = 0.0, j_f;
	for (int i = 1 ; i < rings; i += 1)
	{
		fade *= 0.5;
		j_f = 0.0;
		for (int j = 0 ; j < samples; j += 1)
		{
			float step = PI*2.0 / (samples_f);
			pw = (cos(j_f*step)*i_f);
			ph = (sin(j_f*step)*i_f)*aspect;
			d = readDepth(depthSampler, vec2(inCoord.s+pw*w,inCoord.t+ph*h));
			// ao += clamp(1.0-distance(
			// 			vec2(inCoord.s+pw*w,inCoord.t+ph*h)*ssao_buf_size_px,
			// 			scene_size_f*0.5*ssao_buf_size_px
			// 		), 0.0, 1.0);
			ao += compareDepths(depth,d)*fade;
			s += 1.0*fade;
			j_f += 1.0;
		}
		i_f += 1.0;
	}
	
	ao /= s;
	ao = 1.0-ao*ssao_power;
    
	// vec3 color = texture2D(bgl_RenderedTexture,inCoord).rgb;
	// vec3 luminance = texture2D(bgl_LuminanceTexture,inCoord).rgb;
	
	// luminance = clamp(max(0.0,luminance-0.2)+max(0.0,luminance-0.2)+max(0.0,luminance-0.2),0.0,1.0);
	
	// gl_FragColor = vec4(color*mix(vec3(ao),vec3(1.0),luminance),1.0);
	return vec4(vec3(ao), 1.0);
}
'''
