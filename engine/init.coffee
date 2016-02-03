require './stdlib'

# Browser prefix management
window.requestAnimationFrame =
    window.requestAnimationFrame or\
    window.mozRequestAnimationFrame or\
    window.webkitRequestAnimationFrame or\
    window.msRequestAnimationFrame

window.cancelAnimationFrame =
    window.cancelAnimationFrame or\
    window.mozCancelAnimationFrame or\
    window.webkitCancelAnimationFrame or\
    window.msCancelAnimationFrame

eproto = HTMLElement.prototype

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
