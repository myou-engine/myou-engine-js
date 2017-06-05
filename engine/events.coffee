{vec2} = require 'gl-matrix'

# TODO: make it not global
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

class Events
    # All are just 1 or 0
    constructor: (root_element, options={})->
        {enable_touch=true} = options
        @keys_pressed = new Uint8Array 256
        @keys_just_pressed = new Uint8Array 256
        @keys_just_released = new Uint8Array 256
        @keys_pressed_count = 0
        @NO_MOVE_TICKS = 3
        @_empty_key_array = new Uint8Array 256
        @tmpv = vec2.create()
        @mouse =
            # mouse x and y are relative to the app root element
            # and they can be negative or out of the element when
            # there's a button pressed
            x: 0
            y: 0
            # rel_x and rel_y is the difference from the last frame
            # both when the pointer is unlocked and locked
            rel_x: 0
            rel_y: 0
            page_x: 0
            page_y: 0
            movement_since_mousedown: 0
            move_events_since_mousedown: 0
            left: false
            middle: false
            right: false
            any_button: false
            wheel: 0
            # You can assign cancel_wheel = true to prevent the
            # mouse wheel from scrolling
            cancel_wheel: false
            target: null
            # Target element on mousedown
            down_target: null
            lock_element: false

        @touch =
            #touch events is a list of the captured touch events
            touch_events:{}
            first_touch_event: null
            last_touch_event: null
            #number of current touches
            count: 0

        warned = false

        Object.defineProperty @touch, 'touches', get: ->
            warned || console.error 'touch.touches is DEPRECATED, use touch.count instead'
            warned = true
            return @count

        # The root_element is used on mousedown
        # and mousemove when no button is pressed
        # while the window is used on mouseup
        # and mousemove when a button is pressed
        # This way you can drag the mouse out of the window and
        # it keeps working until you release.

        keydown = (event)=>
            ae = document.activeElement
            code = event.keyCode
            # F12 is kept pressed after opening the debug console
            if ae.value? or ae.isContentEditable or code==123
                return
            jp = @keys_just_pressed[code] = @keys_pressed[code] ^ 1
            @keys_pressed[code] = 1
            @keys_pressed_count += jp
            if code == 116 # F5
                # workaround for chrome, reload ends up eating a lot of memory
                location.href = location.href
                event.preventDefault()
        document.body.addEventListener 'keydown', keydown, false

        keyup = (event)=>
            ae = document.activeElement
            code = event.keyCode
            if ae.value? or ae.isContentEditable or code==123
                return
            @keys_pressed[code] = 0
            @keys_just_released[code] = 1
            @keys_pressed_count -= 1
        document.body.addEventListener 'keyup', keyup, false

        touch_start = (event)=>
            event.preventDefault()
            for t in event.targetTouches
                touch = @touch.touch_events[t.identifier] or {}
                touch.touching = true
                touch.id = t.identifier
                touch.client_x = t.clientX
                touch.client_y = t.clientY
                touch.page_x = t.pageX
                touch.page_y = t.pageY
                touch.force = t.force
                touch.radius_x = t.radiusX
                touch.radius_y = t.radiusY
                touch.rotation_angle = t.rotationAngle
                touch.x = t.clientX - root_element.rect.left
                touch.y = t.clientY - root_element.rect.top
                touch.rel_x = 0
                touch.rel_y = 0
                touch.movement_since_touch = 0
                touch.touch_target = touch.target = t.target
                @touch.touch_events[touch.id] = touch
                if not @touch.first_touch_event?
                    @touch.first_touch_event = touch
                @touch.last_touch_event = touch
            @touch.count = event.targetTouches.length

        if enable_touch
            root_element.addEventListener 'touchstart', touch_start, false

        touch_end = (event)=>
            event.preventDefault()
            for id,touch of @touch.touch_events
                touch.touching = false
            touch_start(event)
            for id,touch of @touch.touch_events when not touch.touching
                if @touch.first_touch_event == touch
                    @touch.first_touch_event = null
                delete @touch.touch_events[id]
            if @touch.first_touch_event == null and event.targetTouches.length != 0
                @touch.first_touch_event = @touch.touch_events[event.targetTouches.identifier]
            if event.targetTouches.length == 0
                @touch.first_touch_event = null
            @touch.count = event.targetTouches.length

        if enable_touch
            root_element.addEventListener 'touchend', touch_end, false
            root_element.addEventListener 'touchleave', touch_end, false
            root_element.addEventListener 'touchcancel', touch_end, false

        touch_move = (event)=>
            event.preventDefault()

            for t in event.targetTouches
                touch = @touch.touch_events[t.identifier] or {}
                x = t.clientX
                y = t.clientY
                rel_x = x - (touch.client_x or 0)
                rel_y = y - (touch.client_y or 0)
                touch.id = t.identifier
                touch.touching = true
                touch.client_x = t.clientX
                touch.client_y = t.clientY
                touch.page_x = t.pageX
                touch.page_y = t.pageY
                touch.force = t.force
                touch.radius_x = t.radiusX
                touch.radius_y = t.radiusY
                touch.rotation_angle = t.rotationAngle
                touch.x = t.clientX - root_element.rect.left
                touch.y = t.clientY - root_element.rect.top
                touch.rel_x = rel_x
                touch.rel_y = rel_y
                touch.movement_since_touch += Math.abs(rel_x) + Math.abs(rel_y)
                @touch.touch_events[touch.id] = touch
            @touch.count = event.targetTouches.length

        if enable_touch
            root_element.addEventListener 'touchmove', touch_move, false

        mouse = @mouse
        mousedown = (event)->
            event.preventDefault()
            mouse[['left', 'middle', 'right'][event.button]] = true
            mouse.any_button = true
            mouse.page_x = event.pageX
            mouse.page_y = event.pageY
            x = event.layerX
            y = event.layerY
            p = event.target
            while p != root_element
                x += p.offsetLeft
                y += p.offsetTop
                p = p.offsetParent
            mouse.x = x
            mouse.y = y
            mouse.rel_x = 0
            mouse.rel_y = 0
            mouse.movement_since_mousedown = 0
            mouse.move_events_since_mousedown = 0
            mouse.down_target = mouse.target = event.target
        root_element.addEventListener 'mousedown', mousedown, false

        contextmenu = (event)->
            event.preventDefault()
        root_element.addEventListener 'contextmenu', contextmenu, false

        # This mousemove is only used when no button is pressed
        mousemove = (event)->
            if mouse.any_button
                return
            event.preventDefault()
            x = event.pageX
            y = event.pageY
            rel_x = x - mouse.page_x
            rel_y = y - mouse.page_y
            mouse.page_x = x
            mouse.page_y = y
            mouse.rel_x += rel_x
            mouse.rel_y += rel_y
            mouse.x += rel_x
            mouse.y += rel_y
            mouse.target = event.target
        root_element.addEventListener 'mousemove', mousemove, false

    # But this mousemove is only used when a button is pressed
        mousemove_pressed = (event)->
            if not mouse.any_button or mouse.lock_element
                return
            event.preventDefault()
            x = event.pageX
            y = event.pageY
            rel_x = x - mouse.page_x
            rel_y = y - mouse.page_y
            mouse.move_events_since_mousedown += 1
            if mouse.move_events_since_mousedown < @NO_MOVE_TICKS
                return
            mouse.page_x = x
            mouse.page_y = y
            mouse.rel_x += rel_x
            mouse.rel_y += rel_y
            mouse.x += rel_x
            mouse.y += rel_y
            mouse.target = event.target
            mouse.movement_since_mousedown += Math.abs(rel_x) + Math.abs(rel_y)
        window.addEventListener 'mousemove', mousemove_pressed, false

        mouseup = (event)->
            if not mouse.any_button
                return
            event.preventDefault()
            mouse[['left', 'middle', 'right'][event.button]] = false
            mouse.any_button = mouse.left or mouse.middle or mouse.right
            x = event.pageX
            y = event.pageY
            rel_x = x - mouse.page_x
            rel_y = y - mouse.page_y
            mouse.page_x = x
            mouse.page_y = y
            mouse.rel_x += rel_x
            mouse.rel_y += rel_y
            mouse.x += rel_x
            mouse.y += rel_y
            mouse.target = event.target
        window.addEventListener 'mouseup', mouseup, false

        wheel = (event)->
            # this value will eventually be normalized to be pixels or heights
            # until then, we'll have 1 or -1
            mouse.wheel += Math.max(-1, Math.min(1, event.deltaY))
            if mouse.cancel_wheel
                event.stopPropagation()
                event.preventDefault()
        root_element.addEventListener 'wheel', wheel, false

        locked_mousemove = (event)->
            rel_x = event.mozMovementX or event.webkitMovementX or event.movementX or 0
            rel_y = event.mozMovementY or event.webkitMovementY or event.movementY or 0
            mouse.move_events_since_mousedown += 1
            if mouse.move_events_since_mousedown < NO_MOVE_TICKS
                return
            mouse.rel_x += rel_x
            mouse.rel_y += rel_y
            mouse.movement_since_mousedown += Math.abs(rel_x) + Math.abs(rel_y)

        pointerlockchange = (event)->
            if mouse.lock_element
                mouse.lock_element.removeEventListener 'mousemove', locked_mousemove
            e = (document.mozPointerLockElement or
                document.webkitPointerLockElement or
                document.pointerLockElement)
            if e
                mouse.lock_element = e
                e.addEventListener 'mousemove', locked_mousemove
            mouse.rel_x = mouse.rel_y = 0

        document.addEventListener 'pointerlockchange', pointerlockchange
        document.addEventListener 'mozpointerlockchange', pointerlockchange
        document.addEventListener 'webkitpointerlockchange', pointerlockchange


    #This function returns only the non undefined touch events
    get_touch_events: ->
        touch_events = []
        for t in @touch.touch_events
            if t? and t.touching
                touch_events.push(t)

        return touch_events

    reset_frame_events: ->
        @keys_just_pressed.set @_empty_key_array
        @keys_just_released.set @_empty_key_array
        @mouse.rel_x = 0
        @mouse.rel_y = 0
        @mouse.wheel = 0

module.exports = {Events}
