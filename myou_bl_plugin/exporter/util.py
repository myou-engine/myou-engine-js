import struct
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
