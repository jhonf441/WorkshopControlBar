      // ---- Order the bar (drag sections and cards) ----
      //
      // Request 2026-10-08: "being able to drag the other groups (not only those
      // of Buttons) to arrange them to taste". "Order" button in the
      // bar's header: it shows a handle (little stripes) on each SECTION
      // (THIS SCREEN / BUTTONS / GLOBAL) and on each fixed CARD (Camera,
      // Jog, Relay, Notifications, Shutdown) and on the Buttons groups.
      // Cards move WITHIN their section (a GLOBAL card does not
      // go to THIS SCREEN: the section's color says whom it affects).
      // The order of sections and fixed cards belongs to THIS screen
      // (localStorage); that of the Buttons groups belongs to the Pi (saved
      // by 15-buttons.js, as in "Edit buttons").
      var SB_ORDER_KEY = "workshopBarOrder";
      var sbOrdering = false;
      var sbOrder = {};
      try {
        sbOrder = JSON.parse(localStorage.getItem(SB_ORDER_KEY) || "{}") || {};
      } catch (e) {
        sbOrder = {};
      }

      function sbOrderSave() {
        try {
          localStorage.setItem(SB_ORDER_KEY, JSON.stringify(sbOrder));
        } catch (e) {
          /* no critico */
        }
      }

      // Orderable containers: scope -> element. Their children with
      // data-sb-key are the ones that move; the others (title, scope text,
      // versions) stay where they are.
      var sbOrderBoxes = {};

      function sbOrderRegister(scope, container) {
        sbOrderBoxes[scope] = container;
        container.dataset.sbScope = scope;
      }

      function sbKeyed(container) {
        return Array.prototype.filter.call(container.children, function (c) {
          return !!c.dataset.sbKey;
        });
      }

      // Reorders the children with a key according to what is saved (those not
      // in what is saved stay at the end, in their current order).
      function sbOrderApply(scope) {
        var box = sbOrderBoxes[scope];
        var saved = sbOrder[scope];
        if (!box || !Array.isArray(saved)) return;
        var keyed = sbKeyed(box);
        if (keyed.length < 2) return;
        var pos = {};
        saved.forEach(function (k, i) {
          pos[k] = i;
        });
        var sorted = keyed.slice().sort(function (a, b) {
          var pa = pos[a.dataset.sbKey],
            pb = pos[b.dataset.sbKey];
          if (pa === undefined && pb === undefined) return keyed.indexOf(a) - keyed.indexOf(b);
          if (pa === undefined) return 1;
          if (pb === undefined) return -1;
          return pa - pb;
        });
        // anchor: the first child WITHOUT a key that is after the first one with a key
        var first = keyed[0];
        var anchor = null;
        for (var n = first.nextElementSibling; n; n = n.nextElementSibling) {
          if (!n.dataset.sbKey) {
            anchor = n;
            break;
          }
        }
        sorted.forEach(function (el) {
          box.insertBefore(el, anchor);
        });
      }

      function sbOrderApplyAll() {
        Object.keys(sbOrderBoxes).forEach(sbOrderApply);
      }

      var SB_HANDLE_SVG =
        '<path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>';

      // Handle for `el` (child with data-sb-key of an orderable container).
      // It is inserted at the beginning of `headEl` and is only seen in Order mode.
      function sbAddHandle(el, headThe) {
        if (headThe.querySelector("[data-sb-handle]")) return;
        var h = document.createElement("span");
        h.dataset.sbHandle = "1";
        h.title = i18nT('order.drag_to_arrange');
        h.style.cssText =
          "flex:none;display:" + (sbOrdering ? "inline-flex" : "none") + ";align-items:center;justify-content:center;width:26px;height:26px;border-radius:4px;background:rgba(255,255,255,0.12);color:#eceff1;cursor:grab;touch-action:none;margin-right:2px;";
        sbH(h, sbIconSvg(SB_HANDLE_SVG, 18, false));
        h.addEventListener("pointerdown", function (ev) {
          ev.stopPropagation();
          ev.preventDefault();
          sbDragStart(ev, el);
        });
        h.addEventListener("click", function (ev) {
          ev.stopPropagation();
        });
        headThe.insertBefore(h, headThe.firstChild);
      }

      // Section (div of sbMakeGroup): its first child is the title.
      function sbMakeSortableSection(sec, key) {
        sec.dataset.sbKey = key;
        var h = sec.firstChild;
        h.style.display = "flex";
        h.style.alignItems = "center";
        h.style.gap = "6px";
        sbAddHandle(sec, h);
      }

      // Card (div from sbMakeCard): its first child is the header.
      function sbMakeSortableCard(card, key) {
        card.dataset.sbKey = key;
        sbAddHandle(card, card.firstChild);
      }

      var sbDrag = null;

      function sbDragStart(ev, el) {
        if (sbDrag) return;
        var box = el.parentElement;
        var r = el.getBoundingClientRect();
        var ghost = el.cloneNode(true);
        ghost.style.cssText +=
          ";position:fixed;left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;max-height:160px;overflow:hidden;z-index:2147483647;opacity:0.85;pointer-events:none;box-shadow:0 4px 14px rgba(0,0,0,0.6);";
        document.body.appendChild(ghost);
        var line = document.createElement("div");
        line.style.cssText = "position:fixed;height:3px;background:#fff;border-radius:4px;z-index:2147483647;pointer-events:none;display:none;";
        document.body.appendChild(line);
        el.style.opacity = "0.3";
        sbDrag = { el: el, box: box, ghost: ghost, line: line, dy: Math.min(ev.clientY - r.top, 40), pid: ev.pointerId, lastY: ev.clientY, before: null, timer: null };
        window.addEventListener("pointermove", sbDragMove);
        window.addEventListener("pointerup", sbDragEnd);
        window.addEventListener("pointercancel", sbDragEnd);
        sbDrag.timer = setInterval(function () {
          if (!sbDrag) return;
          var sc = sb.full && sb.full.parentElement;
          if (!sc) return;
          var sr = sc.getBoundingClientRect();
          if (sbDrag.lastY < sr.top + 50) sc.scrollTop -= 12;
          else if (sbDrag.lastY > sr.bottom - 50) sc.scrollTop += 12;
          else return;
          sbDragLocate(sbDrag.lastY);
        }, 30);
      }

      function sbDragLocate(y) {
        var d = sbDrag;
        var items = sbKeyed(d.box);
        var best = null;
        items.forEach(function (it) {
          var r = it.getBoundingClientRect();
          var dist = Math.abs(y - (r.top + r.height / 2));
          if (!best || dist < best.dist) best = { it: it, r: r, before: y < r.top + r.height / 2, dist: dist };
        });
        if (!best) return;
        d.before = best.before ? best.it : best.it.nextElementSibling && best.it.nextElementSibling.dataset.sbKey ? best.it.nextElementSibling : { afterEl: best.it };
        d.line.style.display = "block";
        d.line.style.left = best.r.left + "px";
        d.line.style.width = best.r.width + "px";
        d.line.style.top = (best.before ? best.r.top - 5 : best.r.bottom + 2) + "px";
      }

      function sbDragMove(ev) {
        if (!sbDrag || ev.pointerId !== sbDrag.pid) return;
        ev.preventDefault();
        sbDrag.lastY = ev.clientY;
        sbDrag.ghost.style.top = ev.clientY - sbDrag.dy + "px";
        sbDragLocate(ev.clientY);
      }

      function sbDragEnd(ev) {
        if (!sbDrag || ev.pointerId !== sbDrag.pid) return;
        var d = sbDrag;
        sbDrag = null;
        window.removeEventListener("pointermove", sbDragMove);
        window.removeEventListener("pointerup", sbDragEnd);
        window.removeEventListener("pointercancel", sbDragEnd);
        clearInterval(d.timer);
        d.ghost.remove();
        d.line.remove();
        d.el.style.opacity = "";
        if (ev.type === "pointercancel" || !d.before || d.before === d.el) return;
        if (d.before.afterEl) {
          if (d.before.afterEl === d.el) return;
          d.box.insertBefore(d.el, d.before.afterEl.nextSibling);
        } else d.box.insertBefore(d.el, d.before);
        var scope = d.box.dataset.sbScope;
        sbOrder[scope] = sbKeyed(d.box).map(function (c) {
          return c.dataset.sbKey;
        });
        sbOrderSave();
      }

      function sbSetOrdering(on) {
        sbOrdering = on;
        Array.prototype.forEach.call(document.querySelectorAll("#" + SIDEBAR_ID + " [data-sb-handle]"), function (h) {
          h.style.display = on ? "inline-flex" : "none";
        });
        if (sb.orderBtn) {
          sbT(sb.orderBtn, on ? i18nT('common.done') : i18nT('sidebar.arrange'));
          sb.orderBtn.style.background = on ? "#2e7d32" : "#37474f";
        }
        if (sb.orderHint) sb.orderHint.style.display = on ? "" : "none";
        // the header button only appears while ordering ("Done")
        if (sb.orderBtn) sb.orderBtn.style.display = on ? "" : "none";
        if (typeof btnRender === "function") btnRender(); // manijas de los grupos de Botones
        if (typeof ocApply === "function") ocApply(); // Hidden: sorting shows the whole list
      }

      // Row of a "show X" option kept negated in sbConfig (sbConfig[key] = true means hidden); after() runs once it is saved
      function sbConfigShowRow(row, label, key, after) {
        row(label, !sbConfig[key], false, function (v) {
          sbConfig[key] = !v;
          sbConfigSave();
          after();
        });
      }

      // ---- Gear: configure the bar on THIS screen (2026-10-10) ----
      // Which sections and cards are seen (hidden ones also do not show in the
      // rail), whether the status lights are seen on top, and "Order". All in
      // localStorage: each screen builds its own bar.
      var SB_CONFIG_KEY = "workshopBarConfig";
      var SB_CONFIG_EMPTY = { ocultas: [], withoutLeds: false, withoutArrow: false, withoutLiveStop: false, compact: false, collapsible: false, collapsed: [], sections: [], location: {}, closed: "rail", autoClose: false, pushPage: true };
      var sbConfig = JSON.parse(JSON.stringify(SB_CONFIG_EMPTY));
      try {
        var _c = JSON.parse(localStorage.getItem(SB_CONFIG_KEY) || "{}") || {};
        sbConfig.ocultas = Array.isArray(_c.ocultas) ? _c.ocultas : [];
        sbConfig.withoutLeds = !!_c.withoutLeds;
        sbConfig.withoutArrow = !!_c.withoutArrow;
        sbConfig.withoutLiveStop = !!_c.withoutLiveStop;
        sbConfig.compact = !!_c.compact;
        sbConfig.collapsible = !!_c.collapsible;
        // "when closed" + "automatic collapse" (2026-10-12)
        var _m = workshopSidebarRead(_c);
        sbConfig.closed = _m.closed;
        sbConfig.autoClose = _m.autoClose;
        sbConfig.pushPage = _m.pushPage;
        // on the touch screen of the Pi (the kiosk) the bar folds by itself unless the user chose otherwise
        if (typeof _c.collapseAuto !== "boolean" && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)) sbConfig.autoClose = true;
        sbConfig.collapsed = Array.isArray(_c.collapsed) ? _c.collapsed : [];
        sbConfig.sections = Array.isArray(_c.sections) ? _c.sections : [];
        sbConfig.location = _c.location && typeof _c.location === "object" ? _c.location : {};
      } catch (e) {
        /* config por defecto */
      }

      // How the closed bar looks and whether the page makes room for it go together: a rail that does not make room would cover DWC (so the rail
      // turns making room on) and a bar that does not make room is hidden as an arrow when closed (so turning it off picks the arrow)
      function sbConfigApplyLook() {
        sbConfigSave();
        sidebarSetCollapsed(sidebarCollapsed);
        sbApplyPush();
        sbConfigRender();
      }
      function sbSetClosedLook(look) {
        sbConfig.closed = look;
        if (look === "rail") sbConfig.pushPage = true;
        sbConfigApplyLook();
      }
      function sbSetPushPage(v) {
        sbConfig.pushPage = v;
        if (!v) sbConfig.closed = "arrow";
        sbConfigApplyLook();
      }

      function sbConfigSave() {
        try {
          // stored keys (cerrada / colapsoAuto) instead of the internal closed / autoClose
          var out = {};
          Object.keys(sbConfig).forEach(function (k) {
            if (k !== "closed" && k !== "autoClose" && k !== "pushPage") out[k] = sbConfig[k];
          });
          var st = workshopSidebarStore({ closed: sbConfig.closed, autoClose: sbConfig.autoClose, pushPage: sbConfig.pushPage });
          out.closed = st.closed;
          out.collapseAuto = st.collapseAuto;
          out.pushPage = st.pushPage;
          localStorage.setItem(SB_CONFIG_KEY, JSON.stringify(out));
        } catch (e) {
          /* no critico */
        }
      }

      function sbVerLeds() {
        return !sbConfig.withoutLeds;
      }

      // card/section -> its icons in the rail (collapsed bar)
      function sbRailOf(key) {
        if (key === "relay") return [sb.railRelay];
        if (key === "notice") return [sb.railNotice];
        if (key === "power") return [sb.railPower, sb.railTimer, sb.railTimerLabel];
        if (key === "buttons") return [sb.railButtons];
        return [];
      }

      // marks with data-sb-hidden what is hidden (a CSS rule with
      // !important hides it, without fighting whoever changes its display)
      // tapping a card's title (only with "Foldable cards")
      function sbFold(card) {
        if (!sbConfig.collapsible || sbOrdering) return;
        var k = card.dataset.sbKey;
        if (!k) return;
        var i = sbConfig.collapsed.indexOf(k);
        if (i >= 0) sbConfig.collapsed.splice(i, 1);
        else sbConfig.collapsed.push(k);
        sbConfigSave();
        sbConfigApply();
      }

      // Own sections (gear): named groups to which any card can
      // be moved. This screen only.
      var sbSecOwn = {}; // id -> elemento
      function sbSectionsOwn() {
        var live = {};
        sbConfig.sections.forEach(function (sec) {
          live[sec.id] = true;
          var g = sbSecOwn[sec.id];
          if (!g || !g.isConnected) {
            g = sbMakeGroup(sb.full, sec.name, "", "#90a4ae");
            if (sb.versions && sb.versions.parentElement === sb.full) sb.full.insertBefore(g, sb.versions);
            sbMakeSortableSection(g, "cust:" + sec.id);
            sbOrderRegister("cust:" + sec.id, g);
            sbSecOwn[sec.id] = g;
            sbSectionFoot(g, sec.id);
          }
          var t = g.firstChild;
          var nombre = t && t.lastChild && t.lastChild.nodeType === 3 ? t.lastChild : null;
          if (nombre && nombre.nodeValue !== sec.name) nombre.nodeValue = sec.name;
        });
        Object.keys(sbSecOwn).forEach(function (id) {
          if (!live[id]) {
            sbSecOwn[id].remove();
            delete sbSecOwn[id];
            delete sbOrderBoxes["cust:" + id];
          }
        });
        // each card to its section (or back to the original)
        Array.prototype.forEach.call(document.querySelectorAll("#" + SIDEBAR_ID + " [data-sb-card='1'][data-sb-key]"), function (card) {
          var k = card.dataset.sbKey;
          if (!card.__sbOrigin) card.__sbOrigin = card.parentElement;
          var destination = sbSecOwn[sbConfig.location[k]] || card.__sbOrigin;
          if (destination && card.parentElement !== destination) destination.insertBefore(card, destination.__groups || null);
        });
        sbFeetRender();
      }

      // Request 2026-10-10: an own section can be left EMPTY and filled
      // later, besides with cards, with own button groups
      // (name, description, macro or G-code) just like in BUTTONS. The
      // groups and buttons belong to the Pi (sys/workshop/config/buttons.json); that a group
      // goes in this section belongs to THIS screen (location "grp:<id>"),
      // on another screen it is seen in BUTTONS.
      function sbSectionFoot(g, secId) {
        g.__groups = document.createElement("div");
        g.__groups.style.cssText = "display:flex;flex-direction:column;gap:10px;";
        g.appendChild(g.__groups);
        var pie = document.createElement("div");
        pie.style.cssText = "display:flex;flex-direction:column;gap:6px;";
        pie.__empty = sbText(
          i18nT('order.empty_section_add_a_button_group'),
          "font-size:11px;line-height:1.35;color:rgba(255,255,255,0.65);"
        );
        pie.appendChild(pie.__empty);
        var row = document.createElement("div");
        row.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;";
        pie.__new = sbMakeButton(i18nT('order.button_group'), "#1976d2", function () {
          if (typeof btnNewGroup === "function") btnNewGroup(secId);
        });
        row.appendChild(pie.__new);
        pie.__edit = sbMakeButton(i18nT('common.edit_buttons'), "#455a64", function () {
          if (sb.btnEditBtn) sb.btnEditBtn.click();
        });
        row.appendChild(pie.__edit);
        pie.appendChild(row);
        g.appendChild(pie);
        g.__foot = pie;
      }

      // State of the footers of the own sections (empty, Edit/Done).
      // Called by sbSectionsOwn and btnRender.
      function sbFeetRender() {
        var editing = typeof btnEditing !== "undefined" && btnEditing;
        var hasForm = typeof btnForm !== "undefined" && !!btnForm;
        Object.keys(sbSecOwn).forEach(function (id) {
          var g = sbSecOwn[id];
          var pie = g.__foot;
          if (!pie) return;
          var conGroups = !!g.__groups.querySelector("[data-btn-group]");
          pie.__empty.style.display = conGroups || sbKeyed(g).length || g.__groups.children.length ? "none" : "";
          pie.__new.style.display = hasForm ? "none" : "";
          pie.__edit.style.display = conGroups || editing ? "" : "none";
          sbT(pie.__edit, editing ? i18nT('common.done') : i18nT('common.edit_buttons'));
          pie.__edit.style.background = editing ? "#2e7d32" : "#37474f";
        });
      }

      function sbConfigApply() {
        if (!document.getElementById("workshop-sb-hidden-css")) {
          var st = document.createElement("style");
          st.id = "workshop-sb-hidden-css";
          var B = "#" + SIDEBAR_ID;
          st.textContent = [
            "[data-sb-hidden='1']{display:none !important}",
            // compact: without explanation texts and with less air
            B + "[data-sb-compact='1'] [data-sb-help='1']{display:none !important}",
            B + "[data-sb-compact='1'] [data-sb-group='1']{gap:6px !important;padding:6px 6px 6px 8px !important}",
            B + "[data-sb-compact='1'] [data-sb-card='1']{gap:4px !important;padding:6px !important}",
            B + "[data-sb-compact='1'] [data-sb-card='1'] button{min-height:28px !important;padding:3px 6px !important}",
            // foldable: tapping a card's title folds it
            B + "[data-sb-collapsible='1'] [data-sb-collapsed='1'] > :not(:first-child){display:none !important}",
            B + "[data-sb-collapsible='1'] [data-sb-card='1'] > :first-child{cursor:pointer}",
            B + ":not([data-sb-collapsible='1']) [data-sb-chev]{display:none}",
            B + " [data-sb-collapsed='1'] [data-sb-chev]{transform:rotate(-90deg)}",
          ].join("\n");
          document.head.appendChild(st);
        }
        var bar = document.getElementById(SIDEBAR_ID);
        if (bar) {
          bar.dataset.sbCompact = sbConfig.compact ? "1" : "";
          bar.dataset.sbCollapsible = sbConfig.collapsible ? "1" : "";
        }
        if (sb.full) sbSectionsOwn();
        Object.keys(sbOrderBoxes).forEach(function (scope) {
          sbKeyed(sbOrderBoxes[scope]).forEach(function (el) {
            el.dataset.sbCollapsed = sbConfig.collapsed.indexOf(el.dataset.sbKey) >= 0 ? "1" : "";
            var oculta = sbConfig.ocultas.indexOf(el.dataset.sbKey) >= 0;
            el.dataset.sbHidden = oculta ? "1" : "";
            sbRailOf(el.dataset.sbKey).forEach(function (r) {
              if (r) r.dataset.sbHidden = oculta ? "1" : "";
            });
          });
        });
        // button groups: their section and whether they are seen (drawn by btnRender).
        // This runs on every state refresh: redraw only if something changed
        // (recreating the buttons every 2 s loses taps and focus).
        var keyGroups = JSON.stringify([Object.keys(sbSecOwn), sbConfig.location, sbConfig.ocultas]);
        if (keyGroups !== sbKeyGroups && typeof btnRender === "function") {
          sbKeyGroups = keyGroups;
          btnRender();
        }
      }
      var sbKeyGroups = "";

      // visible name of a section or card: the text of its header
      function sbConfigName(el) {
        var h = el.firstChild;
        var t = ((h && h.textContent) || el.dataset.sbKey).trim().split("\n")[0];
        return t.length > 40 ? t.slice(0, 40) + "..." : t;
      }

      function sbConfigRender() {
        var box = sb.configBox;
        if (!box) return;
        box.textContent = "";
        box.appendChild(sbText(i18nT('order.configure_the_bar_this_screen_only'), "font-size:13px;font-weight:bold;"));
        box.appendChild(sbText(i18nT('order.uncheck_what_you_don_t_use'), "font-size:11px;color:rgba(255,255,255,0.65);"));
        // start-up dialog (16-startup.js): the macros the buttons need, with a count of what is still pending
        if (typeof barStartupOpen === "function") {
          var pending = barStartupPending();
          var bp = sbMakeButton(i18nT('startup.title') + (pending ? " (" + i18nT('startup.summary_pending', { n: pending }) + ")" : ""), pending ? "#e65100" : "#455a64", function () {
            sbConfigOpen(false);
            barStartupOpen();
          });
          bp.style.minHeight = "40px";
          box.appendChild(bp);
        }
        var items = document.createElement("div");
        items.style.cssText = "display:flex;flex-direction:column;gap:2px;margin:4px 0;";
        box.appendChild(items);
        function row(text, marcado, sangria, alChange, cardKey) {
          var l = document.createElement("label");
          l.style.cssText = "display:flex;align-items:center;gap:8px;font-size:12px;padding:3px 0 3px " + (sangria ? 18 : 0) + "px;cursor:pointer;";
          var c = document.createElement("input");
          c.type = "checkbox";
          c.checked = marcado;
          c.style.cssText = "width:16px;height:16px;flex:none;";
          c.addEventListener("change", function () {
            alChange(c.checked);
          });
          l.appendChild(c);
          l.appendChild(document.createTextNode(text));
          // with own sections: which section this card goes to
          if (cardKey && sbConfig.sections.length) {
            var sel = document.createElement("select");
            sel.style.cssText = "margin-left:auto;max-width:110px;font-size:11px;background:#1e272c;color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:4px;";
            var op0 = document.createElement("option");
            op0.value = "";
            sbT(op0, i18nT('order.its_section'));
            sel.appendChild(op0);
            sbConfig.sections.forEach(function (sec) {
              var o = document.createElement("option");
              o.value = sec.id;
              sbT(o, sec.name);
              sel.appendChild(o);
            });
            sel.value = sbConfig.location[cardKey] || "";
            sel.addEventListener("click", function (ev) {
              ev.preventDefault();
              ev.stopPropagation();
            });
            sel.addEventListener("change", function () {
              if (sel.value) sbConfig.location[cardKey] = sel.value;
              else delete sbConfig.location[cardKey];
              sbConfigSave();
              sbConfigApply();
              sbConfigRender();
            });
            l.appendChild(sel);
          }
          items.appendChild(l);
        }
        function alternar(key, ver) {
          sbConfig.ocultas = sbConfig.ocultas.filter(function (k) {
            return k !== key;
          });
          if (!ver) sbConfig.ocultas.push(key);
          sbConfigSave();
          sbConfigApply();
        }
        var secciones = sbOrderBoxes.sections ? sbKeyed(sbOrderBoxes.sections) : [];
        secciones.forEach(function (sec) {
          var k = sec.dataset.sbKey;
          row(sbConfigName(sec), sbConfig.ocultas.indexOf(k) < 0, false, function (v) {
            alternar(k, v);
          });
          var tarjetas = sbOrderBoxes[k] ? sbKeyed(sbOrderBoxes[k]) : [];
          tarjetas.forEach(function (card) {
            var kc = card.dataset.sbKey;
            row(sbConfigName(card), sbConfig.ocultas.indexOf(kc) < 0, true, function (v) {
              alternar(kc, v);
            }, card.dataset.sbCard ? kc : null);
          });
          // button groups (from the Pi): hide them or take them to an own section
          if (k === "buttons" && typeof btnData !== "undefined" && btnData) {
            btnData.groups.forEach(function (gr) {
              var kg = "grp:" + gr.id;
              row(gr.title, sbConfig.ocultas.indexOf(kg) < 0, true, function (v) {
                alternar(kg, v);
              }, kg);
            });
          }
        });
        var opt = sbText(i18nT('order.options'), "font-size:12px;font-weight:bold;margin-top:6px;");
        items.appendChild(opt);
        // 2026-10-12: two independent settings, same on every page.
        var hint = "font-size:11px;color:#b0bec5;margin-bottom:4px;";
        items.appendChild(sbText(i18nT('order.when_closed'), "font-size:12px;font-weight:bold;margin-top:4px;"));
        var cerr = document.createElement("div");
        cerr.style.cssText = "display:flex;gap:4px;flex-wrap:wrap;";
        [["rail", i18nT('order.icon_rail')], ["arrow", i18nT('order.arrow_only')]].forEach(function (m) {
          var bm = sbMakeButton(m[1], sbConfig.closed === m[0] ? "#1976d2" : "#455a64", function () { sbSetClosedLook(m[0]); });
          bm.style.minHeight = "32px";
          cerr.appendChild(bm);
        });
        items.appendChild(cerr);
        items.appendChild(sbText(i18nT('order.rail_a_narrow_strip_of_icons'), hint));
        row(i18nT('order.automatic_collapse'), sbConfig.autoClose, false, function (v) {
          sbConfig.autoClose = v;
          sbConfigSave();
        });
        items.appendChild(sbText(i18nT('order.on_the_bar_closes_by_itself'), hint));
        row(i18nT('order.push_page'), sbConfig.pushPage, false, sbSetPushPage);
        items.appendChild(sbText(i18nT('order.push_page_hint'), hint));
        // these two options show the status of the Lights plugin: no rows without it
        if (typeof ledLightsActive === "function" ? ledLightsActive() : true) {
          sbConfigShowRow(row, i18nT('order.status_lights_at_the_top_of'), "withoutLeds", function () { if (typeof ledMirrorApply === "function") ledMirrorApply(); });
          sbConfigShowRow(row, i18nT('order.state_on_the_arrow'), "withoutArrow", function () { if (typeof ledMirrorApply === "function") ledMirrorApply(); });
        }
        sbConfigShowRow(row, i18nT('order.live_stop_on_the_bar'), "withoutLiveStop", function () { if (typeof sbLiveStopRefresh === "function") sbLiveStopRefresh(); });
        row(i18nT('order.compact_no_explanation_texts'), sbConfig.compact, false, function (v) {
          sbConfig.compact = v;
          sbConfigSave();
          sbConfigApply();
        });
        row(i18nT('order.collapsible_cards_tap_the_title'), sbConfig.collapsible, false, function (v) {
          sbConfig.collapsible = v;
          sbConfigSave();
          sbConfigApply();
        });
        // secciones propias: crear, renombrar, quitar
        items.appendChild(sbText(i18nT('order.custom_sections'), "font-size:12px;font-weight:bold;margin-top:6px;"));
        sbConfig.sections.forEach(function (sec) {
          var f = document.createElement("div");
          f.style.cssText = "display:flex;gap:6px;align-items:center;";
          var inp = document.createElement("input");
          inp.value = sec.name;
          inp.maxLength = 24;
          inp.style.cssText = "flex:1;min-width:0;padding:4px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.3);background:#1e272c;color:#fff;font-size:12px;";
          inp.addEventListener("change", function () {
            sec.name = inp.value.trim() || sec.name;
            sbConfigSave();
            sbConfigApply();
          });
          f.appendChild(inp);
          var x = sbMakeButton(i18nT('common.remove'), "#5d4037", function () {
            sbConfig.sections = sbConfig.sections.filter(function (q) {
              return q !== sec;
            });
            Object.keys(sbConfig.location).forEach(function (k) {
              if (sbConfig.location[k] === sec.id) delete sbConfig.location[k];
            });
            sbConfigSave();
            sbConfigApply();
            sbConfigRender();
          });
          x.style.flex = "none";
          f.appendChild(x);
          items.appendChild(f);
        });
        var nueva = document.createElement("div");
        nueva.style.cssText = "display:flex;gap:6px;align-items:center;";
        var nameNew = document.createElement("input");
        nameNew.placeholder = i18nT('order.section_name');
        nameNew.maxLength = 24;
        nameNew.style.cssText = "flex:1;min-width:0;padding:4px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.3);background:#1e272c;color:#fff;font-size:12px;";
        nueva.appendChild(nameNew);
        var crear = sbMakeButton(i18nT('order.section'), "#455a64", function () {
          var n = nameNew.value.trim();
          if (!n) {
            nameNew.focus();
            return;
          }
          var k = 1;
          while (sbConfig.sections.some(function (q) { return q.id === "s" + k; })) k++;
          sbConfig.sections.push({ id: "s" + k, name: n });
          sbConfigSave();
          sbConfigApply();
          sbConfigRender();
        });
        crear.style.flex = "none";
        nueva.appendChild(crear);
        items.appendChild(nueva);
        items.appendChild(
          sbText(
            sbConfig.sections.length
              ? i18nT('order.choose_the_section_of_each_card')
              : i18nT('order.only_the_name_is_needed_the'),
            "font-size:11px;color:rgba(255,255,255,0.6);"
          )
        );
        var actions = document.createElement("div");
        actions.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;";
        box.appendChild(actions);
        actions.appendChild(
          sbMakeButton(i18nT('order.arrange_cards'), "#455a64", function () {
            sbConfigOpen(false);
            sbSetOrdering(true);
          })
        );
        actions.appendChild(
          sbMakeButton(i18nT('order.show_all'), "#455a64", function () {
            sbConfig = JSON.parse(JSON.stringify(SB_CONFIG_EMPTY));
            sbConfigSave();
            sbConfigApply();
            sbConfigRender();
            if (typeof ledMirrorApply === "function") ledMirrorApply();
          })
        );
        actions.appendChild(
          sbMakeButton(i18nT('common.close'), "#2e7d32", function () {
            sbConfigOpen(false);
          })
        );
      }

      function sbConfigOpen(on) {
        if (!sb.configBox) return;
        if (on && sbOrdering) sbSetOrdering(false);
        sb.configBox.style.display = on ? "flex" : "none";
        if (sb.gearBtn) sb.gearBtn.style.background = on ? "#1565c0" : "#37474f";
        if (on) {
          sbConfigRender();
          if (sb.full && sb.full.parentElement) sb.full.parentElement.scrollTop = 0;
        }
      }
