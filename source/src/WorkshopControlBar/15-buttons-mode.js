      // ---- Mode buttons say "done" only when the machine really is in that mode (2026-11-04) ----
      // "listo" used to mean "the POST answered". The macro can fail without a word (M98 on a missing file answers nothing, M452 refused) and the
      // machine stayed in FFF while the bar said it was ready. Now the model (state.machineMode, fed by every /machine/status) has the last word.

      // the mode a button of the "mode" group switches to ("Laser" | "CNC" | "FFF"), or "" for any other button
      function btnModeTarget(b) {
        var m = /mode\/select(laser|cnc|fff)\.g$/i.exec(String((b && b.action) || ""));
        return m ? { laser: "Laser", cnc: "CNC", fff: "FFF" }[m[1].toLowerCase()] : "";
      }

      // waits (at most 10 s) until the model shows the mode; resolves the message to show, true or false in `confirmed`
      function btnModeConfirm(b, target, replyText) {
        return new Promise(function (resolve) {
          var t0 = Date.now();
          (function look() {
            if (btnMachineMode === target) return resolve(b.label + ": " + i18nT("buttons.mode_confirmed"));
            if (Date.now() - t0 > 10000) {
              var tail = replyText ? " " + String(replyText).slice(0, 120) : "";
              return resolve(i18nT("buttons.mode_not_changed", { label: b.label, mode: btnMachineMode || "?" }) + tail);
            }
            setTimeout(look, 500);
          })();
        });
      }

      // what a button says when the reply of its order arrives: a mode button waits for the model; the others keep the old rule
      function btnAfterReply(b, seq, txt) {
        txt = String(txt || "").trim();
        var target = btnModeTarget(b);
        if (!target) {
          if (seq === btnSendSeq) btnMsg = b.label + ": " + (txt ? txt.slice(0, 160) : i18nT("buttons.done_lower"));
          return null;
        }
        if (seq === btnSendSeq) {
          btnMsg = b.label + i18nT("buttons.mode_waiting");
          btnRender();
        }
        return btnModeConfirm(b, target, txt).then(function (msg) {
          if (seq === btnSendSeq) btnMsg = msg;
        });
      }

      // The state a button SHOWS. A function that belongs to another mode (Air off while the machine is in FFF) is not "active" here:
      // it stays a plain locked button. The mode buttons are the exception: their state IS the machine mode, so they keep "active".
      function btnShownState(b) {
        var on = btnState(b);
        var otherMode = b.modes.length && btnMachineMode && b.modes.indexOf(btnMachineMode) < 0;
        if (on === true && otherMode && !(b.state && b.state.path === "state.machineMode")) return null;
        return on;
      }
