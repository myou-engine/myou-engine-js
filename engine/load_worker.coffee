
CRUNCH_MEM = 64
MAX_ACTIVE_TASKS = 6
worker = @
# Crunch is imported in the head of the load_worker (in loader.coffee)
# JS("importScripts('crunch.js')")

# TODO: test: failing files, stuck files

#decode functions:
load_crunch = (task_id, queue_id, data, extra_data, uri) ->
    data = new Uint8Array(data)
    data_view = new DataView(data.buffer)
    src_size = data.length
    src = Crunch._malloc(src_size)
    Crunch.HEAPU8.set(data, src)
    width = data_view.getUint16(12)
    height = data_view.getUint16(14)
    levels = data[16]
    faces = data[17]
    format = data[18]
    additional_levels = data[25]
    level_buffers = []
    # TODO: copy levels in a single buffer instead of several?
    # good because there are less gc objects? or bad idea because it's contiguous?
    if format == 0
        block_bytes = 8
    else
        block_bytes = 16
    context = Crunch._crn_unpack_begin(src, src_size)
    i = 0
    while i < levels
        data_length = (Math.max( 4, width>>i )>>2) * (Math.max( 4, height>>i )>>2) * block_bytes
        #max_size = Math.max(max_size, src_size+dataLength)
        #console.log max_size
        data_offset = Crunch._crn_unpack_level(context, src, src_size, i)
        # This makes a copy, to be used as a transferable buffer
        buffer = Crunch.HEAPU8.buffer[data_offset ... data_offset+data_length]
        if not COMPRESSED_TEXTURE_SUPPORT
            buffer = dxtToRgb565(new Uint16Array(buffer), 0, width>>i, height>>i).buffer
        level_buffers.push(buffer)
        Crunch._free(data_offset)
        i += 1
    common_data = null
    transfer = level_buffers
    if additional_levels
        # Transfer the common data too, to be used for higher levels and in case of lost context
        common_data_size = data_view.getUint32(70)
        common_data = data.buffer[ ... common_data_size]
        transfer = level_buffers.concat([data.buffer])
    post_message([task_id, queue_id, [additional_levels, width, height, format, level_buffers, common_data, uri]], transfer)
    Crunch._crn_unpack_end(context)
    Crunch._free(src)

load_crunch_extra = (task_id, queue_id, data, original_common_data, uri)->
    global max_size
    data = new Uint8Array(data)
    original_common_data = new Uint8Array(original_common_data)
    data_view = new DataView(data.buffer)
    # The data contains a modified header (16 bytes)
    # and then the new level. We thus calculate the size:
    src_size = original_common_data.length + (data.length - 16)
    src = Crunch._malloc(src_size)
    # First we set the original common data
    Crunch.HEAPU8.set(original_common_data, src)
    # Then we overwrite the modified header (first 16 bytes)
    Crunch.HEAPU8.set(data.subarray(0,16), src)
    # Also we have to write the total length to the nextlevel offset
    # because crunch uses that for calculating the size
    Crunch.HEAPU8.set(data.subarray(6, 10), src + 74)
    # Finally we copy the new level to the first level offset
    # which is just after the common data
    Crunch.HEAPU8.set(data.subarray(16), src + original_common_data.length)

    width = data_view.getUint16(12)
    height = data_view.getUint16(14)
    faces = original_common_data[17]
    format = original_common_data[18]
    level_buffers = []
    # TODO: copy levels in a single buffer instead of several?
    # good because there are less gc objects? or bad idea because it's contiguous?
    if format == 0
        block_bytes = 8
    else
        block_bytes = 16
    context = Crunch._crn_unpack_begin(src, src_size)
    data_length = (Math.max( 4, width )>>2) * (Math.max( 4, height )>>2) * block_bytes
    #max_size = Math.max(max_size, src_size+dataLength)
    #console.log max_size
    data_offset = Crunch._crn_unpack_level(context, src, src_size, 0)
    # This makes a copy, to be used as a transferable buffer
    buffer = Crunch.HEAPU8.buffer[data_offset ... data_offset+(data_length)]
    Crunch._free(data_offset)

    post_message([task_id, queue_id, [width, height, format, buffer, uri]], [buffer])
    Crunch._crn_unpack_end(context)
    Crunch._free(src)

dxtToRgb565 = (src, src16Offset, width, height) ->
    c = new Uint16Array(4)
    dst = new Uint16Array(width * height)
    nWords = (width * height) / 4
    m = dstI = i = r0 = g0 = b0 = r1 = g1 = b1 = 0

    blockWidth = width / 4
    blockHeight = height / 4

    blockY = 0
    while blockY < blockHeight
        blockX = 0
        while blockX < blockWidth
            i = src16Offset + 4 * (blockY * blockWidth + blockX)
            c[0] = src[i]
            c[1] = src[i + 1]
            r0 = c[0] & 0x1f
            g0 = c[0] & 0x7e0
            b0 = c[0] & 0xf800
            r1 = c[1] & 0x1f
            g1 = c[1] & 0x7e0
            b1 = c[1] & 0xf800

            # Interpolate between c0 and c1 to get c2 and c3.
            # Note that we approximate 1/3 as 3/8 and 2/3 as 5/8 for
            # speed.  This also appears to be what the hardware DXT
            # decoder in many GPUs does :)

            c[2] = ((5 * r0 + 3 * r1) >> 3) | (((5 * g0 + 3 * g1) >> 3) & 0x7e0) | (((5 * b0 + 3 * b1) >> 3) & 0xf800)
            c[3] = ((5 * r1 + 3 * r0) >> 3) | (((5 * g1 + 3 * g0) >> 3) & 0x7e0) | (((5 * b1 + 3 * b0) >> 3) & 0xf800)
            m = src[i + 2]
            dstI = (blockY * 4) * width + blockX * 4
            dst[dstI] = c[m & 0x3]
            dst[dstI + 1] = c[(m >> 2) & 0x3]
            dst[dstI + 2] = c[(m >> 4) & 0x3]
            dst[dstI + 3] = c[(m >> 6) & 0x3]
            dstI += width
            dst[dstI] = c[(m >> 8) & 0x3]
            dst[dstI + 1] = c[(m >> 10) & 0x3]
            dst[dstI + 2] = c[(m >> 12) & 0x3]
            dst[dstI + 3] = c[(m >> 14)]
            m = src[i + 3]
            dstI += width
            dst[dstI] = c[m & 0x3]
            dst[dstI + 1] = c[(m >> 2) & 0x3]
            dst[dstI + 2] = c[(m >> 4) & 0x3]
            dst[dstI + 3] = c[(m >> 6) & 0x3]
            dstI += width
            dst[dstI] = c[(m >> 8) & 0x3]
            dst[dstI + 1] = c[(m >> 10) & 0x3]
            dst[dstI + 2] = c[(m >> 12) & 0x3]
            dst[dstI + 3] = c[(m >> 14)]
            blockX += 1
        blockY += 1
    return dst

post_message = @postMessage.bind(@)
console = {
    log : (msg)->
        post_message(['log', msg])
}

class Queue
    constructor: (id)->
        @tasks = []
        @loaded = 0
        @active_tasks = 0
        @id = id

    add_progress: (progress)->
        @loaded += progress
        post_message(['progress', @id, @loaded])

    clear: ()->
        @loaded = 0
        @active_tasks = 0
        for xhr in @tasks
            xhr.abort()
        return

    init_tasks: ()->
        while @active_tasks < Math.min(MAX_ACTIVE_TASKS, @tasks.length)
            @tasks[@active_tasks].send()
            @active_tasks += 1

    finish_task: (xhr)->
        @tasks.remove(xhr)
        @active_tasks -= 1
        @init_tasks()
        if @active_tasks == 0
            post_message(['done', @id])

    add_task: (task_id, uri, decode_function, extra_data, tries=6, retry_time=1)->
        xhr = new XMLHttpRequest
        xhr.open('GET', uri, true)
        do_json = false
        if decode_function=='text'
            xhr.responseType = 'text'
            decode_function = null
        else if decode_function == 'json'
            # some browsers still don't implement json type
            xhr.responseType = 'text'
            decode_function = null
            do_json = true
        else
            xhr.responseType = 'arraybuffer'
        @tasks.push(xhr)
        total = 0
        loaded = 0

        queue = @
        retry = ->
            queue.add_task(task_id, uri, decode_function, extra_data, tries - 1, retry_time * 2)
        xhr.onload = (evt) ->
            if xhr.status == 200 or xhr.status == 0
                data = xhr.response
                if do_json
                    data = JSON.parse(data)
                if decode_function
                    worker[decode_function](task_id, queue.id, data, extra_data, uri)
                else
                    if data.byteLength != null
                        total = data.byteLength
                        #total = (new Uint8Array(data)).length
                        post_message([task_id, queue.id, [xhr.response], [xhr.response]])
                        #console.log xhr.response.byteLength  # it should be 0
                    else
                        post_message([task_id, queue.id, [xhr.response]])
                        total = data.length or total
            else
                # TODO: is this necessary for onload?
                if tries
                    post_message([task_id, queue.id, 'error', xhr.status, xhr.response, 'retrying '+uri.split('/').pop()+' in '+retry_time+' seconds'])
                    setTimeout(retry, retry_time*1000)
                    return
                else
                    post_message([task_id, queue.id, 'error', xhr.status, xhr.response, 1])
            queue.add_progress(total - loaded)
            queue.finish_task(xhr)

        xhr.onerror = (evt)->
            if tries
                post_message([task_id, queue.id, 'error', xhr.status, xhr.response, 'retrying '+uri.split('/').pop()+' in '+retry_time+' seconds'])
                setTimeout(retry, retry_time*1000)
            else
                post_message([task_id, queue.id, 'error', xhr.status, xhr.response, 2])
                queue.add_progress(total - loaded)
                queue.finish_task(xhr)

        xhr.onprogress = (evt)->
            # clearTimeout(to_timer)
            # to_timer = setTimeout(instant_retry, 10000)
            if evt.lengthComputable
                queue.add_progress(evt.loaded - loaded)
                total = evt.total
                loaded = evt.loaded

        # instant_retry = ->
        #     xhr.abort()
        #     retry()
        # to_timer = setTimeout(instant_retry, 10000)

        @init_tasks()


queues = []

# clear 1 queue_id
# get   1 queue_id  2 task_id  3 url  4 decode_function  5 [extra data]

# decode_function can be "text", "json" or any function defined here for decoding


onmessage = (e)->
    d = e.data
    if d[0]=='clear'
        queues[d[1]].clear()
    else if d[0]=='get'
        q = queues[d[1]]
        if not q
            q = queues[d[1]] = new Queue(d[1])
        q.add_task(d[2], d[3], d[4], d[5])
    else
        console.log 'error ' + d[0]
