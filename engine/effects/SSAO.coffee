
{BaseFilter} = require '../filters'
{FilterEffect} = require './base'
{vec2} = require 'vmath'
MersenneTwister = require 'mersennetwister'
{next_POT} = require '../math_utils/math_extra'

class SSAOFilter extends BaseFilter
    constructor: (context, effect) ->
        super context, 'ssao'
        {
            @radius
            @zrange
            @strength
            @samples
            @clumping
            @noise_size
            @fade_start
            @fade_end
        } = effect
        @disk_texture_uniform = {varname: 'disk_texture', value: null}
        @noise_texture_uniform = {varname: 'noise_texture', value: null}
        @make_textures()
        @uniforms = [
            {varname: 'radius', value: @radius}
            {varname: 'iradius4', value: 4/@radius}
            {varname: 'strength', value: @strength}
            {varname: 'zrange', value: 1/@zrange}
            {varname: 'fade', value: vec2.new(@fade_start, @fade_end)}
            @disk_texture_uniform
            @noise_texture_uniform
        ]
        @defines = {
            SAMPLES: @samples
            ISAMPLES: 1/@samples
            NOISE_ISIZE: 1/@noise_size
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
            r = Math.pow((i+1)/@samples, @clumping)
            th = mt.random() * Math.PI * 2
            v.x = Math.cos(th) * r
            v.y = Math.sin(th) * r
            # vec2.add vsum, vsum, v
            pixels[i*4] = (v.x+1)*127.5
            pixels[i*4+1] = (v.y+1)*127.5
            pixels[i*4+2] = r*255
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
        noise_size = @noise_size
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

class MinMaxBlurFilter extends BaseFilter
    constructor: (context) ->
        super context, 'minmaxblur'
        code = []
        for v in ['a.', 'b.', 'c.']
            for v2 in [v+'xy', v+'zw']
                d = v+v2[3] # a.xy -> a.y
                code.push \
                    "infl = (#{d} - min_d) * inv_dist;",
                    "o.xy += #{v2} * infl;",
                    "count.x += infl;",
                    "infl = (max_d - #{d}) * inv_dist;",
                    "o.zw += #{v2} * infl;",
                    "count.y += infl;"
        @fragment = """
            precision highp float;
            uniform sampler2D source;
            varying vec2 source_coord;
            uniform vec2 vector;
            void main() {
                vec2 count = vec2(0.0);
                vec4 a = texture2D(source, source_coord-vector);
                vec4 b = texture2D(source, source_coord);
                vec4 c = texture2D(source, source_coord+vector);
                vec4 o = vec4(0.0);
                float max_d = max(max(max(max(max(a.y,a.w),b.y),b.w),c.y),c.w)+0.001;
                float min_d = min(min(min(min(min(a.y,a.w),b.y),b.w),c.y),c.w)-0.001;
                float inv_dist = 1./(max_d-min_d);
                float infl;
                #{code.join '\n    '}
                gl_FragColor = o / count.xxyy;
            }
        """

        @vector = vec2.new(0,0)
        @uniforms.push {varname: 'vector', value: @vector}


class SSAOCompose extends BaseFilter
    constructor: (context) ->
        super context, 'ssao_compose'
        @uniforms = [
            {varname: 'ssao', value: {type: 'TEXTURE'}}
            {varname: 'ssao_iscale', value: vec2.create()}
        ]
        @add_depth()
        @fragment = """
            precision highp float;
            uniform sampler2D source, ssao;
            uniform vec2 ssao_iscale;
            varying vec2 source_coord, coord;
            #{@library.join '\n'}
            void main() {
                vec4 color = texture2D(source, source_coord);
                float luminance = color.r*0.2126+color.g*0.7152+color.b*0.0722;
                luminance = max(0., luminance-.8) * 5.;
                vec2 uv = gl_FragCoord.xy * ssao_iscale;
                vec4 p = texture2D(ssao, uv);
                float ao1 = p.x, depth1 = p.y, ao2 = p.z, depth2 = p.w;
                float dist = abs(depth1-depth2) + 0.001;
                float min_d = min(depth1, depth2);
                float infl = (get_depth(coord) - min_d) / dist;
                float ao = mix(ao2, ao1, infl);
                gl_FragColor = vec4(color.rgb * mix(ao,1., luminance), color.a);
            }
        """

class SSAOEffect extends FilterEffect
    constructor: (context, options={}) ->
        super context
        {
            @radius=2.5
            @zrange=2
            @strength=1
            @samples=16
            @clumping=2
            @noise_size=32
            @buffer_scale=1
            @blur_steps=2
            @fade_start=4000
            @fade_end=5000
        } = options
        @filter = new SSAOFilter(@context, this)
        @blur = new MinMaxBlurFilter @context
        @compose = new SSAOCompose @context
        @buffer = @buffer2 = null

    set_radius: (@radius) ->
        @filter.set_input 'radius', @radius
        @filter.set_input 'iradius4', 4/@radius

    set_strength: (@strength) ->
        @filter.set_input 'strength', @strength

    set_zrange: (@zrange) ->
        @filter.set_input 'zrange', 1/@zrange

    set_fade: (@fade_start, @fade_end) ->
        @filter.set_input 'fade', vec2.new @fade_start, @fade_end

    on_viewport_update: (@viewport) ->
        {width, height} = @viewport
        @width = next_POT width
        @height = next_POT height
        @buffer?.destroy()
        @buffer2?.destroy()
        @buffer = new @context.FloatFramebuffer {size: [@width, @height]}
        if @blur_steps != 0
            @buffer2 = new @context.FloatFramebuffer size: [@width/2, @height/2]
        @compose.set_input 'ssao', @buffer.texture
        s = @blur_steps
        @compose.set_input 'ssao_iscale', vec2.new 1/(@width<<s), 1/(@height<<s)


    apply: (source, temporary, rect) ->
        r = [0, 0, rect[2], rect[3]]
        destination = temporary
        @filter.apply source, @buffer, r, {}, clear: true
        vector = @blur.get_material().inputs.vector.value
        bleed = 0
        {current_size_x, current_size_y} = @buffer
        drect = [0, 0, current_size_x+bleed, current_size_y+bleed]
        for [0...@blur_steps] by 1
            drect[2]=((drect[2]-bleed)>>1)+bleed
            drect[3]=((drect[3]-bleed)>>1)+bleed
            # this is downscaling by a factor of 2, so
            # the blur vector needs to be 2 pixels relative to the source
            vec2.set vector, 2/@buffer.size_x, 0
            @blur.apply @buffer, @buffer2, drect, {}, clear: true
            vec2.set vector, 0, 1/@buffer2.size_y
            @blur.apply @buffer2, @buffer, drect, {}, clear: true
            vec2.set vector, 1/@buffer.size_x, 0
            @blur.apply @buffer, @buffer2, drect#, {}, clear: true
            vec2.set vector, 0, 1/@buffer2.size_y
            @blur.apply @buffer2, @buffer, drect#, {}, clear: true
        @compose.apply source, destination, rect
        # test filter only
        # @filter.apply source, destination, r
        return {destination, temporary: source}


module.exports = {SSAOEffect}
