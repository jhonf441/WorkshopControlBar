      // ---- What the top of the open bar shows (the state headline, the live-job line, the status lights) ----
      //
      // The state headline ("Missing homing", "Risk active"...) and its legend come from plugins.WorkshopService.data: statusIndicator,
      // statusLightSecs, statusLightActive (see _shared/25-led-state.js). On DWC 3.7 that data is a Map, read through workshopPluginData();
      // before that read it was always empty there and the whole strip stayed hidden. Pure so the test can feed it a state of each line.
      //   est = ledState.get(); showLeds = the gear option "Status lights at the top of the bar"; lightsActive = the Lights plugin runs
      function ledShowStatus(est, showLeds, lightsActive) {
        return !!(est && (est.active || est.indicator)) && !!showLeds && !!lightsActive;
      }
