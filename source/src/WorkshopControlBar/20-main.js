      // ---- Arranque de WorkshopControlBar ----

      // Machine state: the jog publishes it every 2s in the registry. If
      // nobody published for more than BAR_STATUS_STALE_MS (jog not installed or
      // stopped), the bar publishes it itself when DWC updates its
      // model (2026-10-12: from DWC's store, it no longer asks for /machine/status).
      var BAR_STATUS_POLL_MS = 2000;
      var BAR_STATUS_STALE_MS = 3000;

      function barFetchStatus() {
        if (pluginStopped) return;
        var status = workshopStateDwc();
        if (status) workshopPublishStatus(status);
      }

      var barStatusOff = workshopOnModel(function (status) {
        if (!pluginStopped && Date.now() - workshop.lastStatusAt > BAR_STATUS_STALE_MS) workshopPublishStatus(status);
      }, BAR_STATUS_POLL_MS);

      workshopOnChange(sidebarRefresh);
      var barIdentityOff = workshopOnIdentity(function () { if (!pluginStopped) { sidebarRefresh(); sidebarProbeRelay(); } }); // a new role shows / hides parts (09-role.js)
      workshopOnStatus(sidebarUpdateFromStatus);
      workshopWhenReady(function () {
        createSidebar();
        // With the bar active, the panels remove their own launcher
        // (see _shared/40-launcher.js).
        workshop.barActive = true;
        workshopNotify();
        if (workshop.lastStatus) sidebarUpdateFromStatus(workshop.lastStatus);
        else barFetchStatus();
      });
      workshopWatchDom(function () {
        if (!document.getElementById(SIDEBAR_ID)) createSidebar();
      });
      workshopGuardFocus(function () {
        return [sidebarEl];
      });

      // "Orphan" Vuetify overlay (reported 2026-10-08 testing
      // Consumption: clicks did not respond on the first load and
      // document.elementFromPoint returned a .v-overlay--active with nothing
      // visible on top). It is NOT from this plugin: it is DWC/Vuetify's -- the
      // most likely candidate is the persistent connection dialog
      // ("Please wait...", v-dialog with overlay) that
      // opens and closes very quickly on connecting, at the same time as
      // the snackbar "Connected to ...": Vuetify removes the overlay only on
      // its "transitionend", and if that transition does not get to run the
      // overlay stays active with no owner. It could not be reproduced live
      // (2026-10-08, several clean reloads), so this does two
      // things: (1) it LEAVES A RECORD in the console of which overlay it was and what
      // the page had open, to identify the exact component the
      // next time; (2) if an active overlay has NO dialog/
      // menu/drawer open that justifies it for 2 checks in a row,
      // it removes its pointer-events (it does not delete it: it is still Vuetify's) so
      // it does not block the whole page.
      var orphanOverlaySeen = typeof WeakSet !== "undefined" ? new WeakSet() : null;
      function checkOrphanOverlays() {
        if (pluginStopped || !orphanOverlaySeen) return;
        // Vuetify 4 (DWC 3.7) has none of the Vuetify 2 classes below, so every overlay would look orphaned: the watchdog is a 3.6 tool
        if (workshopHostKind() === "37") return;
        var owners = document.querySelectorAll(
          ".v-dialog--active, .v-navigation-drawer--temporary.v-navigation-drawer--open, .menuable__content__active, .v-bottom-sheet.v-dialog--active"
        );
        var overlays = document.querySelectorAll(".v-overlay.v-overlay--active");
        for (var i = 0; i < overlays.length; i++) {
          var ov = overlays[i];
          if (owners.length > 0) {
            // There is a real dialog/menu open: if Vuetify reused an
            // overlay we had neutralized, give the clicks back to it (a
            // modal dialog, e.g. the M291 confirmation of "Shut down now",
            // must keep blocking the background).
            if (ov.dataset.efNeutralized === "1") {
              delete ov.dataset.efNeutralized;
              ov.style.pointerEvents = "";
            }
            orphanOverlaySeen.delete(ov);
            continue;
          }
          if (ov.dataset.efNeutralized === "1") continue;
          if (!orphanOverlaySeen.has(ov)) {
            orphanOverlaySeen.add(ov);
            continue;
          }
          var r = ov.getBoundingClientRect();
          console.warn(
            "[WorkshopControlBar] Vuetify overlay active with NO dialog/menu open -- its clicks are disabled so it does not block the page.",
            { className: ov.className, rect: [r.left, r.top, r.width, r.height], parent: ov.parentElement && ov.parentElement.className, snackbars: Array.prototype.map.call(document.querySelectorAll(".v-snack"), function (n) { return n.className + " | " + (n.innerText || "").slice(0, 60); }), route: location.pathname }
          );
          ov.dataset.efNeutralized = "1";
          ov.style.pointerEvents = "none";
        }
      }
      var orphanOverlayTimer = setInterval(checkOrphanOverlays, 1500);

      workshopOnStop(function () {
        barStatusOff();
        barIdentityOff();
        clearInterval(orphanOverlayTimer);
        clearInterval(sbControlTimer);
        if (sbRelayProbeTimer) clearInterval(sbRelayProbeTimer);
        workshopOffChange(sidebarRefresh);
        workshopOffStatus(sidebarUpdateFromStatus);
        var node = document.getElementById(SIDEBAR_ID);
        if (node) node.remove();
        sidebarEl = null;
        window.removeEventListener("resize", sbApplyPush);
        sbApplyPush(); // plugin stopped: the page gets its full width back
        workshop.barActive = false; // the panels show their own launcher again
        workshopNotify();
      });
      workshopWatchEnabled();
