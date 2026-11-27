      // ---- What each role sees in the control bar (F3-J of the redesign, 2026-10-21; pure, tested in tests/bar-role.test.js) ----
      //
      // The bar keeps what only it offers (the buttons, the state, the control holder, STOP, shut down when finished and the timer) and
      // lends the rest to its owners: the phone notification settings to Activity (the operator keeps the mute), the mirror of the
      // status LEDs to Lights, the method of shutting down to Power. For an operator those parts are LOCKED (in their place, dimmed, with the
      // reason; 2026-11-06: nothing that the session or the role denies disappears); they work as a quick access for technician and admin.
      // Shut down now is everybody's (power.off is a stop operation); Restart everything is the admin's (power.full_reset).
      // Each part is tied to the REAL operation of the table of the service (workshopCan), never to a role name. Without identity
      // (no users, an old service, no answer yet) everything is usable, as before.

      var SB_ROLE_OPS = {
        notice: "notifications.mute", // phone notifications card with the 60 minute mute: operator (F3-X; it silences, it does not configure)
        noticeSettings: "notifications.get", // the "Settings..." button of that card: technician (Activity has the settings)
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
        v.powerNow = true; // shut down now is for everybody (project decision 2026-11-06: anyone at the machine could pull the plug; the service allows power.off to all)
        v.power = v.powerMethod || v.powerNow || v.powerRestart || v.powerWhenDone || v.powerTimer;
        return v;
      }

      // The parts the note can name, in the order of the bar, with the key of their name. A part that contains others (power) subsumes them.
      var SB_ROLE_PARTS = [
        { key: "notice", name: "sidebar.part_notice" },
        { key: "noticeSettings", name: "sidebar.part_notice_settings" },
        { key: "power", name: "sidebar.part_power", subsumes: ["powerMethod", "powerRestart", "powerWhenDone", "powerTimer"] },
        { key: "powerMethod", name: "sidebar.part_power_method" },
        { key: "powerWhenDone", name: "sidebar.part_power_when_done" },
        { key: "powerTimer", name: "sidebar.part_power_timer" },
        { key: "powerRestart", name: "sidebar.part_power_restart" },
        { key: "powerNow", name: "sidebar.part_power_now" },
      ];

      // PURE. The keys of the parts that are DIMMED right now AND on the screen: the role (v) denies them and at least one of their elements is drawn.
      // The note names exactly these (never a part that only exists in a view that is not open: 2026-11-20, the technician saw "dimmed parts" with none).
      // elsOf(key) -> [elements]; shown(el) -> bool.
      function sbRoleLockedParts(v, elsOf, shown) {
        var out = [];
        SB_ROLE_PARTS.forEach(function (p) {
          if (v[p.key]) return;
          if (out.some(function (k) { return SB_ROLE_PARTS.some(function (q) { return q.key === k && (q.subsumes || []).indexOf(p.key) >= 0; }); })) return;
          var els = elsOf(p.key) || [];
          if (els.some(function (e) { return e && shown(e); })) out.push(p.key);
        });
        return out;
      }

      // The elements drawn for each part in the expanded bar (the rail icons are not here: the note lives in the expanded bar)
      function sbRolePartEls(key) {
        var oc_ = typeof oc !== "undefined" && oc ? oc : null;
        switch (key) {
          case "notice": return [sb.notificationCard, oc_ && oc_.tNotices];
          case "noticeSettings": return [sb.noticeSettingsBtn];
          case "power": return [sb.powerCard, oc_ && oc_.tShutdown];
          case "powerMethod": return sb.powerMethodEls;
          case "powerWhenDone": return sb.powerWhenDoneEls;
          case "powerTimer": return sb.powerTimerEls;
          case "powerRestart": return sb.powerRestartEls;
          case "powerNow": return (sb.powerNowEls || []).concat([oc_ && oc_.footer]);
        }
        return [];
      }

      // Drawn: in the page and no ancestor (up to the bar) hidden with display none (the Hidden style hides the cards of the views that are not open that way)
      function sbRoleShown(el) {
        if (!el || el.isConnected === false) return false;
        for (var n = el; n && n !== sidebarEl; n = n.parentNode) {
          if (n.style && n.style.display === "none") return false;
          if (n.hidden) return false;
        }
        return !!n;
      }

      // What the quiet note of the bar says: "" (nothing dimmed on the screen), "signed_out" (no session: signing in fixes it) or "role" (only another role does).
      function sbRoleNoteKind(lockedParts, signedOut) {
        if (!lockedParts || !lockedParts.length) return "";
        return signedOut ? "signed_out" : "role";
      }

      // The short list for the note: up to three names, then "and N more"
      function sbRolePartsText(keys) {
        var names = keys.map(function (k) {
          return i18nT(SB_ROLE_PARTS.filter(function (p) { return p.key === k; })[0].name);
        });
        if (names.length <= 3) return names.join(", ");
        return names.slice(0, 3).join(", ") + " " + i18nT("sidebar.locked_more", { n: names.length - 3 });
      }

      function sbRoleNow() {
        return sbRoleView(typeof workshopCan === "function" ? workshopCan : null);
      }

      // Marks (or unmarks) an element as LOCKED: it stays in its place, dimmed and inert (a CSS rule, without fighting whoever changes its display),
      // with the reason as its tooltip (2026-11-06: what the session or the role denies is shown locked, never hidden; only what never
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
        sbRoleCause(el, locked ? sbRoleShortCause() : "");
      }

      // The short cause that shows under the label of a locked control, without the cursor (a touch screen has none): "Requires a session" or "Only technician"
      function sbRoleShortCause(need) {
        if (typeof i18nT !== "function") return "";
        var signedOut = typeof workshopSignedOut === "function" && workshopSignedOut();
        if (signedOut) return i18nT("sidebar.lock_short_session");
        return i18nT("sidebar.lock_short_role", { role: workshopNoticeRoleName(need || "technician") });
      }
      function sbRoleCause(el, text) {
        var set = function (n) {
          if (text) n.dataset.sbCause = text;
          else delete n.dataset.sbCause;
        };
        if (el.tagName === "BUTTON") set(el);
        if (typeof el.querySelectorAll === "function") Array.prototype.forEach.call(el.querySelectorAll("button"), set);
      }

      // the role the table of the service asks for an operation (the lock reason names it); "technician" when the table is not known
      function sbRoleNeed(op) {
        var id = typeof workshopIdentity === "function" ? workshopIdentity() : null;
        var ops = id && id.table && id.table.ops;
        return (ops && ops[op]) || "technician";
      }

      // A locked part keeps the mouse (its tooltip says why), so its clicks and keys are stopped here, before they reach it (capture, once per bar)
      function sbRoleGuard() {
        if (!sidebarEl || sidebarEl.dataset.sbRoleGuard === "1") return;
        sidebarEl.dataset.sbRoleGuard = "1";
        var stop = function (ev) {
          var t = ev.target;
          var locked = t && typeof t.closest === "function" ? t.closest("[data-sb-role-locked='1']") : null;
          if (!locked || (ev.type === "keydown" && ev.key !== "Enter" && ev.key !== " ")) return;
          ev.preventDefault();
          ev.stopPropagation();
        };
        ["click", "mousedown", "keydown", "input", "change"].forEach(function (n) { sidebarEl.addEventListener(n, stop, true); });
      }

      // Locks what the role cannot use. Called at the end of every sidebarRefresh and when the identity changes; it is idempotent.
      function sbRoleApply() {
        if (!sidebarEl || !sb || !sb.full) return;
        if (!document.getElementById("workshop-sb-role-css")) {
          var st = document.createElement("style");
          st.id = "workshop-sb-role-css";
          // locked = visible, dimmed and inert (the look of every disabled control of the bar); the stop and the state are never marked
          // dimmed + ONE lock INSIDE each control (never on titles or texts, never a floating column) + the short cause under its label + the
          // reason as tooltip. The part keeps the mouse so the tooltip shows; its clicks are stopped by sbRoleGuard. The rail icons are round and
          // keep their own mark (data-sb-rail). One session note per block: the group notes of a signed-out person say what the note of the bar
          // and the cause under each button already say.
          st.textContent = "[data-sb-role-locked='1']{opacity:.55 !important;filter:grayscale(.5);cursor:not-allowed;}" +
            "[data-sb-role-locked='1'] *{pointer-events:none !important;}" +
            "button[data-sb-role-locked='1']:not([data-sb-rail])::before,[data-sb-role-locked='1'] button:not([data-sb-rail])::before{content:'';display:inline-block;width:14px;height:14px;margin-right:6px;vertical-align:-2px;background:currentColor;" +
            "-webkit-mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 10 0v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3'/%3E%3C/svg%3E\") center/contain no-repeat;mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 10 0v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3'/%3E%3C/svg%3E\") center/contain no-repeat;}" +
            "button[data-sb-role-locked='1']:not([data-sb-rail])::after,[data-sb-role-locked='1'] button:not([data-sb-rail])::after{content:attr(data-sb-cause);display:block;font-size:12px;font-weight:400;line-height:1.3;white-space:normal;}" +
            "#" + SIDEBAR_ID + " .wf-reason--session{display:none !important;}";
          document.head.appendChild(st);
        }
        sbRoleGuard();
        var v = sbRoleNow();
        var signedOut = typeof workshopSignedOut === "function" && workshopSignedOut();
        // the reason of each part: the sentence of every notice (09-notice-dom.js), by the state of the session or the role the part needs
        var why = function (part) {
          if (typeof workshopNoticeText !== "function") return undefined;
          if (signedOut) return workshopNoticeText("session");
          return sbReasonSentence(SB_ROLE_OPS[part]) || workshopNoticeText("role", sbRoleNeed(SB_ROLE_OPS[part])); // the answer of the service first (09-access-reasons.js), the role as fallback
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
        sb.roleLocked = sbRoleLockedParts(v, sbRolePartEls, sbRoleShown);
        sbRoleNotePaint(v);
        // the status LEDs are STATE and are never locked (owner 2026-11-23, note 8: anybody reads the state without a session). They come from the
        // plugin data of the service, which needs no session, and carry no action (the rail dot only opens the bar).
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
        var parts = sb.roleLocked || [];
        var kind = sbRoleNoteKind(parts, signedOut);
        var box = sb.roleNote;
        if (!kind) {
          if (box) box.style.display = "none";
          return;
        }
        var key = kind + "|" + parts.join(",") + "|" + (typeof workshopNoticeStamp === "function" ? workshopNoticeStamp() : "");
        if (!box || sb.roleNoteKey !== key) {
          if (box && box.parentElement) box.parentElement.removeChild(box);
          var list = sbRolePartsText(parts);
          var text = kind === "signed_out" ? workshopSessionSentence("sidebar.locked_needs_session", { parts: list }) : i18nT("sidebar.locked_needs_role", { parts: list, role: workshopNoticeRoleName(typeof workshopRole === "function" ? workshopRole() : "") });
          box = workshopNoticeEl(kind === "signed_out" ? "session" : "role", "section", { text: text, action: kind === "signed_out" ? "sign-in" : "", subject: "" }); // subject deliberately empty: the title of the panel already says "Control bar" (DESIGN 7d: the title names it)
          sb.roleNote = box;
          sb.roleNoteKey = key;
        }
        if (box.parentElement !== full || full.firstElementChild !== box) full.insertBefore(box, full.firstChild); // 2026-11-18: at the TOP, where the dimmed parts and their sign-in are seen (it was at the very bottom)
        box.style.display = "";
      }
