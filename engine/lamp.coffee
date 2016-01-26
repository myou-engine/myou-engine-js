"use strict"
{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{GameObject} = require './gameobject'

class Lamp extends GameObject
    type = 'LAMP'

    constructor: (@context)->
        super(@context)
        @lamp_type = 'POINT'
        @shadow_fb = null
        @_color4 = vec4.fromValues 1,1,1,1
        @color = @_color4.subarray 0,3
        @energy = 1
        @_view_pos = vec3.create()
        @_dir = vec3.create()
        @_depth_matrix = mat4.create()
        @_cam2depth = mat4.create()
        @_projection_matrix = mat4.create()

    init_shadow: (self, frustum_size, clip_start, clip_end)->
        debugger
        @shadow_fb = new Framebuffer @context.render_manager, 256,256

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
            gl_FragColor = vec4(depth, pow(depth, 2.0) + 0.25*(dx*dx + dy*dy), 0.0, 1.0);
        }"""

        mat = new Material @name+'_shadow', fs,[],[],vs
        mat.is_shadow_material = true
        @_shadow_material = mat
        mat4.ortho(@_projection_matrix,
            -frustum_size, frustum_size, -frustum_size, frustum_size, clip_start, clip_end)
        mat4.multiply(@_depth_matrix, [
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.5, 0.5, 0.5, 1.0], @_projection_matrix)

module.exports = {Lamp}
