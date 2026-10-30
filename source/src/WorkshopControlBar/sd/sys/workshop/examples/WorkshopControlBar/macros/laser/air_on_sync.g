; EXAMPLE macro for the "Air on" button of the control bar (air assist of a laser).
; Nothing in this file runs until you remove the ';' in front of a line.
; Only for machines with an air pump or valve: otherwise tap "Do not use" in the start-up card.
;
; Option 1: a fan output used as air (M106, P = the fan number, S = speed from 0 to 1).
; M106 P1 S1
;
; Option 2: a plain output of the board (M42, P = the output number you configured with M950).
; M42 P4 S1
;
; Option 3: call your own macro.
; M98 P"0:/macros/laser/my-air-on.g"
