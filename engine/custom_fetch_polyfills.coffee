
# These polyfills work in place of
# fetch(base+path).then((data)->data.json()) and
# fetch(base+path).then((data)->data.arrayBuffer())
# They work properly but they're currently not used anywhere.
# TODO: We added this to check if this is more efficient or compatible than
# the regular fetch polyfill. They were created as an attempt to fix
# problems with Safari.

window.fetch_json = (uri) ->
    new Promise (resolve, reject) ->
        console.log 'fetching json', uri
        xhr = new XMLHttpRequest
        xhr.open('GET', uri, true)
        xhr.timeout = 60000
        xhr.onload = ->
            if xhr.status == 200 or xhr.status == 0
                console.log uri,'resolves'
                resolve(JSON.parse(xhr.response))
            else
                console.log uri,'errors'
                reject('Error '+xhr.status+': '+xhr.response)
        xhr.onerror = xhr.ontimeout = ->
            console.log uri,'onerror'
            reject('Error '+xhr.status+': '+xhr.response)
        xhr.send()

window.fetch_buffer = (uri) ->
    new Promise (resolve, reject) ->
        console.log 'fetching bafer', uri
        xhr = new XMLHttpRequest
        xhr.open('GET', uri, true)
        xhr.timeout = 60000
        xhr.responseType = 'arraybuffer'
        xhr.onload = ->
            if xhr.status == 200 or xhr.status == 0
                console.log uri,'resolves'
                resolve(xhr.response)
            else
                console.log uri,'errors'
                reject('Error '+xhr.status+': '+xhr.response)
        xhr.onerror = xhr.ontimeout = ->
            console.log uri,'onerror'
            reject('Error '+xhr.status+': '+xhr.response)
        xhr.send()
