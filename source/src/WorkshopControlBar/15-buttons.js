      // ---- Own buttons (replacement for BtnCmd) ----
      //
      // Request 2026-10-08: BtnCmd was freezing (it could not be restarted, its gear
      // did not show up) and was uninstalled; its buttons now live in
      // the bar and are DYNAMIC: they are created, edited, ordered and deleted from
      // the bar itself, without touching code.
      //
      // v2 (same day): GROUPED BY FUNCTION. Each group is a card
      // like "Shutdown" -- icon + title, its buttons and a
      // description -- and it FOLDS by tapping the title, to leave open
      // only those most used. What is folded belongs to THIS screen
      // (localStorage); the groups and buttons belong to the Pi.
      //
      // File 0:/sys/workshop/config/buttons.json:
      //   {version: 2, grupos: [{id, titulo, icono, descripcion, botones: [...]}]}
      // Each button: {label, tipo: "macro"|"gcode", accion, color,
      //   modos: [] (empty = all) or ["FFF","Laser","CNC"],
      //   confirmar: double tap before executing,
      //   enTrabajo: whether it can be used with a job in progress}.
      // Outside its mode (state.machineMode) or during a job (if
      // enTrabajo is false) the button is DISABLED, with the reason in the
      // tooltip. v1 (a flat array of buttons) is converted by itself.
      var BUTTONS_FILE = "0:/sys/workshop/config/buttons.json";
      var BUTTONS_COLLAPSED_KEY = "workshopButtonsCollapsed";
      var BUTTONS_MODES = ["FFF", "Laser", "CNC"];

      // Icons to choose from in each group (besides those of SB_ICONS).
      var BTN_GROUP_ICONS = {
        light: '<path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>',
        laser: '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>',
        air: '<path d="M14.5 17c0 1.65-1.35 3-3 3s-3-1.35-3-3h2c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1H2v-2h9.5c1.65 0 3 1.35 3 3zM19 6.5C19 4.57 17.43 3 15.5 3S12 4.57 12 6.5h2c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S16.33 8 15.5 8H2v2h13.5c1.93 0 3.5-1.57 3.5-3.5zm-.5 4.5H2v2h16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5v2c1.93 0 3.5-1.57 3.5-3.5S20.43 11 18.5 11z"/>',
        crosshair: '<path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>',
        gear: '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>',
        plug: '<path d="M16 7V3h-2v4h-4V3H8v4h-.01C6.9 7 6 7.9 6 8.99v5.49L9.5 18v3h5v-3l3.5-3.51v-5.5c0-1.1-.9-1.99-2-1.99z"/>',
        chart: '<path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/>',
        star: '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
        grid: null, // de SB_ICONS
        power: null,
        timer: null,
      };
      var BTN_ICON_NAMES = {
        light: i18nT('buttons.icon_light'),
        laser: "Laser",
        air: i18nT('buttons.icon_air'),
        crosshair: i18nT('buttons.icon_crosshair_zero'),
        gear: i18nT('buttons.icon_gear'),
        plug: i18nT('buttons.icon_plug'),
        chart: i18nT('buttons.icon_chart'),
        star: i18nT('buttons.icon_star'),
        grid: i18nT('buttons.icon_grid'),
        power: i18nT('buttons.icon_power'),
        timer: i18nT('buttons.icon_clock'),
      };
      function btnIconSvg(name, size) {
        return sbIconSvg(BTN_GROUP_ICONS[name] || SB_ICONS[name] || SB_ICONS.grid, size, false);
      }

      // ---- State of the FUNCTION (on / off) ----
      // Request 2026-10-08: "active = if the button's function is active"
      // (light on, air on, current mode, supply on). Each
      // button can have `estado: {ruta, valor}`: that path of the
      // object model (/machine/status) is looked at and if it equals `valor` the button looks
      // ON (white border, green dot, "ACTIVE"). This way a
      // Light ON / Light OFF pair works like a switch: the one that
      // corresponds to the real state lights up.
      var PCC = "plugins.WorkshopService.data.";
      var BTN_STATES = {
        lightOn: { label: i18nT('buttons.light_on'), path: PCC + "lightOn", value: true },
        lightOff: { label: i18nT('buttons.light_off'), path: PCC + "lightOn", value: false },
        statusOn: { label: i18nT('buttons.automatic_status_lights'), path: PCC + "statusLightAuto", value: true },
        statusOff: { label: i18nT('buttons.status_lights_off'), path: PCC + "statusLightAuto", value: false },
        airOn: { label: i18nT('buttons.air_on'), path: PCC + "airAssist", value: true },
        airOff: { label: i18nT('buttons.air_off'), path: PCC + "airAssist", value: false },
        psuOn: { label: i18nT('buttons.power_supply_on'), path: "state.atxPower", value: true },
        psuOff: { label: i18nT('buttons.power_supply_off'), path: "state.atxPower", value: false },
        modeLaser: { label: i18nT('buttons.laser_mode'), path: "state.machineMode", value: "Laser" },
        modeCnc: { label: i18nT('buttons.cnc_mode'), path: "state.machineMode", value: "CNC" },
        modeFff: { label: i18nT('buttons.fff_mode'), path: "state.machineMode", value: "FFF" },
      };
      var BTN_STATE_BY_MACRO = {
        "light/light_on_sync.g": "lightOn",
        "light/light_off_sync.g": "lightOff",
        "light/statuslight_on.g": "statusOn",
        "light/statuslight_off.g": "statusOff",
        "laser/air_on_sync.g": "airOn",
        "laser/air_off_sync.g": "airOff",
        "psu/start.g": "psuOn",
        "psu/stop.g": "psuOff",
        "mode/selectlaser.g": "modeLaser",
        "mode/selectcnc.g": "modeCnc",
        "mode/selectfff.g": "modeFff",
      };
      var btnLastStatus = null;
      // What LED state an ON button represents: an own state
      // ("aire") or the whole strip ("tira": automatic lights, current mode).
      var BTN_LED = { airOn: "air", statusOn: "led_strip", modeLaser: "led_strip", modeCnc: "led_strip", modeFff: "led_strip" };

      function btnLedOf(b) {
        if (!b.state) return null;
        for (var k in BTN_STATES) {
          var e = BTN_STATES[k];
          if (BTN_LED[k] && e.path === b.state.path && String(e.value) === String(b.state.value)) return BTN_LED[k];
        }
        return null;
      }

      function btnStateFrom(key) {
        var e = BTN_STATES[key];
        return e ? { path: e.path, value: e.value } : null;
      }

      // true / false / null (sin estado o dato todavia desconocido)
      function btnState(b) {
        if (!b.state || !btnLastStatus) return null;
        var v = workshopReadPath(btnLastStatus, b.state.path); // Id del servicio nuevo o viejo
        if (v === undefined || v === null) return null;
        return String(v) === String(b.state.value);
      }

      // Mode buttons with the color assigned to each mode in Lights (2026-10-10,
      // request: "the colors of the mode buttons must match their
      // assigned color"). The Pi publishes statusLightModoColores {Laser, CNC,
      // FFF: "#rrggbb"}; without that data the button's color stays.
      var BTN_MODE_BY_MACRO = { "mode/selectlaser.g": "Laser", "mode/selectcnc.g": "CNC", "mode/selectfff.g": "FFF" };
      function btnModeColors() {
        var pd0 = btnLastStatus && workshopPluginOf(btnLastStatus.plugins, "service");
        var d = workshopPluginData(pd0);
        return (d && d.statusLightModeColors) || {};
      }
      function btnColor(b) {
        if (b.kind === "macro") {
          var mode = BTN_MODE_BY_MACRO[String(b.action || "").replace(/^\/+/, "")];
          var c = mode && btnModeColors()[mode];
          if (/^#[0-9a-fA-F]{6}$/.test(c || "")) return workshopColorScreen(c, "fill");
        }
        // version de pantalla (DESIGN.md 2): mismo tono, sin colores chillones
        return workshopColorScreen(b.color, "fill");
      }
      // black text on light colours (e.g. green #00ff00), white otherwise
      function btnTextOver(hex) {
        var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || "");
        if (!m) return "#fff";
        var l = 0.299 * parseInt(m[1], 16) + 0.587 * parseInt(m[2], 16) + 0.114 * parseInt(m[3], 16);
        return l > 160 ? "#111" : "#fff";
      }

      function btnB(label, action, color, modes, confirmar, inJob) {
        return { label: label, kind: "macro", action: action, color: color, modes: modes || [], confirm: !!confirmar, inJob: inJob !== false };
      }
      // Startup groups (the buttons BtnCmd had, by function).
      var BUTTONS_INITIAL = {
        version: 2,
        groups: [
          {
            id: "lights", title: i18nT('buttons.lighting'), icon: "light",
            description: i18nT('buttons.lighting_desc'),
            buttons: [
              btnB(i18nT('buttons.light_on_btn'), "light/light_on_sync.g", "#2e7d32"),
              btnB(i18nT('buttons.light_off_btn'), "light/light_off_sync.g", "#757575"),
              btnB("Status ON", "light/statuslight_on.g", "#5c6bc0"),
              btnB("Status OFF", "light/statuslight_off.g", "#90a4ae"),
            ],
          },
          {
            id: "laser", title: i18nT('buttons.laser'), icon: "laser",
            description: i18nT('buttons.laser_desc'),
            buttons: [btnB(i18nT('buttons.air_on_btn'), "laser/air_on_sync.g", "#00bcd4", ["Laser"]), btnB(i18nT('buttons.air_off_btn'), "laser/air_off_sync.g", "#607d8b", ["Laser"])],
          },
          {
            id: "cnc", title: i18nT('buttons.cnc_zero'), icon: "crosshair",
            description: i18nT('buttons.cnc_zero_desc'),
            buttons: [
              btnB(i18nT('buttons.set_zero'), "cnc/setzero.g", "#3f51b5", ["CNC"], false, false),
              btnB(i18nT('buttons.capture_zero'), "cnc/capturezero.g", "#00897b", ["CNC"], true, false),
            ],
          },
          {
            id: "mode", title: i18nT('buttons.machine_mode'), icon: "gear",
            description: i18nT('buttons.machine_mode_desc'),
            buttons: [
              btnB(i18nT('buttons.laser_mode'), "mode/selectlaser.g", "#ff5722", ["FFF", "CNC"], true, false),
              btnB(i18nT('buttons.cnc_mode'), "mode/selectcnc.g", "#1976d2", ["FFF", "Laser"], true, false),
              btnB(i18nT('buttons.fff_mode'), "mode/selectfff.g", "#009688", ["Laser", "CNC"], true, false),
            ],
          },
          {
            id: "source", title: i18nT('buttons.power_supply_and_restart'), icon: "plug",
            description: i18nT('buttons.power_supply_and_restart_desc'),
            buttons: [
              btnB("PSU Start", "psu/start.g", "#2e7d32"),
              btnB("PSU Stop", "psu/stop.g", "#c62828", [], true, false),
              btnB(i18nT('sidebar.restart_everything'), "power/full-reset.g", "#5e35b1", [], true, false),
            ],
          },
          {
            id: "consumption", title: i18nT('buttons.power_usage'), icon: "chart",
            description: i18nT('buttons.power_usage_desc'),
            buttons: [
              btnB(i18nT('common.refresh'), "power/consumption.g", "#0288d1"),
              btnB(i18nT('buttons.report'), "power/consumption_report.g", "#2e7d32"),
              btnB(i18nT('buttons.monthly_report'), "power/consumption_report_month.g", "#2e7d32"),
              btnB(i18nT('buttons.yearly_report'), "power/consumption_report_year.g", "#2e7d32"),
            ],
          },
        ],
      };

      // The factory groups without the buttons that point to a macro this machine does not have (the macros are
      // the user's: each machine has its own). A group left empty is not created.
      function btnInitialExisting() {
        var d = JSON.parse(JSON.stringify(BUTTONS_INITIAL));
        var checks = [];
        d.groups.forEach(function (g) {
          g.buttons.forEach(function (b) {
            checks.push(
              fetch("/machine/file/" + encodeURI("0:/macros/" + String(b.action).replace(/^\/+/, "")), { cache: "no-store" })
                // a macro that is only the example (every line commented) does nothing yet: no button for it
                .then(function (r) { return r.ok ? r.text() : null; })
                .then(function (txt) {
                  b._exists = txt !== null && txt.split(/\r?\n/).some(function (l) { var t = l.trim(); return t && t.charAt(0) !== ";"; });
                })
                .catch(function () { b._exists = false; })
            );
          });
        });
        return Promise.all(checks).then(function () {
          d.groups.forEach(function (g) {
            g.buttons = g.buttons.filter(function (b) { return b._exists; });
            g.buttons.forEach(function (b) { delete b._exists; });
          });
          d.groups = d.groups.filter(function (g) { return g.buttons.length; });
          return d;
        });
      }

      var btnLastRaw = ""; // last content read/saved (to not redraw without changes)
      var btnData = null; // {version, grupos} -- null = todavia no se leyo
      var btnLoadError = "";
      var btnMsg = "";
      var btnSendSeq = 0; // ultimo envio (un mensaje viejo no pisa al nuevo)
      var btnMsgGroup = null; // id of the group where to show btnMsg
      var btnEditing = false;
      // {kind: "btn"|"grupo", g: indice de grupo (-1 = nuevo grupo), i: indice de boton (-1 = nuevo), data}
      var btnForm = null;
      var btnArmed = ""; // key of the button waiting for the second tap
      var btnArmTimer = null;
      var btnMachineMode = null;
      var btnMacroList = null; // rutas relativas a 0:/macros (para elegir)
      var btnCollapsed = {};
      try {
        btnCollapsed = JSON.parse(localStorage.getItem(BUTTONS_COLLAPSED_KEY) || "{}") || {};
      } catch (e) {
        btnCollapsed = {};
      }

      function btnSaveCollapsed() {
        try {
          localStorage.setItem(BUTTONS_COLLAPSED_KEY, JSON.stringify(btnCollapsed));
        } catch (e) {
          /* no critico */
        }
      }

      function btnNormalize(b) {
        var modes = Array.isArray(b && b.modes)
          ? b.modes.filter(function (m) {
              return BUTTONS_MODES.indexOf(m) >= 0;
            })
          : [];
        return {
          label: workshopDefaultName(b && b.label, BTN_LABEL_KEYS).slice(0, 40),
          kind: b && b.kind === "gcode" ? "gcode" : "macro",
          action: String((b && b.action) || ""),
          color: /^#[0-9a-fA-F]{6}$/.test((b && b.color) || "") ? b.color : "#455a64",
          modes: modes.length === BUTTONS_MODES.length ? [] : modes,
          confirm: !!(b && b.confirm),
          inJob: !(b && b.inJob === false),
          // without the key (old buttons): the known state of its macro;
          // explicit null = "no state" chosen by hand.
          state:
            b && b.state === undefined
              ? btnStateFrom(BTN_STATE_BY_MACRO[String(b.action || "")])
              : b && b.state && typeof b.state.path === "string" && b.state.path
              ? { path: b.state.path, value: b.state.value }
              : null,
        };
      }

      function btnNewId() {
        return "g" + Date.now().toString(36) + Math.floor(Math.random() * 1000);
      }

      function btnNormalizeGroup(g) {
        return {
          id: String((g && g.id) || btnNewId()),
          title: workshopDefaultName(g && g.title, BTN_TITLE_KEYS).slice(0, 40),
          icon: g && Object.prototype.hasOwnProperty.call(BTN_ICON_NAMES, g.icon) ? g.icon : "grid",
          description: (g && g.description ? workshopDefaultName(g.description, BTN_DESCRIPTION_KEYS) : "").slice(0, 400),
          buttons: (Array.isArray(g && g.buttons) ? g.buttons : []).map(btnNormalize),
        };
      }

      // force: draw even if the file did not change (BUG 2026-10-08:
      // "Edit buttons does nothing" -- entering edit reread the file
      // and, since it had not changed, nothing was redrawn).
      function btnLoad(force) {
        return fetch("/machine/file/" + encodeURI(BUTTONS_FILE) + "?_=" + Date.now(), { cache: "no-store" })
          .then(function (r) {
            if (r.status === 404) return null;
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
          })
          .then(function (d) {
            // first time: the factory groups, but ONLY with the buttons whose macro file exists on this SD
            if (d === null) return btnInitialExisting().then(function (ini) { return { d: ini, migrated: true }; });
            return { d: d, migrated: false };
          })
          .then(function (o) {
            var d = o.d;
            btnLoadError = "";
            var migrated = o.migrated;
            var raw = JSON.stringify(d);
            if (!migrated && raw === btnLastRaw && btnData) return "same"; // sin cambios: no re-dibujar
            btnLastRaw = raw;
            btnData = { version: 2, groups: (Array.isArray(d.groups) ? d.groups : []).map(btnNormalizeGroup) };
            if (migrated) return btnSave();
          })
          .catch(function (e) {
            btnLoadError = i18nT(/^HTTP \d+/.test(String(e && e.message)) ? 'buttons.could_not_read_the_buttons' : 'buttons.could_not_read_the_buttons_reply', { error: e.message }); // a transport failure never shows the browser's wording
            if (btnData === null) btnData = { version: 2, groups: [] };
          })
          .then(function (r) {
            if (force || r !== "same") btnRender();
          });
      }

      function btnSave() {
        btnLastRaw = JSON.stringify(btnData);
        return fetch("/machine/file/" + encodeURI(BUTTONS_FILE), {
          method: "PUT",
          headers: { "Content-Type": "application/octet-stream" },
          body: JSON.stringify(btnData, null, 1),
        })
          .then(function (r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
          })
          .catch(function (e) {
            btnMsg = i18nT('buttons.error_saving_the_buttons', { error: e.message });
            btnMsgGroup = null;
          })
          .then(btnRender);
      }

      // List of macros to choose from in the form (recursive, without .bak).
      function btnLoadMacros() {
        var out = [];
        function walk(dir) {
          return fetch("/machine/directory/" + encodeURI("0:/macros/" + dir), { cache: "no-store" })
            .then(function (r) {
              return r.ok ? r.json() : [];
            })
            .then(function (items) {
              var subs = [];
              items.forEach(function (it) {
                var p = dir + it.name;
                if (it.type === "d") subs.push(walk(p + "/"));
                else if (/\.g$/i.test(it.name)) out.push(p);
              });
              return Promise.all(subs);
            })
            .catch(function () {});
        }
        return walk("").then(function () {
          btnMacroList = out.sort();
          btnRender();
        });
      }

      function btnJobRunning() {
        return (
          sbMachineStatus === "processing" ||
          sbMachineStatus === "paused" ||
          sbMachineStatus === "pausing" ||
          sbMachineStatus === "resuming" ||
          sbMachineStatus === "simulating"
        );
      }

      // Reason why the button can NOT be used now ("" = it can).
      function btnBlockReason(b) {
        if (b.modes.length && btnMachineMode && b.modes.indexOf(btnMachineMode) < 0)
          return i18nT('buttons.only_in_mode_now', { modes: b.modes.join(" / "), mode: btnMachineMode });
        if (!b.inJob && btnJobRunning()) return i18nT('buttons.not_available_with_a_job_running');
        // Motion audit (findings 5 and 7): the "not in a job" buttons
        // (Set/Capture Zero, mode, PSU Stop...) also with a live job
        // and with a paused job. Zero and mode, besides, with the
        // machine busy. Restart everything keeps working with the board
        // halted (it is the exit from a halted).
        if (!b.inJob && typeof workshopMachineFree === "function") {
          var cambiaGeometria = b.kind === "macro" && /^\/*(cnc|mode)\//i.test(b.action || "");
          var ml = workshopMachineFree(undefined, { purpose: "settings", allowBusy: !cambiaGeometria });
          if (!ml.free && (ml.code === "file" || ml.code === "paused" || ml.code === "live" || (cambiaGeometria && ml.code === "busy")))
            return ml.reason;
        }
        if (!b.action) return i18nT('buttons.no_action_configured');
        return "";
      }

      // Doble toque generico: devuelve true si ya estaba armado (ejecutar).
      function btnArm(key) {
        if (btnArmed === key) {
          clearTimeout(btnArmTimer);
          btnArmed = "";
          return true;
        }
        btnArmed = key;
        clearTimeout(btnArmTimer);
        btnArmTimer = setTimeout(function () {
          btnArmed = "";
          btnRender();
        }, 4000);
        btnRender();
        return false;
      }

      function btnRun(gi, i) {
        var g = btnData.groups[gi];
        var b = g && g.buttons[i];
        if (!b) return;
        var block = btnBlockReason(b); // it is looked at again on tap: the drawing may be a few seconds old
        if (block) {
          btnMsg = b.label + ": " + block;
          btnMsgGroup = g.id;
          btnRender();
          return;
        }
        if (b.confirm && !btnArm("run:" + gi + ":" + i)) return;
        var code = b.kind === "macro" ? 'M98 P"0:/macros/' + b.action.replace(/^\/+/, "") + '"' : b.action;
        btnMsg = b.label + i18nT('buttons.sent');
        btnMsgGroup = g.id;
        btnRender();
        // Request 2026-10-09 ("air off from the buttons stayed on
        // sending"): if the response does not arrive (machine busy, DSF stuck)
        // the message cannot stay on "sent..." forever.
        var seq = ++btnSendSeq;
        var slow = setTimeout(function () {
          if (seq !== btnSendSeq) return;
          btnMsg = i18nT('buttons.no_response_in_15_s', { label: b.label });
          btnRender();
        }, 15000);
        postCode(code)
          .then(function (r) {
            return r.text();
          })
          .then(function (txt) {
            txt = String(txt || "").trim();
            if (seq === btnSendSeq) btnMsg = b.label + ": " + (txt ? txt.slice(0, 160) : i18nT('buttons.done_lower'));
          })
          .catch(function (e) {
            if (seq === btnSendSeq) btnMsg = i18nT('buttons.label_error', { label: b.label, error: String(e) });
          })
          .then(function () {
            clearTimeout(slow);
            btnRender();
          });
      }

      function btnEl(tag, css, text) {
        var e = document.createElement(tag);
        if (css) e.style.cssText = css;
        if (text != null) e.textContent = text;
        return e;
      }

      var BTN_INPUT_CSS =
        "width:100%;max-width:100%;min-width:0;box-sizing:border-box;background:#263238;color:#fff;border:1px solid rgba(255,255,255,0.35);border-radius:4px;padding:5px;font-size:12px;";

      function btnSmall(label, bg, onClick) {
        var b = sbMakeButton(label, bg, onClick);
        b.style.flex = "none";
        b.style.minHeight = "28px";
        b.style.padding = "3px 7px";
        b.style.fontSize = "11px";
        return b;
      }

      function btnFormBox(title) {
        var form = btnEl("div", "display:flex;flex-direction:column;gap:6px;padding:8px;border:1px solid rgba(255,255,255,0.3);border-radius:6px;background:rgba(255,255,255,0.05);");
        form.appendChild(btnEl("div", "font-size:12px;font-weight:bold;", title));
        form._field = function (label, input) {
          var d = btnEl("div", "display:flex;flex-direction:column;gap:2px;");
          d.appendChild(btnEl("label", "font-size:11px;color:rgba(255,255,255,0.75);", label));
          d.appendChild(input);
          form.appendChild(d);
        };
        return form;
      }

      function btnTextInput(obj, key, max, multiline) {
        var inp = btnEl(multiline ? "textarea" : "input", BTN_INPUT_CSS + (multiline ? "min-height:54px;" : ""));
        inp.value = obj[key] || "";
        if (max) inp.maxLength = max;
        inp.addEventListener("input", function () {
          obj[key] = inp.value;
        });
        return inp;
      }

      function btnFormButtons(form, onSave) {
        var err = btnEl("div", "font-size:11px;color:#ef9a9a;");
        form.appendChild(err);
        var row = btnEl("div", "display:flex;gap:6px;flex-wrap:wrap;");
        row.appendChild(
          sbMakeButton(i18nT('common.save'), "#2e7d32", function () {
            var e = onSave();
            if (e) err.textContent = e;
          })
        );
        row.appendChild(
          sbMakeButton(i18nT('common.cancel'), "#455a64", function () {
            btnForm = null;
            btnRender();
          })
        );
        form.appendChild(row);
      }

      function btnRenderGroupForm(box) {
        var f = btnForm.data;
        var form = btnFormBox(btnForm.g < 0 ? i18nT('buttons.new_group') : i18nT('buttons.edit_group'));
        form._field(i18nT('buttons.title'), btnTextInput(f, "title", 40));
        var sel = btnEl("select", BTN_INPUT_CSS);
        Object.keys(BTN_ICON_NAMES).forEach(function (k) {
          var op = btnEl("option", null, BTN_ICON_NAMES[k]);
          op.value = k;
          if (k === f.icon) op.selected = true;
          sel.appendChild(op);
        });
        var prev = btnEl("span", "display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;flex:none;");
        sbH(prev, btnIconSvg(f.icon, 20));
        sel.addEventListener("change", function () {
          f.icon = sel.value;
          sbH(prev, btnIconSvg(f.icon, 20));
        });
        var iconRow = btnEl("div", "display:flex;align-items:center;gap:6px;");
        iconRow.appendChild(prev);
        sel.style.flex = "1 1 auto";
        sel.style.width = "auto";
        iconRow.appendChild(sel);
        form._field(i18nT('buttons.icon'), iconRow);
        form._field(i18nT('buttons.description_shown_below'), btnTextInput(f, "description", 400, true));
        btnFormButtons(form, function () {
          if (!String(f.title).trim()) return i18nT('buttons.the_title_is_missing');
          var g = btnNormalizeGroup(f);
          if (btnForm.g < 0) {
            btnData.groups.push(g);
            // created from its own section: it goes to that section (on this screen)
            if (btnForm.sec) {
              sbConfig.location["grp:" + g.id] = btnForm.sec;
              sbConfigSave();
            }
          } else {
            g.buttons = btnData.groups[btnForm.g].buttons;
            btnData.groups[btnForm.g] = g;
          }
          btnForm = null;
          btnSave();
        });
        box.appendChild(form);
      }

      function btnRenderButtonForm(box) {
        var f = btnForm.data;
        var form = btnFormBox(btnForm.i < 0 ? i18nT('buttons.new_button') : i18nT('buttons.edit_button'));
        form._field(i18nT('buttons.button_text'), btnTextInput(f, "label", 40));

        var selG = btnEl("select", BTN_INPUT_CSS);
        btnData.groups.forEach(function (g, gi) {
          var op = btnEl("option", null, g.title);
          op.value = gi;
          if (gi === f._group) op.selected = true;
          selG.appendChild(op);
        });
        selG.addEventListener("change", function () {
          f._group = parseInt(selG.value, 10);
        });
        form._field(i18nT('buttons.group'), selG);

        var selKind = btnEl("select", BTN_INPUT_CSS);
        [["macro", i18nT('buttons.run_a_macro')], ["gcode", i18nT('buttons.send_g_code')]].forEach(function (o) {
          var op = btnEl("option", null, o[1]);
          op.value = o[0];
          if (f.kind === o[0]) op.selected = true;
          selKind.appendChild(op);
        });
        selKind.addEventListener("change", function () {
          f.kind = selKind.value;
          btnRender();
        });
        form._field(i18nT('buttons.what_it_does'), selKind);

        if (f.kind === "macro") {
          var inAction = btnEl("select", BTN_INPUT_CSS);
          var list = (btnMacroList || []).slice();
          if (f.action && list.indexOf(f.action) < 0) list.unshift(f.action);
          var op0 = btnEl("option", null, btnMacroList ? i18nT('buttons.choose_macro') : i18nT('buttons.loading_macros'));
          op0.value = "";
          inAction.appendChild(op0);
          list.forEach(function (p) {
            var op = btnEl("option", null, p);
            op.value = p;
            if (p === f.action) op.selected = true;
            inAction.appendChild(op);
          });
          inAction.addEventListener("change", function () {
            f.action = inAction.value;
          });
          form._field(i18nT('buttons.macro_macros_folder'), inAction);
        } else {
          var ta = btnTextInput(f, "action", 0, true);
          ta.style.fontFamily = "monospace";
          ta.placeholder = i18nT('buttons.eg_m106');
          form._field(i18nT('buttons.g_code_one_or_more_lines'), ta);
        }

        var inColor = btnEl("input", "width:60px;height:30px;padding:0;border:none;background:none;");
        inColor.type = "color";
        inColor.value = f.color;
        inColor.addEventListener("input", function () {
          f.color = inColor.value;
        });
        form._field(i18nT('buttons.color'), inColor);

        var modesRow = btnEl("div", "display:flex;gap:10px;flex-wrap:wrap;font-size:12px;");
        BUTTONS_MODES.forEach(function (m) {
          var l = btnEl("label", "display:flex;align-items:center;gap:4px;");
          var cb = btnEl("input");
          cb.type = "checkbox";
          cb.value = m;
          cb.checked = !f.modes.length || f.modes.indexOf(m) >= 0;
          l.appendChild(cb);
          l.appendChild(document.createTextNode(m));
          modesRow.appendChild(l);
        });
        form._field(i18nT('buttons.active_in_modes_help'), modesRow);

        // Estado: cuando mostrarlo ENCENDIDO (ver BTN_STATES)
        var selE = btnEl("select", BTN_INPUT_CSS);
        var curKey = "";
        if (f.state) {
          curKey = "custom";
          Object.keys(BTN_STATES).forEach(function (k) {
            if (BTN_STATES[k].path === f.state.path && String(BTN_STATES[k].value) === String(f.state.value)) curKey = k;
          });
        }
        if (f._custom) curKey = "custom";
        [["", i18nT('buttons.never_no_state')]]
          .concat(
            Object.keys(BTN_STATES).map(function (k) {
              return [k, BTN_STATES[k].label];
            })
          )
          .concat([["custom", i18nT('buttons.custom_object_model_path')]])
          .forEach(function (o) {
            var op = btnEl("option", null, o[1]);
            op.value = o[0];
            if (o[0] === curKey) op.selected = true;
            selE.appendChild(op);
          });
        selE.addEventListener("change", function () {
          if (selE.value === "custom") {
            f.state = f.state || { path: "", value: "" };
            f._custom = true;
          } else {
            f.state = btnStateFrom(selE.value);
            delete f._custom;
          }
          btnRender();
        });
        form._field(i18nT('buttons.shown_on_active_when'), selE);
        if (curKey === "custom") {
          if (!f.state) f.state = { path: "", value: "" };
          var cr = btnTextInput(f.state, "path", 120);
          cr.placeholder = i18nT('buttons.eg_path');
          form._field(i18nT('buttons.path'), cr);
          var cv = btnEl("input", BTN_INPUT_CSS);
          cv.value = f.state.value === undefined ? "" : String(f.state.value);
          cv.placeholder = i18nT('buttons.eg_value');
          cv.addEventListener("input", function () {
            var t = cv.value.trim();
            f.state.value = t === "true" ? true : t === "false" ? false : t !== "" && !isNaN(Number(t)) ? Number(t) : t;
          });
          form._field(i18nT('buttons.value_that_means_on'), cv);
        }

        [["confirm", i18nT('buttons.ask_for_confirmation_double_tap')], ["inJob", i18nT('buttons.can_be_used_with_a_job_running')]].forEach(function (o) {
          var l = btnEl("label", "display:flex;align-items:center;gap:6px;font-size:12px;");
          var cb = btnEl("input");
          cb.type = "checkbox";
          cb.checked = !!f[o[0]];
          cb.addEventListener("change", function () {
            f[o[0]] = cb.checked;
          });
          l.appendChild(cb);
          l.appendChild(document.createTextNode(o[1]));
          form.appendChild(l);
        });

        btnFormButtons(form, function () {
          if (!String(f.label).trim()) return i18nT('buttons.the_button_text_is_missing');
          if (f.state && !String(f.state.path || "").trim()) f.state = null;
          if (!String(f.action).trim()) return f.kind === "macro" ? i18nT('buttons.choose_a_macro') : i18nT('buttons.the_g_code_is_missing');
          var marcados = Array.prototype.map.call(modesRow.querySelectorAll("input:checked"), function (c) {
            return c.value;
          });
          if (!marcados.length) return i18nT('buttons.tick_at_least_one_mode');
          f.modes = marcados;
          var b = btnNormalize(f);
          var dest = btnData.groups[f._group] || btnData.groups[btnForm.g];
          if (btnForm.i >= 0 && f._group === btnForm.g) dest.buttons[btnForm.i] = b;
          else {
            if (btnForm.i >= 0) btnData.groups[btnForm.g].buttons.splice(btnForm.i, 1); // se mudo de grupo
            dest.buttons.push(b);
          }
          btnForm = null;
          btnSave();
        });
        box.appendChild(form);
      }

      // Default modes of a NEW button: those of the group (if all its
      // buttons share the same modes, e.g. "Laser" -> Air), otherwise,
      // all. User's question 2026-10-08: "how do the new buttons know
      // which mode they apply to" -- they are chosen in the form
      // ("Active in the modes"); this only pre-marks the most likely.
      function btnGroupDefaultModes(g) {
        if (!g || !g.buttons.length) return [];
        var first = JSON.stringify(g.buttons[0].modes);
        for (var k = 1; k < g.buttons.length; k++) if (JSON.stringify(g.buttons[k].modes) !== first) return [];
        return g.buttons[0].modes.slice();
      }

      function btnOpenButtonForm(gi, i) {
        var src =
          i >= 0
            ? btnData.groups[gi].buttons[i]
            : { label: "", kind: "macro", action: "", color: "#455a64", modes: btnGroupDefaultModes(btnData.groups[gi]), confirm: false, inJob: true };
        var data = JSON.parse(JSON.stringify(src));
        data._group = gi;
        btnForm = { kind: "btn", g: gi, i: i, data: data };
        btnCollapsed[btnData.groups[gi].id] = false;
        if (!btnMacroList) btnLoadMacros();
        btnRender();
      }

      // Short reason (second line of the disabled button).
      function btnShortReason(b) {
        if (b.modes.length && btnMachineMode && b.modes.indexOf(btnMachineMode) < 0) return i18nT('buttons.only_modes_short', { modes: b.modes.join("/") });
        if (!b.inJob && btnJobRunning()) return i18nT('buttons.not_with_a_job');
        if (!b.action) return i18nT('buttons.no_action');
        return "";
      }

      // ---- Drag to order (edit mode) ----
      // Request 2026-10-08: "drag in the sidebar to organize".
      // Each button row and each group header has a HANDLE (the little
      // stripes on the left): it is dragged from there (the rest of the
      // bar keeps scrolling with the finger). A button can be dropped
      // in another place of its group or in ANOTHER group; a group, between groups.
      // Near the top/bottom edge the bar scrolls by itself.
      var BTN_DRAG_HANDLE_SVG =
        '<path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>';
      var btnDrag = null;

      function btnMakeHandle(kind, gi, i, rowThe) {
        var h = btnEl("span", "flex:none;display:inline-flex;align-items:center;justify-content:center;width:26px;height:30px;border-radius:4px;background:rgba(255,255,255,0.1);color:#eceff1;cursor:grab;touch-action:none;");
        sbH(h, sbIconSvg(BTN_DRAG_HANDLE_SVG, 18, false));
        h.title = i18nT('order.drag_to_arrange');
        h.addEventListener("pointerdown", function (ev) {
          ev.stopPropagation();
          ev.preventDefault();
          btnDragStart(ev, kind, gi, i, rowThe);
        });
        h.addEventListener("click", function (ev) {
          ev.stopPropagation();
        });
        return h;
      }

      function btnDragStart(ev, kind, gi, i, rowThe) {
        if (btnDrag || btnForm) return;
        var r = rowThe.getBoundingClientRect();
        var ghost = rowThe.cloneNode(true);
        ghost.style.cssText +=
          ";position:fixed;left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;z-index:2147483647;opacity:0.85;pointer-events:none;box-shadow:0 4px 14px rgba(0,0,0,0.6);background:#455a64;border-radius:6px;";
        document.body.appendChild(ghost);
        var line = btnEl("div", "position:fixed;height:3px;background:#66bb6a;border-radius:4px;z-index:2147483647;pointer-events:none;display:none;");
        document.body.appendChild(line);
        rowThe.style.opacity = "0.3";
        btnDrag = { kind: kind, gi: gi, i: i, rowEl: rowThe, ghost: ghost, line: line, dy: ev.clientY - r.top, target: null, pid: ev.pointerId, lastY: ev.clientY, timer: null };
        window.addEventListener("pointermove", btnDragMove);
        window.addEventListener("pointerup", btnDragEnd);
        window.addEventListener("pointercancel", btnDragCancel);
        // auto-scroll while it is kept near the edge
        btnDrag.timer = setInterval(function () {
          if (!btnDrag) return;
          var sc = sb.full && sb.full.parentElement;
          if (!sc) return;
          var sr = sc.getBoundingClientRect();
          if (btnDrag.lastY < sr.top + 50) sc.scrollTop -= 12;
          else if (btnDrag.lastY > sr.bottom - 50) sc.scrollTop += 12;
          else return;
          btnDragLocate(btnDrag.lastY);
        }, 30);
      }

      // Finds where the dragged item would land at height y (screen
      // coordinate): {g, i} = insert BEFORE index i of group g (buttons)
      // or {g} = before group g (groups).
      function btnDragLocate(y) {
        var d = btnDrag;
        var sel = d.kind === "btn" ? "[data-btn-row]" : "[data-btn-group]";
        var items = Array.prototype.slice.call(btnZone().querySelectorAll(sel));
        var best = null;
        items.forEach(function (el) {
          var r = el.getBoundingClientRect();
          var before = y < r.top + r.height / 2;
          var cand = { el: el, before: before, r: r, dist: Math.abs(y - (r.top + r.height / 2)) };
          if (!best || cand.dist < best.dist) best = cand;
        });
        // Button over an EMPTY group: drop it as the group's only button.
        if (d.kind === "btn") {
          Array.prototype.forEach.call(btnZone().querySelectorAll("[data-btn-group]"), function (gThe) {
            var gr = gThe.getBoundingClientRect();
            var gi = parseInt(gThe.dataset.btnGroup, 10);
            if (y >= gr.top && y <= gr.bottom && !btnData.groups[gi].buttons.length) best = { emptyGroup: gi, r: gr, el: gThe };
          });
        }
        if (!best) {
          d.target = null;
          d.line.style.display = "none";
          return;
        }
        var lr = best.r;
        d.line.style.display = "block";
        d.line.style.left = lr.left + "px";
        d.line.style.width = lr.width + "px";
        if (best.emptyGroup !== undefined) {
          d.target = { g: best.emptyGroup, i: 0 };
          d.line.style.top = lr.top + lr.height / 2 + "px";
          return;
        }
        d.line.style.top = (best.before ? lr.top - 4 : lr.bottom + 1) + "px";
        if (d.kind === "btn") {
          var tg = parseInt(best.el.dataset.btnG, 10);
          var ti = parseInt(best.el.dataset.btnI, 10) + (best.before ? 0 : 1);
          d.target = { g: tg, i: ti };
        } else {
          d.target = { g: parseInt(best.el.dataset.btnGroup, 10) + (best.before ? 0 : 1) };
        }
      }

      function btnDragMove(ev) {
        if (!btnDrag || ev.pointerId !== btnDrag.pid) return;
        ev.preventDefault();
        btnDrag.lastY = ev.clientY;
        btnDrag.ghost.style.top = ev.clientY - btnDrag.dy + "px";
        btnDragLocate(ev.clientY);
      }

      function btnDragCleanup() {
        var d = btnDrag;
        btnDrag = null;
        window.removeEventListener("pointermove", btnDragMove);
        window.removeEventListener("pointerup", btnDragEnd);
        window.removeEventListener("pointercancel", btnDragCancel);
        if (!d) return null;
        clearInterval(d.timer);
        d.ghost.remove();
        d.line.remove();
        d.rowEl.style.opacity = "";
        return d;
      }

      function btnDragCancel() {
        btnDragCleanup();
        btnRender();
      }

      function btnDragEnd(ev) {
        if (!btnDrag || ev.pointerId !== btnDrag.pid) return;
        var d = btnDragCleanup();
        var t = d && d.target;
        if (!t) return btnRender();
        if (d.kind === "btn") {
          var src = btnData.groups[d.gi].buttons;
          var dst = btnData.groups[t.g].buttons;
          var ti = t.i;
          if (t.g === d.gi && (ti === d.i || ti === d.i + 1)) return btnRender(); // mismo lugar
          var item = src.splice(d.i, 1)[0];
          if (t.g === d.gi && ti > d.i) ti--;
          dst.splice(ti, 0, item);
          btnCollapsed[btnData.groups[t.g].id] = false;
        } else {
          var tg = t.g;
          if (tg === d.gi || tg === d.gi + 1) return btnRender();
          var grp = btnData.groups.splice(d.gi, 1)[0];
          if (tg > d.gi) tg--;
          btnData.groups.splice(tg, 0, grp);
        }
        btnSave();
      }

      // Card of a group: header (icon + title, tap to fold),
      // buttons, message, description; in edit mode, drag handles
      // and group controls.
      function btnRenderGroup(g, gi) {
        var card = sbMakeCard(btnDestination(g), g.icon, "");
        card.dataset.btnGroup = gi;
        // hidden from the gear (it is seen anyway while the buttons are edited)
        card.dataset.sbHidden = !btnEditing && sbConfig.ocultas.indexOf("grp:" + g.id) >= 0 ? "1" : "";
        var head = card.firstChild;
        head.innerHTML = "";
        head.style.cursor = btnEditing ? "default" : "pointer";
        var collapsed = !!btnCollapsed[g.id] && !btnEditing && !sbOrdering;
        if (btnEditing || sbOrdering) head.appendChild(btnMakeHandle("group", gi, -1, card));
        var ic = btnEl("span", "display:inline-flex;flex:none;");
        sbH(ic, btnIconSvg(g.icon, 18));
        head.appendChild(ic);
        head.appendChild(btnEl("span", "flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;", g.title));
        // What is ON now in this group (at a glance, even
        // folded): the names of the buttons whose state is active.
        var encendidos = g.buttons.filter(function (b) {
          return btnState(b) === true;
        });
        var conState = g.buttons.some(function (b) {
          return !!b.state;
        });
        if (!btnEditing && conState)
          head.appendChild(
            btnEl(
              "span",
              "flex:0 1 auto;min-width:0;max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;font-weight:bold;padding:1px 6px;border-radius:9px;background:rgba(102,187,106,0.25);color:#a5d6a7;",
              encendidos.length
                ? encendidos
                    .map(function (b) {
                      return b.label;
                    })
                    .join(" + ")
                : "--"
            )
          );
        if (!btnEditing) {
          // SVG arrow (not text "+"/"-": in some Chrome fonts the
          // hyphen was barely visible) and flex:none so that a long title never
          // pushes it out of the card.
          var chev = btnEl("span", "flex:none;display:inline-flex;width:22px;height:22px;align-items:center;justify-content:center;border-radius:4px;background:rgba(255,255,255,0.12);color:#fff;");
          sbH(chev, sbIconSvg(collapsed ? '<path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>' : '<path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>', 18, false));
          head.appendChild(chev);
          head.title = collapsed ? i18nT('buttons.show_the_buttons_of', { name: g.title }) : i18nT('buttons.fold_this_screen_only', { name: g.title });
        }
        head.addEventListener("pointerdown", function (ev) {
          ev.preventDefault();
        });
        head.addEventListener("click", function (ev) {
          ev.stopPropagation();
          if (btnEditing || sbOrdering) return;
          btnCollapsed[g.id] = !btnCollapsed[g.id];
          btnSaveCollapsed();
          btnRender();
        });
        if (collapsed) return;

        var grid = btnEl("div", "display:flex;flex-wrap:wrap;gap:6px;");
        card.appendChild(grid);
        g.buttons.forEach(function (b, i) {
          if (!btnEditing) {
            var reason = btnBlockReason(b);
            var armed = btnArmed === "run:" + gi + ":" + i;
            var bColor = btnColor(b);
            var el = sbMakeButton("", armed ? "#ff8f00" : bColor, function () { // armado = nivel 2 (ambar)
              btnRun(gi, i);
            });
            if (!armed) el.style.color = btnTextOver(bColor);
            el.style.flex = "1 1 calc(50% - 6px)";
            el.style.minWidth = "0";
            el.style.overflow = "hidden";
            el.style.display = "flex";
            el.style.flexDirection = "column";
            el.style.alignItems = "center";
            el.style.justifyContent = "center";
            var l1 = btnEl("span", "max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;", armed ? i18nT('buttons.confirm_q') : b.label);
            el.appendChild(l1);
            // Disabled: gray, dotted border and the short reason below (before
            // only the opacity went down and it was hard to tell which one worked).
            var on = btnState(b);
            if (on === true) {
              // ENCENDIDO: color lleno, borde blanco grueso, brillo, punto
              // green and "ACTIVO" (even if it cannot be tapped, e.g. the current mode).
              el.disabled = !!reason;
              el.style.position = "relative";
              el.style.border = "2px solid #fff";
              el.style.boxShadow = "0 0 10px " + bColor;
              el.style.cursor = reason ? "default" : "pointer";
              el.appendChild(btnEl("span", "font-size:10px;font-weight:bold;letter-spacing:0.08em;", i18nT('buttons.active_caps')));
              el.appendChild(btnEl("span", "position:absolute;top:3px;right:4px;width:8px;height:8px;border-radius:50%;background:#69f0ae;box-shadow:0 0 4px #69f0ae;"));
              // Mirror of the status LEDs (20-led-mirror.js): the button takes the
              // color/animation of the state it represents while it is active
              var led = btnLedOf(b);
              if (led) el.dataset.ledState = led;
            } else if (reason) {
              el.disabled = true;
              el.style.background = "#263238";
              el.style.color = "rgba(255,255,255,0.45)";
              el.style.border = "1px dashed rgba(255,255,255,0.3)";
              el.style.cursor = "not-allowed";
              el.style.fontWeight = "normal";
              var l2 = btnEl("span", "font-size:10px;font-weight:normal;letter-spacing:0.02em;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;", btnShortReason(b));
              el.appendChild(l2);
            } else {
              el.style.border = "1px solid rgba(255,255,255,0.55)";
              el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.5)";
              // it has state and is NOT active: a bit dimmed on a dark background.
              // Not with DWC's light theme: the color fill got washed out and the
              // white text was barely readable (2026-10-10, "the bar is not right in
              // light mode"); there it is distinguished by the lack of "ACTIVE" and of the dot.
              if (on === false && !document.documentElement.classList.contains("tp-bright")) el.style.opacity = "0.75";
            }
            el.title =
              (on === true ? i18nT('buttons.active_now') + " " : "") +
              (reason || (b.kind === "macro" ? "Macro: " + b.action : "G-code: " + b.action) + (b.confirm ? " " + i18nT('buttons.double_tap_paren') : ""));
            grid.appendChild(el);
            return;
          }
          var row = btnEl("div", "flex:1 1 100%;min-width:0;display:flex;align-items:center;gap:4px;");
          row.dataset.btnRow = "1";
          row.dataset.btnG = gi;
          row.dataset.btnI = i;
          row.appendChild(btnMakeHandle("btn", gi, i, row));
          row.appendChild(btnEl("span", "width:12px;height:12px;border-radius:4px;flex:none;background:" + b.color + ";"));
          var lab = btnEl("div", "flex:1 1 auto;min-width:0;display:flex;flex-direction:column;");
          lab.appendChild(btnEl("span", "font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;", b.label));
          lab.appendChild(btnEl("span", "font-size:10px;color:rgba(255,255,255,0.5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;", b.modes.length ? i18nT('buttons.modes_list', { modes: b.modes.join(", ") }) : i18nT('buttons.all_modes')));
          row.appendChild(lab);
          row.appendChild(
            btnSmall(i18nT('common.edit'), "#1976d2", function () {
              btnOpenButtonForm(gi, i);
            })
          );
          var dk = "del:" + gi + ":" + i;
          var del = btnSmall(btnArmed === dk ? i18nT('common.delete_confirm') : "X", btnArmed === dk ? "#c62828" : "#6d4c41", function () {
            if (!btnArm(dk)) return;
            g.buttons.splice(i, 1);
            btnSave();
          });
          del.title = i18nT('buttons.delete_button_double_tap');
          row.appendChild(del);
          grid.appendChild(row);
        });
        if (!g.buttons.length) grid.appendChild(sbText(btnEditing ? i18nT('buttons.empty_group_drag_here') : i18nT('buttons.no_buttons_hint')));

        if (btnEditing && btnForm && btnForm.g === gi) {
          var fb = btnEl("div");
          card.appendChild(fb);
          if (btnForm.kind === "btn") btnRenderButtonForm(fb);
          else btnRenderGroupForm(fb);
        }

        if (btnMsg && btnMsgGroup === g.id) card.appendChild(sbText(btnMsg, "font-size:11px;color:#ffe082;word-break:break-word;"));
        if (g.description && !btnEditing) card.appendChild(sbText(g.description));

        if (btnEditing && !(btnForm && btnForm.g === gi)) {
          var er = sbRow(card);
          er.style.borderTop = "1px solid rgba(255,255,255,0.15)";
          er.style.paddingTop = "6px";
          er.appendChild(
            btnSmall(i18nT('buttons.add_button'), "#1976d2", function () {
              btnOpenButtonForm(gi, -1);
            })
          );
          er.appendChild(
            btnSmall(i18nT('buttons.edit_group'), "#455a64", function () {
              btnForm = { kind: "group", g: gi, data: JSON.parse(JSON.stringify(g)) };
              btnRender();
            })
          );
          var gk = "delg:" + gi;
          var dg = btnSmall(btnArmed === gk ? i18nT('buttons.delete_group_q') : i18nT('buttons.delete_group'), btnArmed === gk ? "#c62828" : "#6d4c41", function () {
            if (!btnArm(gk)) return;
            btnData.groups.splice(gi, 1);
            btnSave();
          });
          dg.title = i18nT('buttons.delete_group_with_buttons');
          er.appendChild(dg);
        }
      }

      function btnRender() {
        if (!sb.btnGroups || btnData === null) return;
        sbT(sb.btnStatus, btnLoadError || (btnEditing ? i18nT('buttons.editing_hint') : btnMachineMode ? i18nT('buttons.current_mode_hint', { mode: btnMachineMode }) : ""));
        sb.btnStatus.style.color = btnLoadError ? "#ef9a9a" : "rgba(255,255,255,0.75)";
        sb.btnGroups.innerHTML = "";
        // the groups that are in their own sections (see btnDestination)
        Array.prototype.forEach.call(btnZone().querySelectorAll("[data-btn-group], [data-btn-form-sec]"), function (el) {
          el.remove();
        });
        btnData.groups.forEach(btnRenderGroup);
        if (!btnData.groups.length) sb.btnGroups.appendChild(sbText(i18nT('buttons.no_groups_hint')));
        if (btnEditing && btnForm && btnForm.kind === "group" && btnForm.g < 0) {
          var fb = btnEl("div");
          var secThe = btnForm.sec && sbSecOwn[btnForm.sec];
          if (secThe && secThe.__groups) {
            fb.dataset.btnFormSec = "1";
            secThe.__groups.appendChild(fb);
          } else sb.btnGroups.appendChild(fb);
          btnRenderGroupForm(fb);
        }
        if (btnMsg && btnMsgGroup === null) sb.btnGroups.appendChild(sbText(btnMsg, "font-size:11px;color:#ffe082;word-break:break-word;"));
        sb.btnNewGroupBtn.style.display = btnEditing && !btnForm ? "" : "none";
        sbT(sb.btnEditBtn, btnEditing ? i18nT('common.done') : i18nT('common.edit_buttons'));
        sb.btnEditBtn.style.background = btnEditing ? "#2e7d32" : "#37474f";
        sbFeetRender();
      }

      // Where a group's card goes: its own section (gear, this screen
      // only) or BUTTONS.
      function btnDestination(g) {
        var sec = sbSecOwn[sbConfig.location["grp:" + g.id]];
        return sec && sec.__groups ? sec.__groups : sb.btnGroups;
      }

      // The whole bar: the groups can be in BUTTONS or in their own sections.
      function btnZone() {
        return sb.full || sb.btnGroups;
      }

      // "+ Grupo de botones" de una seccion propia (secId) o de BOTONES (null).
      function btnNewGroup(secId) {
        btnEditing = true;
        btnArmed = "";
        btnMsg = "";
        btnForm = { kind: "group", g: -1, sec: secId || null, data: { id: btnNewId(), title: "", icon: "star", description: "", buttons: [] } };
        if (!btnMacroList) btnLoadMacros();
        btnRender();
      }

      // Called by createSidebar(): BUTTONS section with a container for the
      // group cards and the edit controls at the end.
      function btnCreateSection(parent) {
        var sec = sbMakeGroup(
          parent,
          i18nT('buttons.buttons_caps'),
          i18nT('buttons.buttons_section_help'),
          "#66bb6a"
        );
        sb.btnCard = sec;
        sbMakeSortableSection(sec, "buttons");
        sb.btnStatus = sbStatusLine(sec);
        sb.btnGroups = btnEl("div", "display:flex;flex-direction:column;gap:10px;");
        sec.appendChild(sb.btnGroups);
        var row = sbRow(sec);
        sb.btnNewGroupBtn = sbMakeButton(i18nT('buttons.new_group'), "#1976d2", function () {
          btnNewGroup(null);
        });
        row.appendChild(sb.btnNewGroupBtn);
        sb.btnEditBtn = sbMakeButton(i18nT('common.edit_buttons'), "#455a64", function () {
          btnEditing = !btnEditing;
          btnForm = null;
          btnArmed = "";
          btnMsg = "";
          btnRender(); // right away, without waiting for the network
          if (btnEditing) btnLoad(true); // reread in case another screen changed them
          else btnRender();
        });
        row.appendChild(sb.btnEditBtn);
        sb.startup = barStartupCreate(sec); // start-up card (16-startup.js)
        btnLoad();
      }

      // Every /machine/status: current mode (to disable buttons) and,
      // every ~30 s when not editing, reread the file (changes made
      // from another screen). It is only redrawn if something that affects
      // the buttons changed: recreating them every 2 s could replace one right between
      // the pointerdown and the click (lost tap), and with an open form
      // it took the focus away from the field being typed in.
      var btnLastReload = Date.now();
      var btnLastKey = "";
      function btnUpdateFromStatus(status) {
        var m = status && status.state && status.state.machineMode;
        if (m) btnMachineMode = m;
        if (status) btnLastStatus = status;
        if (btnEditing) return;
        if (Date.now() - btnLastReload > 30000) {
          btnLastReload = Date.now();
          btnLastKey = "";
          btnLoad();
          if (sb.startup) sb.startup.refresh();
          return;
        }
        var key =
          btnMachineMode +
          "|" +
          btnJobRunning() +
          "|" +
          JSON.stringify(btnModeColors()) +
          "|" +
          (btnData
            ? btnData.groups
                .map(function (g) {
                  return g.buttons.map(btnState).join(",");
                })
                .join(";")
            : "");
        if (key !== btnLastKey) {
          btnLastKey = key;
          btnRender();
        }
      }
