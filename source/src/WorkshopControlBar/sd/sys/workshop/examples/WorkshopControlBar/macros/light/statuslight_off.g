; EXAMPLE macro for the "Status OFF" button of the bar: automatic status LEDs off, through WorkshopService.
; Nothing here runs until you remove the ";" in front of the line. It needs macros/light/statusledoff.g (the service runs it) and a LED strip.
;
; M98 P"0:/sys/workshop/macros/system/service-call.g" S"statuslight.set" A"on=false" Q1
