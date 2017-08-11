{GameObject} = require './gameobject.coffee'
{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'vmath'

VECTOR_X = vec3.new 1,0,0
VECTOR_Y = vec3.new 0,1,0
VECTOR_MINUS_Z = vec3.new 0,0,-1

class Camera extends GameObject


    constructor: (@context, options) ->
        super @context
        @type = 'CAMERA'
        {
            @near_plane = 0.1,
            @far_plane = 10000,
            @field_of_view = 30,
            @ortho_scale = 8,
            @aspect_ratio = 1,
            @cam_type = 'PERSP',
            @sensor_fit = 'AUTO',
        } = options
        # if non-zero, will use as up, right, down and left FoV
        @fov_4 = [0,0,0,0]
        @target_aspect_ratio = @aspect_ratio
        @projection_matrix = mat4.create()
        @projection_matrix_inv = mat4.create()
        @world_to_screen_matrix = mat4.create()
        @cull_left = vec3.create()
        @cull_bottom = vec3.create()
        @recalculate_projection()

    clone: ->
        clone = super()
        clone.near_plane = @near_plane
        clone.far_plane = @far_plane
        clone.field_of_view = @field_of_view
        clone.fov_4 = @fov_4[...]
        clone.projection_matrix = mat4.clone @projection_matrix
        clone.projection_matrix_inv = mat4.clone @projection_matrix_inv
        clone.world_to_screen_matrix = mat4.clone @world_to_screen_matrix
        clone.aspect_ratio = @aspect_ratio
        clone.target_aspect_ratio = @target_aspect_ratio
        clone.cam_type = @cam_type
        clone.sensor_fit = @sensor_fit
        return clone

    #Avoid physical lamps and cameras
    instance_physics: ->

    get_ray_direction: (x, y)->
        # Assumes screen coordinates (0 to 1)
        v = vec3.create()
        v.x = x*2-1
        v.y = 1-y*2
        v.z = 1
        pos_rot = @get_world_pos_rot()
        vec3.transformMat4 v, v, @projection_matrix_inv
        vec3.transformQuat v, v, pos_rot[1]
        vec3.add(v, v, pos_rot[0])
        return v

    get_ray_direction_local: (x, y)->
        # Assumes screen coordinates (0 to 1)
        v = vec3.create()
        v.x = x*2-1
        v.y = 1-y*2
        v.z = 1
        vec3.transformMat4 v, v, @projection_matrix_inv
        vec3.transformQuat v, v, @rotation
        return v

    is_vertical_fit: ->
        {sensor_fit} = @
        if sensor_fit == 'AUTO'
            return @aspect_ratio <= 1
        if sensor_fit == 'HORIZONTAL'
            return false
        else if sensor_fit == 'VERTICAL'
            return true
        else if sensor_fit == 'COVER'
            return @aspect_ratio <= @target_aspect_ratio
        else if sensor_fit == 'CONTAIN'
            return @aspect_ratio > @target_aspect_ratio
        else
            throw "Camera.sensor_fit must be AUTO, HORIZONTAL or VERTICAL."

    recalculate_projection: ->

        near_plane = @near_plane
        far_plane = @far_plane
        if @fov_4[0] == 0
            # Regular symmetrical FoV
            sensor_fit = @sensor_fit
            if @cam_type == 'PERSP'
                half_size = near_plane * Math.tan(@field_of_view/2)
            else if @cam_type == 'ORTHO'
                half_size = @ortho_scale/2
            else
                throw "Camera.cam_type must be PERSP or ORTHO."

            if @is_vertical_fit()
                top = half_size
                if /CONTAIN|COVER/.test @sensor_fit
                    top /= @target_aspect_ratio
                right = top * @aspect_ratio
            else
                right = half_size
                top = right / @aspect_ratio

            bottom = -top
            left = -right
        else
            # Custom FoV in each direction, for VR
            [top, right, bottom, left] = @fov_4
            top = near_plane * Math.tan(top * Math.PI / 180.0)
            right = near_plane * Math.tan(right * Math.PI / 180.0)
            bottom = near_plane * Math.tan(bottom * Math.PI / -180.0)
            left = near_plane * Math.tan(left * Math.PI / -180.0)

        pm = @projection_matrix
        a = (right + left) / (right - left)
        b = (top + bottom) / (top - bottom)
        c = -(far_plane + near_plane) / (far_plane - near_plane)
        if @cam_type == 'PERSP'
            d = -(2 * far_plane * near_plane) / (far_plane - near_plane)
            x = (2 * near_plane) / (right - left)
            y = (2 * near_plane) / (top - bottom)
            # x, 0, 0, 0,
            # 0, y, 0, 0,
            # a, b, c, -1,
            # 0, 0, d, 0
            pm.m00 = x
            pm.m01 = 0
            pm.m02 = 0
            pm.m03 = 0
            pm.m04 = 0
            pm.m05 = y
            pm.m06 = 0
            pm.m07 = 0
            pm.m08 = a
            pm.m09 = b
            pm.m10 = c
            pm.m11 = -1
            pm.m12 = 0
            pm.m13 = 0
            pm.m14 = d
            pm.m15 = 0
            mat4.invert @projection_matrix_inv, @projection_matrix
            v = @cull_left
            v.x = -1
            v.y = 0
            v.z = 1
            vec3.transformMat4 v, v, @projection_matrix_inv
            vec3.cross v, v, VECTOR_Y
            vec3.normalize v, v
            v = @cull_bottom
            v.x = 0
            v.y = -1
            v.z = 1
            vec3.transformMat4 v, v, @projection_matrix_inv
            vec3.cross v, VECTOR_X, v
            vec3.normalize v, v
        else
            d = -2 / (far_plane - near_plane)
            x = 2 / (right - left)
            y = 2 / (top - bottom)
            #  x, 0, 0, 0,
            #  0, y, 0, 0,
            #  0, 0, d, 0,
            # -a,-b, c, 1
            pm.m00 = x
            pm.m01 = 0
            pm.m02 = 0
            pm.m03 = 0
            pm.m04 = 0
            pm.m05 = y
            pm.m06 = 0
            pm.m07 = 0
            pm.m08 = 0
            pm.m09 = 0
            pm.m10 = d
            pm.m11 = 0
            pm.m12 = -a
            pm.m13 = -b
            pm.m14 = c
            pm.m15 = 1
            mat4.invert @projection_matrix_inv, @projection_matrix
            console.error "TODO: frustum culling for ortho!"

    get_frustum_normals: (horizontal_fov=0, vertical_fov=0) ->
        near_plane = @near_plane
        far_plane = @far_plane
        top = near_plane * Math.tan(vertical_fov * 0.5)
        right = near_plane * Math.tan(horizontal_fov * 0.5)
        if top == 0
            top = right / @aspect_ratio
        else if right == 0
            right = top * @aspect_ratio
        bottom = -top
        left = -right

        pm = mat4.create()
        a = (right + left) / (right - left)
        b = (top + bottom) / (top - bottom)
        c = -(far_plane + near_plane) / (far_plane - near_plane)
        if @cam_type == 'PERSP'
            d = -(2 * far_plane * near_plane) / (far_plane - near_plane)
            x = (2 * near_plane) / (right - left)
            y = (2 * near_plane) / (top - bottom)
            # x, 0, 0, 0,
            # 0, y, 0, 0,
            # a, b, c, -1,
            # 0, 0, d, 0
            pm.m00 = x
            pm.m01 = 0
            pm.m02 = 0
            pm.m03 = 0
            pm.m04 = 0
            pm.m05 = y
            pm.m06 = 0
            pm.m07 = 0
            pm.m08 = a
            pm.m09 = b
            pm.m10 = c
            pm.m11 = -1
            pm.m12 = 0
            pm.m13 = 0
            pm.m14 = d
            pm.m15 = 0
            projection_matrix_inv = mat4.invert mat4.create(), pm
            v = cull_left_local = vec3.create()
            v.x = -1
            v.y = 0
            v.z = 1
            vec3.transformMat4 v, v, projection_matrix_inv
            vec3.cross v, v, VECTOR_Y
            vec3.normalize v, v
            v = cull_bottom_local = vec3.create()
            v.x = 0
            v.y = -1
            v.z = 1
            vec3.transformMat4 v, v, projection_matrix_inv
            vec3.cross v, VECTOR_X, v
            vec3.normalize v, v
        else
            d = -2 / (far_plane - near_plane)
            x = 2 / (right - left)
            y = 2 / (top - bottom)
            #  x, 0, 0, 0,
            #  0, y, 0, 0,
            #  0, 0, d, 0,
            # -a,-b, c, 1
            mat4.identity pm
            pm.m00 = x
            pm.m01 = 0
            pm.m02 = 0
            pm.m03 = 0
            pm.m04 = 0
            pm.m05 = y
            pm.m06 = 0
            pm.m07 = 0
            pm.m08 = 0
            pm.m09 = 0
            pm.m10 = d
            pm.m11 = 0
            pm.m12 = -a
            pm.m13 = -b
            pm.m14 = c
            pm.m15 = 1
            mat4.invert @projection_matrix_inv, @projection_matrix
            throw "TODO: frustum culling for ortho!"

        @update_matrices_recursive()
        camera_z = vec3.transformMat3 vec3.create(), VECTOR_MINUS_Z, @rotation_matrix
        normal_left = vec3.transformMat3 vec3.create(), cull_left_local, @rotation_matrix
        normal_right = v = vec3.copy vec3.create(), cull_left_local
        v.x = -v.x
        vec3.transformMat3 v, v, @rotation_matrix
        normal_bottom = vec3.transformMat3 vec3.create(), cull_bottom_local, @rotation_matrix
        normal_top = v = vec3.copy vec3.create(), cull_bottom_local
        v.y = -v.y
        vec3.transformMat3 v, v, @rotation_matrix
        return {normal_top, normal_bottom, normal_right, normal_left}


module.exports = {Camera}
