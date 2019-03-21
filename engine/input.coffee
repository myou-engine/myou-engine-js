
###
    Input module, providing an API for remappeable buttons and axes,
    with keyboard and gamepads as input sources for now.
    It gives helpful error messages for the vast majority of mistakes.

    Example:
        axes = new @context.Axes2 'Joy:+X', 'Joy:+Y'
            .add_inputs 'Key:ArrowLeft', 'Key:ArrowRight',
                        'Key:ArrowDown', 'Key:ArrowUp'
        jump_btn = new @context.Button 'Key:Space', 'Joy:A', 'Joy:+Y2', 'Joy:RT'
        jump_btn.on_press = some_function
        console.log axes.value  # {x: 0, y: 0, z: 0}

    NOTE: I'm very satisfied with this API but not with the code structure.
    Expect a rewrite as soon as we need a bit more functionality.
###

{vec3} = require 'vmath'

proxy_warn = {}
if Proxy?
    # TODO: Only do this when not in production
    warn_f = ->
        stack = (new Error).stack.split('\n')
        if /^Error/.test stack[0] then stack.shift()
        throw Error "This method is not bound.
                    Declare it with a fat arrow (=>)\n" + stack[1]
    proxy_warn = new Proxy {}, get: warn_f, set: warn_f

class Button
    constructor: (@context, ids...) ->
        for id in ids
            {source, source_name, pad_index, label} =
                @context.input_manager.parse_id id
            if source?
                source.add_button this, source_name, pad_index, label
        @pressed = @just_pressed = @just_released = false
        @_value = 0  # Semi axis simulation

    press: ->
        if not @pressed
            @pressed = @just_pressed = true
            @_value = 1
            @context.input_manager.pending_reset.push this
            @on_press?.call proxy_warn
        return this

    release: ->
        if @pressed
            @pressed = false
            @just_released = true
            @_value = 0
            @context.input_manager.pending_reset.push this
            @on_release?.call proxy_warn
        return this

    on_press: null

    on_release: null

class Axis
    constructor: (@context, minus, plus) ->
        @value = 0
        # Both of these can be semi axes or buttons,
        # Only the property _value will be read from each
        @_semi_axis_minus = []
        @_semi_axis_plus = []
        @_priority = 1 # last pressed key
        @context.input_manager.all_axis.push this
        @add_inputs minus, plus

    add_inputs: (minus, plus) ->
        if minus?
            flip_minus = false
            if not plus?
                plus = minus
                flip_minus = true
            {source, source_name, pad_index, label} = \
                @context.input_manager.parse_id minus, flip_minus
            if not source?
                # This way only suggests one semi axis when you try
                # to use an implicit (opposite) axis, i.e. new Axis('X','Y')
                return
            source?.add_semi_axis this, source_name, pad_index, label, -1
            {source, source_name, pad_index, label} = \
                @context.input_manager.parse_id plus, false
            source?.add_semi_axis this, source_name, pad_index, label, 1
        return this

    _update: ->
        max_plus = max_minus = 0
        for {_value, just_pressed} in @_semi_axis_plus
            max_plus = Math.max max_plus, _value
            if just_pressed then @_priority = 1
        for {_value, just_pressed} in @_semi_axis_minus
            max_minus = Math.max max_minus, _value
            if just_pressed then @_priority = -1
        # When both semi axes are digital,
        # the last pressed button has the priority
        if @_priority > 0
            comparison = max_plus >= max_minus
        else
            comparison = max_plus > max_minus
        if comparison
            @value = max_plus
        else
            @value = -max_minus
        return

class Axes2
    constructor: (@context, minus_x, plus_x, minus_y, plus_y) ->
        # vec3 instead of vec2 for convenience
        @value = vec3.create()
        @x_axis = new Axis @context
        @y_axis = new Axis @context
        @context.input_manager.all_axes2.push this
        @add_inputs minus_x, plus_x, minus_y, plus_y

    add_inputs: (minus_x, plus_x, minus_y, plus_y) ->
        x = y = x2 = y2 = undefined
        if minus_x?
            if not plus_x? or minus_y? != plus_y?
                throw Error "Invalid parameters. Expected two axes,
                            four semi axes or none."
            if minus_y?
                [x, x2] = [minus_x, plus_x]
                [y, y2] = [minus_y, plus_y]
            else
                x = minus_x # actually +X
                y = plus_x  # actually +Y
            @x_axis.add_inputs x, x2
            @y_axis.add_inputs y, y2
        return this

class InputManager
    constructor: (@context) ->
        @context.input_manager = this
        @input_sources = {}
        @input_source_list = []
        @pending_reset = []
        @all_axis = []
        @all_axes2 = []
        new KeyboardInputSource @context
        new GamepadInputSource @context

    update_axes: ->
        for source in @input_source_list
            source.update_controller()
        for axis in @all_axis
            axis._update()
        for {value, x_axis, y_axis} in @all_axes2
            value.x = x_axis.value
            value.y = y_axis.value
        return

    reset_buttons: ->
        for button in @pending_reset
            button.just_pressed = button.just_released = false
        return

    parse_id: (id, flip_axis) ->
        id = id.toString()
        [source_name, label] = id.split ':'
        pad_index = 0
        if (m = source_name.match /([^\d]*)(\d+)$/)?
            source_name = m[1]
            pad_index = m[2]|0
        source = @input_sources[source_name]
        if not source?
            console.error "Unknown input source: #{source_name}"
            if not label?
                if flip_axis
                    suggest = id
                    if not @input_sources.Joy.has_semi_axis(id)
                        suggest = @input_sources.Joy.suggest_semi_axis(id) ? id
                    console.error "Did you mean 'Joy:#{suggest}'?"
                else
                    suggest = @input_sources.Key.suggest_button(id) ? id
                    console.error "Did you mean 'Key:#{suggest}'?"
            return {}
        if flip_axis
            label = source.opposite_axis label
            if not label?
                # opposite_axis() did output an error
                return {}
        return {source, source_name, pad_index, label}

class InputSource
    constructor: (@context) ->
        @source_names = []
        # Button objects will be referenced here
        # For each pad_index, object with label as key, list of buttons as value
        # [{label: [Button, Button, ...]}, ...]
        # E.g. Joy3:B12 is (button for button in @buttons[3]['B12'])
        @buttons = [{}]
        # but semi axes will have just values
        # and "axis" objects will reference the values
        # but only after @ensure_semi_axis(label) has been called
        @semi_axes = [{}] # [{label: {_value}}, ...]

    register_source: (aliases) ->
        for alias in aliases
            @source_names.push alias
            @context.input_manager.input_sources[alias] = this
            @context.input_manager.input_source_list.push this
        return

    add_button: (button, source_name, pad_index, label) ->
        if not @has_button label
            sname = source_name + (if pad_index!=0 then pad_index else '')
            console.error "Input #{sname} has no button #{label}"
            if (suggestion = @suggest_button label)
                console.error "Did you mean '#{sname}:#{suggestion}'?"
        else
            while @buttons.length <= pad_index
                @buttons.push {}
            buttons = @buttons[pad_index][label]
            if not buttons?
                buttons = @buttons[pad_index][label] = []
            buttons.push button

    add_semi_axis: (axis, source_name, pad_index, label, multiplier) ->
        if @has_button label
            b = new @context.Button
            @add_button b, source_name, pad_index, label
            if multiplier < 0
                axis._semi_axis_minus.push b
            else
                axis._semi_axis_plus.push b
        else if @has_semi_axis label
            semi_axis = @ensure_semi_axis pad_index, label
            if semi_axis?
                if multiplier < 0
                    axis._semi_axis_minus.push semi_axis
                else
                    axis._semi_axis_plus.push semi_axis
        else
            sname = source_name + (if pad_index!=0 then pad_index else '')
            console.error "Input #{sname} has no semi axis or button '#{label}'"
            if (suggestion = @suggest_semi_axis label)?
                console.error "Did you mean '#{sname}:#{suggestion}'?"

    has_button: (label) ->
        throw Error "Abstract method"

    has_semi_axis: (label) ->
        throw Error "Abstract method"

    suggest_button: ->

    suggest_semi_axis: ->

    update_controller: ->
        throw Error "Abstract method"

    opposite_axis: (label) ->
        suggestion = @context.input_manager.input_sources.Joy.
            suggest_semi_axis(label)
        console.error "Input source '#{@source_names[0]}' doesn't have
            opposite semi axis. Specify all semi axes."
        if suggestion
            console.error "Did you mean 'Joy:#{suggestion}'?"

    ensure_semi_axis: (pad_index, label) ->
        while @semi_axes.length <= pad_index
            @semi_axes.push {}
        semi_axes = @semi_axes[pad_index][label]
        if not semi_axes?
            semi_axes = @semi_axes[pad_index][label] = {_value: 0}
        return semi_axes

    ensure_all_existing_semi_axis: ->
        for pad,pad_index in @semi_axes
            for label of pad
                @ensure_semi_axis pad_index, label
        return

class KeyboardInputSource extends InputSource
    constructor: (context) ->
        super context
        @register_source ['Key', 'Keyboard']
        if 'code' of KeyboardEvent.prototype
            window.addEventListener 'keydown', @_keydown
            window.addEventListener 'keyup', @_keyup
        else if 'key' of KeyboardEvent.prototype
            window.addEventListener 'keydown', @_keydown_old
            window.addEventListener 'keyup', @_keyup_old
        else
            console.error "Your browser is too old!"

    has_button: (label) ->
        # Can we know if a key exists without adding the whole list here?
        return label.length > 1 \
            and not /(^(Left|Right|Up|Down))|_/i.test(label) \
            and not /(^(Control|Alt|Shift|Meta|OS|Command)$)|_/i.test(label) \
            and not /^[^A-Z]/.test(label)

    has_semi_axis: (label) -> false

    suggest_button: (label) ->
        # We guess 95% of the mistakes here
        if label.length == 1
            suggestion = polyfill_keyevent_code label, 0
            if label != suggestion
                return suggestion
        incorrect_side = label.match /^(Left|Right|Up|Down)(.*)/i
        if incorrect_side?
            [_, side, rest] = incorrect_side
            return capital(rest.replace('_','') or 'Arrow') + capital(side)
        if label == 'Command'
            return 'OSLeft'
        keys_that_need_side = label.match /^(Control|Alt|Shift|Meta|OS)$/i
        if keys_that_need_side?
            return capital label+'Left'
        under_scored = label.split '_'
        suggestion = (capital x for x in under_scored).join('')
        if suggestion != label
            return suggestion
        return null

    suggest_semi_axis: (label) -> @suggest_button label

    update_controller: ->

    _keydown: (event) =>
        buttons = @buttons[0][event.code]
        if buttons?
            for button in buttons
                button.press()
            event.preventDefault()
        return

    _keyup: (event) =>
        buttons = @buttons[0][event.code]
        if buttons?
            for button in buttons
                button.release()
        return

    _keydown_old: (event) =>
        {key, location} = event
        event.code = polyfill_keyevent_code key, location
        @_keydown event

    _keyup_old: (event) =>
        {key, location} = event
        event.code = polyfill_keyevent_code key, location
        @_keyup event

class GamepadInputSource extends InputSource
    button_mappings =
        'A': 0, 'Cross': 0,
        'B': 1, 'Circle': 1,
        'X': 2, 'Square': 2,
        'Y': 3, 'Triangle': 3,
        'LB': 4, 'L1': 4,
        'RB': 5, 'R1': 5,
        # 'LT': 6, 'L2': 6, # These are semi-axes
        # 'RT': 7, 'R2': 7,
        'Select': 8, 'Back': 8, 'Share': 8,
        'Start': 9, 'Forward': 9, 'Options': 9,
        'LS': 10, 'L3': 10,
        'RS': 11, 'R3': 11,
        'Up': 12, 'DPadUp': 12,
        'Down': 13, 'DPadDown': 13,
        'Left': 14, 'DPadLeft': 14,
        'Right': 15, 'DPadRight': 15,
        'System': 16, 'Guide': 16, 'PS': 16
        'TouchPad': 17,

    button_names = [ 'A', 'B', 'X', 'Y', 'L1', 'R1', 'L2', 'R2', 'Select',
        'Start', 'L3', 'R3', 'Up', 'Down', 'Left', 'Right', 'System', 'TouchPad'
    ]

    constructor: (context, id) ->
        super context
        if not navigator.getGamepads?
            return
        @register_source ['Joy', 'Joystick', 'Gamepad']
        @gamepads = []
        @buttons_as_semi_axes = []
        # @gamepads = navigator.getGamepads()
        window.addEventListener 'gamepadconnected', =>
            console.log "A gamepad has been connected or detected"
            @gamepads = navigator.getGamepads()
            @ensure_all_existing_semi_axis()
        window.addEventListener 'gamepaddisconnected', =>
            console.log "A gamepad has been disconnected"
            @gamepads = navigator.getGamepads()
            @ensure_all_existing_semi_axis()

    add_button: (button, source_name, pad_index, label) ->
        # TODO: This is super ugly!!! We need a generic button/semi_axis class
        # All buttons are treated as semi axes for now
        if (hb = @has_button label)
            index = button_mappings[label]
            if index?
                label = 'B'+index
        super(button, source_name, pad_index, label)
        if hb
            semi_axis = @ensure_semi_axis pad_index, label
            @buttons_as_semi_axes.push button, semi_axis
        return

    has_button: (label) ->
        return label of button_mappings or /^B\d+$/.test(label) \
            or @has_semi_axis label

    has_semi_axis: (label) ->
        return /^([+-](X[12]?|Y[12]?|Axis\d+)|LT|RT|L2|R2)$/.test label

    suggest_button: (label) ->
        if /^\d+$/.test label
            return 'B'+label
        label_low = label.replace(/button|[^A-Za-z]+/gi, '').toLowerCase()
        for name of button_mappings
            if label_low == name.toLowerCase()
                return name
        return

    suggest_semi_axis: (label) ->
        if /^\d+$/.test label
            return '+Axis' + label
        if @has_semi_axis '+' + label
            return '+' + label
        return @suggest_button label

    opposite_axis: (label) ->
        if /^[+-]/.test label
            return {'+': '-', '-': '+'}[label[0]] + label[1...]
        console.error "Input '#{label}' has no opposite semi axis."
        if /^(X|Y|Axis)\d*$/.test label
            console.error "Did you mean '+#{label}'?"
            console.error "Otherwise, specify both semi axes."
        else
            console.error "Specify both semi axes."

    ensure_semi_axis: (pad_index, label) ->
        semi_axis = super(pad_index, label)
        gamepad = semi_axis.gamepad = @gamepads[pad_index]
        # TODO: Remap known non-standard gamepads to standard ones
        # E.g. PS4 controller is remapped in Chrome but not in Firefox
        semi_axis.type = ''
        semi_axis.index = 0
        semi_axis.multiplier = 1
        if gamepad?
            type = 'axes'
            xy = label.match /^[+-]([XY])([12]?)$/
            if xy?
                index = 0
                if xy[1] == 'Y'
                    index = 1
                if xy[2] == '2'
                    index += 2
            else if /^(LT|L2)$/.test label
                type = 'buttons'
                index = 6
            else if /^(RT|R2)$/.test label
                type = 'buttons'
                index = 7
            else # +AxisN and Bn
                match = label.match /^([+-]Axis|B)(\d+)$/
                index = match[2]|0
                if match[1] == 'B'
                    type = 'buttons'
            semi_axis.type = type
            semi_axis.index = index
            if label[0] == '-'
                semi_axis.multiplier = -1
            if gamepad.mapping == 'standard' and (index == 1 or index == 3)
                # We invert Y axes on purpose to match handness
                semi_axis.multiplier *= -1
        return semi_axis

    update_controller: ->
        # NOTE: Looks like Chrome only updates gamepad values if we call this
        if @gamepads.length
            # TODO: Investigate why we had to disable this line in Daydream
            navigator.getGamepads()
        for pad in @semi_axes
            for label, semi_axis of pad
                {gamepad, type, index, multiplier} = semi_axis
                if gamepad?
                    n = gamepad[type][index]
                    semi_axis._value = Math.max 0, ((n.value ? n) * multiplier)
                    # semi_axis.pressed = n.pressed
        # TODO: Redo parts relevant to this, preserving the API
        # but making more configurable
        {buttons_as_semi_axes} = this
        for button,i in buttons_as_semi_axes by 2
            semi_axis = buttons_as_semi_axes[i+1]
            # TODO: This value is rather arbitrary
            # TODO: Do we need hysteresis?
            {index} = semi_axis
            pressed = semi_axis._value > 0.333
            # pressed = semi_axis.pressed or semi_axis._value > 0.333
            if pressed != button.pressed
                if pressed
                    button.press()
                else
                    button.release()
        return

## Helper functions

capital = (str) ->
    return str[0].toUpperCase() + str[1...].toLowerCase()

polyfill_keyevent_code = (key, location) ->
    switch location
        when 0
            key = {
                ' ': 'Space'
                ',': 'Comma'
                '.': 'Period'
                '-': 'Minus'
                '/': 'Slash'
                '\\': 'Backslash'
                '+': 'Plus'
                '=': 'Equal'
                '`': 'Backquote'
            }[key] ? key
            if /^\d$/.test key
                key = 'Digit'+key
            else if key.length == 1
                key = 'Key'+key.toUpperCase()
        when 1
            key += 'Left'
        when 2
            key += 'Right'
        when 3
            key = 'Numpad' + {
                Delete: 'Decimal'
                '.': 'Decimal'
                Insert: '0'
                End: '1'
                ArrowDown: '2'
                PageDown: '3'
                ArrowLeft: '4'
                Unidentified: '5'
                ArrowRight: '6'
                Home: '7'
                ArrowUp: '8'
                PageUp: '9'
                '+': 'Add'
                '-': 'Substract'
                '*': 'Multiply'
                '/': 'Divide'
            }[key] ? key
    return key

module.exports = {Button, Axis, Axes2, InputSource, InputManager}
