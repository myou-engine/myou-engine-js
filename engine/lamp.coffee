{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{GameObject} = require './gameobject.coffee'
{Framebuffer} = require './framebuffer.coffee'
{Material} = require './material.coffee'

class Lamp extends GameObject
    type : 'LAMP'

    constructor: (@context)->
        super(@context)
        @lamp_type = 'POINT'
        @shadow_fb = null
        @shadow_texture = {loaded: true, gl_tex: @context.render_manager.white_texture}
        # set in loader, its presence signals calling init_shadow()
        # when shadows are enabled
        @shadow_options = null
        # this option allows to stop rendering the shadow when stuff didn't change
        @render_shadow = true
        @_color4 = vec4.fromValues 1,1,1,1
        @color = @_color4.subarray 0,3
        @energy = 1
        @_view_pos = vec3.create()
        @_dir = vec3.create()
        @_depth_matrix = mat4.create()
        @_cam2depth = mat4.create()
        @_projection_matrix = mat4.create()

    #Avoid physical lamps and cameras
    instance_physics: ->

    init_shadow: ->
        {texture_size, frustum_size, clip_start, clip_end} = @shadow_options
        # This one has no depth because we're using common_shadow_fb,
        # then applying box blur and storing here
        @shadow_fb = new Framebuffer @context, {size: [texture_size, texture_size], use_depth: false}
        @shadow_texture.gl_tex = @shadow_fb.texture
        
        # If using half float buffers, add a little bit of extra bias
        {extensions} = @context.render_manager
        extra_bias = ''
        if @shadow_fb.tex_type == 0x8D61 # HALF_FLOAT_OES
            # TODO: make configurable? or calculate depending on scene size?
            extra_bias = '-0.0007'
        
        vs = """precision highp float;
        uniform mat4 projection_matrix;
        uniform mat4 model_view_matrix;
        attribute vec3 vertex;
        varying vec4 varposition;
        void main(){
            gl_Position = varposition =
            projection_matrix * model_view_matrix * vec4(vertex, 1.0);
        }"""

        fs = """#extension GL_OES_standard_derivatives : enable
        precision highp float;
        varying vec4 varposition;
        void main(){
            float depth = varposition.z/varposition.w;
            depth = depth * 0.5 + 0.5;
            float dx = dFdx(depth);
            float dy = dFdy(depth);
            gl_FragColor = vec4(depth #{extra_bias}, pow(depth, 2.0) + 0.25*(dx*dx + dy*dy), 0.0, 1.0);
        }"""

        mat = new Material @context, {name: @name+'_shadow', fragment: fs, vertex: vs}
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
            [0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.5, 0.5, 0.5, 1.0],
            @_projection_matrix
            )
    
    destroy_shadow: ->
        @shadow_fb?.destroy()
        @shadow_fb = null
        @material?.destroy()
        @material = null
        @shadow_texture.gl_tex = @context.render_manager.white_texture

module.exports = {Lamp}
