; EXAMPLE macro: air assist pump OFF (laser). Nothing here runs until you remove the ";" in front of a line.
; Called by the service (air.set) and by laser jobs that use air assist: M98 P"0:/macros/laser/airoff.g". Pair of airon.g: use the same output.
;
; Option 1: a plain output of the board (M42, P = the output number you configured with M950).
; M42 P4 S0
;
; Option 2: a fan output used as air.
; M106 P1 S0
;
; Option 3: only in Laser mode.
; if global.selectedMode = "Laser"
;     M42 P4 S0
