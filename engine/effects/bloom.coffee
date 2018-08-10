
{vec2} = require 'vmath'
{next_POT} = require '../math_utils/math_extra'

class BloomEffect
    constructor: (@context, @steps=4, @intensity=1.2, @threshold=0.8) ->
        # functions = '''
        #     vec3 vpow(vec3 v, float p){
        #         return vec3(pow(v.r, p), pow(v.g, p), pow(v.b, p));
        #     }'''
        @highlight = new @context.ExprFilter 1,
            "(a.r*0.2126+a.g*0.7152+a.b*0.0722 >
                #{@threshold.toFixed 7})?a:vec3(0.0)"
        @blur = new @context.DirectionalBlurFilter
        # expression is "screen" mix function * emission
        @screen_mix = new @context.ExprFilter 2,
            "vec4(1.0 - (1.0-a.rgb)*(1.0-b.rgb*#{@intensity.toFixed 7}), a.a)"
            use_vec4: true
        @buffer = null

    on_viewport_update: (@viewport) ->
        {width, height} = @viewport
        initial_scale = 1/2
        # TODO: Handle big differences of POT/non POT
        # that cause highlights to be squashed
        @width = next_POT width*initial_scale
        @height = next_POT height*initial_scale
        @buffer?.destroy()
        @buffer2?.destroy()
        @buffer = new @context.ByteFramebuffer {size: [@width, @height]}
        @buffer2 = new @context.ByteFramebuffer {size: [@width/2, @height/2]}
        @screen_mix.set_input 'b_texture', @buffer.texture
        scale = 1/(1<<(@steps))
        @screen_mix.set_input 'b_scale', vec2.new scale, scale

    apply: (source, temporary, rect) ->
        # Step 1: put shiny things in @buffer
        @highlight.apply source, @buffer, null
        # Step 2: downscale and box blur @steps times
        # by doing radial blur twice in each iteration
        # horizontal+downscale from @buffer to @buffer2
        # vertical from @buffer2 to @buffer
        vector = @blur.get_material().inputs.vector.value
        # extend a couple of pixels outwards to avoid bleeding
        # (TODO: benchmark against clearing whole buffer)
        bleed = 0
        drect = [0, 0, @width+bleed, @height+bleed]
        for [0...@steps] by 1
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
        # Step 3: Mix source and @buffer with screen mix.
        # The @buffer inputs are already set in previous functions
        destination = temporary
        @screen_mix.apply source, destination, rect
        return {destination, temporary: source}

    on_viewport_remove: ->
        @buffer.destroy()
        @buffer2.destroy()


module.exports = {BloomEffect}
