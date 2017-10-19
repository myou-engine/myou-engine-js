{mat2, mat3, mat4, vec2, vec3, vec4, quat, color4} = require 'vmath'
{GameObject} = require './gameobject.coffee'
{Framebuffer} = require './framebuffer.coffee'
{Material, glsl100to300} = require './material.coffee'
LIGHT_PROJ_TO_DEPTH = mat4.new(
    0.5, 0.0, 0.0, 0.0,
    0.0, 0.5, 0.0, 0.0,
    0.0, 0.0, 0.5, 0.0,
    0.5, 0.5, 0.5, 1.0)

class Lamp extends GameObject
    # @nodoc
    type: 'LAMP'
    # shadow_options contains the configuration for buffer shadow rendering.
    # If available in the scene data, overwrites the default options and
    # triggers init_shadow()
    shadow_options:
        texture_size: 0 # pixels
        frustum_size: 0.0 # world units
        clip_start: 0.0
        clip_end: 0.0
        bias: 0.0
        bleed_bias: 0.0

    constructor: (context)->
        super context
        @lamp_type = 'POINT'
        @shadow_fb = null
        @shadow_texture = null
        # this option allows to stop rendering the shadow when stuff didn't change
        @render_shadow = true
        @color = color4.new 1,1,1,1
        @energy = 1
        @spot_size = 1.3
        @spot_blend = 0.15
        @_view_pos = vec3.create()
        @_dir = vec3.create()
        @_depth_matrix = mat4.create()
        @_cam2depth = mat4.create()
        @_projection_matrix = mat4.create()
        @size_x = 0
        @size_y = 0


    #Avoid physical lamps and cameras
    instance_physics: ->

    recalculate_render_data: (world2cam, cam2world, world2light) ->
        wm = @world_matrix
        vec3.transformMat4 @_view_pos, vec3.new(wm.m12,wm.m13,wm.m14), world2cam

        # mat4.multiply m4, world2cam, @world_matrix
        # @_dir.x = -m4.m08
        # @_dir.y = -m4.m09
        # @_dir.z = -m4.m10
        ##We're doing the previous lines, but just for the terms we need
        a = world2cam
        b = @world_matrix
        b0 = b.m08; b1 = b.m09; b2 = b.m10; b3 = b.m11
        x = b0*a.m00 + b1*a.m04 + b2*a.m08 + b3*a.m12
        y = b0*a.m01 + b1*a.m05 + b2*a.m09 + b3*a.m13
        z = b0*a.m02 + b1*a.m06 + b2*a.m10 + b3*a.m14
        @_dir.x = -x
        @_dir.y = -y
        @_dir.z = -z

        if @shadow_fb?
            mat4.multiply @_cam2depth, world2light, cam2world
            mat4.multiply @_cam2depth, @_depth_matrix, @_cam2depth
        return

    init_shadow: ->
        {texture_size, frustum_size, clip_start, clip_end} = @shadow_options
        # This one has no depth because we're using common_shadow_fb,
        # then applying box blur and storing here
        @shadow_fb = new Framebuffer @context, {size: [texture_size, texture_size], use_depth: false}
        @shadow_texture = @shadow_fb.texture

        # If using half float buffers, add a little bit of extra bias
        {extensions} = @context.render_manager
        extra_bias = ''
        if @shadow_fb.tex_type == 0x8D61 # HALF_FLOAT_OES
            # TODO: make configurable? or calculate depending on scene size?
            extra_bias = '-0.0007'

        varyings = [{type: 'PROJ_POSITION', varname: 'proj_position'}]
        fs = """#extension GL_OES_standard_derivatives : enable
        precision highp float;
        varying vec4 proj_position;
        void main(){
            float depth = proj_position.z/proj_position.w;
            depth = depth * 0.5 + 0.5;
            float dx = dFdx(depth);
            float dy = dFdy(depth);
            gl_FragColor = vec4(depth #{extra_bias}, pow(depth, 2.0) + 0.25*(dx*dx + dy*dy), 0.0, 1.0);
        }"""
        if @context.is_webgl2
            fs = glsl100to300 fs

        mat = new Material @context, @name+'_shadow', {fragment: fs, varyings, material_type: 'PLAIN_SHADER'}
        mat.is_shadow_material = true
        @_shadow_material = mat

        mat4.ortho(
            @_projection_matrix,
            -frustum_size,
            frustum_size,
            -frustum_size,
            frustum_size,
            clip_start,
            clip_end
        )
        mat4.multiply(
            @_depth_matrix,
            LIGHT_PROJ_TO_DEPTH,
            @_projection_matrix
        )
        return

    destroy_shadow: ->
        @shadow_fb?.destroy()
        @shadow_fb = null
        @material?.destroy()
        @material = null
        @shadow_texture.gl_tex = @context.render_manager.white_texture

module.exports = {Lamp}
