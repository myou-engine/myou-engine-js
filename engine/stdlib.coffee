"use strict"

TimSort = require('timsort')

window.timsort_sqdist = (arr) ->
    TimSort.sort arr, (a,b)-> a._sqdist - b._sqdist

window.timsort_numeric = TimSort.sort

window.getattr =(ob,item_name,d)->
    if item_name of ob
        return ob[item_name]
    return d

window.randInt = (min, max) ->
    range = max - min
    rand = Math.floor(Math.random() * (range + 1))
    return min + rand

String::startswith ?= (s) -> @[...s.length] == s
String::endswith ?= (s) -> s == '' or @[-s.length..] == s

window.reversed = (x) ->
    result = []
    l = x.length
    i=0
    while i < l
        result.push(x[l-i-1])
        i+=1
    return result

# Add a few base functions, so we don't have a hard time switching
# from Python.

Object.defineProperty(Array.prototype, 'insert',
    {value: (index, item) ->
        @splice(index, 0, item)
    })
Object.defineProperty(Array.prototype, 'extend',
    {value: (items)->
        for item in items
            @append(item)
        return
    })
Object.defineProperty(Array.prototype, 'remove',
    {value: (i) ->
        i = @indexOf(i)
        if i != -1
            @splice(i,1)
    })

Object.defineProperty(Array.prototype, 'clear',
    {value: () ->
        @splice(0)
    })

window.range = (start, stop, step=1) ->
    if not stop?
        stop = start
        start = 0

    r = []

    i = start
    while i < stop
        r.push(i)
        i += step
    return r
    
