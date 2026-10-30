; EXAMPLE macro for the "PSU Stop" button of the control bar (power supply of the motors).
; Nothing in this file runs until you remove the ';' in front of a line.
; Only for machines whose power supply is switched by the Duet: otherwise tap "Do not use" in the start-up card.
; It undoes what "start.g" does.
;
; Option 1: the ATX power-on pin of the board (M81).
; M81
;
; Option 2: a relay on a spare output.
; M42 P2 S0
