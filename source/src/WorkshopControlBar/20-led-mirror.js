      // ---- Mirror of the status LEDs (request 2026-10-09) ----
      // With the automatic status lights, the interface copies what the physical
      // strip shows (same colors and animation: turns, blinking, progress
      // bar). It is computed by WorkshopService; ledState (_shared/25) reads it.
      //   - bar open: strip under the header + what each color means
      //   - bar collapsed: a single round indicator above the rail with
      //     the same colors in proportion (pie), not a long strip
      //     (request 2026-10-09); tapping it opens the bar with the explanation
      //   - DWC status chip ("Available", "Processing"...)
      // The buttons (rail and Buttons card) NO longer carry anything: request 2026-10-09,
      // "remove from each button, leave it at the top in the bar".
      var ledBox = null; // contenedor bajo la cabecera (tira + leyenda)
      var ledStripH = null;
      var ledLegend = null;
      var ledStripV = null; // indicador redondo, en el riel

      function ledPie(secs) {
        var total = secs.reduce(function (t, s) {
          return t + s[2];
        }, 0);
        if (!total) return "none";
        var pos = 0, parts = [];
        secs.forEach(function (s) {
          var c = ledColor(s);
          var a = (pos / total) * 360, b = ((pos + s[2]) / total) * 360;
          parts.push(c + " " + a.toFixed(1) + "deg " + b.toFixed(1) + "deg");
          pos += s[2];
        });
        return "conic-gradient(" + parts.join(",") + ")";
      }

      // a single color per LED across the whole interface (_shared/25-led-state.js)
      function ledColor(s) {
        return ledState.color(s);
      }

      function ledTextLegend(est) {
        return (est.activeList || [])
          .map(function (a) {
            return a.name || a.id;
          })
          .join(" · ");
      }

      // the state is shown only while the Lights and status plugin is installed and enabled (stopped = nothing is painted)
      function ledLightsActive() {
        if (!workshopPathExists("/Plugins/Lights")) return false;
        var l = workshopHostEnabledPlugins();
        return !Array.isArray(l) || l.indexOf("WorkshopLights") >= 0;
      }

      // The layer of the arrow tab follows how the states combine (Lights > "When several are active"):
      // priority = the first state, split = one stripe per state (the first ones get more room, the mode
      // colour is the last stripe), turns = the layer changes state every turn_s seconds. Each state keeps its effect.

      function ledLayerStop(layer) {
        if (layer._tm) clearInterval(layer._tm);
        layer._tm = null;
        layer._sig = null;
      }

      function ledLayerPaint(layer, ind) {
        var items = (ind.activeList || []).map(function (a) {
          return { hex: a.hex, fx: a.effect };
        });
        if (!items.length) items = [{ hex: ind.hex, fx: ind.effect }];
        var mode = ind.combine === "split" || ind.combine === "turns" ? ind.combine : "priority";
        // the mode colour is part of the zone only when real states are active and none of them takes the
        // whole zone (stop, crash, risk, free jog) or stands for the lighting while the automatic status is off
        var own = (ind.activeList || []).length > 0 && ["stop", "crash", "risk", "jog_free", "lighting"].indexOf(ind.id) < 0;
        if (mode === "priority" || !own) items = items.slice(0, 1);
        else items.push({ hex: ind.baseHex || "#455a64", fx: "steady" });
        var sig = mode + "|" + ind.turnS + "|" + JSON.stringify(items);
        if (layer._sig === sig) return;
        ledLayerStop(layer);
        layer._sig = sig;
        layer.textContent = "";
        layer.style.background = "none";
        ledState.fx(layer, "steady");
        layer.style.flexDirection = "column";
        if (mode === "split") {
          var k = items.length;
          items.forEach(function (it, i) {
            var fr = document.createElement("span");
            fr.style.cssText = "display:block;min-height:0;flex:" + (i < k - 1 ? k - i : 1) + " 1 0;background:" + it.hex + ";";
            layer.appendChild(fr);
            ledState.fx(fr, it.fx, 0.95, 0.12);
          });
          return;
        }
        var put = function (it) {
          layer.style.background = it.hex;
          ledState.fx(layer, it.fx, 0.95, 0.12);
        };
        put(items[0]);
        if (mode === "turns" && items.length > 1) {
          var n = 0;
          layer._tm = setInterval(function () {
            n = (n + 1) % items.length;
            put(items[n]);
          }, Math.max(500, (ind.turnS || 1.5) * 1000));
        }
      }

      // Fold the legend chips that do not fit in two rows into one "+N" chip.
      function ledLegendAdjust() {
        var more = ledLegend.querySelector("[data-led-more]");
        if (more) more.remove();
        var chips = Array.prototype.slice.call(ledLegend.children);
        chips.forEach(function (c) { c.style.display = ""; });
        if (!chips.length) return;
        ledLegend.title = chips.map(function (c) { return c.textContent; }).join(" \u00b7 ");
        var base = chips[0].offsetTop;
        function outside(c) { return c.offsetTop - base > 26; } // 3rd row (a row is about 17 px)
        var ocultos = 0;
        var i = 0;
        while (i < chips.length && !outside(chips[i])) i++;
        if (i === chips.length) return;
        ocultos = chips.length - i;
        for (var k = i; k < chips.length; k++) chips[k].style.display = "none";
        var m = document.createElement("span");
        m.setAttribute("data-led-more", "1");
        m.style.cssText = "white-space:nowrap;font-weight:bold;color:rgba(255,255,255,0.7);";
        ledLegend.appendChild(m);
        // make room for the "+N" chip: hide one more chip while it still wraps to a third row
        for (var j = i - 1; j >= 0; j--) {
          m.textContent = "+" + ocultos;
          if (m.offsetTop - base <= 26) break;
          chips[j].style.display = "none";
          ocultos++;
        }
        m.textContent = "+" + ocultos;
      }

      // Rail dot: the same layer as the arrow tab (ledLayerPaint: priority / split stripes / turns, each state with its own effect), clipped to a circle
      function ledRailPaint(est) {
        var ind = est.indicator;
        if (ind) {
          // the same pie as the open bar and the Lights page (state colors, combine mode and effects), so the rail animates alike
          var sig = JSON.stringify([ind.hex, ind.effect, ind.activeList.map(function (a) { return [a.id, a.hex, a.effect]; }), ind.combine, ind.turnS, ind.baseHex, ind.id]);
          if (ledStripV._signature !== sig || !ledStripV.firstChild) {
            ledRailClean();
            ledStripV._signature = sig;
            ledStripV.style.background = "#1e272c";
            ledStripV.style.alignItems = "center";
            ledStripV.style.justifyContent = "center";
            ledStripV.appendChild(workshopLedPastel(ind, 22, ledStripV, ledState.fx));
          }
          ledStripV.style.boxShadow = "none";
          return;
        }
        ledRailClean();
        var lit = est.secs.filter(function (x) { return x[1] > 0; });
        ledStripV.style.background = ledPie(est.secs);
        ledStripV.style.boxShadow = lit.length ? "0 0 8px " + ledColor(lit[0]) : "none";
      }

      // The arrow tab of the closed bar turns into the round indicator on top of the bar when it opens, and back when it closes (a ghost that
      // flies from one box to the other: size, position and corner radius animate; it carries the same layer, so the effect keeps playing).
      // a = the box where it starts; target = function that gives the box where it ends, read when it moves (after `wait` ms: the bar slides in
      // when it opens, so its final place is only known once it has arrived)
      function ledMorph(a, target, wait) {
        var ind = ledState.get().indicator;
        if (!ind || !a || !a.width) return;
        // prefers-reduced-motion is NOT honoured here on purpose: Windows sends "reduce" when its animations are off, and the owner asked for this
        // 0.35 s transition (it plays once, it does not loop)
        var g = document.createElement("span");
        g.setAttribute("data-tp-panel", "1");
        var box = function (r) {
          g.style.left = r.left + "px";
          g.style.top = r.top + "px";
          g.style.width = r.width + "px";
          g.style.height = r.height + "px";
          g.style.borderRadius = r.width > 40 ? "6px" : "50%";
        };
        g.style.cssText = "position:fixed;z-index:2147483000;pointer-events:none;overflow:hidden;box-sizing:border-box;background:#1e272c;box-shadow:0 0 8px " + ind.hex + ";transition:left .34s ease,top .34s ease,width .34s ease,height .34s ease,border-radius .34s ease,opacity .12s ease .26s;";
        box(a);
        var layer = document.createElement("span");
        layer.style.cssText = "position:absolute;left:0;top:0;right:0;bottom:0;display:flex;opacity:.95;";
        g.appendChild(layer);
        document.body.appendChild(g);
        ledLayerPaint(layer, ind);
        setTimeout(function () {
          var b = target();
          if (b && b.width) {
            box(b);
            g.style.opacity = "0";
          }
        }, wait || 30);
        setTimeout(function () {
          ledLayerStop(layer);
          g.remove();
        }, (wait || 30) + 520);
      }

      // The box the round indicator has on top of the open bar (the status strip under its header, else the corner of the bar)
      function ledMorphCircleBox() {
        var r = ledBox && ledBox.isConnected && ledBox.style.display !== "none" ? ledBox.getBoundingClientRect() : sidebarEl ? sidebarEl.getBoundingClientRect() : null;
        if (!r || !r.width) return null;
        return { left: r.left + 12, top: r.top + (ledBox && ledBox.isConnected ? 4 : 10), width: 28, height: 28 };
      }

      function ledRailClean() {
        if (ledStripV._layer) {
          ledLayerStop(ledStripV._layer);
          ledStripV._layer = null;
        }
        if (ledStripV._tm) clearInterval(ledStripV._tm);
        ledStripV._tm = null;
        ledStripV._signature = "";
        ledStripV.textContent = "";
      }

      function ledMirrorApply() {
        if (!sidebarEl || !sb) return;
        var est = ledState.get();
        // barra abierta: tira + leyenda bajo la cabecera
        if (!ledBox || !ledBox.isConnected) {
          var head = sidebarEl.firstElementChild;
          if (!head) return;
          ledBox = document.createElement("div");
          ledBox.style.cssText = "flex:none;padding:5px 8px 6px;background:#1e272c;border-bottom:1px solid rgba(255,255,255,0.12);";
          ledStripH = document.createElement("div");
          ledLegend = document.createElement("div");
          ledLegend.style.cssText = "display:flex;flex-wrap:wrap;align-content:flex-start;gap:3px 10px;margin-top:5px;font-size:11px;line-height:1.3;color:rgba(255,255,255,0.85);height:32px;overflow:hidden;";
          ledBox.appendChild(ledStripH);
          ledBox.appendChild(ledLegend);
          head.insertAdjacentElement("afterend", ledBox);
          ledState.paint(ledStripH, "badge"); // on-screen indicator: current state with its color and effect (not a strip)
        }
        // barra contraida: tira vertical arriba del riel
        if (sb.rail && (!ledStripV || !ledStripV.isConnected)) {
          ledStripV = document.createElement("button");
          ledStripV.type = "button";
          ledStripV.style.cssText = "width:30px;height:30px;flex:none;padding:0;margin:2px 0 4px;border-radius:50%;border:2px solid #1e272c;outline:1px solid rgba(255,255,255,0.25);cursor:pointer;";
          ledStripV.addEventListener("click", function (ev) {
            ev.stopPropagation();
            sidebarSetCollapsed(false); // open to see what each color means
          });
          sb.rail.insertBefore(ledStripV, sb.rail.firstChild);
        }
        var ver = ledShowStatus(est, sbVerLeds(), ledLightsActive()); // gear: "Status lights at the top of the bar"
        ledBox.style.display = ver && !sidebarCollapsed ? "block" : "none";
        if (ledStripV) ledStripV.style.display = ver && sidebarCollapsed ? "flex" : "none";
        if (ver) {
          if (ledStripV) {
            ledRailPaint(est);
          }
          // the badge text (ellipsis span inside an inline-flex row) must also shrink and scroll
          ledStripH.querySelectorAll("span").forEach(function (sp) {
            if (sp.style.textOverflow === "ellipsis" && !sp._sbMq) {
              sp.parentElement.style.maxWidth = "100%";
              sp.style.flex = "0 1 auto";
              sbMarquee(sp);
            }
          });
          // rebuild the legend only when it changed (rebuilding every second drops a text selection)
          var leyFirma = (est.activeList || []).map(function (a) { return a.hex + a.name + a.id; }).join("|");
          if (ledLegend._signature !== leyFirma) ledLegend.textContent = "";
          (ledLegend._signature !== leyFirma ? est.activeList || [] : []).forEach(function (a) {
            var it = document.createElement("span");
            it.style.cssText = "display:inline-flex;align-items:center;gap:4px;white-space:nowrap;";
            var dot = document.createElement("i");
            dot.style.cssText = "width:9px;height:9px;border-radius:50%;flex:none;background:" + a.hex + ";box-shadow:0 0 4px " + a.hex + ";";
            it.appendChild(dot);
            it.appendChild(document.createTextNode(a.name || a.id));
            ledLegend.appendChild(sbMarquee(it));
          });
          ledLegend._signature = leyFirma;
          // The legend always takes two rows, whatever the number of active states: the ones that do not
          // fit are folded into a "+N" chip (the full list is in the tooltip), so the bar never changes size.
          var fitKey = ledLegend.clientWidth + "|" + leyFirma;
          if (ledBox.style.display !== "none" && ledLegend.clientWidth > 0 && ledLegend._fitKey !== fitKey) {
            ledLegendAdjust();
            ledLegend._fitKey = fitKey;
          }
          var t = i18nT('sidebar.status_leds', { text: ledTextLegend(est) + (est.text ? " (" + est.text + ")" : "") });
          ledBox.title = t;
          if (ledStripV) ledStripV.title = i18nT('sidebar.status_leds_tap_to_open', { text: t });
        }
        // The arrow tab of the closed bar shows the state with its whole area: a layer of the state color
        // behind the arrow, animated with the state effect. The arrow stays on top and readable.
        var pest = typeof sbHidden !== "undefined" && sbHidden.tab;
        if (pest) {
          if (!pest._state) {
            pest.style.overflow = "hidden";
            pest.style.isolation = "isolate";
            var layer = document.createElement("span");
            layer.style.cssText = "position:absolute;left:0;top:0;right:0;bottom:0;z-index:-1;display:none;pointer-events:none;opacity:.95;";
            pest.appendChild(layer);
            pest._state = [layer];
          }
          var marks = pest._state;
          // the arrow has its own switch (Settings > "State on the arrow"), apart from the state at the top of the bar
          var verArrow = !!est.indicator && !sbConfig.withoutArrow && ledLightsActive();
          if (verArrow) {
            marks.forEach(function (m) {
              m.style.display = "flex";
              ledLayerPaint(m, est.indicator);
            });
            pest.title = i18nT('sidebar.open_the_control_bar') + " - " + est.indicator.name;
          } else {
            marks.forEach(function (m) {
              m.style.display = "none";
              ledState.fx(m, "steady");
              ledLayerStop(m);
            });
            pest.title = i18nT('sidebar.open_the_control_bar');
          }
        }
      }

      var ledMirrorOff = ledState.subscribe(ledMirrorApply);
      // the buttons, DWC's chip and the collapse are recreated/changed by themselves
      var ledMirrorTimer = setInterval(ledMirrorApply, 1000);
      workshopOnStop(function () {
        ledMirrorOff();
        clearInterval(ledMirrorTimer);
        if (ledBox) ledBox.remove();
        if (ledStripV) {
          if (ledStripV._tm) clearInterval(ledStripV._tm);
          ledStripV.remove();
        }
      });
