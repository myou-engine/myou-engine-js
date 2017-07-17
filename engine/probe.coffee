{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'

class Probe
    constructor: (@object, options) ->
        {@context, @scene} = @object
        if @object.type == 'SCENE'
            @scene = @object
            @object = null
        {
            @type
            object
            @auto_refresh
            @compute_sh
            @double_refresh
            @same_layers
            @size
            @sh_quality
            @clip_start
            @clip_end
            @parallax_type
            @parallax_volume
            @reflection_plane
            @background_only = false
            # TODO: export these two (they're scene-wide)
            # TODO: bsdf_samples is hard-coded in the shader
            # and in get_lutsamples_texture
            @bsdf_samples = 32
            @lodbias = -0.5
        } = options
        @size = nearest_POT @size
        @target_object = object
        @cubemap = new @context.Cubemap {@size}
        @cubemap.loaded = false
        @position = vec3.create()
        @set_lod_factor()
        if @auto_refresh
            @context.render_manager.probes.push @
        else
            @render()

    set_lod_factor: ->
        @lodfactor = 0.5 * Math.log( ( @size*@size / @bsdf_samples ) ) / Math.log(2)
        @lodfactor -= @lodbias

    render: ->
        if @size != @cubemap.size
            @size = nearest_POT @size
            @cubemap.size = @size
            @cubemap.set_data()
            @set_lod_factor()
        @object?.get_world_position?(@position)
        @context.render_manager.draw_cubemap(@scene, @cubemap,
            @position, @clip_start, @clip_end, @background_only)
        # TODO: Detect if any material uses this!
        @cubemap.generate_spherical_harmonics(@sh_quality)
        @cubemap.loaded = true

    destroy: ->
        if @auto_refresh
            @context.render_manager.probes.splice _,1 if (_ = @context.render_manager.probes.indexOf @)!=-1
        @cubemap.destroy()

nearest_POT = (x) ->
    x = Math.max(0, x)
    return Math.pow(2, Math.round(Math.log(x)/Math.log(2)))

module.exports = {Probe}
