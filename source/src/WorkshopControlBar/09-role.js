      // ---- What each role sees in the control bar (F3-J of the redesign, 2026-10-21; pure, tested in tests/bar-role.test.js) ----
      //
      // The bar keeps what only it offers (the buttons, the state, the control holder, STOP, shut down when finished and the timer) and
      // lends the rest to its owners: the phone notification settings to Activity (the operator keeps the mute), the mirror of the
      // status LEDs to Lights, the method of shutting down to Power. For an operator those parts are LOCKED (in their place, dimmed, with the
      // reason; owner 2026-11-06: nothing that the session or the role denies disappears); they work as a quick access for technician and admin.
      // Shut down now is everybody's (power.off is a stop operation); Restart everything is the admin's (power.full_reset).
      // Each part is tied to the REAL operation of the table of the service (workshopCan), never to a role name. Without identity
      // (no users, an old service, no answer yet) everything is usable, as before.

      var SB_ROLE_OPS = {
        notice: "notifications.mute", // phone notifications card with the 60 minute mute: operator (F3-X; it silences, it does not configure)
        noticeSettings: "notifications.get", // the "Settings..." button of that card: technician (Activity has the settings)
        led: "lights.save", // mirror of the status LEDs: technician (Lights shows the same indicator)
        powerMethod: "power.method", // how it shuts down: technician
        powerNow: "power.off", // shut down now: everybody
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
        v.powerNow = true; // shut down now is for everybody (owner decision 2026-11-06: anyone at the machine could pull the plug; the service allows power.off to all)
        v.power = v.powerMethod || v.powerNow || v.powerRestart || v.powerWhenDone || v.powerTimer;
        return v;
      }

      // What the quiet note of the bar says: "" (nothing is locked), "signed_out" (no session: signing in fixes it) or "role" (only another role does).
      function sbRoleNoteKind(v, signedOut) {
        var locked = Object.keys(SB_ROLE_OPS).some(function (k) {
          return !v[k];
        });
        if (!locked) return "";
        return signedOut ? "signed_out" : "role";
      }

      function sbRoleNow() {
        return sbRoleView(typeof workshopCan === "function" ? workshopCan : null);
      }

      // Marks (or unmarks) an element as LOCKED: it stays in its place, dimmed and inert (a CSS rule, without fighting whoever changes its display),
      // with the reason as its tooltip (owner 2026-11-06: what the session or the role denies is shown locked, never hidden; only what never
      // applies to the mode of the machine is hidden). The tooltip the element had comes back when it is unlocked.
      function sbRoleMark(el, locked, reason) {
        if (!el || !el.dataset) return;
        var v = locked ? "1" : "";
        if (el.dataset.sbRoleLocked !== v) {
          el.dataset.sbRoleLocked = v;
          if (locked) {
            el.dataset.sbRoleTitle = el.title || "";
            if (typeof el.setAttribute === "function") el.setAttribute("aria-disabled", "true");
          } else {
            el.title = el.dataset.sbRoleTitle || "";
            delete el.dataset.sbRoleTitle;
            if (typeof el.removeAttribute === "function") el.removeAttribute("aria-disabled");
          }
        }
        if (locked && reason !== undefined && el.title !== reason) el.title = reason;
      }

      // the role the table of the service asks for an operation (the lock reason names it); "technician" when the table is not known
      function sbRoleNeed(op) {
        var id = typeof workshopIdentity === "function" ? workshopIdentity() : null;
        var ops = id && id.table && id.table.ops;
        return (ops && ops[op]) || "technician";
      }

      // Locks what the role cannot use. Called at the end of every sidebarRefresh and when the identity changes; it is idempotent.
      function sbRoleApply() {
        if (!sidebarEl || !sb || !sb.full) return;
        if (!document.getElementById("workshop-sb-role-css")) {
          var st = document.createElement("style");
          st.id = "workshop-sb-role-css";
          // locked = visible, dimmed and inert (the look of every disabled control of the bar); the stop and the state are never marked
          st.textContent = "[data-sb-role-locked='1']{opacity:.45 !important;pointer-events:none !important;filter:grayscale(.6);cursor:not-allowed;}";
          document.head.appendChild(st);
        }
        var v = sbRoleNow();
        var signedOut = typeof workshopSignedOut === "function" && workshopSignedOut();
        // the reason of each part: the sentence of every notice (09-notice-dom.js), by the state of the session or the role the part needs
        var why = function (part) {
          if (typeof workshopNoticeText !== "function") return undefined;
          return signedOut ? workshopNoticeText("session") : workshopNoticeText("role", sbRoleNeed(SB_ROLE_OPS[part]));
        };
        [sb.notificationCard, sb.railNotice].forEach(function (e) { sbRoleMark(e, !v.notice, why("notice")); });
        sbRoleMark(sb.noticeSettingsBtn, !v.noticeSettings, why("noticeSettings"));
        sbRoleMark(sb.powerCard, !v.power, why("powerTimer"));
        [sb.railPower].forEach(function (e) { sbRoleMark(e, !v.powerNow, why("powerNow")); });
        [sb.railTimer, sb.railTimerLabel].forEach(function (e) { sbRoleMark(e, !v.powerTimer && !v.powerWhenDone, why("powerTimer")); });
        (sb.powerMethodEls || []).forEach(function (e) { sbRoleMark(e, !v.powerMethod, why("powerMethod")); });
        (sb.powerNowEls || []).forEach(function (e) { sbRoleMark(e, !v.powerNow, why("powerNow")); });
        (sb.powerRestartEls || []).forEach(function (e) { sbRoleMark(e, !v.powerRestart, why("powerRestart")); });
        (sb.powerWhenDoneEls || []).forEach(function (e) { sbRoleMark(e, !v.powerWhenDone, why("powerWhenDone")); });
        (sb.powerTimerEls || []).forEach(function (e) { sbRoleMark(e, !v.powerTimer, why("powerTimer")); });
        sbRoleNotePaint(v);
        if (typeof ledBox !== "undefined") sbRoleMark(ledBox, !v.led, why("led"));
        if (typeof ledStripV !== "undefined") sbRoleMark(ledStripV, !v.led, why("led"));
        // the Hidden style (11-hidden.js): its tiles and its footer
        if (typeof oc !== "undefined" && oc) {
          sbRoleMark(oc.tNotices, !v.notice, why("notice"));
          sbRoleMark(oc.tShutdown, !v.power, why("powerTimer"));
          sbRoleMark(oc.footer, !v.powerNow, why("powerNow"));
        }
      }

      // The note at the end of the bar (N2 of the standard): the dimmed parts are locked by the session or the role. The bar has no .wf-bar, so the shared chip
      // does not reach it: signed out the note itself offers the sign-in (a surface without a bar), a role has no button.
      function sbRoleNotePaint(v) {
        var full = sb.full;
        if (!full) return;
        var signedOut = typeof workshopSignedOut === "function" && workshopSignedOut();
        var kind = sbRoleNoteKind(v, signedOut);
        var box = sb.roleNote;
        if (!kind) {
          if (box) box.style.display = "none";
          return;
        }
        var key = kind + "|" + (typeof workshopNoticeStamp === "function" ? workshopNoticeStamp() : "");
        if (!box || sb.roleNoteKey !== key) {
          if (box && box.parentElement) box.parentElement.removeChild(box);
          var text = kind === "signed_out" ? workshopSessionSentence("sidebar.locked_needs_session") : i18nT("sidebar.locked_needs_role", { role: workshopNoticeRoleName(typeof workshopRole === "function" ? workshopRole() : "") });
          box = workshopNoticeEl(kind === "signed_out" ? "session" : "role", "section", { text: text, action: kind === "signed_out" ? "sign-in" : "" });
          sb.roleNote = box;
          sb.roleNoteKey = key;
        }
        if (box.parentElement !== full || full.lastElementChild !== box) full.appendChild(box);
        box.style.display = "";
      }
