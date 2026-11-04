      // ---- The open look of a panel: rail icon and card (2026-10-31) ----
      // What an open panel looks like is decided in 09-panel-open.js (sbOpenView); this file paints it on the two launchers of
      // 10-sidebar.js (sbSyncPanels builds them, sbRefreshPanels paints them) and holds the pieces the tile of the Hidden style shares
      // (11-hidden-open.js): the style tag and the badge. An open panel: accent fill, white words, a ring, a dot that pulses softly, and the
      // only action is a small X. A closed one keeps the quiet look it always had.

      // The style tag with the pulse (once per page; it is created the first time a panel is painted, so a bar with no panels adds nothing)
      function sbOpenStyle() {
        if (document.getElementById(SB_OPEN_STYLE_ID)) return;
        var st = document.createElement("style");
        st.id = SB_OPEN_STYLE_ID;
        st.textContent = sbOpenCssText();
        document.head.appendChild(st);
      }

      // "dot + word" inside `el`. The two nodes are kept between refreshes (the bar repaints every second: new nodes would restart the pulse
      // each time); only the word and whether the dot shows change. `el` must not be written with sbT afterwards.
      function sbOpenBadge(el, on, label) {
        if (!el._sbDot) {
          el.textContent = "";
          el._sbDot = document.createElement("span");
          el._sbDot.className = "sb-open-dot";
          el._sbDot.setAttribute("aria-hidden", "true");
          el._sbDot.style.marginRight = "6px";
          el._sbWord = document.createElement("span");
          el._sbWord.style.cssText = "min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
          el.appendChild(el._sbDot);
          el.appendChild(el._sbWord);
        }
        el._sbDot.style.display = on ? "" : "none";
        sbT(el._sbWord, label);
        el.title = label;
      }

      // The launcher in the rail: a 44 px tall touch target (the rail is 44 wide, 42 inside its border: 40 wide), the icon in a box of its own
      // and the dot of an open panel in the corner.
      function sbOpenRailBuild(ui) {
        ui.rail.style.width = "40px";
        ui.rail.style.height = SB_OPEN_TOUCH + "px";
        ui.rail.setAttribute("aria-pressed", "false");
        sbH(ui.rail, ""); // the icon the button got when it was made (sbMakeRailBtn) moves into a box of its own, next to the dot
        ui.railIcon = document.createElement("span");
        ui.railIcon.style.cssText = "display:flex;pointer-events:none;";
        ui.rail.appendChild(ui.railIcon);
        ui.railDot = document.createElement("span");
        ui.railDot.className = "sb-open-dot";
        ui.railDot.setAttribute("aria-hidden", "true");
        ui.railDot.style.cssText = "position:absolute;top:3px;right:3px;width:10px;height:10px;display:none;pointer-events:none;box-shadow:0 0 0 2px " + SB_OPEN_FILL + ";";
        ui.rail.appendChild(ui.railDot);
      }

      // The pieces of both launchers that the painters keep, built once when sbSyncPanels makes them: the rail icon with its dot, the status
      // line as a badge row and the button that opens and closes at the height of a finger. sbOpenPaintPanel fills them.
      function sbOpenBuild(ui) {
        sbOpenRailBuild(ui);
        ui.status.style.display = "flex";
        ui.status.style.alignItems = "center";
        ui.btn.style.minHeight = SB_OPEN_TOUCH + "px";
      }

      // Rail icon: closed = quiet gray; open = accent fill + ring + the dot (not only another tone)
      function sbOpenPaintRail(ui, p, st, v) {
        sbH(ui.railIcon, sbIconSvg(p.icon, 22, false));
        ui.rail.dataset.sbOpen = v.on ? "1" : "0";
        ui.rail.style.background = v.on ? SB_OPEN_FILL : "#37474f";
        ui.rail.style.border = v.on ? "2px solid " + SB_OPEN_RING : "1px solid rgba(255,255,255,0.25)";
        ui.rail.style.opacity = st.disabled ? "0.4" : "1";
        ui.railDot.style.display = v.on ? "" : "none";
        var hint = st.railTitle || i18nT(v.open ? "sidebar.panel_this_screen_only_open" : "sidebar.panel_this_screen_only_tap_to_open", { name: p.title });
        ui.rail.title = hint;
        ui.rail.setAttribute("aria-label", hint);
        ui.rail.setAttribute("aria-pressed", v.open ? "true" : "false");
      }

      // Card of the arrange view: closed = the quiet card and the blue "Open" button; open = the card filled with the accent, the status line as
      // the badge (dot + the panel's own words) and a white "Close" button
      function sbOpenPaintCard(ui, p, st, v) {
        var name = p.title.toLowerCase();
        ui.card.dataset.sbOpen = v.on ? "1" : "0";
        if (v.on) ui.card.style.setProperty("background", SB_OPEN_FILL, "important");
        else ui.card.style.setProperty("background", "rgba(0,0,0,0.25)");
        ui.card.style.border = v.on ? "2px solid " + SB_OPEN_RING : "";
        sbOpenBadge(ui.status, v.on, st.statusText || (v.open ? "" : i18nT("sidebar.closed")));
        ui.status.style.color = v.on ? SB_OPEN_TEXT : "rgba(255,255,255,0.6)";
        ui.status.style.fontWeight = v.on ? "700" : "bold";
        if (ui.desc) ui.desc.style.color = v.on ? SB_OPEN_TEXT : "rgba(255,255,255,0.7)";
        // Open: one small X (40 px target) with its accessible name and tooltip; closed: the "Open {name}" button as ever
        var label = v.open ? i18nT("sidebar.close_name", { name: name }) : i18nT("sidebar.open_name", { name: name });
        if (v.open) sbH(ui.btn, sbIconSvg("close", 18, false));
        else sbT(ui.btn, label);
        ui.btn.style.flex = v.open ? "0 0 auto" : "1 1 auto";
        ui.btn.style.minWidth = v.open ? SB_OPEN_TOUCH + "px" : "";
        ui.btn.style.marginLeft = v.open ? "auto" : "";
        ui.btn.title = label;
        ui.btn.setAttribute("aria-label", label);
        ui.btn.style.background = v.on ? SB_OPEN_BTN : SB_OPEN_FILL;
        ui.btn.style.color = v.on ? SB_OPEN_BTN_TEXT : SB_OPEN_TEXT;
        ui.btn.setAttribute("aria-pressed", v.open ? "true" : "false");
        ui.btn.disabled = !!st.disabled;
        ui.btn.style.opacity = st.disabled ? "0.5" : "1";
      }

      // Both launchers of one registered panel, from the state it gave
      function sbOpenPaintPanel(ui, p, st) {
        var v = sbOpenView(st);
        sbOpenStyle();
        sbOpenPaintCard(ui, p, st, v);
        sbOpenPaintRail(ui, p, st, v);
      }
