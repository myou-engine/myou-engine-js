
# This module generates Blender scripts for debugging generated data
# as a crude hack until we have proper frame inspection

# Usage:
# dbg = require 'myou-engine/engine/blender_debug.coffee'
# dbg.initialize()
# # run here functions like dbg.generate_plane()
# console.log(dbg.get_script())
# # then paste the script in Blender

# If it's code run on every frame, add a flag so it's run only once

code = ''

initialize = ->
    code = '''import bpy
    from mathutils import *
    Z_VECTOR = Vector((0,0,1))
    def generate_plane(point, normal, name):
        bpy.ops.mesh.primitive_plane_add(radius=1, view_align=False, enter_editmode=False, location=point)
        ob = bpy.context.object
        ob.rotation_mode = 'QUATERNION'
        ob.rotation_quaternion = Z_VECTOR.rotation_difference(Vector(normal))
        ob.name = name or ob.name
        return ob
    \n'''

generate_plane = (point, normal, name) ->
    point = JSON.stringify Array.from point
    normal = JSON.stringify Array.from normal
    code += "generate_plane(#{point}, #{normal}, #{JSON.stringify name})\n"

get_script = -> code

module.exports = {initialize, generate_plane, get_script}
