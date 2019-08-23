{GameObject} = require './gameobject'
{mat3, mat4, vec3, vec4, quat} = require 'vmath'
{plane_from_norm_point} = require './math_utils/g3'

VECTOR_X = vec3.new 1,0,0
VECTOR_Y = vec3.new 0,1,0

class Camera extends GameObject


    constructor: (context, options={}) ->
        super context
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
        @cull_planes = (vec4.create() for [0...6])
        @update_projection()

    # Returns a clone of the object
    # @option options scene [Scene] Destination scene
    # @option options recursive [bool] Whether to clone its children
    # @option options behaviours [bool] Whether to clone its behaviours
    clone: (options) ->
        clone = super options
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
        clone.cull_planes = (vec4.clone v for v in @cull_planes)
        return clone

    # @nodoc
    # Avoid physical lamps and cameras
    instance_physics: ->

    # Returns a world vector from screen coordinates,
    # 0 to 1, where (0,0) is the upper left corner.
    get_ray_direction: (x, y)-> @get_ray_direction_into vec3.create(), x, y

    # Returns a world vector from screen coordinates,
    # 0 to 1, where (0,0) is the upper left corner.
    get_ray_direction_into: (out, x, y)->
        vec3.set out, x*2-1, 1-y*2, 1
        vec3.transformMat4 out, out, @projection_matrix_inv
        vec3.transformQuat out, out, @get_world_rotation()
        return out

    get_ray_direction_local: (x, y)->
        @get_ray_direction_local_into vec3.create(), x, y

    get_ray_direction_local_into: (out, x, y)->
        vec3.set out, x*2-1, 1-y*2, 1
        vec3.transformMat4 out, out, @projection_matrix_inv
        vec3.transformQuat out, out, @rotation
        return out

    look_at: (target, options={}) ->
        options.front ?= '-Z'
        options.up ?= '+Y'
        super target, options

    is_vertical_fit: ->
        switch @sensor_fit
            when 'AUTO'
                return @aspect_ratio <= 1
            when 'HORIZONTAL'
                return false
            when 'VERTICAL'
                return true
            when 'COVER'
                return @aspect_ratio <= @target_aspect_ratio
            when 'CONTAIN'
                return @aspect_ratio > @target_aspect_ratio
            else
                throw Error "Camera.sensor_fit must be
                    AUTO, HORIZONTAL, VERTICAL, COVER or CONTAIN."

    update_projection: ->
        @_calculate_projection()
        @_calculate_culling_planes()

    # @nodoc
    _calculate_projection: ->
        near_plane = @near_plane
        far_plane = @far_plane
        if @fov_4[0] == 0
            # Regular symmetrical FoV
            if @cam_type == 'PERSP'
                half_size = near_plane * Math.tan(@field_of_view/2)
            else if @cam_type == 'ORTHO'
                half_size = @ortho_scale/2
            else
                throw Error "Camera.cam_type must be PERSP or ORTHO."

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

    # @nodoc
    # Calculate frustum culling planes from projection_matrix_inv
    _calculate_culling_planes: ->
        a = vec3.create()
        b = vec3.create()
        c = vec3.create()
        normal = vec3.create()
        q = quat.create()
        i = 0
        for axis in [0...3]
            for side in [-1,1]
                # We calculate 3 points in the untransformed plane,
                # in screen space (-1 to 1 box)
                vec3.set a, side, 0, 0
                vec3.set b, side, .5, 0
                vec3.set c, side, 0, .5*side
                for [0...axis] by 1
                    _shift a
                    _shift b
                    _shift c
                # Then we transform them to world space
                vec3.transformMat4 a, a, @projection_matrix_inv
                vec3.transformMat4 b, b, @projection_matrix_inv
                vec3.transformMat4 c, c, @projection_matrix_inv
                # make b and c relative to a, to calculate the normal
                vec3.sub b, b, a
                vec3.sub c, c, a
                vec3.cross normal, b, c
                vec3.normalize normal, normal
                plane_from_norm_point @cull_planes[i++], normal, a
        return

_shift = (v) ->
    {x,y,z} = v
    v.x = z
    v.y = x
    v.z = y

module.exports = {Camera}
