
{BaseFilter} = require '../filters'
{FilterEffect} = require './base'
{vec2} = require 'vmath'
MersenneTwister = require 'mersennetwister'
{next_POT} = require '../math_utils/math_extra'

NOISE_SIZE = 32

class SSAOFilter extends BaseFilter
    constructor: (context, @radius, @zrange, @strength, @samples) ->
        super context, 'ssao'
        @disk_texture_uniform = {varname: 'disk_texture', value: null}
        @noise_texture_uniform = {varname: 'noise_texture', value: null}
        @make_textures()
        @uniforms = [
            {varname: 'radius', value: @radius}
            {varname: 'iradius4', value: 4/@radius}
            {varname: 'strength', value: @strength}
            {varname: 'zrange', value: 1/@zrange}
            @disk_texture_uniform
            @noise_texture_uniform
        ]
        @defines = {
            SAMPLES: @samples
            ISAMPLES: 1/@samples
            NOISE_ISIZE: 1/NOISE_SIZE
        }
        # TODO!! Optimize depth reads!
        # original was:
        # (2.0 * near) / (far + near - texture2D(...).x * (far-near));
        @add_depth()
        @fragment = require('raw-loader!./SSAO.glsl').replace \
            '/*library goes here*/', @library

    make_textures: (seed_=59066, seed_r=886577) ->
        # seed_r=1679174 is good for 16x16
        # disk kernel texture
        seed = seed_ ? ((Math.random()*10000000)|0)
        mt = new MersenneTwister seed
        v = vec2.create()
        pixels = new Uint8Array @samples*4
        # vsum = vec2.create()
        for i in [0...@samples] by 1
            r = Math.pow((i+1)/@samples, 1.5)
            th = mt.random() * Math.PI * 2
            v.x = Math.cos(th) * r
            v.y = Math.sin(th) * r
            # vec2.add vsum, vsum, v
            pixels[i*4] = (v.x+1)*127.5
            pixels[i*4+1] = (v.y+1)*127.5
            pixels[i*4+2] = r*r*255
        # TODO: Sort and benchmark

        # find the sum of the smallest distance between any two points
        # (this is only for finding a good seed, do not use)
        # if vec2.len(vsum) < 2.15
        #     sum = 0
        #     for a in [0...@samples-1] by 1
        #         pa = {x: pixels[a*4], y: pixels[a*4+1], }
        #         dist_to_a = Infinity
        #         for b in [a+1...@samples] by 1
        #             pb = {x: pixels[b*4], y: pixels[b*4+1], }
        #             dist_to_a = Math.min(dist_to_a, vec2.sqrDist(pa, pb))
        #             sum += dist_to_a
        #     (@attempts = @attempts ? []).push {seed, sum}

        # random rotation texture
        seed = seed_r ? ((Math.random()*10000000)|0)
        # console.log seed
        mt = new MersenneTwister seed
        noise_size = NOISE_SIZE
        rot_pixels = new Uint8Array noise_size * noise_size * 4
        for i in [0...noise_size*noise_size] by 1
            th = mt.random() * Math.PI * 2
            x = Math.cos(th)
            y = Math.sin(th)
            rot_pixels[i*4] = (x+1)*127.5
            rot_pixels[i*4+1] = (-y+1)*127.5
            rot_pixels[i*4+2] = (y+1)*127.5
            rot_pixels[i*4+3] = (x+1)*127.5

        # find the sum between consecutive pixels (must be as high as possible)
        # (this is only for finding a good seed, do not use)
        # min_dist = 0
        # sum_dist = 0
        # arrlen = rot_pixels.length
        # for x in [0...noise_size] by 1
        #     for y in [0...noise_size] by 1
        #         i1 = (x+(y*noise_size))*4
        #         x = rot_pixels[((x+(y*noise_size))*4)%arrlen]
        #         x2 = rot_pixels[((x+1+(y*noise_size))*4)%arrlen]
        #         y = rot_pixels[((x+((y+1)*noise_size))*4 + 1)%arrlen]
        #         y2 = rot_pixels[((x+((y+1)*noise_size))*4 + 1)%arrlen]
        #         dist = Math.sqrt(Math.pow(x2-x,2)+Math.pow(y2-y,2))
        #         sum_dist += dist
        #         min_dist = Math.max(min_dist, dist)
        # if min_dist > 350
        #     (@attempts = @attempts ? []).push {seed, min_dist, sum_dist}

        if seed_r? or not @material?
            tex = @disk_texture_uniform.value = new @context.Texture {@context},
                formats: raw_pixels: {
                    width: @samples, height: 1, pixels: pixels,
                }
            tex.load()
            if @material?
                @set_input 'disk_texture', tex
            tex = @noise_texture_uniform.value = new @context.Texture {@context},
                formats: raw_pixels: {
                    width: noise_size, height: noise_size, pixels: rot_pixels,
                }
            tex.load()
            if @material?
                @set_input 'noise_texture', tex

class SSAOBlur extends BaseFilter
    constructor: (context) ->
        super context, 'copy'
        @uniforms = [
            {varname: 'ssao', value: {type: 'TEXTURE'}}
            {varname: 'ssao_iscale', value: vec2.create()}
        ]
        @fragment = '''
            precision highp float;
            uniform sampler2D source, ssao;
            uniform vec2 ssao_iscale;
            varying vec2 source_coord;
            void main() {
                vec4 color = texture2D(source, source_coord);
                float luminance = color.r*0.2126+color.g*0.7152+color.b*0.0722;
                luminance = max(0., luminance-.8) * 5.;
                vec2 uv = gl_FragCoord.xy * ssao_iscale;
                // half pixel
                float hpx = ssao_iscale.x * .5;
                float hpy = ssao_iscale.y * .5;
                float ao =
                    min(texture2D(ssao, uv+vec2(-hpx, -hpy)).r,
                    min(texture2D(ssao, uv+vec2(-hpx, hpy)).r,
                    min(texture2D(ssao, uv+vec2(hpx, -hpy)).r,
                    texture2D(ssao, uv+vec2(hpx, hpy)).r)));
                gl_FragColor = vec4(color.rgb * mix(ao,1., luminance), color.a);
            }
        '''





class SSAOEffect extends FilterEffect
    constructor: (context, options={}) ->
        super context
        {
            @radius=2.5
            @zrange=2
            @strength=1
            @samples=32
        } = options
        @filter = new SSAOFilter(@context,
            @radius, @zrange, @strength, @samples)
        @blur = new SSAOBlur @context

    set_radius: (@radius) ->
        @filter.set_input 'radius', @radius
        @filter.set_input 'iradius4', 4/@radius

    set_strength: (@strength) ->
        @filter.set_input 'strength', @strength

    set_zrange: (@zrange) ->
        @filter.set_input 'zrange', 1/@zrange

    on_viewport_update: (@viewport) ->
        {width, height} = @viewport
        width = next_POT width
        height = next_POT height
        @buffer?.destroy()
        @buffer = new @context.ByteFramebuffer {size: [width, height]}
        @blur.set_input 'ssao', @buffer.texture
        @blur.set_input 'ssao_iscale', vec2.new(1/width, 1/height)


    apply: (source, temporary, rect) ->
        r = [0, 0, rect[2], rect[3]]
        destination = temporary
        @filter.apply source, @buffer, r
        @blur.apply source, destination, rect
        # test filter only
        # @filter.apply source, destination, r
        return {destination, temporary: source}


module.exports = {SSAOEffect}
