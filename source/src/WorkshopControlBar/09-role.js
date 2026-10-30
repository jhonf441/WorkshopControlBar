      // ---- What each role sees in the control bar (F3-J of the redesign, 2026-10-21; pure, tested in tests/bar-role.test.js) ----
      //
      // The bar keeps what only it offers (the buttons, the state, the control holder, STOP, shut down when finished and the timer) and
      // lends the rest to its owners: the camera relay and timelapse to Camera, the phone notification settings to Activity (the operator keeps the mute), the mirror of the
      // status LEDs to Lights, the method of shutting down to Power. For an operator those parts are hidden; they stay as a quick access
      // for technician and admin. Shut down now and Restart everything are the admin's (power.off, power.full_reset).
      // Each part is tied to the REAL operation of the table of the service (workshopCan), never to a role name. Without identity
      // (no users, an old service, no answer yet) everything is shown, as before.

      var SB_ROLE_OPS = {
        relay: "camera.url", // camera relay + manual timelapse: technician (Camera has the timelapse; the relay start / stop only the bar)
        notice: "notifications.mute", // phone notifications card with the 60 minute mute: operator (F3-X; it silences, it does not configure)
        noticeSettings: "notifications.get", // the "Settings..." button of that card: technician (Activity has the settings)
        led: "lights.save", // mirror of the status LEDs: technician (Lights shows the same indicator)
        powerMethod: "power.method", // how it shuts down: technician
        powerNow: "power.off", // shut down now: admin
        powerRestart: "power.full_reset", // restart everything: admin
        powerWhenDone: "power.after_job", // shut down when the job finishes: operator
        powerTimer: "power.timer", // shut down in N minutes: operator
      };

      // can(op) -> bool (workshopCan). Returns {part: bool} for every key of SB_ROLE_OPS, plus power (any of the power parts).
      function sbRoleView(can) {
        var v = {};
        Object.keys(SB_ROLE_OPS).forEach(function (k) {
          v[k] = typeof can === "function" ? !!can(SB_ROLE_OPS[k]) : true;
        });
        v.power = v.powerMethod || v.powerNow || v.powerRestart || v.powerWhenDone || v.powerTimer;
        return v;
      }

      function sbRoleNow() {
        return sbRoleView(typeof workshopCan === "function" ? workshopCan : null);
      }

      // The camera relay is only read while the bar can show it (a browser that cannot see it never asks :8090).
      function sbRoleProbeRelay(view) {
        return !!(view && view.relay);
      }

      // Marks (or unmarks) an element: a CSS rule with !important hides it, without fighting whoever changes its display.
      function sbRoleMark(el, hidden) {
        if (!el || !el.dataset) return;
        var v = hidden ? "1" : "";
        if (el.dataset.sbRoleHidden !== v) el.dataset.sbRoleHidden = v;
      }

      // Hides what the role cannot use. Called at the end of every sidebarRefresh and when the identity changes; it is idempotent.
      function sbRoleApply() {
        if (!sidebarEl || !sb || !sb.full) return;
        if (!document.getElementById("workshop-sb-role-css")) {
          var st = document.createElement("style");
          st.id = "workshop-sb-role-css";
          st.textContent = "[data-sb-role-hidden='1']{display:none !important}";
          document.head.appendChild(st);
        }
        var v = sbRoleNow();
        [sb.relayCard, sb.railRelay].forEach(function (e) { sbRoleMark(e, !v.relay); });
        [sb.notificationCard, sb.railNotice].forEach(function (e) { sbRoleMark(e, !v.notice); });
        sbRoleMark(sb.noticeSettingsBtn, !v.noticeSettings);
        sbRoleMark(sb.powerCard, !v.power);
        [sb.railPower].forEach(function (e) { sbRoleMark(e, !v.powerNow); });
        [sb.railTimer, sb.railTimerLabel].forEach(function (e) { sbRoleMark(e, !v.powerTimer && !v.powerWhenDone); });
        (sb.powerMethodEls || []).forEach(function (e) { sbRoleMark(e, !v.powerMethod); });
        (sb.powerNowEls || []).forEach(function (e) { sbRoleMark(e, !v.powerNow); });
        (sb.powerRestartEls || []).forEach(function (e) { sbRoleMark(e, !v.powerRestart); });
        (sb.powerWhenDoneEls || []).forEach(function (e) { sbRoleMark(e, !v.powerWhenDone); });
        (sb.powerTimerEls || []).forEach(function (e) { sbRoleMark(e, !v.powerTimer); });
        if (typeof ledBox !== "undefined") sbRoleMark(ledBox, !v.led);
        if (typeof ledStripV !== "undefined") sbRoleMark(ledStripV, !v.led);
        // the Hidden style (11-hidden.js): its tiles and its footer
        if (typeof oc !== "undefined" && oc) {
          sbRoleMark(oc.tRelay, !v.relay);
          sbRoleMark(oc.tNotices, !v.notice);
          sbRoleMark(oc.tShutdown, !v.power);
          sbRoleMark(oc.footer, !v.powerNow);
        }
      }
