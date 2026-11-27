      // ---- Mode buttons say "done" only when the machine really is in that mode (2026-11-04) ----
      // "listo" used to mean "the POST answered". The macro can fail without a word (M98 on a missing file answers nothing, M452 refused) and the
      // machine stayed in FFF while the bar said it was ready. Now the model (state.machineMode, fed by every /machine/status) has the last word.

      // the mode a button of the "mode" group switches to ("Laser" | "CNC" | "FFF"), or "" for any other button
      function btnModeTarget(b) {
        var m = /mode\/select(laser|cnc|fff)\.g$/i.exec(String((b && b.action) || ""));
        return m ? { laser: "Laser", cnc: "CNC", fff: "FFF" }[m[1].toLowerCase()] : "";
      }

      // A mode button follows the ONE rule of every mode switch (workshopModeSwitchReason, src/_shared/07-modes.js: the same the Printing page asks):
      // the button stays, locked, with the sentence of the session or the role under it. It used to switch for anybody while Printing asked for a
      // session (2026-11-06). "" for any other button, or when the person may.
      function btnModeBlockReason(b) {
        if (!btnModeTarget(b) || typeof workshopModeSwitchReason !== "function") return "";
        return workshopModeSwitchReason();
      }

      // The short cause a locked mode button shows under its label (no cursor needed): "Requires a session" / "Only technician"
      function btnModeLockShort() {
        var a = typeof workshopModeSwitchAccess === "function" ? workshopModeSwitchAccess() : "";
        if (a === "session") return i18nT("sidebar.lock_short_session");
        if (a === "role") return i18nT("sidebar.lock_short_role", { role: workshopNoticeRoleName(typeof WORKSHOP_MODE_SWITCH_ROLE !== "undefined" ? WORKSHOP_MODE_SWITCH_ROLE : "technician") });
        return "";
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

      // ---- The profile in the bar (UNUSED case of the mode rule, vue/_shared36/mode-gate.js): a mode the machine profile says it does not use ----
      // The groups and buttons of that mode are NOT shown (a decision of the configuration, it never flickers with the mode the machine is in).
      // Only when the profile is ANSWERED: an unanswered or unread profile hides nothing. While the buttons are edited everything shows.
      var btnModesState = null; // workshopModes.load().state: { answer: { FFF, Laser, CNC }, answered }
      var btnModesKey = "";

      // true when the profile is answered and says the machine does not use `mode`
      function btnModeUnused(mode) {
        return !!(btnModesState && btnModesState.answered && btnModesState.answer && BUTTONS_MODES.indexOf(mode) >= 0 && !btnModesState.answer[mode]);
      }

      // a button belongs to unused modes only: the mode button of an unused mode, or one that works only in unused modes (Air in Laser)
      function btnButtonUnused(b) {
        var target = btnModeTarget(b);
        if (target) return btnModeUnused(target);
        return !!(b && b.modes && b.modes.length) && b.modes.every(btnModeUnused);
      }

      // a group with buttons, all of them unused
      function btnGroupUnused(g) {
        return !!(g && g.buttons && g.buttons.length) && g.buttons.every(btnButtonUnused);
      }

      // reads the profile (cached by the shared profile reader); draws again only when the answer changed
      function btnLoadModes() {
        if (typeof workshopModes === "undefined") return Promise.resolve();
        return workshopModes.load().then(function (o) {
          var key = JSON.stringify(o.state);
          if (key === btnModesKey) return;
          btnModesKey = key;
          btnModesState = o.state;
          if (typeof btnRender === "function") btnRender();
        }).catch(function () { /* unknown profile: nothing is hidden */ });
      }
