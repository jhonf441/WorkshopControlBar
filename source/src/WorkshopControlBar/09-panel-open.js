      // ---- How an open panel shows in the bar: the pure part (tests/bar-open.test.js) ----
      //
      // A panel is "open" while its state() says so, whichever plugin registered it (workshop.panels): the bar names none, so the cue comes from
      // the registry and works for any panel, present or future. ONE decision and ONE look for the three places that list the panels: the rail
      // icon of the closed bar and the card of the arrange view (18-sidebar-open.js) and the tile of the Hidden style (11-hidden-open.js).
      // The cue never rests on colour alone: an open panel also changes its words (the badge "Open", the action "Close"), gains a dot that
      // pulses softly (it stands still with reduced motion) and a ring, and tells assistive technology (aria-pressed, aria-label).

      var SB_OPEN_FILL = "#1565c0"; // the accent fill (the blue of every chosen thing of the bar): white text on it is 5.75:1, AA asks 4.5
      var SB_OPEN_TEXT = "#ffffff";
      var SB_OPEN_RING = "#90caf9"; // the ring of an open panel; the light theme of the page darkens it by itself (_shared/03-theme.js)
      var SB_OPEN_DOT = "#69f0ae"; // the live dot, 4:1 against the fill (a graphic needs 3)
      var SB_OPEN_BTN = "#ffffff"; // the "Close" button on a filled card: white with dark text, 9:1
      var SB_OPEN_BTN_TEXT = "#0d47a1";
      var SB_OPEN_TOUCH = 44; // px: what a finger needs (height of the rail icon and of the buttons that open and close a panel)
      var SB_OPEN_STYLE_ID = "workshop-bar-open-css"; // listed in BAR_OWN_STYLES (20-main.js): it leaves the page when the plugin stops

      // What a panel's state() answered, as the painters read it. A closing panel (busy, not open any more) is still on the screen, so it keeps
      // the open look until it is gone; `kind` is the word the badge says: open, busy (the panel's own text) or closed.
      function sbOpenView(st) {
        var s = st && typeof st === "object" ? st : {};
        var open = !!s.open;
        var busy = !open && !!s.busy;
        return { open: open, busy: busy, on: open || busy, disabled: !!s.disabled, kind: open ? "open" : busy ? "busy" : "closed" };
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
