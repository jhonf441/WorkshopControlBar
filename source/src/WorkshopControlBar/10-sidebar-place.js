      // ---- Where the control bar sits and how it opens on a small screen (split from 10-sidebar.js, 2026-11-23) ----
      // Loaded before 10-sidebar.js (files are joined by name); everything here is called by it at run time.

      // ---- Placement without polling the layout (note 15 of the owner, 2026-11-23) ----
      // The bar re-measured DWC's top bar every second (getBoundingClientRect) and the scroll bar every 2 s; right after another timer had
      // written styles that forced a synchronous layout of the whole page (the kiosk logged 'setInterval' handlers of 77 ms). A ResizeObserver
      // reports the size of DWC's bars and of the root box after the browser's own layout, so measuring there is free. A slow scan (every 3 s,
      // only while the page is visible, no layout read) attaches it to the bars DWC builds later. Without ResizeObserver the old polling stays.
      var SB_PLACE_WATCHED = ".v-app-bar, .v-toolbar--fixed, header.v-toolbar, .v-bottom-navigation";
      var sbPlaceRo = null;
      var sbPlaceSeen = typeof WeakSet !== "undefined" ? new WeakSet() : null;
      function sbPlaceObserve() {
        if (!sbPlaceRo || !sbPlaceSeen) return;
        var els = document.querySelectorAll(SB_PLACE_WATCHED);
        for (var i = 0; i < els.length; i++) {
          if (sbPlaceSeen.has(els[i]) || (sidebarEl && sidebarEl.contains(els[i]))) continue;
          sbPlaceSeen.add(els[i]);
          sbPlaceRo.observe(els[i]);
        }
      }
      // true when the observer runs (now or already); false when the browser has none and the caller must poll
      function sbPlaceWatchStart() {
        if (sbPlaceRo) return true;
        if (typeof ResizeObserver !== "function" || !sbPlaceSeen) return false;
        sbPlaceRo = new ResizeObserver(function () {
          if (pluginStopped) return;
          if (sidebarEl) sbPlace();
          if (typeof sbHidden.rootCheck === "function") sbHidden.rootCheck();
        });
        sbPlaceRo.observe(document.documentElement);
        sbPlaceObserve();
        workshopOnStop(function () {
          if (sbPlaceRo) sbPlaceRo.disconnect();
          sbPlaceRo = null;
        });
        return true;
      }

      // ---- The open bar on a small screen is a sheet (note 16 of the owner, 2026-11-23) ----
      // Under SB_SHEET_W px of window the open bar cannot make room (the page would be left too narrow): it floats as a sheet, at most 88 % of
      // the width, over a dark veil that starts under DWC's top bar (its emergency stop stays visible and reachable). A tap on the veil closes
      // the bar, with or without automatic collapse (not while the gear or the arrange mode has unsaved work), and is not passed to the page;
      // Escape closes it as well. It is NOT a modal dialog on purpose: DWC's top bar and the stop of the bar must stay usable while it is open.
      // Closed, the bar keeps its rail or its arrow as usual.
      var SB_SHEET_W = 640;
      var sbScrim = null;
      function sbSheetMode() {
        return window.innerWidth < SB_SHEET_W;
      }
      function sbOpenWidthCss() {
        return sbSheetMode() ? "min(" + SIDEBAR_EXPANDED_W + "px, 88vw)" : sbWidthCss(false);
      }
      // the click that follows the tap closing the bar must not act on what is under the finger
      function sbSwallowNextClick() {
        var eat = function (e) {
          document.removeEventListener("click", eat, true);
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        };
        document.addEventListener("click", eat, true);
        setTimeout(function () { document.removeEventListener("click", eat, true); }, 800);
      }
      function sbScrimPaint() {
        var show = !pluginStopped && !!sidebarEl && !sidebarCollapsed && sbSheetMode();
        if (!show) {
          if (sbScrim && sbScrim.style.display !== "none") sbScrim.style.display = "none";
          return;
        }
        if (!sbScrim) {
          sbScrim = document.createElement("div");
          sbScrim.id = "workshop-bar-scrim";
          sbScrim.setAttribute("aria-hidden", "true");
          sbScrim.style.cssText = "position:fixed;left:0;right:0;bottom:0;top:" + (sbHidden.top || 0) + "px;z-index:2147483646;background:rgba(0,0,0,0.45);display:none;touch-action:none;";
          sbScrim.addEventListener("pointerdown", function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            if (!workshopSidebarShouldAutoClose(true, !sidebarCollapsed, sbBusyUi())) return;
            sidebarSetCollapsed(true);
            sbSwallowNextClick();
          });
          document.body.appendChild(sbScrim);
          // Escape closes the sheet too, like a tap on the veil (a drawer is dismissed by the veil, its own button or Escape)
          var onKey = function (ev) {
            if (ev.key !== "Escape" || !sbScrim || sbScrim.style.display !== "block") return;
            if (!workshopSidebarShouldAutoClose(true, !sidebarCollapsed, sbBusyUi())) return;
            sidebarSetCollapsed(true);
          };
          document.addEventListener("keydown", onKey);
          workshopOnStop(function () {
            document.removeEventListener("keydown", onKey);
            if (sbScrim && sbScrim.parentNode) sbScrim.parentNode.removeChild(sbScrim);
            sbScrim = null;
          });
        }
        if (sbScrim.style.display !== "block") sbScrim.style.display = "block";
      }
      // a window that crosses SB_SHEET_W while the bar is open: the width of the sheet and its veil follow
      function sbSheetApply() {
        if (!sidebarEl) return;
        if (!sidebarCollapsed) {
          var w = sbOpenWidthCss();
          if (sidebarEl.style.width !== w) sidebarEl.style.width = w;
        }
        sbScrimPaint();
      }

      // ---- The notices center (window.__workshopNotices, v1) keeps its cards clear of the bar (note 13, 2026-11-23) ----
      // The bar tells the center how many px of the right edge it takes on screen (the footprint sbApplyModalClear measures; 0 for the arrow),
      // without knowing who owns the center. Only when the number or the center changes: every setInset redraws the cards.
      var sbInsetSent = { center: null, px: -1 };
      function sbNoticeInset(px) {
        var c = window.__workshopNotices;
        if (!c || typeof c.setInset !== "function") return;
        if (c === sbInsetSent.center && px === sbInsetSent.px) return;
        sbInsetSent = { center: c, px: px };
        c.setInset("right", px, "WorkshopControlBar");
      }
