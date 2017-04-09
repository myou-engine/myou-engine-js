
# TODO: Remove this file, organizing things better

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

window.randInt = (min, max) ->
    range = max - min
    rand = Math.floor(Math.random() * (range + 1))
    return min + rand

window.clamp = (value, min, max) ->
    Math.max(min, Math.min(max, value))

String::startswith ?= (s) -> @[...s.length] == s
String::endswith ?= (s) -> s == '' or @[-s.length..] == s
Array::append ?= Array::push

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

if not Array::insert?
    Object.defineProperty(Array.prototype, 'insert',
        {value: (index, item) ->
            @splice index, 0, item
        })

if not Array::extend?
    Object.defineProperty(Array.prototype, 'extend',
        {value: (items)->
            for item in items
                @append item
            return
        })

if not Array::remove?
    Object.defineProperty(Array.prototype, 'remove',
        {value: (i) ->
            i = @indexOf i
            if i != -1
                @splice i,1
        })

if not Array::clear?
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

# Warn if overriding existing method
if Array::equals
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");

# attach the .equals method to Array's prototype to call it on any array
Array::equals = (array)->
    # if the other array is a falsy value, return
    if not array
        return false
    # compare lengths - can save a lot of time
    if @length != array.length
        return false
    for i in [0...@length]
        # Check if we have nested arrays
        if @[i] instanceof Array && array[i] instanceof Array
            # recurse into the nested arrays
            if not @[i].equals array[i]
                return false
        else if @[i] != array[i]
            # Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false
    return true

# Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

window.KEYS = {
    CANCEL: 3, HELP: 6, BACK_SPACE: 8, TAB: 9, CLEAR: 12,
    RETURN: 13, ENTER: 14, SHIFT: 16, CONTROL: 17, ALT: 18,
    LEFT_SHIFT: 16, LEFT_CONTROL: 17, LEFT_ALT: 18,
    RIGHT_SHIFT: 16, RIGHT_CONTROL: 17, RIGHT_ALT: 18,
    PAUSE: 19, CAPS_LOCK: 20, KANA: 21, HANGUL: 21, EISU: 16,
    JUNJA: 23, FINAL: 24, HANJA: 25, KANJI: 25, ESC: 27,
    CONVERT: 28, NONCONVERT: 29, ACCEPT: 30, MODECHANGE: 31,
    SPACE: 32, PAGE_UP: 33, PAGE_DOWN: 34, END: 35, HOME: 36,
    LEFT_ARROW: 37, UP_ARROW: 38, RIGHT_ARROW: 39, DOWN_ARROW: 40, SELECT: 41,
    PRINT: 42, EXECUTE: 43, PRINTSCREEN: 44, INSERT: 45,
    DELETE: 46, 0: 48, 1: 49, 2: 50, 3: 51, 4: 52,
    5: 53, 6: 54, 7: 55, 8: 56, 9: 57, COLON: 58,
    SEMICOLON: 59, LESS_THAN: 60, EQUALS: 61, GREATER_THAN: 62,
    QUESTION_MARK: 63, AT: 64, A: 65, B: 66, C: 67, D: 68,
    E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75,
    L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82,
    S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89,
    Z: 90, OSKEY: 91, CONTEXT_MENU: 93, SLEEP: 95, NUMPAD_0: 96,
    NUMPAD_1: 97, NUMPAD_2: 98, NUMPAD_3: 99, NUMPAD_4: 100,
    NUMPAD_5: 101, NUMPAD_6: 102, NUMPAD_7: 103, NUMPAD_8: 104,
    NUMPAD_9: 105, NUMPAD_ASTERIX: 106, NUMPAD_PLUS: 107,
    SEPARATOR: 108, NUMPAD_MINUS: 109, NUMPAD_PERIOD: 110,
    NUMPAD_SLASH: 111, F1: 112, F2: 113,
    F3: 114, F4: 115, F5: 116, F6: 117, F7: 118, F8: 119,
    F9: 120, F10: 121, F11: 122, F12: 123, F13: 124,
    F14: 125, F15: 126, F16: 127, F17: 128, F18: 129,
    F19: 130, F20: 131, F21: 132, F22: 133, F23: 134,
    F24: 135, NUM_LOCK: 144, SCROLL_LOCK: 145,
    WIN_OEM_FJ_JISHO: 146, WIN_OEM_FJ_MASSHOU: 147,
    WIN_OEM_FJ_TOUROKU: 148, WIN_OEM_FJ_LOYA: 149,
    WIN_OEM_FJ_ROYA: 150, CIRCUMFLEX: 160, EXCLAMATION: 161,
    DOUBLE_QUOTE: 162, HASH: 163, DOLLAR: 164, PERCENT: 165,
    AMPERSAND: 166, UNDERSCORE: 167, OPEN_PAREN: 168,
    CLOSE_PAREN: 169, ASTERISK: 170, PLUS: 171, PIPE: 172,
    HYPHEN_MINUS: 173, OPEN_CURLY_BRACKET: 174,
    CLOSE_CURLY_BRACKET: 175, TILDE: 176, VOLUME_MUTE: 181,
    VOLUME_DOWN: 182, VOLUME_UP: 183, COMMA: 188, PERIOD: 190,
    SLASH: 191, BACK_QUOTE: 192, OPEN_BRACKET: 219,
    BACK_SLASH: 220, CLOSE_BRACKET: 221, QUOTE: 222, META: 224,
    ALTGR: 225, WIN_ICO_HELP: 227, WIN_ICO_00: 228,
    WIN_ICO_CLEAR: 230, WIN_OEM_RESET: 233, WIN_OEM_JUMP: 234,
    WIN_OEM_PA1: 235, WIN_OEM_PA2: 236, WIN_OEM_PA3: 237,
    WIN_OEM_WSCTRL: 238, WIN_OEM_CUSEL: 239, WIN_OEM_ATTN: 240,
    WIN_OEM_FINISH: 241, WIN_OEM_COPY: 242, WIN_OEM_AUTO: 243,
    WIN_OEM_ENLW: 244, WIN_OEM_BACKTAB: 245, ATTN: 246, CRSEL: 247,
    EXSEL: 248, EREOF: 249, PLAY: 250, ZOOM: 251, PA1: 253,
    WIN_OEM_CLEAR: 254,}
