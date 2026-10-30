; Restarts EVERYTHING by software (resets the Duet board with M999 and restarts
; the system) WITHOUT cutting the power. The bar confirms in its floating panel
; and calls this macro with C1; run from anywhere else (no C1) the question is asked here (M291 S3).
; 2026-10-13: the order goes to WorkshopService through its API (service-call.g,
; operation power.full_reset).
var en = exists(global.workshopLanguage) ? (global.workshopLanguage == "en") : false   ; messages in English (DWC language, see sys/workshop/macros/language.g)
var asked = exists(param.C) && param.C = 1   ; C1 = already confirmed in the floating panel (the bar): do not ask a second time
var ok = var.asked
if !var.asked
    ; one M291 per language: a line with an argument of 255 characters or more is not accepted by RRF
    if var.en
        M291 P"This resets the Duet3 board (M999) and restarts the system by software. It does NOT cut the power. Tap OK to confirm, Cancel to do nothing." R"Restart everything" S3
    else
        M291 P"Esto resetea la placa Duet3 (M999) y reinicia el sistema por software. NO corta la energia. Toca OK para confirmar, Cancelar para no hacer nada." R"Reiniciar todo" S3
    set var.ok = (result = 0)
if var.ok
    M291 P{var.en ? "Restarting the board and the system..." : "Reiniciando la placa y el sistema..."} R{var.en ? "Restarting everything" : "Reiniciando todo"} S0 T4
    M98 P"0:/sys/workshop/macros/service-call.g" S"power.full_reset" W0
else
    M291 P{var.en ? "Restart cancelled." : "Reinicio cancelado."} R{var.en ? "Cancelled" : "Cancelado"} S1 T3
