      // ---- BUTTONS section: one button of a group, as it is used (not edited): colour, state, reason it is blocked ----
      // Called by btnRenderGroup (15-buttons.js); it only builds the element: the caller puts it in the grid.
      function btnMakeRunButton(gi, i, b) {
        var reason = btnBlockReason(b);
        var armed = btnArmed === "run:" + gi + ":" + i;
        var bColor = btnColor(b);
        var el = sbMakeButton("", armed ? "#ff8f00" : bColor, function () { // armado = nivel 2 (ambar)
          btnRun(gi, i);
        });
        if (!armed) el.style.color = btnTextOver(bColor);
        el.style.flex = "1 1 calc(50% - 6px)";
        el.style.minWidth = "0";
        el.style.overflow = "hidden";
        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        var l1 = btnEl("span", "max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;", armed ? i18nT('buttons.confirm_q') : b.label);
        el.appendChild(l1);
        // Disabled: gray, dotted border and the short reason below (before
        // only the opacity went down and it was hard to tell which one worked).
        var on = btnShownState(b);
        if (on === true) {
          // ENCENDIDO: color lleno, borde blanco grueso, brillo, punto
          // green and "ACTIVO" (even if it cannot be tapped, e.g. the current mode).
          el.disabled = true; // 2026-11-18: a function already in this state is not asked again (light off while off re-sent the macro)
          el.style.position = "relative";
          el.style.border = "2px solid #fff";
          el.style.boxShadow = "0 0 10px " + bColor;
          el.style.cursor = "default";
          el.appendChild(btnEl("span", "font-size:12px;font-weight:bold;letter-spacing:0.08em;", i18nT('buttons.active_caps')));
          el.appendChild(btnEl("span", "position:absolute;top:3px;right:4px;width:8px;height:8px;border-radius:50%;background:#69f0ae;box-shadow:0 0 4px #69f0ae;"));
          // Mirror of the status LEDs (20-led-mirror.js): the button takes the
          // color/animation of the state it represents while it is active
          var led = btnLedOf(b);
          if (led) el.dataset.ledState = led;
        } else if (reason) {
          el.disabled = true;
          el.style.cursor = "not-allowed";
          var l2 = btnEl("span", "font-size:12px;font-weight:normal;color:rgba(255,255,255,0.9);letter-spacing:0.01em;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;", btnShortReason(b));
          if (btnModeBlockReason(b)) {
            // locked by the session or the role: the normal button, dimmed, with the lock beside its label and the cause under it (never an empty dashed box)
            el.style.border = "1px solid rgba(255,255,255,0.4)";
            el.style.opacity = "0.6";
            l1.insertBefore(btnEl("span", "display:inline-block;width:14px;height:14px;margin-right:6px;vertical-align:-2px;"), l1.firstChild);
            sbH(l1.firstChild, sbOpenLockSvg(14));
            l1.style.whiteSpace = "normal";
          } else {
            // another reason (the mode, a job, no action): gray, dotted border and the short reason below
            el.style.background = "#263238";
            el.style.color = "rgba(255,255,255,0.45)";
            el.style.border = "1px dashed rgba(255,255,255,0.3)";
            el.style.fontWeight = "normal";
          }
          el.appendChild(l2);
        } else {
          el.style.border = "1px solid rgba(255,255,255,0.55)";
          el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.5)";
          // it has state and is NOT active: a bit dimmed on a dark background.
          // Not with DWC's light theme: the color fill got washed out and the
          // white text was barely readable (2026-10-10, "the bar is not right in
          // light mode"); there it is distinguished by the lack of "ACTIVE" and of the dot.
          if (on === false && !document.documentElement.classList.contains("tp-bright")) el.style.opacity = "0.75";
        }
        el.title =
          (on === true ? i18nT('buttons.active_now') + " " : "") +
          (reason || (b.kind === "macro" ? "Macro: " + b.action : "G-code: " + b.action) + (b.confirm ? " " + i18nT('buttons.double_tap_paren') : ""));
        return el;
      }
