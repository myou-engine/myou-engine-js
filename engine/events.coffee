
class Events
    # All are just 1 or 0
    keys_pressed: new Uint8Array 256
    keys_just_pressed: new Uint8Array 256
    keys_just_released: new Uint8Array 256
    keys_pressed_count: 0
    NO_MOVE_TICKS: 3

    mouse:
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

    touch: {}

    # This function sets a set of generic event handlers
    # for keyboard, mouse, touch... to be used by game logic
    # without having to add one listener per key or button

    constructor: (root_element)->
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
            if mouse.move_events_since_mousedown < NO_MOVE_TICKS
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
            mouse.wheel += max(-1, min(1, event.deltaY))
            if mouse.cancel_wheel
                event.preventDefault()
        root_element.addEventListener('wheel', wheel, false)

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
                mouse.lock_element.removeEventListener('mousemove', locked_mousemove)
            e = (document.mozPointerLockElement or
                document.webkitPointerLockElement or
                document.pointerLockElement)
            if e
                mouse.lock_element = e
                e.addEventListener('mousemove', locked_mousemove)
            mouse.rel_x = mouse.rel_y = 0

        document.addEventListener('pointerlockchange', pointerlockchange)
        document.addEventListener('mozpointerlockchange', pointerlockchange)
        document.addEventListener('webkitpointerlockchange', pointerlockchange)


    _empty_key_array = new Uint8Array(256)

    reset_frame_events = ->
        keys_just_pressed.set(_empty_key_array)
        keys_just_released.set(_empty_key_array)
        @mouse.rel_x = 0
        @mouse.rel_y = 0
        @mouse.wheel = 0

module.exports = {Events}
