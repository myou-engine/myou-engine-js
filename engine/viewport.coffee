{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'vmath'

v = vec3.create()

# A viewport is part of the screen/canvas associated with a camera, with a specific size.
#
# Typically there's only a single viewport occupying the whole canvas.
#
# Created with `screen.add_viewport(camera)`` or automatically on first load
# of a scene with active camera.
# Available at `screen.viewports`.
class Viewport

    constructor: (@context, @screen, @camera)->
        @rect = [0,0,1,1]
        @rect_pix = [0,0,0,0]
        @left = @bottom = @width = @height = 0
        @effects = []
        @effects_by_id = {}
        @eye_shift = vec3.create()
        @right_eye_factor = 0
        @custom_fov = null
        @debug_camera = null
        @units_to_pixels = 100
        @set_clear true, true
        @recalc_aspect()

    # @private
    # Recalculates viewport rects and camera aspect ratio.
    # Used in `screen.resize` and `screen.resize_soft`
    recalc_aspect: (is_soft) ->
        [x,y,w,h] = @rect
        {size_x, size_y} = @screen.framebuffer
        @left = size_x * x
        @bottom = size_x * y
        @width = size_x * w
        @height = size_y * h
        @camera.aspect_ratio = @width/@height
        @camera.recalculate_projection()
        @rect_pix = [@left, @bottom, @width, @height]
        vec3.set v, 1,0,-1
        vec3.transformMat4(v, v, @camera.projection_matrix)
        @units_to_pixels = v.x * @width
        @pixels_to_units = 1/@units_to_pixels
        if not is_soft
            for effect in @effects
                effect.on_viewport_update this
        return

    # Sets whether color and depth buffers will be cleared
    # before rendering.
    # @param color [Boolean] Whether to clear color with `scene.background_color`.
    # @param depth [Boolean] Whether to clear depth buffer.
    set_clear: (color, depth)->
        c = if color then 16384 else 0 # GL_COLOR_BUFFER_BIT
        c |= if depth then 256 else 0 # GL_DEPTH_BUFFER_BIT
        @clear_bits = c

    # Clones the viewport. Note that it is added to the list of viewports,
    # and they will be rendering over the same area unless rect is changed.
    # @return {Viewport}
    clone: ->
        return new Viewport(@screen, @camera)

    # Returns size of viewport in pixels.
    # @return [vec2]
    get_size_px: ->
        return vec2.new @width, @height

    destroy: ->
        idx = @render_manager.viewports.indexOf @
        if ~idx
            @render_manager.viewports.splice idx, 1
        # TODO: Destroy compositor if single user?
        return

    # Add effect at the end of the stack
    add_effect: (effect) ->
        effect.on_viewport_update this
        @effects.push effect
        @effects_by_id[effect.id] = effect
        return effect

    # Insert an effect at the specified index of the stack
    insert_effect: (index, effect) ->
        effect.on_viewport_update this
        @effects.splice index, 0, effect
        @effects_by_id[effect.id] = effect
        return effect

    replace_effect: (before, after) ->
        @remove_effect(before)
        @insert_effect(after)

    # Remove an effect from the stack
    remove_effect: (index_or_effect)->
        index = index_or_effect
        if typeof index != 'number'
            index = @effects.indexOf index_or_effect
        if index != -1
            @effects[index]
            @effects.splice(index, 1)[0].on_viewport_remove?()

    clear_effects: ->
        for effect in @effects
            effect.on_viewport_remove?()
        @effects.splice 0

    ensure_shared_effect: (effect_class, a, b, c, d) ->
        for effect in @effects
            if effect.constructor == effect_class
                return effect
        return @insert_effect 0, new effect_class @context, a, b, c, d



module.exports = {Viewport}
