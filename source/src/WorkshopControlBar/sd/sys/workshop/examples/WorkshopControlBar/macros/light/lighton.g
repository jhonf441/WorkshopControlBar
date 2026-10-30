; Work light ON: leaves its colour in global.lightZoneColor.
; The LED strip is painted ONLY by the system service of the Pi (WorkshopService, Lights page): it sees this variable change and
; repaints every zone. This macro does not send M150. It is run by the "Light on" button of the bar through the service
; (macros/light/light_on_sync.g -> light.set), so the state of the button follows it.
; Edit the colour: {R, G, B, W, brightness} 0-255; or define global.lightOnColor in your config.g.
var c = exists(global.lightOnColor) ? global.lightOnColor : {0, 0, 255, 255, 255}
if !exists(global.lightZoneColor)
    global lightZoneColor = var.c
else
    set global.lightZoneColor = var.c
