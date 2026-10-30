      // ---- The painters of the control bar: what sidebarRefresh writes into the elements of `sb` (F3-J, 2026-10-21) ----
      // sidebarRefresh (10-sidebar.js) calls them in order. The shutdown ones share a view `pv` (sbPowerView) so each one reads the same
      // state: armed, a job running, the method of shutting down and the sentence that says what it does.

      // The state of the shutdown that every painter reads.
      function sbPowerView() {
        var armed = sbPowerOffArmed === true;
        var jobRunning =
          sbMachineStatus === "processing" ||
          sbMachineStatus === "paused" ||
          sbMachineStatus === "pausing" ||
          sbMachineStatus === "resuming" ||
          sbMachineStatus === "simulating";
        var met = sbMethod;
        var metDesc = met ? met.desc || "" : "";
        var thatDoes = met ? metDesc : i18nT('sidebar.shuts_down_the_system_and_cuts');
        return { armed: armed, jobRunning: jobRunning, met: met, thatDoes: thatDoes };
      }

      // Camera relay and timelapse (GLOBAL).
      function sbPaintRelay() {
        // Relay (global)
        var relayState = {
          running: i18nT('sidebar.relay_state_running'),
          stopped: i18nT('sidebar.relay_state_stopped'),
          unknown: i18nT('sidebar.relay_state_unknown'),
          nocam: i18nT('sidebar.relay_state_no_camera'),
        }[sbRelayState];
        var relayTxt = i18nT('sidebar.relay_status', { state: relayState });
        sbT(sb.relayStatus, relayTxt);
        sb.relayStatus.style.color =
          sbRelayState === "running" ? "#a5d6a7" : sbRelayState === "stopped" ? "#ef9a9a" : "rgba(255,255,255,0.6)";
        if (!sbRelayArmTimer) {
          sbT(sb.relayStopBtn, i18nT('sidebar.stop_relay'));
          sb.relayStopBtn.style.background = "#e65100";
        }
        sbT(sb.relayMsg, sbRelayMsg);
        var tl = sbRelayState === "running" ? sbTl : null;
        sbT(sb.tlStatus, !tl
          ? i18nT('sidebar.timelapse_no_data_from_the_relay')
          : tl.recording
          ? i18nT('sidebar.timelapse_recording_job', { job: tl.job || "", n: tl.frames || 0 })
          : tl.assembling
          ? i18nT('sidebar.timelapse_building_the_video')
          : i18nT('sidebar.timelapse_stopped'));
        sb.tlStatus.style.color = tl && tl.recording ? "#ef9a9a" : "rgba(255,255,255,0.6)";
        sbT(sb.tlBtn, tl && tl.recording ? i18nT('sidebar.stop_timelapse') : i18nT('sidebar.start_timelapse'));
        sb.tlBtn.style.background = tl && tl.recording ? "#c62828" : "#1976d2";
        sb.tlBtn.disabled = !tl;
        sb.tlBtn.style.opacity = tl ? "1" : "0.5";
        sbT(sb.tlMsg, sbTlMsg);
        sb.railRelay.innerHTML =
          sbIconSvg("relay", 22, sbRelayState === "stopped") +
          '<span style="position:absolute;right:2px;top:2px;width:8px;height:8px;border-radius:50%;background:' +
          (sbRelayState === "running" ? "#66bb6a" : sbRelayState === "stopped" ? "#ef5350" : "#9e9e9e") +
          ';pointer-events:none"></span>';
        sb.railRelay.title = i18nT('sidebar.camera_relay_global_state', { state: relayState });
        sbH(sb.railPower, sbIconSvg("power", 22, false));
        sbH(sb.railButtons, sbIconSvg("grid", 22, false));
      }

      // Shut down when finished: status and button.
      function sbPaintShutdownState(pv) {
        var armed = pv.armed, jobRunning = pv.jobRunning, met = pv.met, thatDoes = pv.thatDoes;
        // Apagado al terminar (global)
        if (sbPowerOffArmed === null) {
          sbT(sb.shutdownStatus, i18nT('sidebar.shut_down_when_done_reading'));
          sb.shutdownStatus.style.color = "rgba(255,255,255,0.6)";
          sbT(sb.shutdownBtn, i18nT('sidebar.shut_down_when_done'));
          sb.shutdownBtn.disabled = true;
          sb.shutdownBtn.style.opacity = "0.5";
        } else {
          sbT(sb.shutdownStatus, armed ? i18nT('sidebar.shut_down_when_done_armed') : i18nT('sidebar.shut_down_when_done_not_armed'));
          sb.shutdownStatus.style.color = armed ? "#ffb300" : "rgba(255,255,255,0.75)";
          sbT(sb.shutdownBtn, armed ? i18nT('sidebar.cancel_shutdown_when_done') : i18nT('sidebar.arm_shutdown_when_done'));
          sb.shutdownBtn.style.background = armed ? "#6d4c41" : "#1565c0";
          sb.shutdownBtn.disabled = false;
          sb.shutdownBtn.style.opacity = "1";
        }
      }

      // How it shuts down: buttons, checkbox, relay output.
      function sbPaintPowerMethod(pv) {
        var armed = pv.armed, jobRunning = pv.jobRunning, met = pv.met, thatDoes = pv.thatDoes;
        // How it shuts down: buttons, checkbox and texts that say what is going to happen
        Object.keys(sb.methodButtons).forEach(function (k) {
          var on = !!met && met.method === k;
          sb.methodButtons[k].style.background = on ? "#1565c0" : "#37474f";
          sb.methodButtons[k].style.border = on ? "2px solid #90caf9" : "2px solid transparent";
          sb.methodButtons[k].disabled = !met;
          sb.methodButtons[k].style.opacity = met ? "1" : "0.5";
        });
        sb.methodPi.style.display = met && met.effective === "pson" ? "flex" : "none";
        sb.metodoPiChk.checked = !!(met && met.power_off_pi);
        var conRelay = !!met && met.method === "relay";
        sb.relayRow.style.display = conRelay ? "flex" : "none";
        if (conRelay) {
          var rc = met.relay || {};
          var ops = (met.outputs || []).slice();
          if (rc.output != null && ops.indexOf(rc.output) < 0) ops.push(rc.output);
          var key = ops.join(",") + "|" + rc.output;
          if (sb.relaySel.dataset.k !== key) {
            sb.relaySel.dataset.k = key;
            sb.relaySel.innerHTML = "";
            var o0 = document.createElement("option");
            o0.value = "";
            sbT(o0, i18nT('sidebar.choose'));
            sb.relaySel.appendChild(o0);
            ops.forEach(function (n) {
              var o = document.createElement("option");
              o.value = String(n);
              sbT(o, "P" + n);
              sb.relaySel.appendChild(o);
            });
            sb.relaySel.value = rc.output != null ? String(rc.output) : "";
          }
          ["0", "1"].forEach(function (k) {
            var on = String(rc.power_off_with || 0) === k;
            sb.relayVal[k].style.background = on ? "#1565c0" : "#37474f";
            sb.relayVal[k].style.border = on ? "2px solid #90caf9" : "2px solid transparent";
          });
        }
      }

      // The sentences that say what each shutdown action is going to do.
      function sbPaintPowerTexts(pv) {
        var armed = pv.armed, jobRunning = pv.jobRunning, met = pv.met, thatDoes = pv.thatDoes;
        // each part in its own <span>: the fixed texts and the description
        // (which comes from the Pi) are translated separately
        // desc / notice: texts of the service, already in the language of this DWC (sidebarUpdateFromStatus)
        var metDesc = met ? met.desc || "" : "";
        var metNotice = met ? met.notice || "" : "";
        if (met)
          sbParts(sb.methodDesc, [
            i18nT('sidebar.when_powering_off'),
            metDesc,
            met.method !== "auto" ? "" : met.effective === "meter" ? i18nT('sidebar.automatic_meter') : met.effective === "pson" ? i18nT('sidebar.automatic_ps_on') : met.effective === "relay" ? i18nT('sidebar.automatic_relay') : i18nT('sidebar.automatic_no_meter_relay_or_ps'),
          ]);
        else sbParts(sb.methodDesc, [i18nT('sidebar.reading_how_it_powers_off')]);
        sbT(sb.methodNotice, metNotice || "");
        sbT(sb.methodMsg, sbMethodMsg);
        sbParts(sb.nowText, [i18nT('sidebar.immediate_action'), thatDoes, i18nT('sidebar.asks_for_confirmation_first')]);
        sbParts(sb.timingText, [
          i18nT('sidebar.when_the_chosen_time_is_up'),
          thatDoes,
          i18nT('sidebar.works_even_with_no_screen_open'),
        ]);
        sb.railPower.title = i18nT('sidebar.shut_down_now_global', { what: thatDoes });
        var nomMet = !met ? "" : { meter: i18nT('sidebar.the_meter'), relay: i18nT('sidebar.the_relay'), pson: "PS_ON", pi: i18nT('sidebar.only_the_system') }[met.effective] || met.effective;
        sbParts(sb.shutdownMethodLn, met ? [i18nT('sidebar.it_will_power_off_with'), nomMet, i18nT('sidebar.changed_in_how_it_powers_off')] : []);
        sbParts(sb.timingMethodLn, met ? [i18nT('sidebar.it_will_power_off_with'), nomMet, i18nT('sidebar.changed_in_how_it_powers_off')] : []);
      }

      // Context of the arm button and the rail timer.
      function sbPaintShutdownWhen(pv) {
        var armed = pv.armed, jobRunning = pv.jobRunning, met = pv.met, thatDoes = pv.thatDoes;
        sbT(sb.shutdownContext, armed
          ? jobRunning
            ? sbJobFile
              ? i18nT('sidebar.when_the_current_job_ends_file', { file: sbJobFile.split("/").pop(), what: thatDoes })
              : i18nT('sidebar.when_the_current_job_ends', { what: thatDoes })
            : i18nT('sidebar.no_job_running_when_the_next_ends', { what: thatDoes })
          : i18nT('sidebar.schedules_the_power_off_for_when'));
        sbT(sb.shutdownMsg, sbShutdownMsg);
        sbH(sb.railTimer, sbIconSvg("timer", 22, false));
        sb.railTimer.style.background = armed ? "#ff8f00" : "#37474f";
        sb.railTimer.title = armed ? i18nT('sidebar.shut_down_when_done_global_armed') : i18nT('sidebar.shut_down_when_done_global_not_armed');
        sbT(sb.railTimerLabel, armed ? i18nT('sidebar.armed') : "");
      }

      // Shut down with a timer.
      function sbPaintTiming(pv) {
        var armed = pv.armed, jobRunning = pv.jobRunning, met = pv.met, thatDoes = pv.thatDoes;
        // Apagado con temporizador
        if (sb.timingStatus) {
          var missingMin = sbTiming ? Math.max(0, Math.ceil((sbTiming.missing_s || 0) / 60)) : 0;
          sbT(sb.timingStatus, sbTiming
            ? i18nT('sidebar.scheduled_shutdown_left', { time: sbTiming.until, left: missingMin >= 60 ? Math.floor(missingMin / 60) + " h " + (missingMin % 60) + " min" : missingMin + " min" })
            : i18nT('sidebar.turn_off_in_timer'));
          sb.timingStatus.style.color = sbTiming ? "#ffb300" : "rgba(255,255,255,0.75)";
          sb.timingRow.style.display = sbTiming ? "none" : "";
          sb.timingInput.style.display = sbTiming ? "none" : "";
          sb.timingOtherBtn.style.display = sbTiming ? "none" : "";
          sb.timingCancelBtn.style.display = sbTiming ? "" : "none";
          sbT(sb.timingMsg, sbTimingMsg);
          if (sbTiming) {
            sb.railTimer.style.background = "#ff8f00";
            sb.railTimer.title = i18nT('sidebar.scheduled_shutdown_at', { time: sbTiming.until }) + (armed ? " | " + i18nT('sidebar.shut_down_when_done_armed') : "");
            sbT(sb.railTimerLabel, missingMin + "m");
          }
        }
      }
