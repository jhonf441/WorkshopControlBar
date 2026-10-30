; EXAMPLE macro for the "Air off" button of the control bar (air assist of a laser).
; Nothing in this file runs until you remove the ';' in front of a line.
; Only for machines with an air pump or valve: otherwise tap "Do not use" in the start-up card.
; Edit it to undo what "air_on_sync.g" does.
;
; Option 1: a fan output used as air.
; M106 P1 S0
;
; Option 2: a plain output of the board.
; M42 P4 S0
;
; Option 3: call your own macro.
; M98 P"0:/macros/laser/my-air-off.g"
