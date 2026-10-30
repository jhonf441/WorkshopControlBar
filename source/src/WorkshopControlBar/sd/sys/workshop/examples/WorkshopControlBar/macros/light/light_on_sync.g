; EXAMPLE macro for the "Light on" button of the control bar.
; Nothing in this file runs until you remove the ';' in front of a line.
; Edit it for your machine. The button of the bar only appears when this file has a line that is not a comment.
;
; Option 1: a NeoPixel / DotStar strip connected to the Duet (M150).
; R G B W are 0-255, S is how many LEDs to paint. The LAST M150 of a sequence
; must be the one without F (it is the one that sends the frame to the strip).
; M150 R255 G255 B255 W255 S20
;
; Option 2: a lamp on a spare output of the board (M42, P = the output number you
; configured with M950, S1 = on).
; M42 P3 S1
;
; Option 3: call your own macro.
; M98 P"0:/macros/light/my-light-on.g"
