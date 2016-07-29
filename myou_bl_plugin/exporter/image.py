import bpy
import struct
import shutil
import tempfile
import os
from math import *
tempdir  = tempfile.gettempdir()

def save_image(image, path, new_format):
    old_path = image.filepath_raw
    old_format = image.file_format

    image.filepath_raw = path
    image.file_format = new_format
    image.save()

    image.filepath_raw = old_path
    image.file_format = old_format


def save_images(dest_path, used_data):
    if not os.path.exists(dest_path):
        os.mkdir(dest_path)
    
    pack_generated_images(used_data)
    non_alpha_images = get_non_alpha_images(used_data)

    # For compatibility with old .blends you need to add
    # 'skip_texture_conversion' to the active scene
    skip_conversion = bpy.context.scene.get('skip_texture_conversion')

    for image in used_data['images']:
        if image.source == 'VIEWER':
            raise ValueError('You are using a render result as texture, please save it as image first.')
        
        real_path = bpy.path.abspath(image.filepath)
        path_exists = os.path.exists(real_path)
        uses_alpha = image not in non_alpha_images

        print('Exporting image:', image.name)
        if uses_alpha:
            print('image:', image.name, 'is using alpha channel')

        if image.source == 'FILE':
            out_format = 'JPEG'
            out_ext = 'jpg'
            if uses_alpha:
                out_format = 'PNG'
                out_ext = 'png'
            if path_exists or image.packed_file:
                exported_path = os.path.join(dest_path, image.name + '.' + out_ext)
                image['exported_extension'] = out_ext
                if path_exists and (image.file_format == out_format or skip_conversion):
                    out_ext = image.filepath_raw.split('.')[-1]
                    exported_path = os.path.join(dest_path, image.name + '.' + out_ext)
                    image['exported_extension'] = out_ext
                    # The previous lines are only necessary for skip_conversion
                    shutil.copy(real_path, exported_path)
                    print('Copied original image')
                else:
                    save_image(image, exported_path, out_format)
                    print('Image exported as '+out_format)
            else:
                raise Exception('Image not found: ' + image.name + ' path: ' + real_path)
        elif image.source == 'MOVIE' and path_exists:
            out_ext = image.filepath_raw.split('.')[-1]
            exported_path = os.path.join(dest_path, image.name + '.' + out_ext)
            image['exported_extension'] = out_ext
            if path_exists and image.file_format == out_format:
                shutil.copy(real_path, exported_path)
                print('Copied original video')
        else:
            raise Exception('Image source not supported: ' + image.name + ' source: ' + image.source)
        print()

def pack_generated_images(used_data):
    for image in used_data['images']:
        if image.source == 'GENERATED': #generated or rendered
            print('Generated image will be packed as png')
            #The image must be saved in a temporal path before packing.
            tmp_filepath = tempdir + image.name + '.png'
            save_image(image, tmp_filepath, 'PNG')
            image.filepath = tmp_filepath
            image.file_format = 'PNG'
            image.pack()
            image.filepath = ''
            os.unlink(tmp_filepath)

def get_non_alpha_images(used_data):
    non_alpha_images = []
    for image in used_data['images']:
        if not image.use_alpha:
            non_alpha_images.append(image)
        elif not bpy.context.scene.get('skip_texture_conversion'):
            # If it's not a format known to not have alpha channel,
            # make sure it has an alpha channel at all
            if image.file_format not in ['JPEG', 'TIFF']:
                path = bpy.path.abspath(image.filepath)
                if os.path.exists(path):
                    if not png_file_has_alpha(path):
                        non_alpha_images.append(image)
                elif image.packed_file:
                    tmp_filepath = tempdir + image.name + '.png'
                    save_image(image, tmp_filepath, 'PNG')
                    if not png_file_has_alpha(tmp_filepath):
                        non_alpha_images.append(image)
                    os.unlink(tmp_filepath)
            else:
                non_alpha_images.append(image)
    return non_alpha_images

def png_file_has_alpha(file_path):
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
    return has_alpha_channel or has_transparency_chunk
