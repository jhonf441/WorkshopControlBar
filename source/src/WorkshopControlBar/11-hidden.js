      // ---- Hidden style: complete redesign (2026-10-10, approved mockup
      // "Hidden bar: complete redesign": "yes, program it like that") ----
      //
      // Home: machine state, THIS SCREEN as large switches
      // (Jog, Camera...), MY BUTTONS with chips to filter by
      // group, GLOBAL as status cards (Relay, Notices, Shutdown) and
      // "Shut down now" separate at the bottom. Tapping a global card opens its
      // DETAIL in the same panel (the usual card, with an arrow to go
      // back): nothing of what they do is duplicated; only how it is seen
      // and navigated changes. Classic does not change. While ordering, the
      // usual complete list is seen.

      var OC_FILTER_KEY = "workshopBarOcGroup";
      var ocView = "start"; // "start" | sb key of the open card
      var ocHidden = [];
      var oc = null; // nodos de la vista

      function ocEl(tag, css, txt) {
        var e = document.createElement(tag);
        if (css) e.style.cssText = css;
        if (txt != null) e.textContent = txt;
        return e;
      }
      function ocLbl(txt, color) {
        return ocEl("div", "font-size:10px;font-weight:600;letter-spacing:0.08em;color:" + color + ";", txt);
      }
      // card-button of the board
      function ocTile(onTap) {
        var t = ocEl("button", "display:flex;flex-direction:column;gap:6px;min-height:72px;box-sizing:border-box;padding:10px;border-radius:10px;border:1px solid rgba(128,128,128,0.3);background:rgba(128,128,128,0.07);color:#eceff1;font:inherit;text-align:left;cursor:pointer;touch-action:pan-y;min-width:0;");
        t.type = "button";
        t.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); ev.preventDefault(); });
        t.addEventListener("click", function (ev) { ev.stopPropagation(); onTap(); });
        var top = ocEl("div", "display:flex;align-items:center;gap:8px;min-width:0;");
        t.appendChild(top);
        t._ic = ocEl("span", "width:24px;height:24px;flex:none;display:inline-flex;align-items:center;justify-content:center;color:rgba(128,128,128,0.95);"); // a gray icon, no colored box (design family)
        top.appendChild(t._ic);
        t._tit = ocEl("b", "font-size:13px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;");
        top.appendChild(t._tit);
        t._chev = ocEl("span", "margin-left:auto;color:#b0bec5;font-size:15px;flex:none;");
        top.appendChild(t._chev);
        t._est = ocEl("span", "font-size:11px;color:#b0bec5;min-width:0;");
        t.appendChild(t._est);
        return t;
      }

      function ocArm() {
        if (oc || !sb.full) return;
        workshopInjectFamily(); // the design family (wf-* classes): the filter chips and the state of the board
        oc = {};
        var full = sb.full;

        // cabecera de detalle (flecha para volver)
        oc.back = ocEl("div", "display:none;align-items:center;gap:10px;padding:2px 0 6px 0;border-bottom:1px solid rgba(255,255,255,0.08);");
        var bb = ocEl("button", "width:32px;height:32px;flex:none;border-radius:9px;border:none;background:#263238;color:#fff;font-size:16px;cursor:pointer;", "<");
        bb.type = "button";
        bb.title = i18nT('hidden.back');
        bb.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); ev.preventDefault(); });
        bb.addEventListener("click", function (ev) { ev.stopPropagation(); ocIr("start"); });
        oc.back.appendChild(bb);
        var bt = ocEl("div", "display:flex;flex-direction:column;min-width:0;");
        oc.backSec = ocLbl("GLOBAL", SIDEBAR_GLOBAL_COLOR);
        oc.backTit = ocEl("span", "font-size:15px;font-weight:600;");
        bt.appendChild(oc.backSec);
        bt.appendChild(oc.backTit);
        oc.back.appendChild(bt);
        full.insertBefore(oc.back, full.firstChild);

        // arriba: estado + esta pantalla
        oc.top = ocEl("div", "display:none;flex-direction:column;gap:14px;");
        var est = ocEl("div", "display:flex;align-items:center;gap:8px;");
        oc.state = ocEl("span", "");
        oc.state.className = "wf-state";
        est.appendChild(oc.state);
        oc.job = ocEl("span", "font-size:11px;color:#b0bec5;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;");
        est.appendChild(oc.job);
        oc.top.appendChild(est);
        var loc = ocEl("div", "display:flex;flex-direction:column;gap:8px;");
        loc.appendChild(ocLbl(i18nT('common.this_screen'), SIDEBAR_LOCAL_COLOR));
        oc.locGrid = ocEl("div", "display:grid;grid-template-columns:1fr 1fr;gap:8px;");
        loc.appendChild(oc.locGrid);
        oc.top.appendChild(loc);
        // my buttons: title + chips (the groups are the usual cards)
        var mb = ocEl("div", "display:flex;flex-direction:column;gap:6px;");
        mb.appendChild(ocLbl(i18nT('hidden.my_buttons'), "#cfd8dc"));
        oc.chips = ocEl("div", "display:flex;gap:6px;flex-wrap:wrap;");
        mb.appendChild(oc.chips);
        oc.top.appendChild(mb);
        oc.panelTiles = {};
        var ref = sb.configBox && sb.configBox.parentNode === full ? sb.configBox.nextSibling : full.firstChild.nextSibling;
        full.insertBefore(oc.top, ref);

        // abajo: global
        oc.bottom = ocEl("div", "display:none;flex-direction:column;gap:8px;");
        oc.bottom.appendChild(ocLbl(i18nT('hidden.global_affects_everyone'), SIDEBAR_GLOBAL_COLOR));
        var gg = ocEl("div", "display:grid;grid-template-columns:1fr 1fr;gap:8px;");
        oc.bottom.appendChild(gg);
        oc.tRelay = ocTile(function () { ocIr("relayCard"); });
        oc.tNotices = ocTile(function () { ocIr("notificationCard"); });
        oc.tShutdown = ocTile(function () { ocIr("powerCard"); });
        oc.tShutdown.style.gridColumn = "span 2";
        [[oc.tRelay, "relay", i18nT('hidden.relay')], [oc.tNotices, "bell", i18nT('hidden.notifications')], [oc.tShutdown, "timer", i18nT('sidebar.shutdown')]].forEach(function (x) {
          sbH(x[0]._ic, sbIconSvg(x[1], 18, false));
          sbT(x[0]._tit, x[2]);
          sbT(x[0]._chev, ">");
          gg.appendChild(x[0]);
        });
        full.appendChild(oc.bottom);

        // fixed footer: Shut down now (the macro asks for confirmation, as always)
        oc.footer = ocEl("div", "flex:none;display:none;padding:10px 12px 12px;border-top:1px solid rgba(255,255,255,0.08);");
        var ap = ocEl("button", "width:100%;height:44px;border-radius:12px;border:none;background:#b71c1c;color:#fff;font:inherit;font-weight:600;font-size:13px;cursor:pointer;", i18nT('sidebar.shut_down_now'));
        ap.type = "button";
        ap.title = i18nT('hidden.shuts_down_the_system_and_cuts');
        ap.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); ev.preventDefault(); });
        sbArmedPress(ap, i18nT('sidebar.shut_down_now'), function () {
          sbPowerMacroRun("shutdown-all.g"); // motion.ask first (19-sidebar-actions.js)
        });
        oc.footer.appendChild(ap);
        sidebarEl.appendChild(oc.footer);

        // group filter: a CSS rule that is rewritten when choosing a chip
        oc.filterCss = document.createElement("style");
        document.head.appendChild(oc.filterCss);
        if (sb.btnCard) sb.btnCard.dataset.ocBtnsec = "1";
        if (sb.btnGroups) sb.btnGroups.dataset.ocFilter = "1";
        var B = "#" + SIDEBAR_ID + '[data-oc-view="start"]';
        var st = document.createElement("style");
        st.textContent = [
          // on the home: no help texts nor the BUTTONS title (the chips replace it)
          B + " [data-sb-help]{display:none!important;}",
          B + " [data-oc-btnsec]{background:transparent!important;padding:0!important;}",
          B + " [data-oc-btnsec]>div:first-child{display:none!important;}",
          B + " [data-oc-btnsec] [data-btn-group] button{min-height:40px!important;border-radius:10px!important;}",
        ].join("\n");
        document.head.appendChild(st);
      }

      function ocGroupSel() {
        try {
          return localStorage.getItem(OC_FILTER_KEY) || "";
        } catch (e) {
          return "";
        }
      }
      function ocFilter() {
        var id = ocGroupSel();
        var gi = -1;
        if (id && typeof btnData !== "undefined" && btnData && btnData.groups)
          btnData.groups.forEach(function (g, i) { if (g.id === id) gi = i; });
        oc.filterCss.textContent = gi < 0 ? "" :
          "#" + SIDEBAR_ID + '[data-oc-view="start"] [data-oc-filter]>[data-btn-group]:not([data-btn-group="' + gi + '"]){display:none!important;}';
      }
      function ocChips() {
        var groups = typeof btnData !== "undefined" && btnData && btnData.groups ? btnData.groups : [];
        var sel = ocGroupSel();
        if (sel && !groups.some(function (g) { return g.id === sel; })) sel = "";
        var key = sel + "|" + groups.map(function (g) { return g.id + ":" + g.title; }).join(",");
        if (oc.chips.dataset.k === key) return;
        oc.chips.dataset.k = key;
        oc.chips.textContent = "";
        [["", i18nT('hidden.all')]].concat(groups.map(function (g) { return [g.id, g.title]; })).forEach(function (x) {
          var on = x[0] === sel;
          var c = ocEl("button", "", x[1]);
          c.className = "wf-cat" + (on ? " on" : "");
          c.setAttribute("aria-pressed", on ? "true" : "false");
          c.type = "button";
          c.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); ev.preventDefault(); });
          c.addEventListener("click", function (ev) {
            ev.stopPropagation();
            try {
              localStorage.setItem(OC_FILTER_KEY, x[0]);
            } catch (e) {
              /* no critico */
            }
            ocChips();
            ocFilter();
          });
          oc.chips.appendChild(c);
        });
      }

      function ocRestore() {
        ocHidden.forEach(function (x) { x[0].style.display = x[1]; });
        ocHidden = [];
      }
      function ocHide(n) {
        if (n && n.style.display !== "none") {
          ocHidden.push([n, n.style.display]);
          n.style.display = "none";
        }
      }

      function ocIr(v) {
        ocView = v;
        ocApply();
        if (sb.scroller) sb.scroller.scrollTop = 0;
      }

      // Sets the view that applies (called when opening/closing and on each refresh).
      function ocApply() {
        if (!sidebarEl || !sb.full) return;
        var active = sbIsHidden() && !sidebarCollapsed && !sbOrdering;
        if (!active) {
          if (oc) {
            ocRestore();
            oc.top.style.display = oc.bottom.style.display = oc.back.style.display = oc.footer.style.display = "none";
          }
          delete sidebarEl.dataset.ocView;
          if (sidebarCollapsed) ocView = "start";
          return;
        }
        ocArm();
        ocRestore();
        var card = ocView !== "start" ? sb[ocView] : null;
        if (ocView !== "start" && !(card && sb.full.contains(card))) ocView = "start";
        sidebarEl.dataset.ocView = ocView === "start" ? "start" : "detail";
        oc.footer.style.display = ocView === "start" ? "block" : "none";
        if (ocView === "start") {
          oc.back.style.display = "none";
          oc.top.style.display = oc.bottom.style.display = "flex";
          ocHide(sb.gLocal);
          ocHide(sb.gGlobal);
          [sb.relayCard, sb.notificationCard, sb.powerCard].forEach(ocHide);
          ocChips();
          ocFilter();
          return;
        }
        // detail: only that card (and the chain up to sb.full), with the arrow
        oc.top.style.display = oc.bottom.style.display = "none";
        oc.back.style.display = "flex";
        sbT(oc.backTit, { relayCard: i18nT('hidden.camera_relay'), notificationCard: i18nT('sidebar.phone_notifications'), powerCard: i18nT('sidebar.shutdown') }[ocView] || "");
        var n = card;
        while (n && n !== sb.full) {
          var p = n.parentNode;
          if (!p) break;
          Array.prototype.forEach.call(p.children, function (h) {
            if (h !== n && h !== oc.back) ocHide(h);
          });
          n = p;
        }
      }

      var OC_STATES = {
        idle: [i18nT('hidden.idle'), "rgba(102,187,106,0.18)", "#a5d6a7", "ok"],
        processing: [i18nT('hidden.processing'), "rgba(66,165,245,0.2)", "#90caf9", "info"],
        simulating: [i18nT('hidden.simulating'), "rgba(66,165,245,0.2)", "#90caf9", "info"],
        paused: [i18nT('hidden.paused'), "rgba(255,152,0,0.2)", "#ffb74d", "warn"],
        pausing: [i18nT('hidden.pausing'), "rgba(255,152,0,0.2)", "#ffb74d", "warn"],
        resuming: [i18nT('hidden.resuming'), "rgba(66,165,245,0.2)", "#90caf9", "info"],
        busy: [i18nT('hidden.busy'), "rgba(255,152,0,0.2)", "#ffb74d", "warn"],
        halted: [i18nT('hidden.halted'), "rgba(239,83,80,0.2)", "#ef9a9a", "err"],
        off: [i18nT('hidden.disconnected'), "rgba(158,158,158,0.2)", "#cfd8dc", ""],
      };

      // Dashboard data (from sidebarRefresh)
      function ocRefresh() {
        ocApply();
        if (!oc || !sbIsHidden() || sidebarCollapsed) return;
        var e = OC_STATES[sbMachineStatus] || [sbMachineStatus || i18nT('common.reading'), "rgba(158,158,158,0.2)", "#cfd8dc", ""];
        sbT(oc.state, e[0]);
        oc.state.className = "wf-state " + (e[3] || "");
        sbT(oc.job, sbJobFile && /processing|paused|pausing|resuming|simulating/.test(sbMachineStatus || "") ? sbJobFile.split("/").pop() : "");

        // this screen: one switch per registered panel
        Object.keys(oc.panelTiles).forEach(function (id) {
          if (!workshop.panels[id]) {
            oc.panelTiles[id].remove();
            delete oc.panelTiles[id];
          }
        });
        Object.keys(workshop.panels)
          .sort(function (a, b) { return (workshop.panels[a].order || 0) - (workshop.panels[b].order || 0); })
          .forEach(function (id) {
            var p = workshop.panels[id];
            var t = oc.panelTiles[id];
            if (!t) {
              t = oc.panelTiles[id] = ocTile(function () {
                var cur = workshop.panels[id];
                if (cur) cur.toggle();
                setTimeout(sidebarRefresh, 50);
              });
              sbH(t._ic, sbIconSvg(p.icon, 18, false));
              sbT(t._tit, p.title);
            }
            oc.locGrid.appendChild(t);
            var s = {};
            try {
              s = p.state() || {};
            } catch (err) {
              /* sin estado */
            }
            var on = !!(s.open || s.busy);
            // an open panel: a stronger neutral border and the title in 600 (no tint, no colored icon box: design family)
            t.style.borderColor = on ? "rgba(128,128,128,0.8)" : "rgba(128,128,128,0.3)";
            t._tit.style.fontWeight = on ? "600" : "500";
            sbT(t._est, s.open ? i18nT('hidden.open') : i18nT('sidebar.closed'));
            t._est.style.color = on ? "#eceff1" : "#b0bec5";
            t.disabled = !!s.disabled;
            t.style.opacity = s.disabled ? "0.5" : "1";
          });

        // global
        var rel = { running: [i18nT('hidden.running'), "#a5d6a7"], stopped: [i18nT('hidden.stopped'), "#ef9a9a"], nocam: [i18nT('hidden.no_camera'), "#b0bec5"] }[sbRelayState] || [i18nT('hidden.no_data'), "#b0bec5"];
        sbT(oc.tRelay._est, rel[0]);
        oc.tRelay._est.style.color = rel[1];
        if (sbRelayState === "running" && sbTl && sbTl.recording) {
          sbT(oc.tRelay._est, i18nT('hidden.recording_timelapse'));
          oc.tRelay._est.style.color = "#ef9a9a";
        }
        var sil = sbNoticeMuted();
        sbT(oc.tNotices._est, !sbNotice ? i18nT('hidden.no_data') : sil ? i18nT('hidden.muted') : i18nT('hidden.active'));
        oc.tNotices._est.style.color = sil ? "#ffb74d" : "#a5d6a7";
        var arm = sbPowerOffArmed === true;
        var txt = sbTiming ? i18nT('hidden.scheduled_at', { time: sbTiming.until }) : arm ? i18nT('hidden.armed_when_the_job_ends') : i18nT('hidden.nothing_scheduled');
        sbT(oc.tShutdown._est, txt);
        oc.tShutdown._est.style.color = sbTiming || arm ? "#ffb74d" : "#b0bec5";
        oc.tShutdown.style.borderColor = sbTiming || arm ? "rgba(255,152,0,0.5)" : "rgba(128,128,128,0.3)";
      }
