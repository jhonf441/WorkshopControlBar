; EXAMPLE macro for the "Set zero" button of the bar (CNC): goes to the reference point of capturezero.g and makes it the XY work origin.
; Nothing here runs until you remove the ";" in front of a line. Work coordinate system 1 (G54, P1) is the one used here.
; The machine moves: check that the way to the reference point is clear before you enable it.
;
; if !exists(global.cncZeroX)
;     abort "No reference point yet: run capturezero.g first"
; G53 G0 X{global.cncZeroX} Y{global.cncZeroY}
; G54
; G10 L20 P1 X0 Y0
; M118 P0 S"XY origin set at X0 Y0"
