; Shuts the system down safely and then cuts the power of the whole machine
; (system + Duet + motors) with the method chosen in the control bar (energy
; meter, relay output or PS_ON). See handlers/apagartodo.py of WorkshopService
; for the order (sync and cut before the shutdown, not after).
;
; The bar confirms in its floating panel and calls this macro with C1; run from anywhere else (no C1)
; the confirmation is asked here (M291 S3): "result" is 0 when confirmed. The
; buttons RRF/DWC draw for S3 are "OK"/"Cancel", so the text talks about them.
; The description comes from global.shutdownDesc / global.shutdownDescEn (published by
; WorkshopService, shutdown_method.py); without it, the generic text.
; 2026-10-13: the order goes through the API (service-call.g, power.off); W0
; because the system goes down and cannot answer.
var en = exists(global.workshopLanguage) ? (global.workshopLanguage == "en") : false   ; messages in English (DWC language, see sys/workshop/macros/language.g)
var desc = "apaga el sistema YA y corta TODA la energia (sistema + Duet + motores) con el medidor"
if var.en
    set var.desc = "shuts the system down NOW and cuts ALL the power (system + Duet + motors) with the meter"
if var.en && exists(global.shutdownDescEn)
    set var.desc = global.shutdownDescEn
elif !var.en && exists(global.shutdownDesc)
    set var.desc = global.shutdownDesc
var asked = exists(param.C) && param.C = 1   ; C1 = already confirmed in the floating panel (the bar): do not ask a second time
var ok = var.asked
if !var.asked
    M291 P{var.en ? ("This " ^ var.desc ^ ". Tap OK to confirm, Cancel to do nothing.") : ("Esto " ^ var.desc ^ ". Toca OK para confirmar, Cancelar para no hacer nada.")} R{var.en ? "Power off" : "Apagar"} S3
    set var.ok = (result = 0)
if var.ok
    M291 P{(var.en ? "Powering off: " : "Apagando: ") ^ var.desc ^ "."} R{var.en ? "Powering off" : "Apagando"} S0 T4
    M98 P"0:/sys/workshop/macros/service-call.g" S"power.off" W0
else
    M291 P{var.en ? "Power off cancelled." : "Apagado cancelado."} R{var.en ? "Cancelled" : "Cancelado"} S1 T3
