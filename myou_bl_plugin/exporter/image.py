import bpy
import struct
import shutil
import tempfile
import os
from math import *
from json import dumps, loads
from collections import defaultdict
tempdir  = tempfile.gettempdir()

type_to_ext = {'JPEG': 'jpg', 'TIFF': 'tif', 'TARGA': 'tga'}

def save_image(image, path, new_format, resize=None):
    if resize:
        image = image.copy()
        image.scale(resize[0], resize[1])

    # Store current render settings
    settings = bpy.context.scene.render.image_settings
    format = settings.file_format
    mode = settings.color_mode
    depth = settings.color_depth

    # Change render settings to our target format
    settings.file_format = new_format
    settings.color_mode = 'RGB' if new_format == 'JPEG' else 'RGBA'
    settings.color_depth = '8'

    # Save image, this does NOT render anything!
    # It only means that the save command will use the current scene's render settings.
    image.save_render(path)

    # Restore previous render settings
    settings.file_format = format
    settings.color_mode = mode
    settings.color_depth = depth

    if resize:
        image.user_clear()
        bpy.data.images.remove(image)


def export_images(dest_path, used_data):
    '''
    This converts/copies all used images and returns encoded JSON with *textures*
    '''
    json_data = []
    if not os.path.exists(dest_path):
        os.mkdir(dest_path)
    elif not os.path.isdir(dest_path):
        raise Exception("Destination path is not a directory: "+dest_path)
    
    pack_generated_images(used_data)
    non_alpha_images = get_non_alpha_images(used_data)

    # For compatibility with old .blends you need to add
    # 'skip_texture_conversion' to the active scene
    scene = bpy.context.scene
    skip_conversion = scene.get('skip_texture_conversion')

    for image in used_data['images']:
        if image.source == 'VIEWER':
            raise ValueError('You are using a render result as texture, please save it as image first.')
        
        # Find settings in textures. Since there's no UI in Blender for
        # custom properties of images, we'll look at them in textures.
        tex_with_settings = None
        for tex in used_data['image_users'][image.name]:
            if 'lod_levels' in tex:
                if not tex_with_settings:
                    tex_with_settings = tex
                else:
                    raise Exception('There are several textures with settings for image '+image.name+':\n'+
                        tex_with_settings.name+' and '+tex.name+'. Please remove settings from one of them')
            
        lod_levels = []
        if tex_with_settings:
            if isinstance(tex_with_settings['lod_levels'], str):
                lod_levels = loads(tex_with_settings['lod_levels'])
            else:
                lod_levels = list(tex_with_settings['lod_levels'])
        
        real_path = bpy.path.abspath(image.filepath)
        path_exists = os.path.isfile(real_path)
        uses_alpha = image not in non_alpha_images
        image_info = {
            'type': 'TEXTURE',
            'name': image.name,
            'formats': defaultdict(list),
            # 'formats': {
            #     # The list is ordered from low quality to high quality
            #     'png': [{width, height, file_size, file_name, data_uri}, ...]
            #     'jpeg':
            #     'crunch':
            #     'etc1':
            #     'pvrtc':
            # }
            'wrap': None, # null on purpose = setting taken from material
            'filter': None,
            'use_mipmap': None,
        }
        
        num_tex_users = len(used_data['image_users'][image.name])
        print('Exporting image:', image.name, 'with', num_tex_users, 'texture users')
        if uses_alpha:
            print('image:', image.name, 'is using alpha channel')
        if lod_levels:
            print('image:', image.name, 'has lod_levels', lod_levels)

        if image.source == 'FILE':
            out_format = 'JPEG'
            out_ext = 'jpg'
            if uses_alpha:
                out_format = 'PNG'
                out_ext = 'png'
            for lod_level in lod_levels+[None]:
                if path_exists or image.packed_file:
                    # image['exported_extension'] is only used
                    # for material.uniform['filepath'] which is only used
                    # in old versions of the engine.
                    # Current versions use the exported list of textures instead
                    image['exported_extension'] = out_ext
                    
                    # Cases in which we can or must skip conversion
                    just_copy_file = \
                        path_exists and \
                        (image.file_format == out_format or skip_conversion) and \
                        lod_level is None
                    if just_copy_file:
                        file_name = image.name + '.' + out_ext
                        # The next 3 lines are only necessary for skip_conversion
                        out_ext = image.filepath_raw.split('.')[-1]
                        exported_path = os.path.join(dest_path, file_name)
                        image['exported_extension'] = out_ext
                        
                        shutil.copy(real_path, exported_path)
                        image_info['formats'][out_format.lower()].append({
                            'width': image.size[0], 'height': image.size[1],
                            'file_name': file_name, 'file_size': fsize(exported_path),
                        })
                        print('Copied original image')
                    else:
                        if lod_level is not None:
                            if isinstance(lod_level, int):
                                width = height = lod_level
                            else:
                                width, height = lod_level
                            file_name = image.name + '-{w}x{h}.{e}'.format(w=width, h=height, e=out_ext)
                            exported_path = os.path.join(dest_path, file_name)
                            save_image(image, exported_path, out_format, resize=(width, height))
                            image_info['formats'][out_format.lower()].append({
                                'width': width, 'height': height,
                                # 'file_name': file_name,
                                'data_uri': file_path_to_data_uri(exported_path, out_format),
                                'file_size': fsize(exported_path),
                            })
                            
                            print('Image resized to '+str(lod_level)+' and exported as '+out_format)
                        else:
                            file_name = image.name + '.' + out_ext
                            exported_path = os.path.join(dest_path, file_name)
                            save_image(image, exported_path, out_format)
                            image_info['formats'][out_format.lower()].append({
                                'width': image.size[0], 'height': image.size[1],
                                'file_name': file_name, 'file_size': fsize(exported_path),
                            })
                            print('Image exported as '+out_format)
                else:
                    raise Exception('Image not found: ' + image.name + ' path: ' + real_path)
        elif image.source == 'MOVIE' and path_exists:
            out_ext = image.filepath_raw.split('.')[-1]
            file_name = image.name + '.' + out_ext
            exported_path = os.path.join(dest_path, file_name)
            image['exported_extension'] = out_ext
            if path_exists:
                shutil.copy(real_path, exported_path)
                image_info['formats'][image.file_format.lower()].append({
                    'width': image.size[0], 'height': image.size[1],
                    'file_name': file_name, 'file_size': fsize(exported_path),
                })
                print('Copied original video')
        else:
            raise Exception('Image source not supported: ' + image.name + ' source: ' + image.source)
        
        # Embed all images that are 64x64 or lower, and delete the files
        # To change the default 64x64, add an 'embed_max_size' property
        # to the scene, set the value (as integer) and a max range >= the value
        # (if you don't change the max range, the final value used gets clamped)
        files_to_delete = set()
        for fmt, datas in image_info['formats'].items():
            for data in datas:
                if fmt in ['png', 'jpeg'] and \
                        max(data['width'],data['height']) <= scene.get('embed_max_size', 64) and \
                        data.get('file_name', None):
                    exported_path = os.path.join(dest_path, data['file_name'])
                    data['data_uri'] = file_path_to_data_uri(exported_path, fmt)
                    data['file_name'] = None
                    del data['file_name']
                    files_to_delete.add(exported_path)
        for fpath in files_to_delete:
            os.unlink(fpath)
        print()
        json_data.append(image_info)
    return json_data

def pack_generated_images(used_data):
    for image in used_data['images']:
        if image.source == 'GENERATED': #generated or rendered
            print('Generated image will be packed as png')
            #The image must be saved in a temporal path before packing.
            tmp_filepath = tempfile.mktemp('.png')
            image.file_format = 'PNG'
            image.filepath_raw = tmp_filepath
            image.save()
            image.pack()
            image.filepath = ''
            os.unlink(tmp_filepath)

def get_non_alpha_images(used_data):
    non_alpha_images = []
    for image in used_data['images']:
        # TODO: also check if any use_alpha of textures is enabled
        if not image.use_alpha:
            non_alpha_images.append(image)
        elif not bpy.context.scene.get('skip_texture_conversion'):
            # If it's not a format known to not have alpha channel,
            # make sure it has an alpha channel at all
            # by saving it as PNG and parsing the meta data
            if image.file_format not in ['JPEG', 'TIFF']:
                path = bpy.path.abspath(image.filepath)
                if image.file_format == 'PNG' and os.path.isfile(path):
                    if not png_file_has_alpha(path):
                        non_alpha_images.append(image)
                elif image.packed_file or os.path.isfile(path):
                    tmp_filepath = tempfile.mktemp('.png')
                    save_image(image, tmp_filepath, 'PNG')
                    if not png_file_has_alpha(tmp_filepath):
                        non_alpha_images.append(image)
                    os.unlink(tmp_filepath)
            else:
                non_alpha_images.append(image)
    return non_alpha_images

def png_file_has_alpha(file_path):
    try:
        file = open(file_path, 'rb')
        file.seek(8, 0)
        has_alpha_channel = False
        has_transparency_chunk = False
        end = False
        max_bytes = 12
        while not end:
            data_bytes, tag = struct.unpack('!I4s', file.read(8))
            data = file.read(min(data_bytes, max_bytes))
            file.seek(max(0, data_bytes-max_bytes) + 4, 1)
            if tag == b'IHDR':
                if data[9] in [4,6]:
                    has_alpha_channel = True
            if tag == b'tRNS':
                has_transparency_chunk = True
            end = tag == b'IEND'
    except:
        raise Exception("Couldn't read PNG file "+file_path)
    return has_alpha_channel or has_transparency_chunk

def fsize(path):
    return os.stat(path).st_size

import base64
def file_path_to_data_uri(path, type):
    data = base64.b64encode(open(path, 'rb').read()).decode().replace('\n', '')
    return 'data:image/'+type.lower()+';base64,'+data
