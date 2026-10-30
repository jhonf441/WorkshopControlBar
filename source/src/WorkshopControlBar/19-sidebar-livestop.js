      // ---- Safe stop of the live job, on the bar (2026-10-22) ----
      // The same stop as the one in the header of the work table (livejob.stop_safe of the service), here so it is one tap away from any page.
      // For a role that can call it (and unless the bar is set not to show it, see the gear): one amber row under the header of the open bar, always (the button is off while no live job runs);
      // and an amber icon on top of the rail, dimmed while none runs (the rail never executes anything: it opens the bar).
      // Amber, never red: it is NOT the emergency stop.
      var SB_LIVESTOP_OP = "livejob.stop_safe";
      var SB_LIVESTOP_ICON = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      var sbLiveJob = null; // the live job of the service ({name, ...}) while one is active
      var sbLiveStopBusy = false;
      var sbLiveStopMsg = "";
      var sbLiveStopOk = true;

      // Pure: whether the stop is offered at all (a role that can call it) and whether it can be pressed now (a live job runs)
      function sbLiveStopShown(liveJob, can) {
        return typeof can !== "function" || !!can(SB_LIVESTOP_OP);
      }

      // One row: a dot, what is running (cut with "..." when long) and a full-width button like the other bar buttons (pause icon + "Stop"; the tip and the aria-label say
      // the whole "Stop safely"). The answer of the service goes in a line under the row, only when there is one.
      function sbBuildLiveStop(bar) {
        var strip = document.createElement("div");
        strip.style.cssText = "flex:none;display:none;flex-wrap:wrap;align-items:center;gap:4px 8px;padding:6px 10px;background:rgba(255,167,38,0.10);border-bottom:1px solid rgba(255,183,77,0.30);";
        sb.liveStopDot = document.createElement("span");
        strip.appendChild(sb.liveStopDot);
        var title = sbText("", "flex:1 1 0;font-size:12px;font-weight:600;color:#ffe0b2;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;");
        strip.appendChild(title);
        sb.liveStopBtn = sbMakeButton("", "transparent", sbLiveStopRun);
        var icon = document.createElement("span");
        icon.style.cssText = "display:inline-flex;";
        icon.innerHTML = sbIconSvg(SB_LIVESTOP_ICON, 18, false);
        sb.liveStopLabel = document.createElement("span");
        sb.liveStopBtn.appendChild(icon);
        sb.liveStopBtn.appendChild(sb.liveStopLabel);
        sb.liveStopBtn.title = i18nT('sidebar.live_stop_tip');
        sb.liveStopBtn.setAttribute("aria-label", i18nT('sidebar.live_stop_button'));
        strip.appendChild(sb.liveStopBtn);
        sb.liveStopMsg = sbMsgLine("flex:1 1 100%;font-size:11px;color:#ffe082;");
        strip.appendChild(sb.liveStopMsg);
        bar.appendChild(strip);
        sb.liveStopStrip = strip;
        sb.liveStopTitle = title;
      }

      function sbLiveStopRail(rail) {
        sb.railLiveStop = sbMakeRailBtn(SB_LIVESTOP_ICON, i18nT('sidebar.live_stop_rail'), "", function () {
          sidebarSetCollapsed(false);
        });
        sb.railLiveStop.innerHTML = sbIconSvg(SB_LIVESTOP_ICON, 22, false);
        sb.railLiveStop.style.display = "none";
        sb.railLiveStop.style.background = "#b26a00";
        sb.railLiveStop.style.borderColor = "#ffb74d";
        rail.appendChild(sb.railLiveStop);
      }

      function sbLiveStopRefresh() {
        if (!sb || !sb.liveStopStrip) return;
        var offered = !sbConfig.withoutLiveStop && sbLiveStopShown(sbLiveJob, typeof workshopCan === "function" ? workshopCan : null);
        // always visible for a role that can call it (the button is off while no live job runs); the rail icon dims when there is none
        var visible = offered && !sidebarCollapsed;
        sb.liveStopStrip.style.display = visible ? "flex" : "none";
        sb.railLiveStop.style.display = offered ? "flex" : "none";
        sb.railLiveStop.style.opacity = sbLiveJob ? "1" : "0.55";
        if (!visible) return;
        var name = sbLiveJob && sbLiveJob.name ? workshopDefaultName(sbLiveJob.name, ["svc.live_job_default_name"]) : "";
        sbT(sb.liveStopTitle, sbLiveJob ? i18nT('sidebar.live_stop_title') + (name ? ": " + name : "") : i18nT('sidebar.live_stop_idle'));
        sb.liveStopTitle.title = sb.liveStopTitle.textContent;
        var off = sbLiveStopBusy || !sbLiveJob;
        sbT(sb.liveStopLabel, sbLiveStopBusy ? i18nT('sidebar.live_stop_stopping') : i18nT('sidebar.live_stop_short'));
        sb.liveStopBtn.disabled = off;
        // same look as the other bar buttons (flat colour, white border, white bold text): orange while it can be pressed, slate and dimmed while off
        sb.liveStopBtn.style.background = off ? "#455a64" : "#e65100";
        sb.liveStopBtn.style.opacity = off ? "0.55" : "1";
        sb.liveStopBtn.style.cursor = off ? "not-allowed" : "pointer";
        sb.liveStopBtn.style.flex = "1 1 100%";
        sb.liveStopBtn.style.display = "inline-flex";
        sb.liveStopBtn.style.alignItems = "center";
        sb.liveStopBtn.style.justifyContent = "center";
        sb.liveStopBtn.style.gap = "6px";
        sb.liveStopDot.style.cssText = "flex:none;width:8px;height:8px;border-radius:50%;background:" + (sbLiveJob ? "#ffb74d" : "#78909c") + ";box-shadow:" + (sbLiveJob ? "0 0 6px #ffb74d" : "none") + ";";
        sbT(sb.liveStopMsg, sbLiveStopMsg);
        sb.liveStopMsg.style.display = sbLiveStopMsg ? "block" : "none";
        sb.liveStopMsg.style.color = sbLiveStopOk ? "#ffe082" : "#ef9a9a";
      }

      function sbLiveStopRun() {
        if (sbLiveStopBusy || !sbLiveJob) return;
        workshopConfirmRisk({ title: i18nT('sidebar.live_stop_confirm_title'), text: i18nT('sidebar.live_stop_confirm_text') }).then(function (ok) {
          if (!ok) return;
          sbLiveStopBusy = true;
          sbLiveStopOk = true;
          sbLiveStopMsg = i18nT('sidebar.live_stop_wait');
          sbLiveStopRefresh();
          // the service answers when the laser is off and the record is saved (up to ~2 minutes)
          return workshopApi(SB_LIVESTOP_OP, {}, {}).then(
            function (r) {
              sbLiveStopOk = true;
              sbLiveStopMsg = (r && r.message) || i18nT('sidebar.live_stop_done');
            },
            function (e) {
              sbLiveStopOk = false;
              sbLiveStopMsg = (e && e.message) || String(e);
            }
          ).then(function () {
            sbLiveStopBusy = false;
            sbLiveStopRefresh();
          });
        });
      }

      // Every /machine/status (called from sidebarUpdateFromStatus)
      function sbLiveStopFromStatus(status) {
        var pcc = status && workshopPluginOf(status.plugins, "service");
        var lj = pcc && pcc.data && pcc.data.liveJob;
        sbLiveJob = lj && lj.active ? lj : null;
        if (!sbLiveJob && !sbLiveStopBusy) sbLiveStopMsg = ""; // the job is gone: the last message is old
      }
