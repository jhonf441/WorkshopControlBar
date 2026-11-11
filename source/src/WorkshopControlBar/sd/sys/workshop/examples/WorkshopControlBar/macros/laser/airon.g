; EXAMPLE macro: air assist pump ON (laser). Nothing here runs until you remove the ";" in front of a line.
; Called by the service (air.set, the "Turn pump on" switch of the Workshop pages) and by laser jobs that use air assist, always with
; M98 P"0:/macros/laser/airon.g". Only for machines with an air pump or valve; otherwise tap "Do not use" in the start-up card.
; The "Air on" button of the bar uses another file (macros/laser/air_on_sync.g); keep both pointing at the same output.
;
; Option 1: a plain output of the board (M42, P = the output number you configured with M950, S = 0 to 1).
; M42 P4 S1
;
; Option 2: a fan output used as air (M106, P = the fan number, S = speed from 0 to 1).
; M106 P1 S1
;
; Option 3: only in Laser mode (the pin may not exist in other modes of your machine).
; if global.selectedMode = "Laser"
;     M42 P4 S1
; else
;     M291 R"Not available" P"The air pump only exists in Laser mode." S1 T5
