
from .mesh import *
from .material import *
#from .. import compiler

from json import dumps, loads
from collections import defaultdict
import shutil

from math import *

import os
TEMPDIR = '/tmp/'
GE_PATH = os.path.realpath(__file__).rsplit(os.sep,2)[0]
if os.name=='nt':
    TEMPDIR = os.environ['TEMP']+'\\' # This may not work, use plugin dir as fallback

MYOU_SCRIPTS = [
    'howler.min.js',
]

MYOU_SCRIPTS_POST = [
    'ammo.asm.js',
    'crunch.js',
    #'cannon.js',
]

DEBUG_SCRIPTS = [
    #'convexHull.js',
]


def scene_data_to_json(scn=None):
    scn = scn or bpy.context.scene
    world = scn.world or bpy.data.scenes['Scene'].world
    scene_data = {
        'type':'SCENE',
        'name': scn.name,
        'gravity' : [0,0,-scn.game_settings.physics_gravity], #list(scn.gravity),
        'background_color' : list(world.horizon_color),
        'debug_physics': scn.game_settings.show_physics_visualization,
        'active_camera': scn.camera.name if scn.camera else 'Camera',
        'stereo': scn.game_settings.stereo == 'STEREO',
        'stereo_eye_separation': scn.game_settings.stereo_eye_separation,
        }
    return dumps(scene_data).encode('utf8')

#ported from animations.py
def interpolate(t, p0, p1, p2, p3):
    t2 = t * t
    t3 = t2 * t

    c0 = p0
    c1 = -3.0 * p0 + 3.0 * p1
    c2 = 3.0 * p0 - 6.0 * p1 + 3.0 * p2
    c3 = -p0 + 3.0 * p1 - 3.0 * p2 + p3

    return c0 + t * c1 + t2 * c2 + t3 * c3

#ported from gameengine/curve.py
def calc_curve_nodes(curves, resolution):
    curve = {'curves':curves, 'resolution':resolution, 'calculated_curves':[]}
    indices = []
    vertices = []
    n = 0
    curve['origins'] = origins = []
    for c in curves:
        cn = 0
        c_indices = []
        c_vertices = []
        for i in range((int(len(c)/9))-1):
            i9 = i*9
            p0x = c[i9+3]
            p0y = c[i9+4]
            p0z = c[i9+5]
            p1x = c[i9+6]
            p1y = c[i9+7]
            p1z = c[i9+8]
            p2x = c[i9+9]
            p2y = c[i9+10]
            p2z = c[i9+11]
            p3x = c[i9+12]
            p3y = c[i9+13]
            p3z = c[i9+14]
            for j in range(resolution):
                x = interpolate(j/resolution, p0x, p1x, p2x, p3x)
                y = interpolate(j/resolution, p0y, p1y, p2y, p3y)
                z = interpolate(j/resolution, p0z, p1z, p2z, p3z)

                vertices.extend([x,y,z])
                indices.append(n)
                indices.append(n+1)

                #sub_curve vertices and indices
                c_vertices.extend([x,y,z])
                c_indices.append(cn)
                c_indices.append(cn+1)

                n += 1
                cn += 1


        c_vertices.extend([p3x, p3y, p3z])
        curve['calculated_curves'].append({'ia':c_indices, 'va':c_vertices})
        vertices.extend([p3x, p3y, p3z])
        n += 1
        va = curve['va'] = vertices
        ia = curve['ia'] = indices
        curve_index = 0
        calculated_nodes = []

    def get_dist(a, b):
        x = b[0] - a[0]
        y = b[1] - a[1]
        z = b[2] - a[2]
        return sqrt(x*x + y*y + z*z)

    def get_nodes(main_curve_index=0, precission=0.0001):
        main_curve = curve['calculated_curves'][main_curve_index]

        nodes = {}

        for i in range(int(len(main_curve['ia'])/2)):
            i2 = i*2
            main_p = main_curve['va'][main_curve['ia'][i2]*3: main_curve['ia'][i2]*3+3]
            ci = 0
            for cc in curve['calculated_curves']:
                if ci != main_curve_index:
                    for ii in range(int(len(cc['ia'])/2)):
                        ii2 = ii*2
                        p = cc['va'][cc['ia'][ii2]*3: cc['ia'][ii2]*3+3]
                        d = get_dist(main_p,p)
                        if d < precission:
                            if not i in nodes:
                                nodes[i]=[[ci,ii]]
                            else:
                                nodes[i].append([ci,ii])
                                #nodes[node_vertex_index] = [attached_curve_index, attached_vertex_index]
                ci += 1
        return nodes

    for cc in curve['calculated_curves']:
        calculated_nodes.append(get_nodes(curve_index))
        curve_index += 1

    return calculated_nodes



def ob_to_json(ob, scn=None, check_cache=False):
    scn = scn or [scn for scn in bpy.data.scenes if ob.name in scn.objects][0]
    scn['game_tmp_path'] = get_scene_tmp_path(scn) # TODO: have a changed_scene function
    data = {}
    #print(ob.type,ob.name)
    obtype = ob.type

    if obtype=='MESH':
        if check_cache:
            print('Checking cache: ',ob.name, scn.name)
        # TODO: QUIRK: when the scene name is changed, cache is not invalidated
        # but new file can't be found (should files be moved?)
        cache_was_invalidated = False
        def convert(o, sort):
            nonlocal cache_was_invalidated
            if (check_cache and not os.path.exists(o.data.get('cached_file', ''))\
                or o.data.get('exported_name') != o.data.name)\
                or 'export_data' not in o.data:
                    cache_was_invalidated = True
                    split_parts = 1
                    while not convert_mesh(o, scn, split_parts, sort):
                        if split_parts > 10:
                            raise Exception("Mesh "+o.name+" is too big.")
                        split_parts += 1

            if check_cache:
                scn['exported_meshes'][o.data['hash']] = o.data['cached_file']

            d = loads(o.data['export_data'])
            materials = []
            passes = []
            for i in o.data.get('material_indexes', []):
                n = 'Material'
                pass_ = 0
                mat = o.material_slots[i:i+1]
                mat = mat and mat[0]
                if mat and mat.material:
                    n = mat.name
                    if mat.material.transparency_method == 'RAYTRACE':
                        pass_ = 2
                    elif mat.material.use_transparency:
                        pass_ = 1
                materials.append(n)
                passes.append(pass_)
            d['materials'] = materials or ['UNDEFINED_MATERIAL']
            d['passes'] = passes or [0]
            return d

        data = convert(ob, sort=True)

        if 'alternative_meshes' in ob:
            orig_mesh = ob.data
            data['active_mesh_index'] = ob['active_mesh_index']
            data['alternative_meshes'] = []
            for d in ob['alternative_meshes']:
                ob.data = bpy.data.meshes[d]
                ob.data['compress_bits'] = orig_mesh.get('compress_bits')
                ob.data['byte_shapes'] = orig_mesh.get('byte_shapes')
                ob.data['uv_short'] = orig_mesh.get('uv_short')
                data['alternative_meshes'].append(convert(ob, sort=False))
            ob.data = bpy.data.meshes[ob['alternative_meshes'][ob['active_mesh_index']]]
        elif ob['modifiers_were_applied']: # No LoD for alt meshes, meshes with keys, etc
            if cache_was_invalidated or 'lod_level_data' not in ob.data:
                # Contains:  (TODO: sorted?)
                #    [
                #        {factor: 0.20,
                #         hash: 'abcdef',
                #         offsets, uv_multiplier, shape_multiplier}, ...
                #    ]
                lod_level_data = []
                lod_exported_meshes = {}
                ob['lod_levels'] = ob.get('lod_levels', '[0.20]')
                for factor in loads(ob['lod_levels']):
                    orig_data = ob.data
                    ob.data = ob.data.copy()
                    scn.objects.active = ob
                    bpy.ops.object.modifier_add(type='DECIMATE')
                    ob.modifiers[-1].ratio = factor
                    ob.modifiers[-1].use_collapse_triangulate = True
                    try:
                        if not convert_mesh(ob, scn, 1, True):
                            raise Exception("Decimated LoD mesh is too big")
                        lod_exported_meshes[ob.data['hash']] = ob.data['cached_file']
                        lod_data = loads(ob.data['export_data'])
                        lod_level_data.append({
                            'factor': factor,
                            'hash': lod_data['hash'],
                            'offsets': lod_data['offsets'],
                            'uv_multiplier': lod_data['uv_multiplier'],
                            'shape_multiplier': lod_data['shape_multiplier'],
                        })
                    finally:
                        bpy.ops.object.modifier_remove(modifier=ob.modifiers[-1].name)
                        ob.data = orig_data
                # end for
                ob.data['lod_level_data'] = dumps(lod_level_data)
                ob.data['lod_exported_meshes'] = lod_exported_meshes
            # end cache invalidated
            data['lod_levels'] = loads(ob.data['lod_level_data'])
            for k,v in ob.data['lod_exported_meshes'].items():
                scn['exported_meshes'][k] = v
        # end if no alt meshes and modifiers_were_applied

        if not 'zindex' in ob:
            ob['zindex'] = 1
        data['zindex'] = ob['zindex']

    elif obtype=='CURVE':
        curves = []
        for c in ob.data.splines:
            l = len(c.bezier_points)
            handles1 = [0.0]*l*3
            points = [0.0]*l*3
            handles2 = [0.0]*l*3
            c.bezier_points.foreach_get('handle_left', handles1)
            c.bezier_points.foreach_get('co', points)
            c.bezier_points.foreach_get('handle_right', handles2)
            curve = [0.0]*l*9
            for i in range(l):
                i3 = i*3
                i9 = i*9
                curve[i9] = handles1[i3]
                curve[i9+1] = handles1[i3+1]
                curve[i9+2] = handles1[i3+2]
                curve[i9+3] = points[i3]
                curve[i9+4] = points[i3+1]
                curve[i9+5] = points[i3+2]
                curve[i9+6] = handles2[i3]
                curve[i9+7] = handles2[i3+1]
                curve[i9+8] = handles2[i3+2]
            curves.append(curve)

        data = {'curves': curves, 'resolution': ob.data.resolution_u}
        if True:#getattr(ob, 'pre_calc', False):
            data['nodes'] = calc_curve_nodes(data['curves'],data['resolution'])

        #print(curves)
    elif obtype=='CAMERA':
        data = {
            'angle': ob.data.angle,
            'clip_end': ob.data.clip_end,
            'clip_start': ob.data.clip_start,
            'ortho_scale': ob.data.ortho_scale,
            'sensor_fit': ob.data.sensor_fit, # HORIZONTAL VERTICAL AUTO
            'cam_type': ob.data.type          # PERSP ORTHO
        }
    elif obtype=='LAMP':
        data = {
            'lamp_type': ob.data.type,
            'color': list(ob.data.color*ob.data.energy),
            'energy': 1, # TODO: move energy here for when all assets no longer use the old way
            'falloff_distance': ob.data.distance,
            'shadow': getattr(ob.data, 'use_shadow', False),
            'tex_size': getattr(ob.data, 'shadow_buffer_size', 512),
            'frustum_size': getattr(ob.data, 'shadow_frustum_size', 0),
            'clip_start': getattr(ob.data, 'shadow_buffer_clip_start', 0),
            'clip_end': getattr(ob.data, 'shadow_buffer_clip_end', 0),
        }
    elif obtype=='ARMATURE':
        bones = []
        bone_dict = {}
        ordered_deform_names = []
        depends = defaultdict(set)
        num_deform = 0
        for bone in ob.data.bones:
            pos = bone.head_local.copy()
            if bone.parent:
                pos = bone.parent.matrix_local.to_3x3().inverted() * (pos - bone.parent.head_local)
            rot = bone.matrix.to_quaternion()
            bdata = {
                'name': bone.name,
                'parent': (bone.parent.name if bone.parent else ""),
                'position': list(pos),
                'rotation': rot[1:]+rot[0:1],
                'deform_id': -1,
                'constraints': [],
                'blength': bone.length,
            }
            bone_dict[bone.name] = bdata
            if bone.use_deform:
                bdata['deform_id'] = num_deform
                ordered_deform_names.append(bone.name)
                num_deform += 1
            for c in bone.children:
                depends[c.name].add(bone.name)
            depends[bone.name]
        # Each constraint: [function_name, owner idx, target idx, args...]
        # TODO: assuming target is own armature
        for bone in ob.pose.bones:
            for c in bone.constraints:
                if c.type.startswith('COPY_') and c.subtarget:
                    axes = [int(c.use_x), int(c.use_y), int(c.use_z)]
                    if axes.count(1)==1 and c.type=='COPY_ROTATION':
                        con = [c.type.lower()+'_one_axis', bone.name, c.subtarget, axes]
                    else:
                        con = [c.type.lower(), bone.name, c.subtarget]
                    bone_dict[bone.name]['constraints'].append(con)

                    depends[bone.name].add(c.subtarget)
                elif c.type == 'STRETCH_TO' and c.subtarget:
                    bone_dict[bone.name]['constraints'].append(
                        [c.type.lower(), bone.name, c.subtarget, c.rest_length, c.bulge])
                    depends[bone.name].add(c.subtarget)
                elif c.type == 'IK' and c.subtarget:
                    cl = c.chain_count or 9999
                    bone_dict[bone.name]['constraints'].append(
                        [c.type.lower(), bone.name, c.subtarget, c.chain_count, c.iterations])
                    depends[bone.name].add(c.subtarget)

        final_order = []
        last = set()
        while depends:
            next = set()
            for k,v in list(depends.items()):
                v.difference_update(last)
                if not v:
                    final_order.append(k)
                    next.add(k)
                    del depends[k]
            last = next
            if not next:
                print("ERROR: cyclic dependencies in", ob.name, "\n      ", ' '.join(depends.keys()))
                # TODO: find bones with less dependencies and no parent dependencies
                break
        bones = [bone_dict[name] for name in final_order]
        ob.data['ordered_deform_names'] = ordered_deform_names
        data = {'bones': bones, 'unfc': num_deform * 4}
        changed = False
        str_data = str(data)
        if ob.data.get('str_data') != str_data:
            changed = True
            ob.data['str_data'] = str_data

        pose = {}
        for bone in ob.pose.bones:
            pose[bone.name] = {
                'position': list(bone.location),
                'rotation': bone.rotation_quaternion[1:]+bone.rotation_quaternion[0:1],
                'scale': list(bone.scale),
            }
        if changed or check_cache:
            data['pose'] = pose
            # Invalidate all children mesh caches
            for c in ob.children:
                if 'exported_name' in c:
                    del c['exported_name']
        else:
            # Send pose only
            data = {'pose': pose}
    else:
        obtype = 'EMPTY'

    if 'particles' in ob:
        data['particles'] = []
        for p in ob['particles']:
            particle = {}
            for k,v in p.items():
                if k == 'formula':
                    v = bpy.data.texts[v].as_string()
                particle[k] = v
            data['particles'].append(particle)
    rot_mode = ob.rotation_mode
    if rot_mode=='QUATERNION':
        rot = ob.rotation_quaternion
        rot_mode = 'Q'
    else:
        rot = ob.rotation_euler.to_quaternion()
        # 'WARNING: All rotations are converted to quaternions (for now).
        rot_mode='Q'


    # Calculate local matrix to extract the hidden
    # parent matrix, particularly the scale

    m = Matrix()
    m[0][0],m[1][1],m[2][2] = ob.scale
    real_local_matrix = (Matrix.Translation(ob.location) * rot.to_matrix().to_4x4() * m)
    hidden_matrix = ob.matrix_local * real_local_matrix.inverted()

    # Extracting rotation and location from computed local
    # matrix instead of the real local
    m3 = ob.matrix_local.to_3x3()
    rot_mode = 'Q'
    rot = m3.to_quaternion()

    first_mat = ob.material_slots and ob.material_slots[0].material

    game_properties = {}
    for k,v in ob.game.properties.items():
        game_properties[k] = v.value

    obj = {
        'scene': scn.name,
        'type': obtype,
        'name': ob.name,
        'pos': list(ob.matrix_local.translation),
        'rot': list(rot),
        'rot_mode': rot_mode,
        'properties': game_properties,
        'scale': list(ob.scale),
        'offset_scale': list(hidden_matrix.to_scale()),
        'dimensions': list(ob.dimensions),
        'color' : list(ob.color),
        'parent': ob.parent.name if ob.parent else None,
        'parent_bone': ob.parent_bone,
        'actions': ob['actions'] if 'actions' in ob else [],
        'dupli_group': ob.dupli_group.name
            if ob.dupli_type=='GROUP' and ob.dupli_group else None,

        # Physics
        'phy_type': ob.game.physics_type,
        'visible': not ob.hide_render,
        'radius': ob.game.radius,
        'anisotropic_friction': ob.game.use_anisotropic_friction,
        'friction_coefficients': list(ob.game.friction_coefficients),
        'collision_group': sum([x*1<<i for i,x in enumerate(ob.game.collision_group)]),
        'collision_mask': sum([x*1<<i for i,x in enumerate(ob.game.collision_mask)]),
        'collision_bounds_type': ob.game.collision_bounds_type,
        'collision_margin': ob.game.collision_margin,
        'collision_compound': ob.game.use_collision_compound,
        'mass': ob.game.mass,
        'no_sleeping': ob.game.use_sleep,
        'is_ghost': ob.game.use_ghost,
        'linear_factor': [1 - int(ob.game.lock_location_x), 1 - int(ob.game.lock_location_y), 1 - int(ob.game.lock_location_z)],
        'angular_factor': [1 - int(ob.game.lock_rotation_x), 1 - int(ob.game.lock_rotation_y), 1 - int(ob.game.lock_rotation_z)],
        'form_factor': ob.game.form_factor,
        'friction': first_mat.physics.friction if first_mat else 0.5,
        'elasticity': first_mat.physics.elasticity if first_mat else 0,
    }
    if ob.game.physics_type == 'CHARACTER':
        obj.update({
            'step_height': ob.game.step_height,
            'jump_force': ob.game.jump_speed,
            'max_fall_speed': ob.game.fall_speed
        })
    obj.update(data)
    #if 'extra_data' in obj:
        #obj.update(loads(obj['extra_data']))
    s = dumps(obj).encode('utf8')
    return s



def action_to_json(action):
    # TYPE, NAME, CHANNEL, list of keys for each element
    # 'object', '', 'location', [[x keys], [y keys], [z keys]]
    # 'pose', bone_name, 'location', [...]
    # 'shape', shape_name, '', [[keys]]
    # Format for each channel element: [flat list of point coords]
    # each point is 6 floats that represent:
    # left handle, point, right handle

    channels = {} # each key is the tuple (type, name, channel)
    markers = {}

    CHANNEL_SIZES = {'position': 3,
                     'rotation': 4, # quats with W
                     'rotation_euler': 3, # TODO: IGNORED
                     'scale': 3,
                     'color': 4}
    for fcurve in action.fcurves:
        path = fcurve.data_path.rsplit('.',1)
        chan = path[-1].replace('location', 'position')\
                       .replace('rotation_quaternion', 'rotation')
        if 'rotation_euler' in path[-1]:
            # TODO: Not supported yet
            continue
        if len(path) == 1:
            type = 'object'
            name = ''
        else:
            #print(path)
            type, name, _ = path[0].split('"')
            if type.startswith('pose.'):
                type = 'pose'
            elif type.startswith('key_blocks'):
                type = 'shape'
            else:
                print('Unknown fcurve path:', path[0])
                continue
        k = type, name, chan
        if not k in channels:
            channels[k] = [[] for _ in range(CHANNEL_SIZES.get(chan, 1))]
        idx = fcurve.array_index
        if chan == 'rotation':
            idx = (idx - 1) % 4
        #print(k, fcurve.array_index)
        l = channels[k][idx]
        for k in fcurve.keyframe_points:
            p = [k.handle_left.x,
                 k.handle_left.y,
                 k.co.x, k.co.y,
                 k.handle_right.x,
                 k.handle_right.y]
            l.extend(p)

    for m in action.pose_markers:
        markers[m.name] = m.frame

    final_action = {'type': 'ACTION',
                    'name': action.name,
                    'channels': [list(k)+[v] for (k,v) in channels.items()],
                    'markers': markers}

    return dumps(final_action).encode('utf8')


def ob_in_layers(scn, ob):
    return any(a and b for a,b in zip(scn.layers, ob.layers))


def ob_materials_recursive(ob):
    r = []
    if ob.type == 'MESH':
        for m in ob.material_slots:
            if m.material:
                r.append(m.material)
    for c in ob.children:
        r += ob_materials_recursive(c)
    return r


def ob_to_json_recursive(ob, scn=None, check_cache=False):
    d = [ob_to_json(ob, scn, check_cache)]
    for c in ob.children:
        if ob_in_layers(scn, ob):
            d += ob_to_json_recursive(c, scn, check_cache)
    return d


def whole_scene_to_json(scn, extra_data=[]):
    previous_scn = None
    if scn != bpy.context.screen.scene:
        previous_scn = bpy.context.screen.scene
        bpy.context.screen.scene = scn

    # TODO: scene doesn't change back
    # Possible quirks of not changing scene:
    # * Meshes can't be exported
    # * Materials with custom uniforms can't be exported
    # Those are or may be cached to mitigate the issue

    was_editing = bpy.context.mode == 'EDIT_MESH'
    if was_editing:
        bpy.ops.object.editmode_toggle()
    scn['exported_meshes'] = {}
    scn['game_tmp_path'] = get_scene_tmp_path(scn) # TODO: have a changed_scene function
    tex_sizes.clear()
    ret = [scene_data_to_json(scn)]
    materials = []
    actions = []
    for ob in scn.objects:
        if ob.parent or not ob_in_layers(scn, ob):
            continue
        ret += ob_to_json_recursive(ob, scn, True)
        materials += ob_materials_recursive(ob)
        if 'actions' in ob:
            actions += ob['actions']
    for group in bpy.data.groups:
        ret.append(dumps(
                {'type': 'GROUP',
                'name': group.name,
                'scene': scn.name,
                'offset': list(group.dupli_offset),
                'objects': [o.name for o in group.objects],
                }).encode())
    mat_json = [mat_to_json(mat, scn) for mat in set(materials)]
    ret += [dumps({"type":"SHADER_LIB","code": get_shader_lib()}).encode()] + mat_json\
    +[action_to_json(action) for action in bpy.data.actions if not action.name.startswith('ConvData_Action') and action.name in actions]
    ret += [dumps(d).encode() for d in extra_data]
    retb = b'['+b','.join(ret)+b']'
    retb_gz = gzip.compress(retb)
    total_textures = get_total_size_of_textures()
    size = len(retb) + total_textures
    size_gz = len(retb_gz) + total_textures
    # TODO TODO TODO TODO TODO stop using scn['exported_meshes']
    # ADD OPTION FOR HIDDEN MESH PRELOADING
    for o in scn.objects:
        if o.type=='MESH' and not o.hide_render and 'cached_file' in o.data and ob_in_layers(scn,o):
            size += os.path.getsize(o.data['cached_file'])
    #print('Total scene size: %.3f MiB (%.3f MiB compressed)' %
          #(size/1048576, size_gz/1048576))
    print('Total scene size: %.3f MiB' % (size/1048576))
    scn['total_size'] = size# + sum(tex_sizes.values())
    if was_editing:
        bpy.ops.object.editmode_toggle()
    if previous_scn:
        bpy.context.screen.scene = previous_scn
    return retb



def get_scene_tmp_path(scn):
    dir = (TEMPDIR + 'scenes' + os.sep + scn.name + os.sep)
    for p in (TEMPDIR + 'scenes', dir):
        try:
            os.mkdir(p)
        except FileExistsError:
            pass
    return dir

def save_tmp_scene(scn):
    dir = get_scene_tmp_path(scn)
    d = whole_scene_to_json(
        scn,
        #extra_data=[{
        #'type':
            #'JSCODE',
        #'code':
            #'external_literals={};\n' + compiler.get_all_literals_code()
        #}]+
        #[{'type': 'JSFILE', 'uri':'logic/'+name+'.js'} for name in compiler.all_tree_names()] +
        #[{'type': 'JSFILE', 'uri':'logic/'+t.name[:-3]+'.js'} for t in bpy.data.texts if 'NodeConf' in t]
        )

    open(dir + 'all.json', 'wb').write(d)
    open(dir + 'all.json.gz', 'wb').write(gzip.compress(d))

# TODO: Export all scenes:
#       switch with bpy.context.screen.scene
#       save to /tmp/$random/scene_name.json

def save_textures(dest_path):
    if not os.path.exists(dest_path):
        os.mkdir(dest_path)
    for image in bpy.data.images:
        real_path = bpy.path.abspath(image.filepath)
        #print(image.name, image.filepath)
        if os.path.exists(real_path) and real_path[-1] != '/':
            ext = image.filepath.rsplit('.',1)[1]
            exported_path = os.path.join(dest_path, image.name + '.' + ext)
            shutil.copy(real_path, exported_path)
            # crunch additional levels
            if ext == 'crn':
                real_path += '.'
                exported_path += '.'
                i = 0
                while os.path.exists(real_path + str(i)):
                    shutil.copy(real_path + str(i), exported_path + str(i))
                    i += 1



def get_total_size_of_textures():
    t = 0
    for image in bpy.data.images:
        real_path = bpy.path.abspath(image.filepath)
        if os.path.exists(real_path):
            t += os.path.getsize(real_path)
    return t

import bpy
from bpy.props import StringProperty, BoolProperty
from bpy_extras.io_utils import ExportHelper

class MyouEngineExporter(bpy.types.Operator, ExportHelper):
    """Export scene as a HTML5 WebGL page."""
    bl_idname = "export_scene.myou"
    bl_label = "Export Myou"

    filename_ext = ""
    filter_glob = StringProperty(default="*", options={'HIDDEN'})

    def execute(self, context):
        export_myou(self.filepath, context.scene)
        return {'FINISHED'}

def menu_export(self, context):
    self.layout.operator(MyouEngineExporter.bl_idname, text="Myou Engine")

def export_myou(path, scn):
    # assuming exec_custom_build_command() has executed successfully
    join = os.path.join

    data_dir = os.path.basename(path.rstrip('/'))
    if data_dir:
        data_dir += '/'
    full_dir = os.path.realpath(join(os.path.dirname(path), data_dir))
    shutil.rmtree(full_dir, ignore_errors=True)
    os.mkdir(full_dir)
    os.mkdir(join(full_dir, 'scenes'))
    os.mkdir(join(full_dir, 'textures'))
    scr_dir = join(full_dir, 'scripts')
    os.mkdir(scr_dir)
    save_textures(join(full_dir, 'textures'))
    for f in MYOU_SCRIPTS + MYOU_SCRIPTS_POST:
        shutil.copy(join(GE_PATH, 'build', f), scr_dir)

    for scene in bpy.data.scenes:
        scn_dir = join(full_dir, 'scenes', scene.name)
        try: os.mkdir(scn_dir)
        except FileExistsError: pass
        scene_json = whole_scene_to_json(scene,
            #extra_data = [{'type':'JSFILE', 'uri': 'logic.js'}]
        )
        open(join(scn_dir, 'all.json'), 'wb').write(scene_json)
        for mesh_file in scene['exported_meshes'].values():
            shutil.copy(mesh_file, scn_dir)
