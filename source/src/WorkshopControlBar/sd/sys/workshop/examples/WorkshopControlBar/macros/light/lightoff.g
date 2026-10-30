; Work light OFF: global.lightZoneColor at zero.
; The LED strip is painted ONLY by the system service of the Pi (WorkshopService, Lights page): it sees this variable change and
; repaints every zone. This macro does not send M150. It is run by the "Light off" button of the bar through the service
; (macros/light/light_off_sync.g -> light.set).
if !exists(global.lightZoneColor)
    global lightZoneColor = {0, 0, 0, 0, 0}
else
    set global.lightZoneColor = {0, 0, 0, 0, 0}
