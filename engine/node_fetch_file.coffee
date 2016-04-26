
fs = require 'fs'

class Body
    constructor: (@buffer) ->
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
                if err
                    reject(err)
                else
                    resolve(new Body(data))
