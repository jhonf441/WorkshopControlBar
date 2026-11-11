; EXAMPLE macro for the "Capture zero" button of the bar (CNC): remembers where the machine is now as the fixed reference point.
; Nothing here runs until you remove the ";" in front of a line. Move the machine by hand onto your physical reference (a corner of the jig)
; before pressing the button. Machine coordinates (not work coordinates) are stored; setzero.g goes back there.
;
; if !exists(global.cncZeroX)
;     global cncZeroX = 0
; if !exists(global.cncZeroY)
;     global cncZeroY = 0
; set global.cncZeroX = move.axes[0].machinePosition
; set global.cncZeroY = move.axes[1].machinePosition
; M118 P0 S{"Reference point captured: X" ^ global.cncZeroX ^ " Y" ^ global.cncZeroY}
