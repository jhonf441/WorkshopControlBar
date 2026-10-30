      // ---- The pieces of the control bar, built one by one (F3-J, 2026-10-21) ----
      // createSidebar (10-sidebar.js) only creates the frame and calls these; they fill the state `sb` (the elements that sidebarRefresh
      // updates). A plain move of code: the DOM they build is the same as before (tests/trace-modules.test.js, bar).

      // The full view (expanded bar): the container of the sections, the hint of ordering and the box of the gear.
      function sbBuildFull(scroller) {
        var full = document.createElement("div");
        full.style.cssText = "display:none;flex-direction:column;gap:14px;padding:10px 10px 16px 8px;";
        scroller.appendChild(full);
        sb.full = full;
        sbOrderRegister("sections", full);
        sb.orderHint = sbText(
          i18nT('sidebar.arrange_hint'),
          "display:none;font-size:11px;line-height:1.35;color:#ffe082;background:rgba(255,224,130,0.1);border-radius:6px;padding:6px;"
        );
        full.appendChild(sb.orderHint);
        // panel del engranaje (lo llena sbConfigRender, 12-order.js)
        sb.configBox = document.createElement("div");
        sb.configBox.style.cssText =
          "display:none;flex-direction:column;gap:6px;padding:8px 10px;border-radius:8px;background:rgba(33,150,243,0.1);border:1px solid rgba(33,150,243,0.45);";
        full.appendChild(sb.configBox);
        return full;
      }

      // THIS SCREEN: the launchers of the panels of the plugins installed here.
      function sbBuildLocalGroup(full) {
        var gLocal = sbMakeGroup(
          full,
          i18nT('common.this_screen'),
          i18nT('sidebar.this_screen_help'),
          SIDEBAR_LOCAL_COLOR
        );
        sbMakeSortableSection(gLocal, "local");
        sb.gLocal = gLocal; // the Hidden style (11-hidden.js) replaces it with switches

        sb.localCards = document.createElement("div");
        sb.localCards.style.cssText = "display:flex;flex-direction:column;gap:10px;";
        gLocal.appendChild(sb.localCards);
        sbOrderRegister("local", sb.localCards);
        sb.noPanels = sbText(
          i18nT('sidebar.no_panels_installed'),
          "font-size:11px;color:rgba(255,255,255,0.5);"
        );
        gLocal.appendChild(sb.noPanels);
      }

      // Fixed header (does not scroll): collapse button, title, order and gear.
      function sbBuildHead(bar) {
        // -- cabecera fija (NO scrollea): boton de colapsar + titulo --
        var head = document.createElement("div");
        head.style.cssText =
          "flex:none;display:flex;align-items:center;gap:8px;padding:4px;border-bottom:1px solid rgba(255,255,255,0.2);background:#263238;";
        bar.appendChild(head);

        var toggle = document.createElement("button");
        toggle.id = SIDEBAR_TOGGLE_ID;
        toggle.type = "button";
        toggle.style.cssText = [
          "width:34px",
          "height:34px",
          "flex:none",
          "border-radius:6px",
          "border:1px solid rgba(255,255,255,0.5)",
          "background:#455a64",
          "color:#fff",
          "font-size:16px",
          "font-weight:bold",
          "padding:0",
          "cursor:pointer",
          "touch-action:none",
        ].join(";");
        toggle.addEventListener("pointerdown", function (ev) {
          ev.stopPropagation();
          ev.preventDefault();
        });
        toggle.addEventListener("click", function (ev) {
          ev.stopPropagation();
          sidebarSetCollapsed(!sidebarCollapsed);
        });
        head.appendChild(toggle);
        sb.toggle = toggle;

        var title = sbText(i18nT('sidebar.controls'), "font-size:14px;font-weight:bold;white-space:nowrap;flex:1 1 auto;");
        head.appendChild(title);
        sb.title = title; sbControlMount(head); // who has the control (17-control.js)
        // Ordenar secciones/tarjetas arrastrando (ver 12-order.js)
        sb.orderBtn = sbMakeButton(i18nT('sidebar.arrange'), "#455a64", function () {
          sbSetOrdering(!sbOrdering);
        });
        sb.orderBtn.style.flex = "none";
        sb.orderBtn.style.minHeight = "32px"; // DESIGN.md: touch targets of at least 32 px (QA-12)
        sb.orderBtn.style.padding = "3px 10px";
        sb.orderBtn.title = i18nT('sidebar.finish_arranging');
        sb.orderBtn.style.display = "none"; // only seen while ordering ("Done")
        head.appendChild(sb.orderBtn);
        // Gear: configure the bar on THIS screen (see 12-order.js)
        sb.gearBtn = document.createElement("button");
        sb.gearBtn.type = "button";
        sb.gearBtn.title = i18nT('sidebar.configure_the_bar_what_s_shown');
        sb.gearBtn.setAttribute("aria-label", sb.gearBtn.title);
        sb.gearBtn.style.cssText =
          "width:32px;height:32px;flex:none;border-radius:6px;border:1px solid rgba(255,255,255,0.35);background:#455a64;color:#fff;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;";
        sb.gearBtn.innerHTML = sbIconSvg(
          '<path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>',
          18,
          false
        );
        sb.gearBtn.addEventListener("click", function (ev) {
          ev.stopPropagation();
          var abrir = !(sb.configBox && sb.configBox.style.display === "flex");
          if (sidebarCollapsed) sidebarSetCollapsed(false);
          sbConfigOpen(abrir);
        });
        head.appendChild(sb.gearBtn);
      }

      // The rail (collapsed bar): launchers of the panels and the global buttons.
      function sbBuildRail(scroller) {
        // Riel (colapsada)
        var rail = document.createElement("div");
        rail.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:6px;padding:6px 0 10px 0;";
        scroller.appendChild(rail);
        sb.rail = rail;

        sbLiveStopRail(rail); // amber icon on top, only while a live job runs

        rail.appendChild(sbRailCaption("LOCAL", SIDEBAR_LOCAL_COLOR));
        // Launchers of the registered panels (camera, jog...) -- filled
        // by sbSyncPanels() according to which plugins are installed.
        sb.railLocal = document.createElement("div");
        sb.railLocal.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:6px;";
        rail.appendChild(sb.railLocal);
        var railSep = document.createElement("div");
        railSep.style.cssText = "width:28px;height:2px;background:" + SIDEBAR_GLOBAL_COLOR + ";margin:6px 0 0 0;";
        rail.appendChild(railSep);
        rail.appendChild(sbRailCaption("GLOBAL", SIDEBAR_GLOBAL_COLOR));
        sb.railButtons = sbMakeRailBtn("grid", i18nT('sidebar.custom_buttons_rail'), "btnCard");
        rail.appendChild(sb.railButtons);
        sb.railRelay = sbMakeRailBtn("relay", i18nT('sidebar.camera_relay_rail'), "relayCard");
        rail.appendChild(sb.railRelay);
        sb.railPower = sbMakeRailBtn("power", i18nT('sidebar.shut_down_now_rail'), "powerCard");
        sb.railPower.style.background = "#b71c1c";
        rail.appendChild(sb.railPower);
        sb.railTimer = sbMakeRailBtn("timer", i18nT('sidebar.shut_down_when_done_global'), "powerCard");
        rail.appendChild(sb.railTimer);
        // Label visible under the clock when the shutdown is armed --
        // it has to be seen even if the bar is collapsed.
        sb.railTimerLabel = sbText("", "font-size:10px;font-weight:bold;color:#ffb74d;text-align:center;width:100%;");
        rail.appendChild(sb.railTimerLabel);
        sb.railNotice = sbMakeRailBtn("bell", i18nT('sidebar.phone_notifications_global'), "notificationCard");
        rail.appendChild(sb.railNotice);
      }

      // Camera relay and manual timelapse (GLOBAL).
      function sbBuildRelayCard(gGlobal) {
        var relayCard = sbMakeCard(gGlobal, "relay", i18nT('sidebar.camera_relay_card'));
        sbMakeSortableCard(relayCard, "relay");
        sb.relayCard = relayCard;
        sb.relayStatus = sbStatusLine(relayCard);
        var relayRow = sbRow(relayCard);
        sb.relayStopBtn = sbMakeButton(i18nT('sidebar.stop_relay'), "#e65100", function () {
          // Double tap to confirm (native confirm() behaves badly in
          // this kiosk, the same pattern as the jog's "Zero Z here").
          if (!sbRelayArmTimer) {
            sbT(sb.relayStopBtn, i18nT('sidebar.tap_again_cut_for_everyone'));
            sb.relayStopBtn.style.background = "#b71c1c";
            sbRelayArmTimer = setTimeout(function () {
              sbRelayArmTimer = null;
              sidebarRefresh();
            }, 4000);
            return;
          }
          clearTimeout(sbRelayArmTimer);
          sbRelayArmTimer = null;
          sidebarRelayAction("stop");
        });
        relayRow.appendChild(sb.relayStopBtn);
        sb.relayStartBtn = sbMakeButton(i18nT('sidebar.start_relay'), "#1976d2", function () {
          sidebarRelayAction("start");
        });
        relayRow.appendChild(sb.relayStartBtn);
        sb.relayMsg = sbMsgLine("font-size:11px;color:#ffe082;");
        relayCard.appendChild(sb.relayMsg);
        // manual timelapse (GLOBAL: records on the Pi, anyone sees it and stops it)
        var tlSep = document.createElement("div");
        tlSep.style.cssText = "height:1px;background:rgba(255,255,255,0.1);margin:6px 0 2px 0;";
        relayCard.appendChild(tlSep);
        sb.tlStatus = sbStatusLine(relayCard);
        var tlRow = sbRow(relayCard);
        sb.tlBtn = sbMakeButton(i18nT('sidebar.start_timelapse'), "#1976d2", function () {
          if (!sbTlHost) return;
          var parar = !!(sbTl && sbTl.recording);
          sbTlMsg = parar ? i18nT('sidebar.stopping_the_timelapse') : i18nT('sidebar.starting_the_timelapse');
          sidebarRefresh();
          fetch("http://" + sbTlHost + "/timelapse?action=" + (parar ? "stop" : "begin"), { method: "POST" })
            .then(function (r) { return r.json(); })
            .then(function (d) {
              sbTlMsg = d.ok ? (parar ? i18nT('sidebar.stopped_the_video_is_built_on') : "") : i18nT('sidebar.couldn_t_error', { error: d.error || "" });
            })
            .catch(function (e) { sbTlMsg = i18nT('sidebar.couldn_t_error', { error: String(e.message || e) }); })
            .then(sidebarProbeRelay);
        });
        tlRow.appendChild(sb.tlBtn);
        sb.tlMsg = sbMsgLine("font-size:11px;color:#ffe082;");
        relayCard.appendChild(sb.tlMsg);
        relayCard.appendChild(
          sbText(
            i18nT('sidebar.stop_relay_help')
          )
        );
      }

      // Phone notifications (GLOBAL).
      function sbBuildNoticeCard(gGlobal) {
        var notifCard = sbMakeCard(gGlobal, "bell", i18nT('sidebar.phone_notifications'));
        sbMakeSortableCard(notifCard, "notice");
        sb.notificationCard = notifCard;
        sb.noticeStatus = sbStatusLine(notifCard);
        var notifRow = sbRow(notifCard);
        sb.noticeBtn = sbMakeButton("", "#455a64", function () {
          if (!sbNotice) return;
          sbNoticeAction(sbNoticeMuted() ? 0 : 60);
        });
        notifRow.appendChild(sb.noticeBtn);
        // the notification settings live in the Activity plugin: no button when it is not installed or not enabled
        if (workshopPathExists("/Plugins/Activity")) {
          sb.noticeSettingsBtn = sbMakeButton(i18nT('sidebar.settings_ellipsis'), "#455a64", function () {
            sbGoTo("/Plugins/Activity");
          });
          notifRow.appendChild(sb.noticeSettingsBtn);
        }
        sb.noticeMsg = sbMsgLine("font-size:11px;color:#ffe082;");
        notifCard.appendChild(sb.noticeMsg);
        // the help names the Activity page only when that plugin is there
        notifCard.appendChild(
          sbText(
            workshopPathExists("/Plugins/Activity") ? i18nT('sidebar.mute_help') : i18nT('sidebar.mute_help_no_activity')
          )
        );
      }

      // How it shuts down: meter, relay or PS_ON (used by the three shutdown actions).
      function sbBuildPowerMethod(powerCard) {
        // How it shuts down: meter (cuts everything) or the Duet's PS_ON (M81). Used by
        // Shut down now, Shut down when finished and the timer.
        sb.methodTitle = sbText(i18nT('sidebar.how_it_powers_off'), "font-size:11px;font-weight:bold;color:rgba(255,255,255,0.85);");
        powerCard.appendChild(sb.methodTitle);
        sb.methodRow = sbRow(powerCard);
        sb.methodButtons = {};
        [
          ["auto", i18nT('sidebar.automatic')],
          ["meter", i18nT('sidebar.meter')],
          ["relay", i18nT('sidebar.relay')],
          ["pson", "PS_ON"],
        ].forEach(function (op) {
          var b = sbMakeButton(op[1], "#37474f", function () {
            sbMethodAction({ method: { meter: "meter", relay: "relay" }[op[0]] || op[0] });
          });
          b.style.flex = "1 1 calc(50% - 3px)";
          b.style.minWidth = "0";
          b.style.whiteSpace = "normal";
          sb.methodButtons[op[0]] = b;
          sb.methodRow.appendChild(b);
        });
        sb.methodPi = document.createElement("label");
        sb.methodPi.style.cssText = "display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;";
        sb.metodoPiChk = document.createElement("input");
        sb.metodoPiChk.type = "checkbox";
        sb.metodoPiChk.addEventListener("change", function () {
          sbMethodAction({ power_off_system: !!sb.metodoPiChk.checked });
        });
        sb.methodPi.appendChild(sb.metodoPiChk);
        sb.methodPi.appendChild(document.createTextNode(i18nT('sidebar.also_shut_down_the_system')));
        powerCard.appendChild(sb.methodPi);
        // Relay (2026-10-10): Duet output (M950 P<n>) with a relay that
        // cuts ALL the power; M42 P<n> S<0|1> operates it
        sb.relayRow = sbRow(powerCard);
        sb.relayRow.style.alignItems = "center";
        sb.relayRow.appendChild(sbText(i18nT('sidebar.relay_output'), "font-size:12px;"));
        sb.relaySel = document.createElement("select");
        sb.relaySel.style.cssText = "padding:4px;border-radius:6px;border:1px solid rgba(255,255,255,0.35);background:#1e272c;color:#fff;font-size:13px;";
        sb.relaySel.addEventListener("change", function () {
          if (sb.relaySel.value !== "") sbMethodAction({ relay_output: Number(sb.relaySel.value) });
        });
        sb.relayRow.appendChild(sb.relaySel);
        sb.relayRow.appendChild(sbText(i18nT('sidebar.to_cut'), "font-size:12px;"));
        sb.relayVal = {};
        [["0", "S0"], ["1", "S1"]].forEach(function (o) {
          var b = sbMakeButton(o[1], "#37474f", function () { sbMethodAction("V" + o[0]); });
          b.style.minWidth = "44px";
          sb.relayVal[o[0]] = b;
          sb.relayRow.appendChild(b);
        });
        sb.methodDesc = sbText("", "font-size:12px;line-height:1.35;color:#fff;");
        powerCard.appendChild(sb.methodDesc);
        sb.methodNotice = sbMsgLine("font-size:11px;color:#ffb74d;");
        powerCard.appendChild(sb.methodNotice);
        sb.methodHelp = sbText(
          i18nT('sidebar.meter_the_smart_meter_or_switch')
        );
        powerCard.appendChild(sb.methodHelp);
        sb.methodMsg = sbMsgLine("font-size:11px;color:#ffe082;");
        powerCard.appendChild(sb.methodMsg);
        sb.powerMethodEls = [sb.methodTitle, sb.methodRow, sb.methodPi, sb.relayRow, sb.methodDesc, sb.methodNotice, sb.methodHelp, sb.methodMsg]; // role: technician (09-role.js)
      }

      // Shut down now and Restart everything (the floating panel asks for the confirmation).
      function sbBuildPowerNow(powerCard) {
        var sep0 = document.createElement("div");
        sep0.style.cssText = "height:1px;background:rgba(255,255,255,0.15);margin:4px 0;";
        powerCard.appendChild(sep0);
        var nowRow = sbRow(powerCard);
        var nowBtn = sbMakeButton(i18nT('sidebar.shut_down_now'), "#c62828", function () {});
        // two presses with an arming delay: a stray click on the page behind the panel cannot shut the machine down
        sbArmedPress(nowBtn, i18nT('sidebar.shut_down_now'), function () {
          // motion.ask first (class power), then the macro with C1 (no second question): 19-sidebar-actions.js
          sbPowerMacroRun("shutdown-all.g");
        });
        nowRow.appendChild(nowBtn);
        sb.nowText = sbText("");
        powerCard.appendChild(sb.nowText);
        var resetRow = sbRow(powerCard);
        var resetBtn = sbMakeButton(i18nT('sidebar.restart_everything'), "#5e35b1", function () {});
        sbArmedPress(resetBtn, i18nT('sidebar.restart_everything'), function () {
          // The same as Shut down now: motion.ask (floating panel), then the macro.
          sbPowerMacroRun("full-reset.g");
        });
        resetRow.appendChild(resetBtn);
        var resetHelp = sbText(i18nT('sidebar.restart_everything_help'));
        powerCard.appendChild(resetHelp);
        sb.powerNowEls = [sep0, nowRow, sb.nowText]; // role: admin (09-role.js)
        sb.powerRestartEls = [resetRow, resetHelp];
      }

      // Shut down when the job finishes (arm / cancel).
      function sbBuildPowerWhenDone(powerCard) {
        var sep = document.createElement("div");
        sep.style.cssText = "height:1px;background:rgba(255,255,255,0.15);margin:4px 0;";
        powerCard.appendChild(sep);
        sb.shutdownStatus = sbStatusLine(powerCard);
        var endRow = sbRow(powerCard);
        sb.shutdownBtn = sbMakeButton("", "#1976d2", function () {
          if (sbPowerOffArmed === null) return; // sin dato todavia: no adivinar
          sidebarShutdownAction(sbPowerOffArmed ? "disarm" : "arm");
        });
        endRow.appendChild(sb.shutdownBtn);
        sb.shutdownContext = sbText("");
        powerCard.appendChild(sb.shutdownContext);
        sb.shutdownMethodLn = sbMsgLine("font-size:11px;font-weight:bold;color:#90caf9;");
        powerCard.appendChild(sb.shutdownMethodLn);
        sb.shutdownMsg = sbMsgLine("font-size:11px;color:#ffe082;");
        powerCard.appendChild(sb.shutdownMsg);
        sb.powerWhenDoneEls = [sep, sb.shutdownStatus, endRow, sb.shutdownContext, sb.shutdownMethodLn, sb.shutdownMsg]; // role: operator
      }

      // Shut down with a timer (the count is kept by the Pi).
      function sbBuildPowerTimer(powerCard) {
        // Shut down with a timer (2026-10-10): the count is kept by the Pi
        // (dsf/shutdown_timer.py), it continues even if the screen is closed
        var sep2 = document.createElement("div");
        sep2.style.cssText = "height:1px;background:rgba(255,255,255,0.15);margin:4px 0;";
        powerCard.appendChild(sep2);
        sb.timingStatus = sbStatusLine(powerCard);
        sb.timingRow = sbRow(powerCard);
        [
          [15, "15 min"],
          [30, "30 min"],
          [60, "1 h"],
          [120, "2 h"],
        ].forEach(function (op) {
          var b = sbMakeButton(op[1], "#455a64", function () {
            sbTimingRequest(op[0], b);
          });
          b.dataset.timingMin = op[0];
          b.dataset.timingLabel = op[1];
          b.style.flex = "1 1 0";
          b.style.minWidth = "0";
          sb.timingRow.appendChild(b);
        });
        var tempoRow2 = sbRow(powerCard);
        sb.timingInput = document.createElement("input");
        sb.timingInput.type = "number";
        sb.timingInput.min = "1";
        sb.timingInput.max = "720";
        sb.timingInput.placeholder = "min";
        sb.timingInput.style.cssText =
          "width:70px;flex:none;padding:6px;border-radius:6px;border:1px solid rgba(255,255,255,0.35);background:#1e272c;color:#fff;font-size:14px;";
        tempoRow2.appendChild(sb.timingInput);
        sb.timingOtherBtn = sbMakeButton(i18nT('sidebar.schedule'), "#455a64", function () {
          var m = parseInt(sb.timingInput.value, 10);
          if (!(m >= 1 && m <= 720)) {
            sbTimingMsg = i18nT('sidebar.enter_between_1_and_720_minutes');
            sidebarRefresh();
            return;
          }
          sbTimingRequest(m, sb.timingOtherBtn);
        });
        tempoRow2.appendChild(sb.timingOtherBtn);
        sb.timingCancelBtn = sbMakeButton(i18nT('sidebar.cancel_scheduled_shutdown'), "#6d4c41", function () {
          sbTimingAction(null);
        });
        tempoRow2.appendChild(sb.timingCancelBtn);
        sb.timingMsg = sbMsgLine("font-size:11px;color:#ffe082;");
        powerCard.appendChild(sb.timingMsg);
        sb.timingText = sbText("");
        powerCard.appendChild(sb.timingText);
        sb.timingMethodLn = sbMsgLine("font-size:11px;font-weight:bold;color:#90caf9;");
        powerCard.appendChild(sb.timingMethodLn);
        sb.powerTimerEls = [sep2, sb.timingStatus, sb.timingRow, tempoRow2, sb.timingMsg, sb.timingText, sb.timingMethodLn]; // role: operator
      }

      // Shutdown card: the four parts above, in this order.
      function sbBuildPowerCard(gGlobal) {
        var powerCard = sbMakeCard(gGlobal, "power", i18nT('sidebar.shutdown'));
        sbMakeSortableCard(powerCard, "power");
        sb.powerCard = powerCard;
        sbBuildPowerMethod(powerCard);
        sbBuildPowerNow(powerCard);
        sbBuildPowerWhenDone(powerCard);
        sbBuildPowerTimer(powerCard);
      }
