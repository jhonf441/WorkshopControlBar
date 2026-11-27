      // ---- The scale of the family in the control bar (redesign batch 1, 2026-11-23, informes/auditoria-diseno-23nov/FAMILIA-REDISENO.md) ----
      // 32 px to the eye with a 40 px area for what is touched (rail icons, launchers, buttons of the cards); 48 only for a stop (data-sb-critical:
      // the stop of a live job, "Shut down now"). The sections are told apart by their colour without boxes: the label is a coloured word with no
      // pill, the cards are rows split by a line (no grey sub-card inside the bar), and the icon of a card keeps the colour of its section.
      // The sizes are inline (sbMakeButton, sbMakeRailBtn, the stops) and the boxes of sections and cards are in the Hidden style (10-sidebar-css.js);
      // this sheet only adds what inline styles cannot: the invisible 40 px areas.
      function sbScaleCss() {
        if (document.getElementById("workshop-bar-scale-css")) return;
        var B = "#" + SIDEBAR_ID;
        var st = document.createElement("style");
        st.id = "workshop-bar-scale-css";
        st.textContent = [
          // the 40 px area of a 32 px control: an invisible ::before 4 px around it (two neighbours 8 px apart touch without overlapping)
          ".sb-hit{position:relative}",
          ".sb-hit::before{content:'';position:absolute;inset:calc((var(--wf-size-s, 32px) - var(--wf-hit, 40px)) / 2)}",
          // the buttons of the cards (32 px inline, sbMakeButton): the same 40 px area; a locked one keeps its lock glyph in ::before (09-role.js)
          B + " [data-sb-card] button:not([data-sb-critical]):not([data-sb-rail]){position:relative}",
          B + " [data-sb-card] button:not([data-sb-critical]):not([data-sb-rail]):not([data-sb-role-locked='1'])::before{content:'';position:absolute;left:0;right:0;top:calc((100% - var(--wf-hit, 40px)) / 2);bottom:calc((100% - var(--wf-hit, 40px)) / 2)}",
          // the rows of a card: 48 high with a line between them (power, notices...)
          B + " [data-sb-card] [data-sb-row]+[data-sb-row]{border-top:1px solid rgba(255,255,255,0.08)}",
          "html.tp-bright " + B + " [data-sb-card] [data-sb-row]+[data-sb-row]{border-top-color:rgba(0,0,0,0.08)}",
          B + " [data-sb-card] button svg{width:var(--wf-icon-m, 18px);height:var(--wf-icon-m, 18px)}",
          // a state that warns (a shutdown armed or scheduled): the warning text colour of DESIGN 2 on dark (#ffb74d) and its light version (#b26a00),
      // named as tokens so the family can take them over
          B + " [data-sb-warn='1']{color:var(--wf-warn-text, #ffb74d)}",
          "html.tp-bright " + B + " [data-sb-warn='1']{color:var(--wf-warn-text-light, #b26a00)}",
        ].join("\n");
        document.head.appendChild(st);
      }
