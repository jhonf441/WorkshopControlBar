; EXAMPLE macro for the "Status ON" button of the bar: automatic status LEDs on, through WorkshopService.
; Nothing here runs until you remove the ";" in front of the line. It needs macros/light/statusledon.g (the service runs it) and a LED strip.
; If you have no LED strip, tap "Do not use" in the start-up card.
;
; M98 P"0:/sys/workshop/macros/system/service-call.g" S"statuslight.set" A"on=true" Q1
