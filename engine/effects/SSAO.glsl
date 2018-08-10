// TODO: Tilt the disk using derivatives, and clamp to 0 instead of -1
//#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform sampler2D source, disk_texture, noise_texture;
uniform mat4 projection_matrix;
uniform vec2 source_size_inverse, source_scale;
varying vec2 source_coord;
uniform float radius, iradius4, strength, zrange;
uniform vec2 fade;

#define PI    3.14159265
/*library goes here*/

void main(void)
{
    // NOTE: Assuming source_scale and depth_scale are the same!
    float depth = get_depth_no_scale(source_coord);
    if(depth > fade.y){
        gl_FragColor = vec4(1, depth, 1, depth);
        return;
    }

    vec2 noise_co = gl_FragCoord.xy * NOISE_ISIZE;
    vec4 n = texture2D(noise_texture, noise_co) - .5;
    mat2 rot = mat2(n.xy, n.zw);

    vec4 r = projection_matrix * vec4(radius, radius, -1., 1.);
    // pow(depth, 1.36)*2.5. seems to preserve radius much better
    // but without pow is kind of interesting and of course faster
    vec2 ratio = r.xy*depth_scale/depth;

    float ao = 0., samples = 0.;
    float d, dif, infl;
    vec4 t;
    vec2 p;
    vec2 limit = depth_scale - source_size_inverse;

    for(float i=ISAMPLES*.5; i<1.; i += ISAMPLES){
        t = texture2D(disk_texture, vec2(i, .5));
        p = rot * (t.xy - .5);
        // t = normalize(t); // use this to test radius
        // TODO: define this
        #ifdef NPOT_TEXTURES
        d = get_depth_no_scale(     (source_coord + p*ratio, vec2(0.), limit));
        #else
        d = get_depth_no_scale(clamp(source_coord + p*ratio, vec2(0.), limit));
        #endif
        dif = (depth-d) * iradius4;
        infl = clamp(2.-dif * zrange, 0., 1.);
        ao += clamp(dif, -1.,1.) * infl;
        samples += infl;
    }

    ao /= samples;
    float fade = min((fade.y - depth)/(fade.y - fade.x), 1.);
    ao = 1.0-max(0., ao * strength * fade);

    // NOTE: For some reason, RGB of float textures are multiplied by sqrt(a)
    // So we're packing both AO in one float...
    // ao =
    // gl_FragColor = vec4(ao, depth, depth, 1.0);
    gl_FragColor = vec4(ao, depth, ao, depth);

    // gl_FragColor = vec4(n.xyz+.5, 1.);
    // gl_FragColor = vec4(vec3(depth*0.001), 1.0);
    // vec4 tt;
    // float o = 0.;
    // for(float i=ISAMPLES*.5; i<1.; i += ISAMPLES){
    //     tt = texture2D(disk_texture, vec2(i, .5));
    //     if(distance(tt.xy*800., gl_FragCoord.xy)<1.){
    //         o = 1.;
    //     }
    // }
    // gl_FragColor = vec4(o,o,o,1.);
    // if(distance(gl_FragCoord.xy, vec2(400.))<1.){
    //     gl_FragColor.r = 1.;
    // }
}
