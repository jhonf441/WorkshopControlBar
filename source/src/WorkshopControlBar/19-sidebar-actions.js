      // ---- Actions and readings of the control bar (F3-J, 2026-10-21; moved out of 10-sidebar.js, same code) ----
      // notifications (mute), navigation, the state of the relay, the shutdown actions and their messages.

      // Shut down now / Restart everything: the service decides first (motion.ask, class power: it asks the person to confirm, or refuses
      // while somebody else has the control), then the macro runs with C1 and does not ask again (without C1 it asks, M291 S3).
      function sbPowerMacroRun(macro) {
        var info = {};
        workshopRequestMotion("", "power", macro, info)
          .then(function (ok) {
            if (!ok) return null;
            // C1: the floating panel was accepted, so the macro does not ask a second time (M291)
            return postCode('M98 P"0:/macros/power/' + macro + '"' + (info.confirmed ? " C1" : ""));
          })
          .catch(function (e) {
            console.error("[WorkshopControlBar] error calling " + macro + ":", e);
            sbMethodMsg = String((e && e.message) || e);
            sidebarRefresh();
          });
      }

      // A destructive button (Shut down now, Restart everything) needs two presses: the first one arms it and shows a wait for
      // SB_ARM_MS (a stray or double click cannot run it), the second one, once armed and within SB_ARM_WINDOW_MS, runs it. The service
      // still asks its own OK / Cancel afterwards. The label is restored when the window closes.
      var SB_ARM_MS = 1500;
      var SB_ARM_WINDOW_MS = 6000;
      function sbArmedPress(btn, label, run) {
        var st = { at: 0, ready: false, t1: null, t2: null };
        var base = { bg: btn.style.background, op: btn.style.opacity };
        function reset() {
          clearTimeout(st.t1);
          clearTimeout(st.t2);
          st.at = 0;
          st.ready = false;
          btn.style.background = base.bg;
          btn.style.opacity = base.op;
          btn.setAttribute("aria-disabled", "false");
          sbT(btn, label);
        }
        btn.addEventListener("click", function (ev) {
          if (ev && ev.stopPropagation) ev.stopPropagation();
          if (!st.at) {
            st.at = Date.now();
            btn.style.opacity = "0.6";
            btn.setAttribute("aria-disabled", "true");
            sbT(btn, i18nT('sidebar.press_wait'));
            st.t1 = setTimeout(function () {
              st.ready = true;
              btn.style.opacity = base.op;
              btn.setAttribute("aria-disabled", "false");
              sbT(btn, i18nT('sidebar.press_again'));
            }, SB_ARM_MS);
            st.t2 = setTimeout(reset, SB_ARM_MS + SB_ARM_WINDOW_MS);
            return;
          }
          if (!st.ready) return; // still arming: the press is ignored
          reset();
          run();
        });
      }

      function sbNoticeMuted() {
        return !!(sbNotice && sbNotice.config && sbNotice.config.silence_until * 1000 > Date.now());
      }

      function sbRefreshNotice() {
        if (!sb.noticeStatus) return;
        var n = sbNotice;
        var fault = !!(n && n.last && n.last.ok === false);
        var txt, color;
        if (!n || !n.config) {
          txt = i18nT('sidebar.no_data_from_the_backend');
          color = "rgba(255,255,255,0.6)";
        } else if (!n.config.active) {
          txt = workshopPathExists("/Plugins/Activity") ? i18nT('sidebar.notifications_disabled') : i18nT('sidebar.notifications_disabled_short');
          color = "rgba(255,255,255,0.6)";
        } else if (!n.config.topic) {
          txt = workshopPathExists("/Plugins/Activity") ? i18nT('sidebar.no_destination_configured') : i18nT('sidebar.no_destination_configured_short');
          color = "#ffb300";
        } else if (sbNoticeMuted()) {
          var until = new Date(n.config.silence_until * 1000);
          txt = i18nT('sidebar.muted_until', { time: ("0" + until.getHours()).slice(-2) + ":" + ("0" + until.getMinutes()).slice(-2) });
          color = "#ffb300";
        } else if (fault) {
          txt = i18nT('sidebar.enabled_but_the_last_send_failed', { error: n.last.error || "" });
          color = "#ef9a9a";
        } else {
          txt = n.last ? i18nT('sidebar.enabled_last_send', { time: n.last.ts.slice(11, 16), title: n.last.title }) : i18nT('sidebar.enabled');
          color = "#a5d6a7";
        }
        sbT(sb.noticeStatus, txt);
        sb.noticeStatus.style.color = color;
        var sil = sbNoticeMuted();
        sbT(sb.noticeBtn, sil ? i18nT('sidebar.unmute_now') : i18nT('sidebar.mute_1_h'));
        sb.noticeBtn.style.background = sil ? "#1565c0" : "#6d4c41";
        var usable = !!(n && n.config && n.config.active && n.config.topic);
        sb.noticeBtn.disabled = !usable;
        sb.noticeBtn.style.opacity = usable ? "1" : "0.5";
        sbT(sb.noticeMsg, sbNoticeMsg);
        // Riel: campana tachada si no van a llegar, punto rojo si el ultimo fallo.
        var off = !usable || sil;
        sb.railNotice.innerHTML =
          sbIconSvg("bell", 22, off) +
          (fault && !off
            ? '<span style="position:absolute;right:2px;top:2px;width:8px;height:8px;border-radius:50%;background:#ef5350;pointer-events:none"></span>'
            : "");
        sb.railNotice.style.background = sil ? "#ff8f00" : "#37474f";
        sb.railNotice.title = i18nT('sidebar.phone_notifications_global_state', { state: txt });
      }

      function sbNoticeAction(minutos) {
        sbNoticeMsg = minutos ? i18nT('sidebar.muting') : i18nT('sidebar.unmuting');
        sidebarRefresh();
        workshopApiText("notifications.mute", { minutes: Number(minutos) || 0 })
          .then(function (txt) {
            try {
              var d = JSON.parse(String(txt).replace(/^Error: /, ""));
              if (d && d.config) sbNotice = d;
              sbNoticeMsg = "";
            } catch (e) {
              sbNoticeMsg = String(txt).slice(0, 140);
            }
          })
          .catch(function (e) {
            sbNoticeMsg = "Error: " + e;
          })
          .then(function () {
            sidebarRefresh();
          });
      }

      // Navigate inside DWC (SPA) without reloading the page: Vue router of
      // the root instance; if it is not found, normal navigation.
      function sbGoTo(path) {
        if (workshopHostCurrentPath() === path) return;
        if (workshopHostPush(path)) {
          sidebarSetCollapsed(true);
          // the new view starts at the top: the page keeps the scroll of the previous one, and when the new view is shorter it showed only the empty background
          [0, 120, 400].forEach(function (ms) { setTimeout(function () { window.scrollTo(0, 0); }, ms); });
          return;
        }
        window.location.href = path;
      }

      // Receives every /machine/status published in the registry (workshopOnStatus).
      function sidebarUpdateFromStatus(status) {
        var g = status && status.global;
        if (g && typeof g.powerOffOnFinish === "boolean") sbPowerOffArmed = g.powerOffOnFinish;
        var pcc = status && workshopPluginOf(status.plugins, "service");
        // the texts of the service come as {key, params}: they are shown in the language of this DWC
        if (pcc && pcc.data && pcc.data.notifications) sbNotice = workshopServiceTexts(pcc.data.notifications);
        if (pcc && pcc.data) sbTiming = workshopServiceTexts(pcc.data.shutdownTimer) || null;
        if (pcc && pcc.data) sbMethod = workshopServiceTexts(pcc.data.shutdownMethod) || null;
        sbMachineStatus = (status && status.state && status.state.status) || null;
        var f = status && status.job && status.job.file;
        sbJobFile = (f && f.fileName) || null;
        sbLiveStopFromStatus(status);
        sidebarRefresh();
        btnUpdateFromStatus(status);
      }

      // Relay state without asking for video: a HEAD (the relay does not implement
      // do_HEAD, it answers 501 at once and closes -- it asks nothing of the
      // ESP32). WARNING: do NOT use GET to a non-existent route -- its 404 comes out without
      // Content-Length in HTTP/1.1 and the browser keeps waiting for the
      // body until the timeout (measured 2026-10-08: it gave "stopped" with the
      // relay running). no-cors: the response is opaque, but the fact that it RESOLVES
      // already proves that the process is listening; connection refused = stopped.
      function sidebarProbeRelay() {
        if (pluginStopped || document.hidden) return; // hidden tab: nobody looks at the state
        if (!sbRoleProbeRelay(sbRoleNow())) return; // a role that does not see the relay never asks for it (09-role.js)
        getWebcamUrl().then(function (url) {
          if (!url) {
            sbRelayState = "nocam";
            sidebarRefresh();
            return;
          }
          var host;
          try {
            host = new URL(url, window.location.href).host;
          } catch (e) {
            sbRelayState = "unknown";
            sidebarRefresh();
            return;
          }
          var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
          var t = setTimeout(function () {
            if (ctrl) ctrl.abort();
          }, 3000);
          fetch("http://" + host + "/emergencyfab-ping?_=" + Date.now(), {
            method: "HEAD",
            mode: "no-cors",
            cache: "no-store",
            signal: ctrl ? ctrl.signal : undefined,
          })
            .then(function () {
              sbRelayState = "running";
              // timelapse state (JSON with CORS; it carries the key by itself: 26-camera-key.js)
              sbTlHost = window.location.hostname + ":8090"; // the system relay (the webcam may point directly at the camera)
              return fetch("http://" + sbTlHost + "/state", { cache: "no-store" })
                .then(function (r) { return r.ok ? r.json() : null; })
                .then(function (d) { sbTl = d && d.timelapse ? d.timelapse : null; })
                .catch(function () { sbTl = null; });
            })
            .catch(function () {
              sbRelayState = "stopped";
            })
            .then(function () {
              clearTimeout(t);
              sidebarRefresh();
            });
        });
      }

      function sidebarRelayAction(action) {
        sbRelayMsg = action === "stop" ? i18nT('sidebar.stopping_relay') : i18nT('sidebar.starting_relay');
        sidebarRefresh();
        workshopApiText(action === "stop" ? "camera.stop" : "camera.start")
          .then(function (txt) {
            sbRelayMsg = (txt || "").trim() || (action === "stop" ? i18nT('sidebar.relay_stopped') : i18nT('sidebar.relay_started'));
          })
          .catch(function (e) {
            sbRelayMsg = "Error: " + e;
          })
          .then(function () {
            sidebarRefresh();
            setTimeout(sidebarProbeRelay, 1500);
          });
      }

      // EXPLICIT arm/disarm (not "toggle"): the button says what it is going to
      // do according to the state being shown, and that is exactly
      // what is sent -- if the shown state were outdated
      // a toggle could do the opposite of what the button says. It goes
      // through the same handler as BtnCmd's macro and the Pi
      // Custom Codes page (handlers/shutdown.py), so everything stays in sync.
      // First tap arms (the button asks to confirm), the second schedules.
      function sbTimingRequest(min, btn) {
        if (sbTimingArmed && sbTimingArmed.btn === btn && sbTimingArmed.min === min) {
          clearTimeout(sbTimingArmed.timer);
          sbTimingArmed = null;
          sbT(btn, btn.dataset.timingLabel || i18nT('sidebar.schedule'));
          btn.style.background = "#455a64";
          sbTimingAction(min);
          return;
        }
        if (sbTimingArmed) {
          clearTimeout(sbTimingArmed.timer);
          sbT(sbTimingArmed.btn, sbTimingArmed.btn.dataset.timingLabel || i18nT('sidebar.schedule'));
          sbTimingArmed.btn.style.background = "#455a64";
        }
        sbT(btn, i18nT('sidebar.confirm'));
        btn.style.background = "#b71c1c";
        sbTimingArmed = {
          min: min,
          btn: btn,
          timer: setTimeout(function () {
            sbT(btn, btn.dataset.timingLabel || i18nT('sidebar.schedule'));
            btn.style.background = "#455a64";
            sbTimingArmed = null;
          }, 4000),
        };
        sbTimingMsg = i18nT('sidebar.tap_again_to_shut_down_in', { t: min >= 60 && min % 60 === 0 ? min / 60 + " h" : min + " min" });
        sidebarRefresh();
      }

      // Text built in parts, one per <span> (only redone if it changes).
      function sbParts(el, parts) {
        parts = parts.filter(function (t) { return !!t; });
        var k = parts.join(" | ");
        if (el.dataset.parts === k) return;
        el.dataset.parts = k;
        el.textContent = "";
        parts.forEach(function (t, i) {
          if (i) el.appendChild(document.createTextNode(" "));
          el.appendChild(document.createElement("span")).textContent = t;
        });
      }

      // params = arguments of power.method ({method} | {power_off_system} | {relay_output})
      function sbMethodAction(params) {
        sbMethodMsg = i18nT('common.saving');
        sidebarRefresh();
        workshopApiText("power.method", params)
          .then(function (txt) {
            sbMethodMsg = /rror|usa C/.test(txt || "") ? (txt || "").trim() : i18nT('common.saved');
          })
          .catch(function (e) {
            sbMethodMsg = "Error: " + e;
          })
          .then(function () {
            sidebarRefresh();
            setTimeout(function () {
              sbMethodMsg = "";
              barFetchStatus();
            }, 2000);
          });
      }

      // minutos: power off in N minutes; null: cancel the timer
      function sbTimingAction(minutos) {
        sbTimingMsg = i18nT('common.sending');
        sidebarRefresh();
        (minutos ? workshopApiText("power.timer", { minutes: Number(minutos) }) : workshopApiText("power.timer_cancel"))
          .then(function (txt) {
            sbTimingMsg = (txt || "").trim();
          })
          .catch(function (e) {
            sbTimingMsg = "Error: " + e;
          })
          .then(function () {
            sidebarRefresh();
            setTimeout(barFetchStatus, 2500); // the system publishes the timer every 2 s
          });
      }

      function sidebarShutdownAction(state) {
        sbShutdownMsg = state === "arm" ? i18nT('sidebar.arming') : i18nT('common.cancelling');
        sidebarRefresh();
        workshopApiText("power.after_job", { armed: state === "arm" })
          .then(function (txt) {
            sbShutdownMsg = (txt || "").trim();
            sbPowerOffArmed = state === "arm";
          })
          .catch(function (e) {
            sbShutdownMsg = "Error: " + e;
          })
          .then(function () {
            sidebarRefresh();
            // rereads global.powerOffOnFinish (from DWC's store: it gives a moment
            // for DSF's update to arrive and not to overwrite what was just set)
            setTimeout(barFetchStatus, 800);
          });
      }
