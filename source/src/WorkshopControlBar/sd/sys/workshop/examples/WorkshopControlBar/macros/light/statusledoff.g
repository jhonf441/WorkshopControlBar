; EXAMPLE macro: switch the automatic status LEDs off (the lighting keeps those LEDs). Nothing here runs until you remove the ";" in front of a line.
; Called by the service (statuslight.set off) and by the "Status OFF" button. Pair of statusledon.g: same variable, opposite value.
; The strip is painted only by the service; this file only sets global.statusLedDisabled, it sends no M150.
;
; if !exists(global.statusLedDisabled)
;     global statusLedDisabled = true
; else
;     set global.statusLedDisabled = true
; echo "Status LEDs: switched off by hand"
