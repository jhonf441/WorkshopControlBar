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
        // the lock of a panel this person cannot open (a session or a role): a small mark in the corner, in the color of the cause
        ui.railLock = document.createElement("span");
        ui.railLock.setAttribute("aria-hidden", "true");
        ui.railLock.style.cssText = "position:absolute;right:-4px;bottom:-4px;width:16px;height:16px;border-radius:50%;display:none;align-items:center;justify-content:center;pointer-events:none;background:#1e272c;";
        ui.rail.appendChild(ui.railLock); // its glyph is drawn only while locked: an unlocked launcher carries exactly one icon
      }

      // The lock mark (a closed padlock), drawn like every other icon of the bar: an SVG, never a glyph the kiosk font lacks
      function sbOpenLockSvg(px) {
        return '<svg viewBox="0 0 24 24" width="' + px + '" height="' + px + '" fill="currentColor" aria-hidden="true" style="display:block"><path d="M12 17a2 2 0 0 0 2-2c0-1.11-.9-2-2-2a2 2 0 0 0-2 2 2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10c0-1.11.9-2 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z"/></svg>';
      }

      // The pieces of both launchers that the painters keep, built once when sbSyncPanels makes them: the rail icon with its dot, the status
      // line as a badge row and the button that opens and closes at the height of a finger. sbOpenPaintPanel fills them.
      function sbOpenBuild(ui) {
        sbOpenRailBuild(ui);
        ui.status.style.display = "flex";
        ui.status.style.alignItems = "center";
        ui.btn.style.minHeight = SB_OPEN_TOUCH + "px";
      }

      // The tooltip of a launcher: the panel's own, or the words of its state; a locked panel says its reason and what the tap does
      function sbOpenHint(p, st, v) {
        if (v.locked) return i18nT("sidebar.panel_locked_tip", { name: p.title, reason: sbOpenLockText(v.locked), action: sbOpenLockAction(v.locked) });
        return st.railTitle || i18nT(v.open ? "sidebar.panel_this_screen_only_open" : "sidebar.panel_this_screen_only_tap_to_open", { name: p.title });
      }

      // Rail icon: closed = quiet gray; open = accent fill + ring + the dot (not only another tone); locked = the quiet icon with a lock mark
      function sbOpenPaintRail(ui, p, st, v) {
        sbH(ui.railIcon, sbIconSvg(p.icon, 22, false));
        ui.rail.dataset.sbOpen = v.on ? "1" : "0";
        ui.rail.dataset.sbLocked = v.locked ? v.locked.kind : "";
        ui.rail.style.background = v.on ? SB_OPEN_FILL : "#37474f";
        ui.rail.style.border = v.on ? "2px solid " + SB_OPEN_RING : "1px solid rgba(255,255,255,0.25)";
        ui.rail.style.opacity = v.disabled ? "0.4" : v.locked ? "0.85" : "1";
        ui.railDot.style.display = v.on ? "" : "none";
        if (ui.railLock) {
          sbH(ui.railLock, v.locked ? sbOpenLockSvg(11) : "");
          ui.railLock.style.display = v.locked ? "flex" : "none";
          ui.railLock.style.color = v.locked ? sbOpenLockColor(v.locked) : "";
        }
        var hint = sbOpenHint(p, st, v);
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
        // locked: the status line is the reason (in the color of its cause) and the button is the way out of the lock, never "Open"
        sbOpenBadge(ui.status, v.on, v.locked ? sbOpenLockText(v.locked) : st.statusText || (v.open ? "" : i18nT("sidebar.closed")));
        ui.status.style.color = v.on ? SB_OPEN_TEXT : v.locked ? sbOpenLockColor(v.locked) : "rgba(255,255,255,0.6)";
        ui.status.style.fontWeight = v.on ? "700" : v.locked ? "500" : "bold";
        ui.status.style.whiteSpace = v.locked ? "normal" : "";
        ui.card.dataset.sbLocked = v.locked ? v.locked.kind : "";
        if (ui.desc) ui.desc.style.color = v.on ? SB_OPEN_TEXT : "rgba(255,255,255,0.7)";
        // Open: one small X (40 px target) with its accessible name and tooltip; closed: the "Open {name}" button as ever
        var label = v.open ? i18nT("sidebar.close_name", { name: name }) : v.locked ? sbOpenLockAction(v.locked) : i18nT("sidebar.open_name", { name: name });
        if (v.open) sbH(ui.btn, sbIconSvg("close", 18, false));
        else if (v.locked) sbH(ui.btn, '<span style="display:inline-flex;align-items:center;gap:6px;pointer-events:none">' + sbOpenLockSvg(14) + "<span>" + label + "</span></span>");
        else sbT(ui.btn, label);
        ui.btn.style.flex = v.open ? "0 0 auto" : "1 1 auto";
        ui.btn.style.minWidth = v.open ? SB_OPEN_TOUCH + "px" : "";
        ui.btn.style.marginLeft = v.open ? "auto" : "";
        ui.btn.title = v.locked ? sbOpenHint(p, st, v) : label;
        ui.btn.setAttribute("aria-label", ui.btn.title);
        ui.btn.style.background = v.on ? SB_OPEN_BTN : v.locked && v.locked.kind === "role" ? "#455a64" : SB_OPEN_FILL;
        ui.btn.style.color = v.on ? SB_OPEN_BTN_TEXT : SB_OPEN_TEXT;
        ui.btn.setAttribute("aria-pressed", v.open ? "true" : "false");
        ui.btn.disabled = v.disabled;
        ui.btn.style.opacity = v.disabled ? "0.5" : "1";
      }

      // Both launchers of one registered panel, from the state it gave
      function sbOpenPaintPanel(ui, p, st) {
        var v = sbOpenView(st);
        sbOpenStyle();
        sbOpenPaintCard(ui, p, st, v);
        sbOpenPaintRail(ui, p, st, v);
      }
