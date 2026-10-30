; EXAMPLE macro for the "Light off" button of the control bar.
; Nothing in this file runs until you remove the ';' in front of a line.
; Edit it for your machine: it undoes what "light_on_sync.g" does.
;
; Option 1: a NeoPixel / DotStar strip connected to the Duet (M150), all channels at 0.
; M150 R0 G0 B0 W0 S20
;
; Option 2: a lamp on a spare output of the board (M42, S0 = off).
; M42 P3 S0
;
; Option 3: call your own macro.
; M98 P"0:/macros/light/my-light-off.g"
