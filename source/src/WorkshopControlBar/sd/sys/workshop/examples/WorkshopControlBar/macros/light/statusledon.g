; EXAMPLE macro: give the status LEDs back to automatic control. Nothing here runs until you remove the ";" in front of a line.
; Called by the service (statuslight.set on) and by the "Status ON" button. The LED strip is painted ONLY by the service (Lights page): it
; watches global.statusLedDisabled and repaints every zone when it changes. This file only sets that variable; it sends no M150.
;
; if !exists(global.statusLedDisabled)
;     global statusLedDisabled = false
; else
;     set global.statusLedDisabled = false
; if exists(global.statusLedKey)
;     set global.statusLedKey = ""
; echo "Status LEDs: automatic control on"
