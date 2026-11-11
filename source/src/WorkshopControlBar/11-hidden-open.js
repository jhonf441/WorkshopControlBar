      // ---- The tile of a panel in the Hidden style: how it says "open" (2026-10-31) ----
      // The tile of THIS SCREEN is the switch of its panel. Open (09-panel-open.js decides, for any registered panel): the tile is filled with the
      // accent, the second line is the badge "dot (pulses softly)" (plus the panel's own words, if it gave any) and, at its right, a small X; no "Open" word; the ring and the pressed state
      // for assistive technology say it too. Closed: the quiet tile it always was ("Closed"). Not only colour: the words and the dot change.

      // The second line of a panel tile: [badge ........ action]. Built once (the nodes stay, so the pulse is never restarted by a repaint).
      function ocOpenTileBuild(t) {
        t._est.style.cssText = "display:flex;align-items:center;gap:8px;min-width:0;font-size:11px;color:#b0bec5;";
        t._badge = ocEl("span", "flex:1 1 auto;min-width:0;display:flex;align-items:center;");
        t._cue = ocEl("span", "flex:none;display:none;color:" + SB_OPEN_TEXT + ";"); // the X: decoration only, the tile itself is the toggle
        t._cue.setAttribute("aria-hidden", "true");
        sbH(t._cue, sbIconSvg("close", 16, false));
        t._lock = ocEl("span", "flex:none;display:none;"); // the lock of a panel this person cannot open: decoration (drawn while locked), the tile signs in
        t._lock.setAttribute("aria-hidden", "true");
        t._est.appendChild(t._badge);
        t._est.appendChild(t._cue);
        t._est.appendChild(t._lock);
      }

      // The surface of the tile: closed = the quiet neutral card; open = the accent fill with its ring and white words
      function ocOpenTileSurface(t, v) {
        t.style.background = v.on ? SB_OPEN_FILL : "rgba(128,128,128,0.07)";
        t.style.borderColor = v.on ? SB_OPEN_RING : "rgba(128,128,128,0.3)";
        t.style.boxShadow = v.on ? "0 0 0 2px rgba(144,202,249,0.5)" : "";
        t.style.color = v.on ? SB_OPEN_TEXT : "#eceff1";
        t._ic.style.color = v.on ? SB_OPEN_TEXT : "rgba(128,128,128,0.95)";
        t._tit.style.fontWeight = v.on ? "700" : "500";
        t._est.style.color = v.on ? SB_OPEN_TEXT : "#b0bec5";
        t._est.style.fontWeight = v.on ? "700" : "400";
        t._est.style.fontSize = v.on ? "12px" : "11px";
        t.disabled = v.disabled;
        t.style.opacity = v.disabled ? "0.5" : "1";
      }

      // Paints the tile of one registered panel from the state it gave (called by ocRefresh)
      function ocPaintPanelTile(t, p, s) {
        var v = sbOpenView(s);
        sbOpenStyle(); // 18-sidebar-open.js
        var hint = sbOpenHint(p, s, v); // 18-sidebar-open.js
        t.title = hint;
        t.setAttribute("aria-label", hint);
        t.setAttribute("aria-pressed", v.open ? "true" : "false");
        t.dataset.sbOpen = v.on ? "1" : "0";
        t.dataset.sbLocked = v.locked ? v.locked.kind : "";
        ocOpenTileSurface(t, v);
        // locked: the second line is the action the tap does (sign in / change the person) with the lock beside it; the reason is the tooltip
        var word = v.open ? s.statusText || "" : v.busy ? s.statusText || i18nT("sidebar.panel_busy") : v.locked ? sbOpenLockAction(v.locked) : i18nT("sidebar.closed");
        sbOpenBadge(t._badge, v.on, word);
        if (v.locked) t._est.style.color = sbOpenLockColor(v.locked);
        t._cue.style.display = v.open ? "" : "none";
        if (t._lock) {
          sbH(t._lock, v.locked ? sbOpenLockSvg(14) : "");
          t._lock.style.display = v.locked ? "" : "none";
          t._lock.style.color = v.locked ? sbOpenLockColor(v.locked) : "";
        }
      }
