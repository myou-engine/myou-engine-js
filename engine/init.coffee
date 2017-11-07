
if not window.fetch?
    require 'whatwg-fetch'

require './node_fetch_file'

require './math_utils/math_extra'

# Browser prefix management
window.requestAnimationFrame =
    window.requestAnimationFrame or\
    window.mozRequestAnimationFrame or\
    window.webkitRequestAnimationFrame or\
    window.msRequestAnimationFrame or\
    window.setImmediate

window.cancelAnimationFrame =
    window.cancelAnimationFrame or\
    window.mozCancelAnimationFrame or\
    window.webkitCancelAnimationFrame or\
    window.msCancelAnimationFrame

eproto = HTMLElement?.prototype or {}

eproto.requestPointerLock =
    eproto.requestPointerLock or\
    eproto.mozRequestPointerLock or\
    eproto.webkitRequestPointerLock

eproto.requestFullscreen =
    eproto.requestFullscreen or\
    eproto.mozRequestFullScreen or\
    eproto.webkitRequestFullscreen or\
    eproto.msRequestFullScreen

document.exitPointerLock =
    document.exitPointerLock or\
    document.mozExitPointerLock or\
    document.webkitExitPointerLock

document.exitFullscreen =
    document.exitFullscreen or\
    document.mozCancelFullScreen or\
    document.webkitExitFullscreen or\
    document.msExitFullScreen

if not window.performance
    window.performance = Date

window.is_64_bit_os = (/x86_64|x86-64|Win64|x64;|amd64|AMD64|WOW64|x64_64/).test(navigator.userAgent)
