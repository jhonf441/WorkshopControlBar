      // ---- One control bar per screen ----
      //
      // A DWC page that runs inside a frame of another page of the same origin that already carries the bar must not build a second one:
      // a reduced "preview" of the demo (the same address in a narrow frame) showed two bars on screen, the small one inside the big one.
      // The bar of the OUTER page stays; the framed page yields (it never looks the other way, and a frame of another origin cannot be read,
      // so it keeps its bar). Inside one document a second copy of the plugin cannot build another bar either: createSidebar() returns
      // when the id is taken.

      // win = a window (injected so the test can pass fakes); true when its parent window is another window whose document has the bar
      function sbFrameBarAlive(win, id) {
        try {
          var up = win && win.parent;
          if (!up || up === win) return false;
          var el = up.document && up.document.getElementById(id);
          return !!el && el.id === id;
        } catch (e) {
          return false; // another origin: not readable, nothing to yield to
        }
      }

      // Called once a second (10-sidebar.js): a bar that now sits inside a frame whose parent also has one stops this copy of the plugin.
      function sbYieldToParentBar() {
        if (pluginStopped || !sidebarEl || !sbFrameBarAlive(window, SIDEBAR_ID)) return;
        console.warn("[WorkshopControlBar] the page that contains this frame already has the control bar: this one steps aside.");
        workshopStop();
      }

      // Width of the bar for a window width: the rail when closed, otherwise the usual 300 px but never wider than the window minus its margins
      // (a 375 px phone gets 300, a 320 px one 296). The CSS text of the same rule is what sidebarSetCollapsed() writes.
      function sbWidthCss(collapsed) {
        if (collapsed) return SIDEBAR_RAIL_W + "px";
        return "min(" + SIDEBAR_EXPANDED_W + "px, calc(100vw - 24px))";
      }
      function sbWidthPx(collapsed, viewport) {
        return collapsed ? SIDEBAR_RAIL_W : Math.max(SIDEBAR_RAIL_W, Math.min(SIDEBAR_EXPANDED_W, viewport - 24));
      }
