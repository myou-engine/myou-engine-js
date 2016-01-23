"use strict"

TimSort = require('timsort')

window.timsort_sqdist = (arr) ->
    TimSort.sort arr, (a,b)-> a._sqdist - b._sqdist

window.timsort_numeric = TimSort.sort


window.len = (x)->
    x.length

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



window.all = (list) ->
    r = true
    for l in list
        r = r and bool(l)
    return r

window.any = (list) ->
    r = false
    for l in list
        r = r or bool(l)
    return r

window.extend = (destination, source) ->
    for p in source
        destination[p] = source[p]
    return destination

window.randInt = (min, max) ->
    range = max - min
    rand = Math.floor(Math.random() * (range + 1))
    return min + rand


String::index = String::indexOf
String::join = (iterable)->
    iterable.join(@)
String::lower = String::toLowerCase
String::upper = String::toUpperCase
String::strip = ->
    @replace('/^\s\s*/', '').replace('/\s\s*$/', '')

window.isinstance = (item, cls)->
    if cls instanceof Array
        for cls_item in cls
            if isinstance(item, cls_item)
                return true
        return false

    if cls == list
        cls = Array
    else if cls == dict
        cls = Object
    else if cls == str
        cls = String
    else if cls == int or cls == float
        isnumber = item.constructor == Number::constructor
        return isnumber and cls(item) == item
    else
        return item instanceof cls
    return item.constructor == cls::constructor

String::lower = String::toLowerCase
String::upper = String::toUpperCase
String::find = String::indexOf
String::strip = String::trim

String::startswith ?= (s) -> @[...s.length] is s
String::endswith ?= (s) -> s is '' or @[-s.length..] is s

window.sum = (arr) ->
    if not arr.length then return arr
    return arr.reduce(lambda x,y: x+y)

round = Math.round

window.map = (f, arr) ->
    return arr.map(f)

window.max = Math.max
window.min = Math.min


window.zip = () ->
    zipped = []

    if len(arguments)
        shortest = len(arguments[0])

        for arg in arguments
            shortest = min(len(arg), shortest)

        for i in range(shortest)
            d = []
            for arg in arguments
                d.append(arg[i])
            zipped.append(d)

    return zipped


window.reversed = (x) ->
    result = []
    l = len(x)
    for i in range(l)
        result.push(x[l-i-1])
    return result

window.list = (x) ->
    result = []
    for item in x
        result.push(item)
    return result

window.update_dict = (a,b) ->
    for key of b
        a[key] = b[key]
    return a

class dict
    constructor: (x) ->
        update_dict(@,x)

    update: (x) ->
        update_dict(@,x)

window.dict = dict

window.int = (x)->
    if x.constructor == Number::constructor
        if x >= 0
            return Math.floor(x)
        return Math.ceil(x)
    return parseInt(x)

window.float = (x) ->
    return parseFloat(x)

window.str = (x) ->
    return x.toString()

window.bool = (x) ->
    if not x? or x instanceof Object and (x.is_null or Object.keys(x).length == 0)
        return false
    #if x == '0'
        #return true
    return Boolean(x)


# Add a few base functions, so we don't have a hard time switching
# from Python.

Object.defineProperty(Array.prototype, 'append', {value: Array::push})
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
Object.defineProperty(Array.prototype, 'index', {value: Array::indexOf})
Object.defineProperty(Array.prototype, 'remove',
    {value: (self, i) ->
        i = self.indexOf(i)
        if i != -1
            self.splice(i,1)
    })

Object.defineProperty(Array.prototype, 'clear',
    {value: (self) ->
        self.splice(0)
    })
