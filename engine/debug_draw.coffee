
{vec2, vec3, quat, mat4, color4} = require 'vmath'
qh = require 'quickhull3d'

debug_shape_meshes = null

# This object allows you to create and draw wireframe shapes for debugging,
# as well as automatically drawing invisible objects and physic bodies
# (of all shape types).
# You can access this object from scene.get_debug_draw() and a new instance
# will be created for that scene if it doesn't exist already.
class DebugDraw
    constructor: (@context, @scene, options={}) ->
        {
            @draw_physics=true
            @draw_invisibles=true
            @hidden_alpha=.1
        } = options
        if not debug_shape_meshes
            debug_shape_meshes = new DebugShapeMeshes @context
        @_shapes = debug_shape_meshes
        @shape_instances = []
        for k,v of {Vector, Line, Point, Plane}
            this[k] = v.bind null, this

    _draw: (gl, camera) ->
        mm4 = mat4.create()
        {render_manager} = @context
        camera_position = camera.get_world_position()
        gl.disable gl.DEPTH_TEST
        # TODO: debug shapes going through things like physics
        for shape in @shape_instances by -1
            shape._draw @_shapes, render_manager, camera_position
            if (shape.ttl_frames -= 1) == 0
                shape.destroy()
        for ob in @scene.children
            if @draw_physics and ob.body.type != 'NO_COLLISION'
                @_draw_physics gl, render_manager, ob, mm4
            if @draw_invisibles
                switch ob.type
                    when 'CAMERA'
                        if ob != camera
                            @_draw_frustum gl, render_manager,  ob, mm4
                    when 'MESH'
                        # TODO: Load meshes?
                        if not ob.visible and ob.data?
                            if not ob.properties._invisible_mesh?
                                ob.properties._invisible_mesh =
                                    @_shapes.make_debug_mesh_from(ob)
                            @_draw_empty gl, render_manager, ob, mm4
                    else
                        @_draw_empty gl, render_manager, ob, mm4
        gl.disable gl.DEPTH_TEST
        for ob in @scene.armatures
            @_draw_armature gl, render_manager, ob, mm4
        gl.enable gl.DEPTH_TEST
        return

    _draw_physics: (gl, rm, ob, mm4) ->
        {color, material} = @_shapes
        {body} = ob
        dob = body.debug_mesh
        if not dob?
            switch ob.body.shape
                when 'BOX'
                    dob = body.debug_mesh = @_shapes.box
                when 'SPHERE'
                    dob = body.debug_mesh = @_shapes.sphere
                when 'CYLINDER'
                    dob = body.debug_mesh = @_shapes.cylinder
                when 'CONE'
                    dob = body.debug_mesh = @_shapes.cone
                when 'CAPSULE'
                    {x,y,z} = ob.body.half_extents
                    radius = Math.max(x,y)
                    height = z*2
                    dob = body.debug_mesh =
                        @_shapes.get_capsule {radius, height}
                    body.debug_mesh_has_transform = true
                when 'CONVEX_HULL'
                    phy_m = ob.body.get_physics_mesh()
                    dob = body.debug_mesh = @_shapes.make_convex_hull_from phy_m
                    ob.body.debug_mesh_has_transform = true
                when 'TRIANGLE_MESH'
                    phy_m = ob.body.get_physics_mesh()
                    dob = body.debug_mesh = @_shapes.make_debug_mesh_from phy_m
                    ob.body.debug_mesh_has_transform = true
        ob.get_world_position_rotation_into dob.position, dob.rotation
        if body.debug_mesh_has_transform
            # I'm not sure why we have to do this...
            # half_extents is supposed to be correct but it isn't
            vec3.copy dob.scale, ob.scale
        else
            vec3.copy dob.scale, ob.body.half_extents
        dob._update_matrices()

        # occluded pass
        color4.set color, 1, 1, 1, @hidden_alpha
        gl.enable gl.BLEND
        gl.disable gl.DEPTH_TEST
        rm.draw_mesh dob, dob.world_matrix, -1, material

        # visible pass
        gl.disable gl.BLEND
        gl.enable gl.DEPTH_TEST
        color4.set color, 1, 1, 1, 1
        rm.draw_mesh dob, dob.world_matrix, -1, material

    _draw_armature: (gl, rm, ob, mm4) ->
        dob = @_shapes.bone
        {world_matrix} = ob
        scale = vec3.create()
        for {matrix, blength} in ob._bone_list
            vec3.set scale, blength, blength, blength
            mat4.scale mm4, matrix, scale
            mat4.mul mm4, world_matrix, mm4
            rm.draw_mesh dob, mm4
        return

    _draw_frustum: (gl, rm, ob, mm4) ->
        {use_frustum_culling} = @context.render_manager
        @context.render_manager.use_frustum_culling = false
        {color} = @_shapes
        dob = @_shapes.box
        # Draw camera with frustum of far=1
        {near_plane, far_plane} = ob
        ob.near_plane = 1e-4
        ob.far_plane = 1
        ob._calculate_projection()
        mat4.mul mm4, ob.world_matrix, ob.projection_matrix_inv
        ob.near_plane = near_plane
        ob.far_plane = far_plane
        ob._calculate_projection()

        # occluded pass
        color4.set color, 1, 1, 1, @hidden_alpha
        gl.enable gl.BLEND
        gl.disable gl.DEPTH_TEST
        rm.draw_mesh dob, mm4

        # visible pass
        gl.disable gl.BLEND
        gl.enable gl.DEPTH_TEST
        color4.set color, 1, 1, 1, 1
        rm.draw_mesh dob, mm4

        # Draw whole frustum
        mat4.mul mm4, ob.world_matrix, ob.projection_matrix_inv

        # occluded pass
        color4.set color, 1, 1, 1, @hidden_alpha
        gl.enable gl.BLEND
        gl.disable gl.DEPTH_TEST
        rm.draw_mesh dob, mm4

        # visible pass
        gl.enable gl.DEPTH_TEST
        color4.set color, 1, 1, 1, .5
        rm.draw_mesh dob, mm4
        gl.disable gl.BLEND

        @context.render_manager.use_frustum_culling = use_frustum_culling

    _draw_empty: (gl, rm, ob, mm4) ->
        {color, material} = @_shapes
        dob = ob.properties._invisible_mesh
        if not dob?
            switch ob.properties._empty_draw_type
                when 'SINGLE_ARROW'
                    dob = @_shapes.arrow
                when 'CIRCLE'
                    dob = @_shapes.circle_y
                when 'CUBE'
                    dob = @_shapes.box
                when 'SPHERE'
                    dob = @_shapes.sphere
                when 'CONE'
                    dob = @_shapes.cone_y_base
                else
                    dob = @_shapes.cross3d
            ob.properties._invisible_mesh = dob
        ob.get_world_position_rotation_into dob.position, dob.rotation
        vec3.copy dob.scale, ob.scale
        vec3.scale dob.scale, dob.scale, ob.properties._empty_draw_size or 1
        dob._update_matrices()

        # occluded pass
        color4.set color, 1, 1, 1, @hidden_alpha
        gl.enable gl.BLEND
        gl.disable gl.DEPTH_TEST
        rm.draw_mesh dob, dob.world_matrix, -1, material

        # visible pass
        gl.disable gl.BLEND
        gl.enable gl.DEPTH_TEST
        color4.set color, 1, 1, 1, 1
        rm.draw_mesh dob, dob.world_matrix, -1, material


class DebugShape
    constructor: (@debug_draw) ->
        @debug_draw.shape_instances.push this

    destroy: ->
        {shape_instances} = @debug_draw
        if (i = shape_instances.indexOf this) != -1
            shape_instances.splice i, 1
        return

class Vector extends DebugShape
    constructor: (debug_draw, options={}) ->
        super debug_draw
        {
            @vector=vec3.create()
            @position=vec3.create()
            @color=color4.new 1,1,1,1
            @ttl_frames=0
        } = options

    _draw: (shapes, render_manager, camera_position) ->
        {position, vector, color} = this
        # TODO: draw something else when it's too small (a different arrow?)
        #       and a circle when it's 0
        dob = shapes.arrow
        color4.copy shapes.color, color
        vec2.set shapes.discontinuity, 1, 1
        vec3.copy dob.position, position
        v3 = vector
        v2 = vec3.sub(vec3.create(), camera_position, position)
        vec3.cross v2, v2, v3
        v1 = vec3.normalize vec3.create(), vec3.cross(vec3.create(),v2,v3)
        v2 = vec3.normalize vec3.create(), vec3.cross(v2,v3,v1)
        s = vec3.len v3
        vec3.scale v2,v2,s
        vec3.scale v1,v1,s
        ma = mat4.new v1.x, v1.y, v1.z, 0,
            v2.x, v2.y, v2.z, 0,
            v3.x, v3.y, v3.z, 0,
            dob.position.x, dob.position.y, dob.position.z, 1
        render_manager.draw_mesh dob, ma

class Line extends DebugShape
    constructor: (debug_draw, options={}) ->
        super debug_draw
        {
            @positions=[vec3.create(),vec3.create()]
            @color=color4.new 1,1,1,1
            @segment_count=10
            @segment_ratio=.75
            @ttl_frames=0
        } = options

    _draw: (shapes, render_manager, camera_position) ->
        {positions: [p1, p2], color, segment_count, segment_ratio} = this
        # TODO: draw a circle when it's 0
        dob = shapes.line
        color4.copy shapes.color, color
        vec2.set shapes.discontinuity, segment_count, segment_ratio
        vec3.copy dob.position, p1
        v3 = vec3.clone p2
        vec3.sub v3, v3, p1
        ma = mat4.new v3.y, v3.z, v3.x, 0,
            v3.z, v3.x, v3.y, 0,
            v3.x, v3.y, v3.z, 0,
            dob.position.x, dob.position.y, dob.position.z, 1
        render_manager.draw_mesh dob, ma

class Point extends DebugShape
    constructor: (debug_draw, options={}) ->
        super debug_draw
        {
            @position=[vec3.create(),vec3.create()]
            @color=color4.new 1,1,1,1
            @size=.1
            @ttl_frames=0
        } = options

    _draw: (shapes, render_manager, camera_position) ->
        {position, color, size} = this
        dob = shapes.cross3d
        color4.copy shapes.color, color
        vec3.set dob.scale, size, size, size
        vec3.copy dob.position, position
        quat.set dob.rotation, 0,0,0,1
        dob._update_matrices()
        render_manager.draw_mesh dob, dob.world_matrix

class Plane extends DebugShape
    constructor: (debug_draw, options={}) ->
        super debug_draw
        {
            @position=vec3.create()
            @normal=vec3.new 0,0,1
            @color_front=color4.new 1,1,1,1
            @color_back
            @cell_size=.5
            @divisions=16
            @ttl_frames=0
        } = options
        if not @color_back?
            {r,g,b} = @color_front
            @color_back = color4.new r*.5, g*.5, b*.5, 1


    _draw: (shapes, render_manager, camera_position) ->
        {position, normal} = this
        # determine what side the camera is to draw one color or the other
        normal = vec3.normalize vec3.create(), normal
        p = vec3.sub(vec3.create(), camera_position, position)
        if vec3.dot(p, normal) >= 0
            color4.copy shapes.color, @color_front
        else
            color4.copy shapes.color, @color_back
        dob = shapes.get_grid {@cell_size, @divisions}
        vec3.set dob.scale, 1, 1, 1
        vec3.copy dob.position, position
        quat.rotationTo dob.rotation, vec3.new(0,0,1), normal
        dob._update_matrices()
        render_manager.draw_mesh dob, dob.world_matrix

# This class is a singleton designed for internal use of DebugDraw.
# It manages the creation of debug meshes and shouldn't be used directly.
class DebugShapeMeshes
    constructor: (@context)->
        {sin, cos} = Math

        @box = new @context.Mesh
        d=[1,1,1,
            1,-1,1,
            -1,-1,1,
            -1,1,1,
            1,1,-1,
            1,-1,-1,
            -1,-1,-1,
            -1,1,-1]
        @box.load_from_lists(d, [0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,
                    0,4,1,5,2,6,3,7])

        @cylinder = new @context.Mesh
        d=[]
        idx=[]
        a=(Math.PI*2)/16
        for i in [0...16]
            d.push sin(a*i),cos(a*i),1
            d.push sin(a*i),cos(a*i),-1
            idx.push i*2,(i*2+2)%32,i*2+1,(i*2+3)%32
            if i%2==0
                idx.push i*2,i*2+1
        @cylinder.load_from_lists d, idx

        @cone = new @context.Mesh
        d=[]
        idx=[]
        a=(Math.PI*2)/16
        for i in [0...16]
            d.push 0,0,1
            d.push sin(a*i),cos(a*i),-1
            idx.push i*2+1,(i*2+3)%32
            if i%2==0
                idx.push i*2,i*2+1
        @cone.load_from_lists d, idx

        @cone_y_base = new @context.Mesh
        d=[]
        idx=[]
        a=(Math.PI*2)/16
        for i in [0...16]
            d.push 0,2,0
            d.push sin(a*i),0,cos(a*i)
            idx.push i*2+1,(i*2+3)%32
            if i%2==0
                idx.push i*2,i*2+1
        @cone_y_base.load_from_lists d, idx

        @sphere = new @context.Mesh
        d = []
        idx = []
        for i in [0...16]
            d.push sin(a*i),cos(a*i),0
            idx.push i, (i+1)%16
        for i in [0...16]
            d.push 0,sin(a*i),cos(a*i)
            idx.push i+16, (i+1)%16+16
        for i in [0...16]
            d.push sin(a*i),0,cos(a*i)
            idx.push i+32, (i+1)%16+32
        @sphere.load_from_lists d, idx

        @circle_y = new @context.Mesh
        d = []
        idx = []
        for i in [0...16]
            d.push sin(a*i),0,cos(a*i)
            idx.push i, (i+1)%16
        @circle_y.load_from_lists d, idx

        @arrow = new @context.Mesh
        d = [0,0,0,  0,0,1,  0,0.07,0.7,  0,-0.07,0.7,]
        @arrow.load_from_lists d, [0,1,1,2,1,3]

        @line = new @context.Mesh
        d = [0,0,0,  0,0,1]
        @line.load_from_lists d, [0,1]

        @cross3d = new @context.Mesh
        d = [-1,0,0,  1,0,0, 0,-1,0,  0,1,0, 0,0,-1,  0,0,1, ]
        @cross3d.load_from_lists d, [0,1,2,3,4,5]

        @bone = new @context.Mesh
        d = [0,0,0,
             -0.1, 0.1, -0.1,
              0.1, 0.1, -0.1,
              0.1, 0.1,  0.1,
             -0.1, 0.1,  0.1,
             0,1,0,1,
             ]
        @bone.load_from_lists(d, [0,1,0,2,0,3,0,4,1,2,2,3,3,4,4,1,
                           5,1,5,2,5,3,5,4])

        @color = color4.create()
        @discontinuity = vec2.new 1,1 # repetitions,
        @material = mat = new @context.Material '_debug', {
            material_type: 'PLAIN_SHADER'
            vertex: """
                precision highp float;
                precision highp int;
                uniform mat4 model_view_matrix;
                uniform mat4 projection_matrix;
                attribute vec3 vertex;
                uniform vec2 discontinuity;
                varying vec2 vardiscont;
                void main()
                {
                    vec4 pos = projection_matrix * model_view_matrix * vec4(vertex, 1.0);
                    vardiscont = vec2(
                        vertex.z * discontinuity.x - vertex.z * (1.-discontinuity.y),
                        discontinuity.y
                    );
                    pos.z -= 0.0005;
                    gl_Position = pos;
                }"""
            fragment: """
                precision mediump float;
                uniform vec4 color;
                varying vec2 vardiscont;
                void main(){
                    if(vardiscont.x-floor(vardiscont.x) > vardiscont.y) discard;
                    gl_FragColor = color;
                }"""
            uniforms: [
                {varname: 'color', value: @color}
                {varname: 'discontinuity', value: @discontinuity}
            ]
        }

        for k,ob of this when ob.type == 'MESH'
            ob.elements = []
            ob.stride = 4
            ob.materials = [mat]
            ob.data.draw_method = @context.render_manager.gl.LINES
            ob.rotation_order = 'Q'
            ob._update_matrices()

        @grids = {}
        @capsules = {}

    # @nodoc
    get_grid: (params) ->
        key = JSON.stringify params
        ob = @grids[key]
        if not grid?
            ob = @grids[key] = new @context.Mesh
            {cell_size, divisions} = params
            line_count = divisions + 2
            half_width = cell_size * (divisions+1) * .5
            x = -half_width
            d = []
            idx = []
            for i in [0...line_count*4] by 4
                d.push(x, -half_width, 0,
                       x, half_width, 0,
                      -half_width, x, 0,
                       half_width, x, 0)
                idx.push i, i+1, i+2, i+3
                x += cell_size
            ob.load_from_lists d, idx
            ob.elements = []
            ob.stride = 4
            ob.materials = [@material]
            ob.data.draw_method = @context.render_manager.gl.LINES
            ob.rotation_order = 'Q'
            ob._update_matrices()
        return ob

    # @nodoc
    get_capsule: (params) ->
        key = JSON.stringify params
        ob = @capsules[key]
        if not grid?
            {sin, cos} = Math
            ob = @capsules[key] = new @context.Mesh
            {radius, height} = params
            half_separation = (height/2)-radius
            # middle cylinder
            d=[]
            idx=[]
            a=(Math.PI*2)/16
            for i in [0...16]
                d.push sin(a*i)*radius,cos(a*i)*radius,half_separation
                d.push sin(a*i)*radius,cos(a*i)*radius,-half_separation
                idx.push i*2,(i*2+2)%32,i*2+1,(i*2+3)%32
                if i%2==0
                    idx.push i*2,i*2+1
            v_offset = 16 * 2
            for j in [1,-1]
                z = j*half_separation
                for i in [0...8]
                    d.push 0, cos(a*i)*radius, sin(a*i)*radius*j + z
                    idx.push i+v_offset, i+v_offset+1
                d.push 0, -1, z
                v_offset += 9
                for i in [0...8]
                    d.push cos(a*i)*radius, 0, sin(a*i)*radius*j + z
                    idx.push i+v_offset, i+v_offset+1
                d.push -1, 0, z
                v_offset += 9
            ob.load_from_lists d, idx
            ob.elements = []
            ob.stride = 4
            ob.materials = [@material]
            ob.data.draw_method = @context.render_manager.gl.LINES
            ob.rotation_order = 'Q'
            ob._update_matrices()
        return ob

    # @nodoc
    make_debug_mesh_from: (ob) ->
        dob = new @context.Mesh
        dob.elements = []
        dob.stride = ob.stride
        dob.offsets = ob.offsets[...]
        dob.materials = [@material]
        dob.rotation_order = 'Q'
        {varray, iarray} = ob.data
        new_iarray = new Uint16Array iarray.length*2
        # Make all edges but make sure equivalent edges are equal
        for i in [0...iarray.length] by 3
            i2 = i*2
            a = iarray[i]; b = iarray[i+1]
            new_iarray[i2] = Math.min a,b
            new_iarray[i2+1] = Math.max a,b
            a = iarray[i+2]
            new_iarray[i2+2] = Math.min a,b
            new_iarray[i2+3] = Math.max a,b
            b = iarray[i]
            new_iarray[i2+4] = Math.min a,b
            new_iarray[i2+5] = Math.max a,b
        # Sort and remove duplicates
        iarray32 = new Uint32Array new_iarray.buffer
        iarray32.sort (a,b) -> a-b
        i = 0
        last = -1
        for v in iarray32
            if v != last
                iarray32[i++] = last = v
        # Assign new length
        dob.offsets[3] = i*2
        new_iarray = new_iarray.subarray 0, i*2
        dob.load_from_va_ia varray, new_iarray
        dob.data.draw_method = @context.render_manager.gl.LINES
        return dob

    # @nodoc
    make_convex_hull_from: (ob) ->
        dob = new @context.Mesh
        dob.elements = []
        dob.stride = ob.stride
        dob.offsets = ob.offsets[...]
        dob.materials = [@material]
        dob.rotation_order = 'Q'
        {varray} = ob.data
        points = []
        for i in [0...varray.length] by ob.stride/4
            points.push [varray[i], varray[i+1], varray[i+2]]
        hull_faces = qh points, skipTriangulation: true
        num_indices = 0
        for face in hull_faces
            # it would be points.length*2, but each side of a face
            # contributes half an edge so we would divide by 2 at the end
            num_indices += face.length
        new_iarray = new Uint16Array num_indices
        i = 0
        for face in hull_faces
            prev = face[face.length-1]
            for index in face
                if index > prev # use only one half-edge
                    new_iarray[i++] = prev
                    new_iarray[i++] = index
                prev = index
        dob.offsets[3] = i
        dob.load_from_va_ia varray, new_iarray
        dob.data.draw_method = @context.render_manager.gl.LINES
        return dob


module.exports = {DebugDraw}
