"use strict"

TimSort = require 'timsort'

window.PI_2 = Math.PI * 2

window.closest_pow2 = (n)->
    return Math.pow(2, Math.round(Math.log(n)/Math.log(2)))

window.interpolate = (t, p0, p1, p2, p3)->
    t2 = t * t
    t3 = t2 * t

    c0 = p0
    c1 = -3.0 * p0 + 3.0 * p1
    c2 = 3.0 * p0 - 6.0 * p1 + 3.0 * p2
    c3 = -p0 + 3.0 * p1 - 3.0 * p2 + p3

    return c0 + t * c1 + t2 * c2 + t3 * c3

window.timsort_sqdist = (arr) ->
    TimSort.sort arr, (a,b)-> a._sqdist - b._sqdist

window.timsort_numeric = TimSort.sort

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
        result.push x[l-i-1]
        i+=1
    return result

# Add a few base functions, so we don't have a hard time switching
# from Python.

Object.defineProperty(Array.prototype, 'insert',
    {value: (index, item) ->
        @splice index, 0, item
    })
Object.defineProperty(Array.prototype, 'extend',
    {value: (items)->
        for item in items
            @append item
        return
    })
Object.defineProperty(Array.prototype, 'remove',
    {value: (i) ->
        i = @indexOf i
        if i != -1
            @splice i,1
    })

Object.defineProperty(Array.prototype, 'clear',
    {value: () ->
        @splice 0
    })

window.range = (start, stop, step=1) ->
    if not stop?
        stop = start
        start = 0

    r = []

    i = start
    while i < stop
        r.push i
        i += step
    return r
