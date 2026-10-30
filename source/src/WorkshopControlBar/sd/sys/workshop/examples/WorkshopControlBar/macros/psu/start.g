; EXAMPLE macro for the "PSU Start" button of the control bar (power supply of the motors).
; Nothing in this file runs until you remove the ';' in front of a line.
; Only for machines whose power supply is switched by the Duet: otherwise tap "Do not use" in the start-up card.
;
; Option 1: the ATX power-on pin of the board (M80), if your board has one wired to the supply.
; M80
;
; Option 2: a relay on a spare output (M42, P = the output number you configured with M950).
; M42 P2 S1
