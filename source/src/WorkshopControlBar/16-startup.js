      // ---- Start-up card of the control bar (2026-10-15) ----
      //
      // A person who installs the plugins on their own machine does not have the macros the factory buttons call. The
      // bar lists them with the state of each one (src/_shared/16-startup.js): green = configured, orange =
      // only the example (everything commented: still to configure), red = missing. The examples travel in
      // sd/sys/workshop/examples/WorkshopControlBar/<path under 0:/> and the service copies each one ONCE (it never
      // overwrites a file). "Do not use" hides a row on this screen (a machine without air or without a switched
      // supply). The mode buttons (mode/select*.g) are not here: they depend on how each machine is built.
      //
      // Every row has an explanation (que / paraQue / siFalta) and an assistant: it asks how YOUR machine does it
      // (a LED strip or a plain output, a fan or an output, the ATX pin or a relay, or your own macro), shows the
      // file and writes it only when the person confirms. Nothing assumes the owner's pins or macro names: every
      // number has a default that the person changes. docs-internal/STARTUP-WIZARD.md explains the format.

      // Question that asks HOW the machine does it. opciones: the [value, key] pairs offered.
      function barQuestionMethod(options) {
        return {
          id: "method",
          kind: "list",
          label: "startup_bar.q_method",
          help: "startup_bar.q_method_tip",
          defaultValue: options[0][0],
          options: options.map(function (o) {
            return { value: o[0], label: o[1] };
          }),
        };
      }

      // Question for the number of an output of the board (M42 P<n>)
      function barQuestionOutput(defecto) {
        return {
          id: "output",
          kind: "number",
          integer: true,
          min: 0,
          max: 99,
          defaultValue: defecto,
          label: "startup_bar.q_output",
          help: "startup_bar.q_output_tip",
          si: { question: "method", value: "output" },
        };
      }

      // Question for the path of the person's own macro (M98)
      function barQuestionMacro(defecto) {
        return {
          id: "macro",
          kind: "text",
          pattern: "^0:/.+\\.g$",
          defaultValue: defecto,
          label: "startup_bar.q_macro",
          help: "startup_bar.q_macro_tip",
          si: { question: "method", value: "macro" },
        };
      }

      // Comments at the top of a file made by the assistant
      function barHeader(title) {
        return ["; " + title, "; Made with the start-up assistant of the control bar. Edit it whenever you need.", ";"];
      }

      // Light: the system service paints the strip (recommended: the Lights page, the status zones and the button state
      // follow it), a LED strip painted by this file (M150), a lamp on an output of the board (M42) or the person's own macro
      function barWizardLight(turn_on) {
        var preguntas = [
          barQuestionMethod([["service", "startup_bar.opt_service"], ["strip", "startup_bar.opt_strip"], ["output", "startup_bar.opt_output"], ["macro", "startup_bar.opt_macro"]]),
          { id: "leds", kind: "number", integer: true, min: 1, max: 1000, defaultValue: 20, label: "startup_bar.q_leds", help: "startup_bar.q_leds_tip", si: { question: "method", value: "strip" } },
        ];
        if (turn_on) {
          preguntas.push({ id: "white", kind: "si_no", defaultValue: true, label: "startup_bar.q_white", help: "startup_bar.q_white_tip", si: { question: "method", value: "strip" } });
        }
        preguntas.push(barQuestionOutput(3));
        preguntas.push(barQuestionMacro(turn_on ? "0:/macros/light/my-light-on.g" : "0:/macros/light/my-light-off.g"));
        return {
          questions: preguntas,
          template: function (r) {
            var l = barHeader(turn_on ? 'Macro for the "Light on" button of the control bar.' : 'Macro for the "Light off" button of the control bar.');
            if (r.method === "service") {
              l.push("; The system service switches the work light, keeps its state (the button of the bar shows it) and paints the strip");
              l.push("; (Lights page; the strip has to be set up first: M950 E.. in your config.g). It runs 0:/macros/light/lighton.g and lightoff.g,");
              l.push("; which only set the colour of the work light (global.lightZoneColor).");
              l.push('M98 P"0:/sys/workshop/macros/service-call.g" S"light.set" A"on=' + (turn_on ? "true" : "false") + '" Q1');
            } else if (r.method === "strip") {
              l.push("; The strip has to be set up first (M950 E.. in your config.g): M150 only paints it.");
              if (turn_on) l.push("M150 R255 G255 B255 W" + (r.white ? "255" : "0") + " S" + r.leds);
              else l.push("M150 R0 G0 B0 W0 S" + r.leds);
            } else if (r.method === "output") {
              l.push("; The output has to be set up first (M950 P" + r.output + " ... in your config.g).");
              l.push("M42 P" + r.output + " S" + (turn_on ? "1" : "0"));
            } else {
              l.push('M98 P"' + r.macro + '"');
            }
            return l.join("\n");
          },
        };
      }

      // Air assist of a laser: a fan output (M106), a plain output (M42) or the person's own macro
      function barWizardAir(turn_on) {
        var preguntas = [
          barQuestionMethod([["fan", "startup_bar.opt_fan"], ["output", "startup_bar.opt_output"], ["macro", "startup_bar.opt_macro"]]),
          { id: "fan", kind: "number", integer: true, min: 0, max: 9, defaultValue: 1, label: "startup_bar.q_fan", help: "startup_bar.q_fan_tip", si: { question: "method", value: "fan" } },
        ];
        if (turn_on) {
          preguntas.push({ id: "speed", kind: "number", min: 0, max: 1, defaultValue: 1, label: "startup_bar.q_speed", help: "startup_bar.q_speed_tip", si: { question: "method", value: "fan" } });
        }
        preguntas.push(barQuestionOutput(4));
        preguntas.push(barQuestionMacro(turn_on ? "0:/macros/laser/my-air-on.g" : "0:/macros/laser/my-air-off.g"));
        return {
          questions: preguntas,
          template: function (r) {
            var l = barHeader(turn_on ? 'Macro for the "Air on" button of the control bar.' : 'Macro for the "Air off" button of the control bar.');
            if (r.method === "fan") {
              l.push("; The fan has to be set up first (M950 F" + r.fan + " ... in your config.g).");
              l.push("M106 P" + r.fan + " S" + (turn_on ? r.speed : "0"));
            } else if (r.method === "output") {
              l.push("; The output has to be set up first (M950 P" + r.output + " ... in your config.g).");
              l.push("M42 P" + r.output + " S" + (turn_on ? "1" : "0"));
            } else {
              l.push('M98 P"' + r.macro + '"');
            }
            return l.join("\n");
          },
        };
      }

      // Power supply of the motors: the ATX pin of the board (M80 / M81), a relay on an output (M42) or the person's own macro
      function barWizardSource(turn_on) {
        return {
          questions: [
            barQuestionMethod([["atx", "startup_bar.opt_atx"], ["output", "startup_bar.opt_relay"], ["macro", "startup_bar.opt_macro"]]),
            barQuestionOutput(2),
            barQuestionMacro(turn_on ? "0:/macros/psu/my-psu-on.g" : "0:/macros/psu/my-psu-off.g"),
          ],
          template: function (r) {
            var l = barHeader(turn_on ? 'Macro for the "PSU Start" button of the control bar.' : 'Macro for the "PSU Stop" button of the control bar.');
            if (r.method === "atx") {
              l.push("; Needs the ATX power pin of your board wired to the supply.");
              l.push(turn_on ? "M80" : "M81");
            } else if (r.method === "output") {
              l.push("; The relay output has to be set up first (M950 P" + r.output + " ... in your config.g).");
              l.push("M42 P" + r.output + " S" + (turn_on ? "1" : "0"));
            } else {
              l.push('M98 P"' + r.macro + '"');
            }
            return l.join("\n");
          },
        };
      }

      var BAR_STARTUP = [
        { id: "light_on", group: "light", groupLabel: "startup_bar.g_light", groupDescription: "startup_bar.g_light_desc", groupIcon: "light", file: "macros/light/light_on_sync.g", label: "startup_bar.light_on", help: "startup_bar.light_tip", what: "startup_bar.light_what", why: "startup_bar.light_for", ifMissing: "startup_bar.light_missing", wizard: barWizardLight(true) },
        { id: "light_off", group: "light", groupLabel: "startup_bar.g_light", groupDescription: "startup_bar.g_light_desc", groupIcon: "light", file: "macros/light/light_off_sync.g", label: "startup_bar.light_off", help: "startup_bar.light_tip", what: "startup_bar.light_what", why: "startup_bar.light_for", ifMissing: "startup_bar.light_missing", wizard: barWizardLight(false) },
        { id: "air_on", group: "air", groupLabel: "startup_bar.g_air", groupDescription: "startup_bar.g_air_desc", groupIcon: "air", file: "macros/laser/air_on_sync.g", label: "startup_bar.air_on", help: "startup_bar.air_tip", what: "startup_bar.air_what", why: "startup_bar.air_for", ifMissing: "startup_bar.air_missing", wizard: barWizardAir(true) },
        { id: "air_off", group: "air", groupLabel: "startup_bar.g_air", groupDescription: "startup_bar.g_air_desc", groupIcon: "air", file: "macros/laser/air_off_sync.g", label: "startup_bar.air_off", help: "startup_bar.air_tip", what: "startup_bar.air_what", why: "startup_bar.air_for", ifMissing: "startup_bar.air_missing", wizard: barWizardAir(false) },
        { id: "psu_start", group: "psu", groupLabel: "startup_bar.g_psu", groupDescription: "startup_bar.g_psu_desc", groupIcon: "source", file: "macros/psu/start.g", label: "startup_bar.psu_start", help: "startup_bar.psu_tip", what: "startup_bar.psu_what", why: "startup_bar.psu_for", ifMissing: "startup_bar.psu_missing", wizard: barWizardSource(true) },
        { id: "psu_stop", group: "psu", groupLabel: "startup_bar.g_psu", groupDescription: "startup_bar.g_psu_desc", groupIcon: "source", file: "macros/psu/stop.g", label: "startup_bar.psu_stop", help: "startup_bar.psu_tip", what: "startup_bar.psu_what", why: "startup_bar.psu_for", ifMissing: "startup_bar.psu_missing", wizard: barWizardSource(false) },
      ];


      // ---- Where the card lives (2026-10-16) ----
      // It is a dialog (src/_shared/16-startup.js, vista "modal"), opened from the gear panel ("Start-up") or from
      // the small strip at the end of the Buttons section, which only exists while something is pending.
      var barStartupCard = null;
      var barStartupBand = null;

      function barStartupGet() {
        if (barStartupCard) return barStartupCard;
        barStartupCard = workshopStartupInRun({
          plugin: "WorkshopControlBar",
          rows: BAR_STARTUP,
          createOnStart: true,
          view: "modal",
          onChange: function (res) {
            if (!barStartupBand) return;
            barStartupBand.box.style.display = res.ready ? "none" : "flex";
            barStartupBand.text.textContent = i18nT("startup_bar.strip_text", { n: res.pending });
          },
        });
        return barStartupCard;
      }

      function barStartupOpen() {
        return workshopStartupModalOpen(barStartupGet(), {
          id: "WorkshopControlBar",
          title: i18nT("startup.title"),
          subtitle: i18nT("startup_bar.modal_sub"),
          close: i18nT("common.close"),
        });
      }

      // pending count for the gear panel (null until the first answer)
      function barStartupPending() {
        return barStartupCard ? barStartupCard.summary().pending : null;
      }

      // The strip, in the Buttons section of the bar. Hidden while everything is ready.
      function barStartupCreate(parent) {
        var card = barStartupGet();
        var box = document.createElement("div");
        box.style.cssText =
          "display:none;align-items:center;gap:8px;margin-top:8px;padding:8px 8px 8px 12px;border-radius:12px;background:transparent;border:1px solid rgba(128,128,128,0.35);color:#cfd8dc;font-size:12px;line-height:1.35;";
        var text = document.createElement("span");
        text.style.cssText = "flex:1 1 auto;min-width:0;";
        var boton = workshopStartupButton(i18nT("startup_bar.strip_button"), "", barStartupOpen, "primary");
        boton.style.minHeight = "40px";
        boton.style.padding = "6px 14px";
        boton.style.fontSize = "13px";
        box.appendChild(text);
        box.appendChild(boton);
        barStartupBand = { box: box, text: text };
        parent.appendChild(box);
        card.refresh();
        return card;
      }
