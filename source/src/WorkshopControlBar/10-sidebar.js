      // ---- 0. Sidebar of controls (full height) ----
      //
      // v2, live request 2026-10-08: the centered bar with only the shutdown
      // button (v1, commit 07eb9c6) becomes the CONTROL CENTER of
      // the floating widgets and the global actions, from edge to edge of
      // the screen (top:0/bottom:0) and collapsible with a button.
      //
      // Conceptual organization -- do NOT mix, it is the whole point:
      //   THIS SCREEN (blue): launchers of Jog and Camera -> open/
      //     close their floating panel. This screen only; they do not stop
      //     any process nor affect other screens.
      //   GLOBAL (orange): Camera relay (process on the Pi) and Shutdown
      //     (now / when finished). They affect the machine and ALL the
      //     screens.
      //   Closing the camera != stopping the relay; closing the jog != stopping anything
      //   global (it only releases what is held); Shut down when finished !=
      //   Shut down now.
      //
      // v3 (2026-10-08, decided with the user): there are no more round
      // floating buttons -- the panels still float, but they are opened
      // from here. With that "Hide/Reactivate" disappeared (it only existed
      // because the circles got in the way): closing a panel now leaves nothing behind.
      //
      // Collapsed: a SIDEBAR_RAIL_W px rail with icons (tooltip via
      // title). The LOCAL launchers (jog, camera) open/close their
      // panel with one tap -- it is harmless and it is their reason for being. The
      // GLOBAL ones do NOT execute anything from the rail: they open the bar on their
      // section (on a rail without text it is far too easy to tap "stop
      // relay" or "shut down" thinking it is something else). The bar NEVER moves
      // DWC's layout: it always floats over the page and starts below DWC's
      // top bar (sbPlace), so it does not cover "Emergency stop".
      // The content scrolls INSIDE the bar; the collapse
      // button stays always at the top, outside the scroll.
      var SIDEBAR_ID = "emergency-fab-sidebar";
      var SIDEBAR_TOGGLE_ID = "emergency-fab-sidebar-toggle";
      var SIDEBAR_COLLAPSED_KEY = "emergencyFabSidebarCollapsed";
      var SIDEBAR_RAIL_W = 44;
      var SIDEBAR_EXPANDED_W = 300;
      var SIDEBAR_LOCAL_COLOR = "#42a5f5";
      var SIDEBAR_GLOBAL_COLOR = "#ff9800";
      var RELAY_PROBE_MS = 30000; // F3-J: every open browser used to ask :8090 every 10 s; the service does not publish the camera state, so 30 s and only where the relay card is seen

      var sidebarEl = null;
      var sidebarCollapsed = true;
      // closed look ("rail" | "arrow") and automatic collapse come from sbConfig
      // (12-order.js, read by _shared/12-sidebar-config.js)
      function sbClosedArrow() {
        return sbConfig.closed === "arrow";
      }
      function sbBusyUi() {
        return !!(sbOrdering || (sb.configBox && sb.configBox.style.display === "flex"));
      }
      var sb = {}; // referencias a elementos que sidebarRefresh() actualiza
      var sbPanelUi = {}; // id de panel registrado -> {rail, card, status, btn}
      // Global state (DWC store's object model, the same shape as
      // /machine/status): published by the jog in the registry (workshop.lastStatus,
      // every 2s); if the jog is not installed the bar publishes it on its own (see
      // 20-main.js).
      var sbPowerOffArmed = null; // null = todavia no se sabe
      var sbTiming = null; // {hasta "HH:MM", missing_s, minutos} o null (plugins.WorkshopService.data.shutdownTimer)
      var sbTimingMsg = "";
      // How it shuts down (2026-10-10): plugins.WorkshopService.data.shutdownMethod
      // {metodo auto|medidor|pson, efectivo medidor|pson|pi, power_off_pi, desc, aviso}
      var sbMethod = null;
      var sbMethodMsg = "";
      var sbTimingArmed = null; // {min, btn, timer}: primer toque de "Apagar en..." (el segundo confirma)
      var sbMachineStatus = null;
      var sbJobFile = null;
      var sbRelayState = "unknown"; // "running" | "stopped" | "unknown" | "nocam"
      var sbRelayMsg = "";
      // Timelapse (2026-10-10, "I want a timelapse button in the
      // controls panel"): state from the relay's /estado, only with the bar open
      var sbTl = null; // {grabando, trabajo, cuadros, manual, armando, ...}
      var sbTlHost = null;
      var sbTlMsg = "";
      var sbShutdownMsg = "";
      var sbRelayArmTimer = null;
      var sbRelayProbeTimer = null;

      // The bar's own icons. Those of the panels (camera, jog) are
      // brought by each plugin when it registers (api.icon).
      var SB_ICONS = {
        relay:
          '<path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>',
        power:
          '<path d="M13 3h-2v10h2V3zm4.83 2.17-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>',
        timer:
          '<path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>',
        grid:
          '<path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h8v8h-8v-8zm2 2v4h4v-4h-4z"/>',
        bell:
          '<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>',
      };

      // Phone notifications (WorkshopService backend, notifier.py): published
      // as plugin data "notificaciones". The full configuration
      // is on the Activity page; here only the state and mute for 1 h.
      var sbNotice = null;
      var sbNoticeMsg = "";

      // SVG instead of unicode glyphs -- the same reason as the other icons
      // of the file (the kiosk font does not have them). `slashed` draws
      // a diagonal on top for "hidden on this screen".
      function sbIconSvg(name, size, slashed) {
        return (
          '<svg viewBox="0 0 24 24" width="' +
          size +
          '" height="' +
          size +
          '" style="pointer-events:none;display:block" fill="currentColor">' +
          (SB_ICONS[name] || name) + // nombre conocido o markup SVG de un panel registrado

          (slashed ? '<line x1="3" y1="3" x2="21" y2="21" stroke="#ff5252" stroke-width="2.5"/>' : "") +
          "</svg>"
        );
      }

      function isSidebarCollapsed() {
        try {
          var v = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
          return v === null ? true : v === "1";
        } catch (e) {
          return true;
        }
      }

      // Bar button: pointerdown with preventDefault (do not take focus
      // -- the same shielding against squeekboard as the rest of the file) and
      // the action on "click", NOT on pointerup like the buttons of the
      // panels: here the content scrolls with the finger, and a pointerup
      // at the end of a scroll drag would trigger the action
      // by accident. "click" is already cancelled by the browser if there was scroll.
      function sbMakeButton(label, bg, onClick) {
        var b = document.createElement("button");
        b.type = "button";
        sbT(b, label);
        b.style.cssText = [
          "flex:1 1 auto",
          "min-height:" + (window.matchMedia && window.matchMedia("(pointer: coarse)").matches === true ? 44 : 34) + "px", // 44 px on a touch screen
          "padding:6px 8px",
          "border-radius:6px",
          "border:1px solid rgba(255,255,255,0.35)",
          "background:" + bg,
          "color:#fff",
          "font-size:12px",
          "font-weight:bold",
          "cursor:pointer",
          "touch-action:pan-y",
          "-webkit-user-select:none",
          "user-select:none",
        ].join(";");
        b.addEventListener("pointerdown", function (ev) {
          ev.stopPropagation();
          ev.preventDefault();
        });
        b.addEventListener("click", function (ev) {
          ev.stopPropagation();
          onClick(ev);
        });
        return b;
      }

      function sbText(text, css) {
        var d = document.createElement("div");
        sbT(d, text);
        d.style.cssText = css || "font-size:11px;line-height:1.35;color:rgba(255,255,255,0.7);";
        if (!css) d.dataset.sbHelp = "1"; // explanation text: the compact mode hides it
        return d;
      }

      // Idempotent setters: the bar refreshes every second, and assigning the same text/markup again
      // replaces the nodes, which drops any text the user is selecting. Only write when it changed.
      function sbT(el, v) {
        v = String(v);
        if (el.textContent !== v) el.textContent = v;
      }
      function sbH(el, v) {
        if (el._sbH !== v || !el.firstChild) {
          el.innerHTML = v;
          el._sbH = v;
        }
      }

      // Single-line text that never spills out of the bar: ellipsis at rest; on hover or tap it scrolls to
      // the end and back, and `title` carries the full text.
      function sbMarquee(el) {
        if (el._sbMq) return el;
        el._sbMq = true;
        el.style.whiteSpace = "nowrap";
        el.style.overflow = "hidden";
        el.style.textOverflow = "ellipsis";
        el.style.minWidth = "0";
        el.style.maxWidth = "100%";
        var raf = 0;
        function stop() {
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
          el.scrollLeft = 0;
          el.style.textOverflow = "ellipsis";
        }
        function start() {
          if (raf) return;
          var extra = el.scrollWidth - el.clientWidth;
          el.title = el.textContent;
          if (extra <= 1) return;
          el.style.textOverflow = "clip";
          var t0 = 0;
          var dur = Math.max(1500, extra * 25); // ms per pass, about 40 px/s
          var pause = 700;
          raf = requestAnimationFrame(function step(t) {
            if (!t0) t0 = t;
            var c = (t - t0) % (2 * (dur + pause));
            var k = c < pause ? 0 : c < pause + dur ? (c - pause) / dur : c < 2 * pause + dur ? 1 : 1 - (c - 2 * pause - dur) / dur;
            el.scrollLeft = Math.round(extra * k);
            raf = requestAnimationFrame(step);
          });
        }
        el.addEventListener("pointerenter", start);
        el.addEventListener("pointerleave", stop);
        el.addEventListener("click", function () {
          if (raf) stop();
          else start();
        });
        return el;
      }

      // Section (THIS SCREEN / GLOBAL) with its color and its scope
      // text -- the difference between local vs global has to be seen without reading
      // each button.
      function sbMakeGroup(parent, title, scopeText, color) {
        var g = document.createElement("div");
        g.style.cssText =
          "border-left:4px solid " +
          color +
          ";background:rgba(255,255,255,0.04);border-radius:0 8px 8px 0;padding:8px 8px 10px 10px;display:flex;flex-direction:column;gap:10px;";
        g.dataset.sbGroup = "1";
        g.style.setProperty("--sb-c", color); // Hidden style: color of the label and of the icons
        var h = sbText(title, "font-size:12px;font-weight:bold;letter-spacing:0.08em;color:" + color + ";");
        g.appendChild(h);
        if (scopeText) {
          var alc = sbText(scopeText, "font-size:11px;line-height:1.35;color:rgba(255,255,255,0.85);");
          alc.dataset.sbHelp = "1";
          g.appendChild(alc);
        }
        parent.appendChild(g);
        return g;
      }

      function sbMakeCard(parent, iconName, title) {
        var c = document.createElement("div");
        c.style.cssText =
          "display:flex;flex-direction:column;gap:6px;padding:8px;border-radius:6px;background:rgba(0,0,0,0.25);transition:box-shadow 0.3s;";
        var head = document.createElement("div");
        head.style.cssText = "display:flex;align-items:center;gap:8px;font-size:13px;font-weight:bold;";
        var ic = document.createElement("span");
        sbH(ic, sbIconSvg(iconName, 18, false));
        head.appendChild(ic);
        var ttl = document.createElement("span");
        sbT(ttl, title);
        ttl.style.cssText = "flex:0 1 auto;min-width:0;";
        head.appendChild(sbMarquee(ttl));
        // tarjetas plegables (engranaje): tocar el titulo pliega/abre
        c.dataset.sbCard = "1";
        var chev = document.createElement("span");
        chev.dataset.sbChev = "1";
        chev.style.cssText = "margin-left:auto;font-size:14px;opacity:0.7;";
        sbT(chev, "▾");
        head.appendChild(chev);
        head.addEventListener("click", function () {
          if (typeof sbFold === "function") sbFold(c);
        });
        c.appendChild(head);
        parent.appendChild(c);
        return c;
      }

      // A one-line text slot that always keeps its height: a message or a state line that appears,
      // changes or disappears must not make the bar (or the card) grow and shrink. Long text scrolls (marquee).
      function sbMsgLine(css) {
        return sbMarquee(sbText("", (css || "") + "min-height:16px;line-height:16px;"));
      }

      function sbStatusLine(card) {
        var s = sbMsgLine("font-size:11px;font-weight:bold;");
        card.appendChild(s);
        return s;
      }

      function sbRow(card) {
        var r = document.createElement("div");
        r.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;";
        card.appendChild(r);
        return r;
      }

      // Icon of the collapsed rail. Tap = open the bar on that section
      // (see big comment above: the rail never executes actions).
      // `onTap` (only for the LOCAL launchers of jog/camera): instead
      // of opening the bar, it executes directly -- opening/closing a panel of
      // this screen is harmless. The GLOBAL ones never pass it.
      function sbMakeRailBtn(iconName, title, targetKey, onTap) {
        var b = document.createElement("button");
        b.type = "button";
        b.title = title;
        b.style.cssText = [
          "position:relative",
          "width:36px",
          "height:36px",
          "flex:none",
          "border-radius:8px",
          "border:1px solid rgba(255,255,255,0.25)",
          "background:#455a64",
          "color:#fff",
          "padding:0",
          "display:flex",
          "align-items:center",
          "justify-content:center",
          "cursor:pointer",
          "touch-action:pan-y",
          "-webkit-user-select:none",
          "user-select:none",
        ].join(";");
        b.addEventListener("pointerdown", function (ev) {
          ev.stopPropagation();
          ev.preventDefault();
        });
        b.addEventListener("click", function (ev) {
          ev.stopPropagation();
          if (onTap) {
            onTap();
            return;
          }
          sidebarSetCollapsed(false);
          var card = sb[targetKey];
          if (card) {
            card.scrollIntoView({ block: "nearest" });
            card.style.boxShadow = "0 0 0 2px #fff";
            setTimeout(function () {
              card.style.boxShadow = "";
            }, 1200);
          }
        });
        return b;
      }

      function sbRailCaption(text, color) {
        return sbText(
          text,
          "font-size:10px;font-weight:bold;letter-spacing:0.04em;color:" + color + ";text-align:center;width:100%;margin-top:4px;"
        );
      }

      // The bar never changes DWC's layout: it only floats over the page. It
      // starts below DWC's top app-bar (read only, never modified) so it cannot
      // cover the emergency stop or the toolbar buttons.
      function sbTopOffset() {
        var top = 10;
        try {
          var bars = document.querySelectorAll(".v-app-bar, .v-toolbar--fixed, header.v-toolbar");
          for (var i = 0; i < bars.length; i++) {
            var r = bars[i].getBoundingClientRect();
            if (r.height > 0 && r.width > 0 && r.top < 8 && r.bottom + 6 > top && !sidebarEl.contains(bars[i])) top = Math.ceil(r.bottom) + 6;
          }
        } catch (e) {
          /* keep the default */
        }
        return Math.min(top, Math.round(window.innerHeight * 0.5));
      }
      // ---- "Make room for the bar" (option pushPage): the DWC page narrows instead of being covered ----
      // #app gets a right margin equal to the bar's footprint (workshopSidebarReserve in _shared/12-sidebar-config.js).
      // DWC's top app bar is fixed to the window and the bar starts below it, so only the content under it narrows. Closed as an arrow,
      // option off, bar stopped, or a screen too narrow to leave the page usable: reserve 0 and everything is as before.
      // Perf (measured on the kiosk, 2026-10-28): the margin is set inline on #app and the page color inline on html/body. A CSS variable on
      // <html> invalidates the style of every element of DWC and a margin transition re-lays out the whole page on every frame: on the Pi
      // that made closing and opening the bar take seconds. Now it is one relayout, no animation.
      var sbPushLast = 0;
      function sbApplyPush() {
        var r = pluginStopped || !sidebarEl ? 0 : workshopSidebarReserve(sbConfig.pushPage, sidebarCollapsed, sbConfig.closed, window.innerWidth, SIDEBAR_RAIL_W, SIDEBAR_EXPANDED_W, 16);
        if (r === sbPushLast) return;
        var app = document.getElementById("app");
        var root = document.documentElement;
        if (r > 0) {
          // the strip freed by the margin shows html/body: paint it with the page's own background (read before the margin changes, so the style is clean)
          var pageBg = app ? getComputedStyle(app).backgroundColor : "";
          if (pageBg && pageBg !== "rgba(0, 0, 0, 0)") {
            root.style.backgroundColor = pageBg;
            document.body.style.backgroundColor = pageBg;
          }
          if (app) app.style.marginRight = r + "px";
        } else {
          if (app) app.style.marginRight = "";
          root.style.backgroundColor = "";
          document.body.style.backgroundColor = "";
        }
        sbPushLast = r;
        // canvases and charts of the page measure themselves on resize
        setTimeout(function () { window.dispatchEvent(new Event("resize")); }, 60);
      }

      function sbPlace() {
        if (!sidebarEl) return;
        var top = sbTopOffset();
        sidebarEl.style.setProperty("--tp-sb-top", top + "px");
        if (sbHidden.zone) sbHidden.zone.style.top = top + "px";
        if (sbHidden.tab) sbHidden.tab.style.top = Math.round(top + (window.innerHeight - top) / 2) + "px";
        sbHidden.top = top;
      }

      // ---- "Hidden" style (2026-10-10: "something that hides completely and when
      // getting close it shows and is fixed while it is over it") ----
      // Closed it takes up nothing (the page uses the whole width). Mouse: approaching the
      // right edge shows it and it stays while the pointer is over it; when
      // leaving it hides by itself. Touch: a small tab on the edge opens it and
      // a tap outside closes it.
      var sbHidden = { zone: null, tab: null, timer: null, top: 10 };
      // Single look now (the old "Clasica" style was removed 2026-10-12): kept
      // as a function because 11-hidden.js calls it.
      function sbIsHidden() {
        return true;
      }
      function sbHiddenArm() {
        if (sbHidden.zone) return;
        var z = document.createElement("div");
        z.id = "workshop-bar-zone";
        z.style.cssText = "position:fixed;top:10px;right:0;bottom:0;width:10px;z-index:2147483646;background:transparent;display:none;";
        z.addEventListener("pointerenter", function (ev) {
          if (ev.pointerType === "mouse" && sidebarCollapsed && sbClosedArrow() && sbConfig.autoClose) sidebarSetCollapsed(false);
        });
        document.body.appendChild(z);
        var t = document.createElement("button");
        t.type = "button";
        t.id = "workshop-bar-tab";
        t.title = i18nT('sidebar.open_the_control_bar');
        t.style.cssText =
          "position:fixed;right:0;top:50%;transform:translateY(-50%);width:30px;height:88px;z-index:2147483646;border:none;border-radius:10px 0 0 10px;background:rgba(25,118,210,0.55);color:#fff;font:bold 14px Roboto,Helvetica,Arial,sans-serif;cursor:pointer;display:none;padding:0;box-shadow:-1px 0 6px rgba(0,0,0,0.4);";
        sbT(t, "<");
        t.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); ev.preventDefault(); });
        t.addEventListener("click", function (ev) { ev.stopPropagation(); sidebarSetCollapsed(false); });
        document.body.appendChild(t);
        sbHidden.zone = z;
        sbHidden.tab = t;
        workshopOnStop(function () {
          if (z.parentNode) z.parentNode.removeChild(z);
          if (t.parentNode) t.parentNode.removeChild(t);
          sbHidden.zone = null;
          sbHidden.tab = null;
        });
        // 2026-10-10 ("on the Pi the tab ends up below DWC's scroll, barely
        // outside; one or the other is touched"): on the Pi's screen (the kiosk
        // opens localhost) the strip and the tab go to the left of the scroll
        // bar and the tab is wider for the finger. In a PC browser it stays as before
        // ("only on the Pi").
        var inThePi = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
        if (!inThePi) {
          t.style.width = "22px";
          t.style.height = "76px";
        }
        function sbOcultaUbicar() {
          if (!inThePi) {
            sbHidden.sbw = 0;
            return;
          }
          var sbw = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
          if (sbw > 40) sbw = 0; // odd measure (zoom, without layout): no shift
          sbHidden.sbw = sbw;
          z.style.right = sbw + "px";
          t.style.right = sbw + (sbw ? 2 : 0) + "px";
          t.style.borderRadius = sbw ? "10px" : "10px 0 0 10px";
        }
        sbOcultaUbicar();
        window.addEventListener("resize", sbOcultaUbicar);
        window.addEventListener("resize", sbPlace);
        window.addEventListener("resize", sbApplyPush);
        window.addEventListener("orientationchange", sbPlace);
        setInterval(sbOcultaUbicar, 2000); // the scrollbar appears / disappears when the page changes
        // mouse: leaving the bar hides it (except gear or order open)
        sidebarEl.addEventListener("pointerenter", function () { clearTimeout(sbHidden.timer); });
        sidebarEl.addEventListener("pointerleave", function (ev) {
          if (ev.pointerType !== "mouse" || sidebarCollapsed || !sbConfig.autoClose) return;
          clearTimeout(sbHidden.timer);
          sbHidden.timer = setTimeout(function () {
            // the settings panel (gear) does not keep the bar open once the pointer is away: it is closed and the bar folds.
            // Only the arrange mode (unsaved moves) keeps it open
            if (!sbOrdering && sb.configBox && sb.configBox.style.display === "flex") sbConfigOpen(false);
            if (workshopSidebarShouldAutoClose(sbConfig.autoClose, !sidebarCollapsed, sbBusyUi())) sidebarSetCollapsed(true);
          }, 700);
        });
        // fallback: if the strip does not receive the pointerenter (scrollbar, iframes),
        // reaching the last 8 px of the window with the mouse also opens it
        document.addEventListener("mousemove", function (ev) {
          // without covering the scroll bar: the 8 px right to its left
          var edge = window.innerWidth - (sbHidden.sbw || 0);
          if (sbClosedArrow() && sbConfig.autoClose && sidebarCollapsed && ev.clientX >= edge - 8 && ev.clientX < edge && ev.clientY >= sbHidden.top) sidebarSetCollapsed(false);
        }, true);
        // a press outside the bar closes it (any pointer: the touch screen of the Pi may report itself as a mouse)
        document.addEventListener("pointerdown", function (ev) {
          if (!sbConfig.autoClose || sidebarCollapsed) return;
          if (sidebarEl.contains(ev.target) || ev.target === sbHidden.tab) return;
          if (!sbOrdering && sb.configBox && sb.configBox.style.display === "flex") sbConfigOpen(false);
          if (!workshopSidebarShouldAutoClose(sbConfig.autoClose, !sidebarCollapsed, sbBusyUi())) return;
          if (sidebarEl.contains(ev.target) || ev.target === sbHidden.tab) return;
          sidebarSetCollapsed(true);
          // the tap that closes the bar must not also act on what is under the finger (a switch, a button):
          // swallow the click that follows this touch
          var comer = function (e) {
            document.removeEventListener("click", comer, true);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          };
          document.addEventListener("click", comer, true);
          setTimeout(function () { document.removeEventListener("click", comer, true); }, 800);
        }, true);
      }

      // Own look of the Hidden style (2026-10-10: "I want a style change
      // also with respect to v1"): floating panel separated from the edge,
      // rounded corners, translucent background; sections with a colored label
      // (not the side stripe) and cards with the icon in a box of the
      // color of their section. CSS only on the same nodes: the Classic one does not change.
      function sbHiddenCss() {
        if (document.getElementById("workshop-bar-hidden-css")) return;
        var B = "#" + SIDEBAR_ID;
        var st = document.createElement("style");
        st.id = "workshop-bar-hidden-css";
        st.textContent = [
          B + "{top:var(--tp-sb-top,10px)!important;bottom:10px!important;right:10px!important;border-radius:16px!important;border:1px solid rgba(255,255,255,0.14)!important;background:#1e272c!important;box-shadow:0 12px 40px rgba(0,0,0,0.65)!important;}",
          B + ">div:first-child{background:transparent!important;border-bottom:1px solid rgba(255,255,255,0.08)!important;padding:8px 10px!important;}",
          // closed as a rail (44 px): only the toggle fits, centred (the gear and title are hidden)
          B + '[data-sb-closed="1"]>div:first-child{padding:8px 0!important;justify-content:center!important;gap:0!important;}',
          B + " [data-sb-group]{border-left:none!important;border-radius:12px!important;background:transparent!important;padding:2px 0 6px 0!important;gap:8px!important;}",
          B + " [data-sb-group]>div:first-child{align-self:flex-start;padding:3px 10px;border-radius:999px;font-size:11px!important;background:color-mix(in srgb,var(--sb-c) 18%,transparent);}",
          B + " [data-sb-card]{background:rgba(255,255,255,0.05)!important;border:1px solid rgba(255,255,255,0.08);border-radius:12px!important;padding:10px!important;}",
          B + " [data-sb-card]>div:first-child>span:first-child{display:inline-flex;width:28px;height:28px;flex:none;border-radius:8px;align-items:center;justify-content:center;background:color-mix(in srgb,var(--sb-c,#42a5f5) 22%,transparent);}",
          B + " [data-sb-card] button{border-radius:10px!important;border-color:rgba(255,255,255,0.16)!important;}",
          // DWC light theme (2026-10-10: "the controls in hidden mode do not
          // have light mode right"): these rules go with !important and
          // 03-theme.js only converts the inline colors; the light version goes
          // here, with the light palette of DESIGN.md (html.tp-bright is set by 03-theme.js)
          "html.tp-bright " + B + "{background:#ffffff!important;border-color:rgba(0,0,0,0.12)!important;box-shadow:0 12px 32px rgba(0,0,0,0.22)!important;}",
          "html.tp-bright " + B + ">div:first-child{border-bottom-color:rgba(0,0,0,0.08)!important;}",
          "html.tp-bright " + B + " [data-sb-card]{background:#f5f7f8!important;border-color:rgba(0,0,0,0.08);}",
          "html.tp-bright " + B + " [data-sb-card] button{border-color:rgba(0,0,0,0.16)!important;}",
          "html.tp-bright " + B + " [data-sb-group]>div:first-child{background:color-mix(in srgb,var(--sb-c) 14%,#ffffff);}",
        ].join("\n");
        document.head.appendChild(st);
      }

      // The arrow of the closed bar: the tab at the edge ("arrow" mode) or the "<" button of the rail ("rail" mode); null while it is not shown
      function sbArrowRect() {
        var el = sbClosedArrow() ? sbHidden.tab : sb.toggle;
        if (!el || !el.isConnected || el.style.display === "none") return null;
        var r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 ? r : null;
      }

      function sidebarSetCollapsed(c) {
        // the arrow tab <-> the round indicator on top of the bar (ledMorph, 20-led-mirror.js): where it starts is read before anything moves
        var morphFrom = null, morphCircle = null;
        if (sidebarEl && sidebarCollapsed !== c) {
          if (sidebarCollapsed) morphFrom = sbArrowRect();
          else morphCircle = ledMorphCircleBox();
        }
        sidebarCollapsed = c;
        try {
          localStorage.setItem(SIDEBAR_COLLAPSED_KEY, c ? "1" : "0");
        } catch (e) {
          /* no critico */
        }
        if (!sidebarEl) return;
        sidebarEl.style.width = sbWidthCss(c);
        // closed = "arrow": off screen (only the tab); closed = "rail": the rail
        var oculta = sbClosedArrow();
        sb.rail.style.display = c && !oculta ? "flex" : "none";
        sb.full.style.display = c ? "none" : "flex";
        sbHiddenArm();
        sbHiddenCss();
        sbPlace();
        sbApplyPush();
        sidebarEl.style.transition = "transform 0.18s ease";
        sidebarEl.style.transform = oculta && c ? "translateX(calc(100% + 24px))" : "";
        if (sbHidden.zone) sbHidden.zone.style.display = oculta && c ? "block" : "none";
        if (sbHidden.tab) sbHidden.tab.style.display = oculta && c ? "block" : "none";
        sb.title.style.display = c ? "none" : "";
        // the gear does not fit in the rail, and the settings panel never stays open
        // once the bar is closed (it would reappear open the next time)
        sidebarEl.setAttribute("data-sb-closed", c ? "1" : "0");
        if (sb.gearBtn) sb.gearBtn.style.display = c ? "none" : "flex";
        if (c) sbConfigOpen(false);
        // the button editor ("Editar botones") is an edit mode too: it must not stay on when the bar closes
        if (c && typeof btnEditing !== "undefined" && btnEditing && sb.btnEditBtn) sb.btnEditBtn.click();
        // "Order" lives in the gear: the one in the header is only the "Done"
        // while ordering (BUG 2026-10-10: it reappeared when opening the bar)
        if (sb.orderBtn) sb.orderBtn.style.display = c || !sbOrdering ? "none" : "";
        if (c && sbOrdering) sbSetOrdering(false);
        // Texto plano ("<"/">"), no simbolos unicode -- ver iconos.
        sbT(sb.toggle, c ? "<" : ">");
        sb.toggle.title = c ? i18nT('sidebar.open_control_bar') : i18nT('sidebar.collapse_control_bar');
        sb.toggle.setAttribute("aria-label", sb.toggle.title);
        if (!c) {
          sidebarProbeRelay();
          if (!sbRelayProbeTimer) sbRelayProbeTimer = setInterval(sidebarProbeRelay, RELAY_PROBE_MS);
        } else if (sbRelayProbeTimer) {
          clearInterval(sbRelayProbeTimer);
          sbRelayProbeTimer = null;
        }
        sidebarRefresh();
        if (morphFrom) ledMorph(morphFrom, ledMorphCircleBox, 230); // the bar needs its 180 ms slide to be where it will stay
        else if (morphCircle) ledMorph(morphCircle, sbArrowRect, 30);
      }

      function createSidebar() {
        if (document.getElementById(SIDEBAR_ID)) return;
        if (pluginStopped || sbFrameBarAlive(window, SIDEBAR_ID)) return; // 10-sidebar-guard.js

        var bar = document.createElement("div");
        bar.id = SIDEBAR_ID;
        bar.style.cssText = [
          "position:fixed",
          "top:0",
          "right:0",
          "bottom:0",
          "z-index:2147483647", // la unica capa maxima: jog/camara van un punto abajo
          "background:#1e272c",
          "color:#fff",
          "border-left:2px solid rgba(255,255,255,0.6)",
          "box-shadow:-2px 0 10px rgba(0,0,0,0.5)",
          "display:flex",
          "flex-direction:column",
          "font-family:Roboto,Helvetica,Arial,sans-serif",
          "box-sizing:border-box",
          "overflow:hidden;overscroll-behavior:contain", // dragging on the bar does not move the page behind
          "-webkit-user-select:none",
          "user-select:none",
        ].join(";");
        sidebarEl = bar;
        sb = {};

        sbBuildHead(bar);
        sbBuildLiveStop(bar); // 19-sidebar-livestop.js: under the header, only while a live job runs

        // -- cuerpo con scroll propio --
        var scroller = document.createElement("div");
        scroller.style.cssText =
          "flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;";
        bar.appendChild(scroller);
        sb.scroller = scroller;

        sbBuildRail(scroller);

        var full = sbBuildFull(scroller);

        sbBuildLocalGroup(full);

        // === BOTONES (grupos propios, ver 15-buttons.js) ===
        btnCreateSection(full);

        // === GLOBAL ===
        var gGlobal = sbMakeGroup(
          full,
          i18nT('sidebar.global_machine'),
          i18nT('sidebar.global_help'),
          SIDEBAR_GLOBAL_COLOR
        );
        sbMakeSortableSection(gGlobal, "global");
        sb.gGlobal = gGlobal; // estilo Oculta: tarjetas de estado + detalle
        sbOrderRegister("global", gGlobal);

        sbBuildRelayCard(gGlobal);

        sbBuildNoticeCard(gGlobal);

        sbBuildPowerCard(gGlobal);

        // Versions of the Taller plugins loaded on this page (build.py
        // injects them; see workshop.versions in _shared/10-registry.js).
        sb.versions = sbText("", "font-size:10px;line-height:1.4;color:rgba(255,255,255,0.45);padding:0 4px;");
        full.appendChild(sb.versions);

        sbPanelUi = {};
        document.body.appendChild(bar);
        sbOrderApplyAll();
        sidebarSetCollapsed(isSidebarCollapsed());
        sidebarProbeRelay();
      }

      // Updates EVERYTHING visible of the bar from the current state.
      // Safe to call at any time (it does nothing without a bar).
      // Creates/removes the launchers (rail icon + card) of the panels
      // registered by other plugins (window.__workshop.panels), in order.
      function sbSyncPanels() {
        var ids = Object.keys(workshop.panels).sort(function (a, b) {
          return (workshop.panels[a].order || 0) - (workshop.panels[b].order || 0);
        });
        Object.keys(sbPanelUi).forEach(function (id) {
          if (workshop.panels[id]) return;
          sbPanelUi[id].rail.remove();
          sbPanelUi[id].card.remove();
          delete sbPanelUi[id];
        });
        ids.forEach(function (id) {
          var p = workshop.panels[id];
          var ui = sbPanelUi[id];
          if (!ui) {
            var toggle = function () {
              var cur = workshop.panels[id];
              if (cur) cur.toggle();
            };
            ui = sbPanelUi[id] = {};
            ui.rail = sbMakeRailBtn(p.icon, p.title, null, toggle);
            ui.card = sbMakeCard(sb.localCards, p.icon, p.title);
            sbMakeSortableCard(ui.card, "panel:" + id);
            ui.status = sbStatusLine(ui.card);
            ui.btn = sbMakeButton("", "#455a64", toggle);
            sbRow(ui.card).appendChild(ui.btn);
            if (p.description) ui.card.appendChild(sbText(p.description));
          }
          // appendChild moves the node: it leaves rail and cards in the order of `order`
          sb.railLocal.appendChild(ui.rail);
          sb.localCards.appendChild(ui.card);
        });
        sb.noPanels.style.display = ids.length ? "none" : "";
        sbOrderApply("local"); // the loop above re-adds them in registration order
      }

      function sbRefreshPanels() {
        Object.keys(sbPanelUi).forEach(function (id) {
          var p = workshop.panels[id];
          var ui = sbPanelUi[id];
          var st = {};
          try {
            st = p.state() || {};
          } catch (e) {
            console.error("[WorkshopControlBar] panel state " + id + ":", e);
          }
          var name = p.title.toLowerCase();
          sbT(ui.status, st.statusText || (st.open ? i18nT('sidebar.open_on_this_screen') : i18nT('sidebar.closed')));
          ui.status.style.color = st.open ? "#a5d6a7" : "rgba(255,255,255,0.6)";
          sbT(ui.btn, st.open ? i18nT('sidebar.close_name', { name: name }) : i18nT('sidebar.open_name', { name: name }));
          ui.btn.style.background = st.open ? "#455a64" : "#1565c0";
          ui.btn.disabled = !!st.disabled;
          ui.btn.style.opacity = st.disabled ? "0.5" : "1";
          // The rail icon is highlighted (blue) while its panel is open.
          sbH(ui.rail, sbIconSvg(p.icon, 22, false));
          ui.rail.style.background = st.open || st.busy ? "#1565c0" : "#37474f";
          ui.rail.style.opacity = st.disabled ? "0.4" : "1";
          ui.rail.title =
            st.railTitle || (st.open ? i18nT('sidebar.panel_this_screen_only_open', { name: p.title }) : i18nT('sidebar.panel_this_screen_only_tap_to_open', { name: p.title }));
        });
      }

      function sidebarRefresh() {
        if (!sidebarEl || !sb.railLocal) return;

        // Lanzadores locales (paneles de otros plugins)
        sbSyncPanels();
        sbRefreshPanels();
        sb.versions.textContent =
          i18nT('sidebar.versions') + " " +
          Object.keys(workshop.versions || {})
            .sort()
            .map(function (id) {
              return id.replace(/^(?:Workshop|Taller)/, "") + " " + workshop.versions[id].version;
            })
            .join(" · ");

        sbPaintRelay();
        var pv = sbPowerView();
        sbPaintShutdownState(pv);
        sbPaintPowerMethod(pv);
        sbPaintPowerTexts(pv);
        sbPaintShutdownWhen(pv);
        sbPaintTiming(pv);
        if (typeof sbConfigApply === "function") sbConfigApply();

        sbRefreshNotice();
        sbLiveStopRefresh(); // 19-sidebar-livestop.js
        sbRoleApply(); // 09-role.js
        if (typeof ocRefresh === "function") ocRefresh(); // estilo Oculta (11-hidden.js)
      }

      // The bar sits below DWC's top app-bar: re-measure now and then (the app-bar
      // can change height without a resize event).
      setInterval(function () {
        if (!pluginStopped && sidebarEl) sbPlace();
        sbYieldToParentBar(); // 10-sidebar-guard.js
      }, 1000);
