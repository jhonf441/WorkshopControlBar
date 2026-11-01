      // ---- Narrow screens: a panel that opens closes the bar (F0, 2026-10-21) ----
      //
      // On a phone the floating panels and the open bar do not fit together and the bar covers the panel.
      // A panel announces that it opened with the window event "workshop-panel-opened" (workshopAnnouncePanelOpened, _shared/40-launcher.js) and the
      // bar goes back to its closed look. A wide screen (kiosk, desktop) is not touched.

      function sbOnPanelOpened() {
        if (pluginStopped || !workshopIsNarrow()) return;
        if (!sidebarCollapsed) sidebarSetCollapsed(true);
      }

      window.addEventListener(WORKSHOP_OPENED_EVENT, sbOnPanelOpened);
