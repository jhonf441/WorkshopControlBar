; Button "Power off when the job ends": arms / disarms the automatic power off
; that sys/daemon.g fires as soon as the current job (or the next one, if none
; is running now) ends by itself. Pressing it again before that cancels it.
; 2026-10-13: WorkshopService does it (API operation power.after_job through
; service-call.g), so this macro and the pages always show the same state.

var en = exists(global.workshopLanguage) ? (global.workshopLanguage == "en") : false   ; messages in English (DWC language, see sys/workshop/macros/language.g)
M98 P"0:/sys/workshop/macros/service-call.g" S"power.after_job" A"armed=toggle" Q1

if exists(global.powerOffOnFinish) && global.powerOffOnFinish
    ; one M291 per language: a line with an argument of 255 characters or more is not accepted by RRF
    if var.en
        M291 P"Everything will power off (system + power cut) as soon as the current job, or the next one you start, ends. Press this same button again to cancel it." R"Power off when done: ARMED" S1 T8
    else
        M291 P"Se va a apagar todo (sistema + corte de energia) apenas termine el trabajo actual o el proximo que arranques. Presiona este mismo boton de nuevo para cancelarlo." R"Apagado al terminar: ARMADO" S1 T8
else
    M291 P{var.en ? "Automatic power off cancelled." : "Apagado automatico cancelado."} R{var.en ? "Power off when done: disarmed" : "Apagado al terminar: desarmado"} S1 T4
