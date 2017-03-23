
# This module allows fetch to load local files from file://
# in node.js, electron and NW.js

if window.process?.execPath

    req = eval 'require'
    fs = req 'fs'

    class Body
        constructor: (err, @buffer) ->
            @ok = not err
            @status = ''
            @statusText = err?.message
        arrayBuffer: -> Promise.resolve @buffer.buffer
        text: -> Promise.resolve @buffer.toString()
        json: -> Promise.resolve JSON.parse @buffer.toString()

    _fetch = window._native_fetch = window._native_fetch or fetch
    window.fetch = (uri) ->
        if /^(https?:)?\/\//.test uri
            _fetch.apply window, arguments
        else
            if /^file:\/\/\/[a-z]:/.test uri
                uri = uri[8...]
            else if /^file:\/\//.test uri
                uri = uri[7...]
            new Promise (resolve, reject) ->
                fs.readFile uri, (err, data) ->
                    resolve(new Body(err, data))
