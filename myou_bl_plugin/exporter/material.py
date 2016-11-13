import bpy, gpu, os, base64, struct, zlib, re
from json import loads, dumps

SHADER_LIB = ""
tex_sizes = {}

def get_shader_lib():
    return SHADER_LIB

def reset_shader_lib():
    global SHADER_LIB
    SHADER_LIB = ""

def get_dynamic_constants(mat, scn, paths):
    # Example:
    #paths = [
        #'node_tree.nodes["slicep"].outputs[0].default_value',
        #'node_tree.nodes["slicen"].outputs[0].default_value',
    #]

    shader = gpu.export_shader(scn, mat)
    code = shader['fragment'].rsplit('}', 2)[1]
    sentinel = 0.406198 # random()
    while ("%f"%sentinel) in code:
        sentinel = random.random()
    # We're assuming "%f"%sentinel yelds exactly the same string
    # as the code generator (sprintf is used in both cases)

    # Possible optimization: use a different sentinel per path
    # and call export_shader and update() only once

    varnames = []
    for p in paths:
        try:
            orig_obj = mat.path_resolve(p)
        except ValueError:
            varnames.append(None)
            continue
        obj, attr = ('.'+p).rsplit('.', 1)
        obj = eval('mat'+obj)
        print(obj, attr)
        is_vector = hasattr(orig_obj, '__getitem__')
        if is_vector:
            orig_val = orig_obj[0]
            orig_obj[0] = sentinel
        else:
            setattr(obj, attr, sentinel)
        scn.update()
        sh = gpu.export_shader(scn, mat)
        c = sh['fragment'].rsplit('}', 2)[1]
        # restore original
        if is_vector:
            orig_obj[0] = orig_val
        else:
            setattr(obj, attr, orig_obj)
        pos = c.find("%f"%sentinel)
        if pos!=-1:
            varnames.append(c[:pos].rsplit(' ',3)[1])
        else:
            varnames.append(None)
    if any(varnames):
        scn.update()
    return varnames

def mat_to_json(mat, scn):
    global SHADER_LIB
    shader = gpu.export_shader(scn, mat)
    parts = shader['fragment'].rsplit('}',2)
    if not SHADER_LIB:
        SHADER_LIB = "#extension GL_OES_standard_derivatives : enable\n"\
        +"#ifdef GL_ES\n"\
        +"precision highp float;\n"\
        +"precision highp int;\n"\
        +"#endif\n"+(parts[0]+'}')\
        .replace('gl_ModelViewMatrixInverse','mat4(1)')\
        .replace('gl_ModelViewMatrix','mat4(1)')\
        .replace('gl_ProjectionMatrixInverse','mat4(1)')\
        .replace('gl_ProjectionMatrix[3][3]','0.0')\
        .replace('gl_ProjectionMatrix','mat4(1)')\
        .replace('gl_NormalMatrixInverse','mat3(1)')\
        .replace('gl_NormalMatrix','mat3(1)')\
        .replace('sampler2DShadow','sampler2D')\
        .replace('shadow2DProj(shadowmap, co).x',
                'step(co.z,texture2D(shadowmap, co.xy).x)')\
        .replace('gl_LightSource[i].position','vec3(0,0,0)')\
        .replace('gl_LightSource[i].diffuse','vec3(0,0,0)')\
        .replace('gl_LightSource[i].specular','vec3(0,0,0)')\
        .replace('gl_LightSource[i].halfVector','vec3(0,0,0)')\
        .replace('float rad[4], fac;', 'float rad[4];float fac;')\
        .replace('(normalize(vec).z + 1)', '(normalize(vec).z + 1.0)') \
        .replace('strength * v1 + (1 - strength) * v2', 'strength * v1 + (1.0 - strength) * v2') \
        .replace('int(x) - ((x < 0) ? 1 : 0)', 'int(x) - ((x < 0.0) ? 1 : 0)') \
        .replace('return x - i;', 'return x - float(i);') \
        .replace('(M_PI * 2)', '(M_PI * 2.0)') \
        .replace('((mod(xi, 2) == mod(yi, 2)) == bool(mod(zi, 2)))', 'true') \
        .replace('if (depth > 0) {', 'if (depth > 0.0) {') \
        .replace('if (depth > 1) {', 'if (depth > 1.0) {') \
        .replace('if (depth > 2) {', 'if (depth > 2.0) {') \
        .replace('if (depth > 3) {', 'if (depth > 3.0) {') \
        .replace('if (depth > 4) {', 'if (depth > 4.0) {') \
        .replace('if (depth > 5) {', 'if (depth > 5.0) {') \
        .replace('if (depth > 6) {', 'if (depth > 6.0) {') \
        .replace('if (depth > 7) {', 'if (depth > 7.0) {') \
        .replace('if (depth > 8) {', 'if (depth > 8.0) {') \
        .replace('if (depth > 9) {', 'if (depth > 9.0) {') \
        .replace('fac = 1;', 'fac = 1.0;') \
        .replace('''/* These are needed for high quality bump mapping */
#version 130
#extension GL_ARB_texture_query_lod: enable
#define BUMP_BICUBIC''','').replace('\r','')
        splits = SHADER_LIB. split('BIT_OPERATIONS', 2)
        if len(splits) == 3:
            a,b,c = splits
            SHADER_LIB = a+'BIT_OPERATIONS\n#endif'+c
        #open('/tmp/shader_lib','w').write(SHADER_LIB)
        try:
            import shader_lib_filter, imp
            imp.reload(shader_lib_filter)
            print('Applying shader_lib_filter.py')
            SHADER_LIB = shader_lib_filter.shader_lib_filter(SHADER_LIB)
        except:
            pass

    shader['fragment'] = ('\n'+parts[1]+'}').replace('sampler2DShadow','sampler2D')\
        .replace('\nin ', '\nvarying ')
    shader['fragment'] = re.sub(r'[^\x00-\x7f]',r'', shader['fragment'])

    # Stuff for debugging shaders
    # TODO write only when they have changed
    # if os.name != 'nt':
    #     SHM = "/run/shm/"
    #     open(SHM + mat.name+'.v','w').write(shader['vertex'])
    #     open(SHM + mat.name+'.f','w').write(shader['fragment'])
    #     try:
    #         shader['fragment']=open(SHM + mat.name+'.f2').read()
    #     except:
    #         pass
    #from pprint import pprint
    #pprint(shader['attributes'])
    # ---------------------------

    dyn_consts = loads(mat.get('dyn_consts') or '[]')
    replacements = loads(mat.get('replacements') or '[]')

    # # Checking hash of main() is not enough
    # code_hash = hash(shader['fragment']) % 2147483648
    #print(shader['fragment'].split('{')[0])
    premain, main = shader['fragment'].split('{')

    if 1:
        # Dynamic uniforms (for animation, per object variables,
        #                   particle layers or other custom stuff)
        dyn_consts = []
        block = bpy.data.texts.get('custom_uniforms')
        if block:
            paths = [x for x in block.as_string().split('\n')
                     if x]
            print(paths)
            dyn_consts = get_dynamic_constants(mat, scn, paths)
        else:
            print('no block')
        mat['dyn_consts'] = dumps(dyn_consts)
        # Get list of unknown varyings and save them
        # as replacement strings
        known = ['var'+a['varname'][3:] for a in shader['attributes'] if a['varname']]
        varyings = [x[:-1].split()
                    for x in premain.split('\n')
                    if x.startswith('varying')
                    and len(x) < 21 # this filters varposition/varnormal
                    ]
        replacements = []
        for v in varyings:
            if v[2] not in known:
                replacements.append((' '.join(v),
                    'const {t} {n} = {t}(0.0)'.format(t=v[1], n=v[2])))
        mat['replacements'] = dumps(replacements)

    if any(dyn_consts):
        # Separate constants from the rest
        lines = premain.split('\n')
        # This generates a dictionary with the var name
        # and comma-separated values in a string, like this:
        # {'cons123': '1.23, 4.56, 7.89', ...}
        consts = dict([(c[2], c[3].split('(')[1][:-2]) for c in
                [l.split(' ', 3) for l in lines]
                if c[0]=='const'])

        premain = '\n'.join(l for l in lines if not l.startswith('cons'))

        # Convert them back to constants, except for dynamic ones
        lines = []
        TYPES = ['float', 'vec2', 'vec3', 'vec4', '','','','','mat3','','','','','','','mat4']
        types = [None]*len(dyn_consts)
        for k,v in consts.items():
            t = TYPES[v.count(',')]
            #print(k, dyn_consts, k in dyn_consts)
            if k in dyn_consts:
                lines.append('uniform {0} {1};'.format(t, k))
                types[dyn_consts.index(k)] = t
            else:
                lines.append('const {0} {1} = {0}({2});'.format(t, k, v))

        shader['fragment'] = '\n'.join(lines) + '\n' + premain + '{' + main

        shader['uniforms'] += [
            {'type': -1, 'varname': c, 'gltype': types[i], 'index': i}
            for i,c in enumerate(dyn_consts)]

    # mat['code_hash'] = code_hash

    for a,b in replacements:
        shader['fragment'] = shader['fragment'].replace(a, b)
    
    if mat.game_settings.alpha_blend == 'CLIP':
        shader['fragment'] = re.sub(
            r'gl_FragColor = ([^;]*)',
            r'if(\1.a < 0.7)discard; gl_FragColor = \1',
            shader['fragment'])

    # Find number of required shape attributes (excluding basis)
    # And number of bones
    num_shapes = 0
    num_bones = 0
    num_partsegments = 0
    weights6 = False
    for ob in scn.objects:
        if ob.type == 'MESH':
            # TODO: manage materials attached to object
            if mat in list(ob.data.materials):
                if ob.data.shape_keys:
                    num_shapes = max(num_shapes, len(ob.data.shape_keys.key_blocks) - 1)
                if ob.particle_systems:
                    num_partsegments = 1  # TODO check correct p systems and segments
                if ob.parent and ob.parent.type == 'ARMATURE' and ob.parent_type != 'BONE' and not ob.get('apply_armature'):
                    num_bones = max(num_bones, len([b for b in ob.parent.data.bones if b.use_deform]))
                    if ob.get('weights6'): weights6 = True
    if num_shapes:
        shader['attributes'].append({'type':99, 'count': num_shapes, 'varname': ''})
    if num_partsegments:
        shader['attributes'].append({'type':77, 'count': num_partsegments, 'varname': ''})
    if num_bones:
        t = 86 if weights6 else 88
        shader['attributes'].append({'type':t, 'count': num_bones, 'varname': ''})

    last_lamp = ""
    param_mats = {}
    for u in shader['uniforms']:
        if 'lamp' in u:
            u['lamp'] = last_lamp = u['lamp'].name
        if 'image' in u:
            # TODO: if the image is used in several textures, how can we know which?
            slots = list(mat.texture_slots)
            if mat.use_nodes:
                for node in mat.node_tree.nodes:
                    if node.type=='MATERIAL' and node.material:
                        slots.extend(node.material.texture_slots)
            texture_slot = [t for t in slots
                if t and t.texture and t.texture.type=='IMAGE' and t.texture.image==u['image']]
            if not texture_slot:
                print("Warning: image %s not found in material %s."%(u['image'].name, mat.name))
                u['filter'] = True
                u['wrap'] = 'R'
            else:
                u['filter'] = texture_slot[0].texture.use_interpolation
                u['wrap'] = 'R' if texture_slot[0].texture.extension == 'REPEAT' else 'C'
            u['size'] = 0
            fpath = bpy.path.abspath(u['image'].filepath)
            if os.path.isfile(fpath):
                u['size'] = os.path.getsize(fpath)
            # u['filepath'] is only used in old versions of the engine
            u['filepath'] = u['image'].name + '.' + u['image']['exported_extension']
            u['image'] = u['image'].name
            tex_sizes[u['image']] = u['size']
        if 'texpixels' in u:
            # Minimum shadow buffer is 128x128
            if u['texsize'] > 16000:
                # This is a shadow buffer
                u['type'] = gpu.GPU_DYNAMIC_SAMPLER_2DSHADOW
                del u['texpixels'] # we don't need this
                # Assuming a lamp uniform is always sent before this one
                u['lamp'] = last_lamp
                # TODO: send lamp stuff
            else:
                # It's a ramp
                # encode as PNG data URI
                # TODO: Store this in the JSON texture list when the old engine
                # is no longer used
                def png_chunk(ty, data):
                    return struct.pack('>I',len(data)) + ty + data +\
                        struct.pack('>I',zlib.crc32(ty + data))

                u['filepath'] = 'data:image/png;base64,' + base64.b64encode(
                    b'\x89PNG\r\n\x1a\n'+png_chunk(b'IHDR',
                    struct.pack('>IIBBBBB', 256, 1, 8, 6, 0, 0, 0))+
                    png_chunk(b'IDAT', zlib.compress(
                    b'\x00'+u['texpixels'][:1024])) + png_chunk(b'IEND', b'')
                    #for some reason is 257px?
                ).decode()
                
                u['image'] = hex(hash(u['filepath']))[-15:]
                u['wrap'] = 'C' # clamp to edge
                u['type'] = gpu.GPU_DYNAMIC_SAMPLER_2DIMAGE
                u['size'] = 0
                del u['texpixels']
        if 'material' in u:
            param_mats[u['material'].name] = u['material']
            u['material'] = u['material'].name

    # Engine builds its own vertex shader
    del shader['vertex']
    shader['double_sided'] = not mat.game_settings.use_backface_culling
    shader['type'] = 'MATERIAL'
    shader['name'] = mat.name
    shader['scene'] = scn.name
    
    shader['params'] = [
        {
            'name': m.name,
            'diffuse_color': list(m.diffuse_color),
            'diffuse_intensity': m.diffuse_intensity,
            'specular_color': list(m.specular_color),
            'specular_intensity': m.specular_intensity,
            'specular_hardness': m.specular_hardness,
            'emit': m.emit,
            'alpha': m.alpha,
        }
        for m in param_mats.values()
    ]

    ret = loads(dumps(shader))
    # mat['hash'] = hash(ret) % 2147483648
    return ret
