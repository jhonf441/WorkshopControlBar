      // ---- How an open panel shows in the bar: the pure part (tests/bar-open.test.js) ----
      //
      // A panel is "open" while its state() says so, whichever plugin registered it (workshop.panels): the bar names none, so the cue comes from
      // the registry and works for any panel, present or future. ONE decision and ONE look for the three places that list the panels: the rail
      // icon of the closed bar and the card of the arrange view (18-sidebar-open.js) and the tile of the Hidden style (11-hidden-open.js).
      // The cue never rests on colour alone: an open panel also changes its words (the badge "Open", the action "Close"), gains a dot that
      // pulses softly (it stands still with reduced motion) and a ring, and tells assistive technology (aria-pressed, aria-label).

      var SB_OPEN_FILL = "#1565c0"; // the accent fill (the blue of every chosen thing of the bar): white text on it is 5.75:1, AA asks 4.5
      var SB_OPEN_TEXT = "#ffffff";
      var SB_OPEN_RING = "var(--wf-n-session-text,#90caf9)"; // the ring of an open panel; the light theme of the page darkens it by itself (_shared/03-theme.js)
      var SB_OPEN_DOT = "#69f0ae"; // the live dot, 4:1 against the fill (a graphic needs 3)
      var SB_OPEN_BTN = "#ffffff"; // the "Close" button on a filled card: white with dark text, 9:1
      var SB_OPEN_BTN_TEXT = "#0d47a1";
      var SB_OPEN_TOUCH = 44; // px: what a finger needs (height of the rail icon and of the buttons that open and close a panel)
      var SB_OPEN_STYLE_ID = "workshop-bar-open-css"; // listed in BAR_OWN_STYLES (20-main.js): it leaves the page when the plugin stops

      // What a panel's state() answered, as the painters read it. A closing panel (busy, not open any more) is still on the screen, so it keeps
      // the open look until it is gone; `kind` is the word the badge says: open, busy (the panel's own text), locked or closed.
      // `locked` (owner rule 2026-11-06): a panel that cannot be OPENED by this person because it needs a session ({ kind: "session" }) or a role
      // ({ kind: "role", needed: "<role id>" }) is not opened: its launchers show a lock and the reason, and the tap signs in (or changes the
      // person) instead of opening. A panel that is already open is not locked by this (the panel itself blocks its content in place).
      function sbOpenView(st) {
        var s = st && typeof st === "object" ? st : {};
        var open = !!s.open;
        var busy = !open && !!s.busy;
        var lk = !open && !busy && s.locked && typeof s.locked === "object" && (s.locked.kind === "session" || s.locked.kind === "role") ? { kind: s.locked.kind, needed: s.locked.needed || "" } : null;
        return { open: open, busy: busy, on: open || busy, disabled: !!s.disabled && !lk, locked: lk, kind: open ? "open" : busy ? "busy" : lk ? "locked" : "closed" };
      }

      // The reason of a locked panel in the words of the session standard (one sentence per cause, _shared/09-notice-dom.js), and the word of its
      // action: sign in while nobody is, change the person when the role is too low (the same name + PIN dialog serves both).
      function sbOpenLockText(lk) {
        return typeof workshopNoticeText === "function" ? workshopNoticeText(lk.kind, lk.needed || undefined) : "";
      }
      function sbOpenLockAction(lk) {
        return i18nT(lk.kind === "session" ? "sidebar.panel_locked_sign_in" : "sidebar.panel_locked_change_role");
      }
      // The tap on a locked launcher: the name + PIN dialog (a sign-in, or another person). Nothing opens.
      function sbOpenLockTap() {
        if (typeof workshopLogin === "function") workshopLogin();
      }
      // What a launcher does when tapped: the lock dialog for a locked panel, else the panel's own toggle. Returns true when it was the lock.
      function sbOpenTap(p) {
        var st = {};
        try {
          st = (p && typeof p.state === "function" && p.state()) || {};
        } catch (e) {
          st = {};
        }
        if (sbOpenView(st).locked) {
          sbOpenLockTap();
          return true;
        }
        if (p && typeof p.toggle === "function") p.toggle();
        return false;
      }
      // The color of the lock mark and of the reason: the token of the cause (blue for the session, gray for the role)
      function sbOpenLockColor(lk) {
        return lk.kind === "session" ? "var(--wf-n-session-text,#90caf9)" : "var(--wf-n-role-text,#b0bec5)";
      }

      // The CSS the painters need and inline styles cannot say: the pulse and the reduced-motion rule. The dot is a class (.sb-open-dot), the
      // rest of the look is inline like the rest of the bar (the light theme of the page reads inline colours: _shared/03-theme.js).
      function sbOpenCssText() {
        var dot = ".sb-open-dot";
        return [
          dot + "{display:inline-block;flex:none;width:8px;height:8px;border-radius:50%;background:" + SB_OPEN_DOT + ";animation:sbOpenPulse 1.8s ease-in-out infinite;}",
          "@keyframes sbOpenPulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.45;transform:scale(0.7);}}",
          // with reduced motion the dot stays on and still: the badge and the ring say the same without moving
          "@media (prefers-reduced-motion: reduce){" + dot + "{animation:none;}}",
        ].join("\n");
      }
