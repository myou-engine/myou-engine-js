{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'vmath'

v = vec3.create()

# A viewport is part of the screen/canvas associated with a camera, with a specific size.
#
# Typically there's only a single viewport occupying the whole canvas.
#
# When a new viewport is instanced, it's automatically added to the list of
# active viewports, available at `render_manager.viewports`.
class Viewport

    constructor: (@render_manager, @camera, @rect=[0,0,1,1], @custom_size=[0, 0], @dest_buffer=@render_manager.main_fb)->
        @rect_pix = @rect
        @compositor_enabled = false
        @compositor = null
        @eye_shift = vec3.create()
        @right_eye_factor = 0
        @custom_fov = null
        @debug_camera = null
        @units_to_pixels = 100
        @set_clear true, true
        @render_manager.viewports.push @
        @recalc_aspect()
        if @render_manager.common_filter_fb
            @render_manager.recalculate_fb_size()

    # @private
    # Recalculates viewport rects and camera aspect ratio.
    # Used in `render_manager.resize` and `render_manager.resize_soft`.
    recalc_aspect: ->
        r = @rect
        w = @dest_buffer.size_x
        h = @dest_buffer.size_y
        @camera.aspect_ratio = (r[2]*@render_manager.width)/(r[3]*@render_manager.height)
        @camera.recalculate_projection()
        cs = @custom_size
        if cs[0] == 0 and cs[1] == 0
            @rect_pix = [r[0]*w, r[1]*h, r[2]*w, r[3]*h]
        else
            @rect_pix = [r[0]*w, r[1]*h, cs[0], cs[1]]
        @dest_rect_pix = [r[0]*w, r[1]*h, r[2]*w, r[3]*h]
        vec3.set v, 1,0,-1
        vec3.transformMat4(v, v, @camera.projection_matrix)
        @units_to_pixels = v[0] * w

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
        return new Viewport(@render_manager, @camera, @rect, @custom_size, @dest_buffer)

    # Returns size of viewport in pixels.
    # @return [Array<number>]
    get_size_px: ->
        return [@dest_buffer.size_x, @dest_buffer.size_y]

    destroy: ->
        idx = @render_manager.viewports.indexOf @
        if ~idx
            @render_manager.viewports.splice idx, 1
        # TODO: Destroy compositor if single user?
        return


module.exports = {Viewport}
