      // ---- The cards and the rail icons of the tiles other plugins offer (2026-10-31; the decisions are in 09-tiles.js) ----
      //
      // One card in GLOBAL and one icon in the rail for every tile that is registered, whose plugin is active and whose role gate lets the person
      // in. They are built when the tile appears and taken out when it goes (a stopped plugin leaves nothing behind). Whether the card is SEEN is
      // the switch of the gear (sbKeyHidden, below); the card takes part in the order, the foldable cards and the own sections like any other.
      // The bar draws what state() says and sends the taps back; it does not know what the tile does.

      var sbTileUi = {}; // id -> { key, api, card, status, row, msg, rail, buttons: {buttonId: element}, last: {buttonId: descriptor}, watching }

      // Is the card or tile with this key hidden on this screen? A tile follows its own switch (and the default its plugin gave); any other card
      // follows the list of hidden keys of the gear.
      function sbKeyHidden(key) {
        var id = sbTileIdOf(key);
        if (id === null) return sbConfig.ocultas.indexOf(key) >= 0;
        return !sbTileChosen(sbConfig.tiles, id, (workshop.barTiles || {})[id]);
      }

      // A switch of the gear: show (true) or hide (false) the card or tile with that key, on this screen, and keep it
      function sbKeyShow(key, shown) {
        var id = sbTileIdOf(key);
        if (id !== null) {
          sbConfig.tiles[id] = !!shown;
        } else {
          sbConfig.ocultas = sbConfig.ocultas.filter(function (k) {
            return k !== key;
          });
          if (!shown) sbConfig.ocultas.push(key);
        }
        sbConfigSave();
        sbConfigApply();
      }

      function sbTilesReset() {
        Object.keys(sbTileUi).forEach(function (id) {
          sbTileWatch(sbTileUi[id], false);
        });
        sbTileUi = {};
      }

      // The rail icons of the tiles have a box of their own under the other GLOBAL icons, made with the first tile (a bar with no tiles has the same
      // DOM as before).
      function sbTileRailBox() {
        if (!sb.railTiles) {
          sb.railTiles = document.createElement("div");
          sb.railTiles.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:6px;";
          sb.rail.appendChild(sb.railTiles);
        }
        return sb.railTiles;
      }

      function sbTileBuild(id, api) {
        var key = sbTileKey(id);
        var card = sbMakeCard(sb.gGlobal, api.icon, api.title);
        sbMakeSortableCard(card, key);
        var ui = { key: key, api: api, card: card, buttons: {}, last: {}, watching: false };
        ui.status = sbStatusLine(card);
        ui.row = sbRow(card);
        ui.msg = sbMsgLine("font-size:11px;color:#ffe082;");
        card.appendChild(ui.msg);
        if (api.help) card.appendChild(sbText(api.help));
        ui.rail = sbMakeRailBtn(api.icon, api.title, key);
        sbTileRailBox().appendChild(ui.rail);
        sb[key] = card; // the rail icon scrolls to it and the Hidden style opens it as the detail
        sbTileUi[id] = ui;
      }

      function sbTileDrop(id) {
        var ui = sbTileUi[id];
        sbTileWatch(ui, false);
        ui.card.remove();
        ui.rail.remove();
        delete sb[ui.key];
        delete sbTileUi[id];
      }

      // The tile says it is on screen (true) or not (false) only when that changes: it reads its state from the service only while it is watched
      function sbTileWatch(ui, on) {
        if (ui.watching === on) return;
        ui.watching = on;
        if (typeof ui.api.watch !== "function") return;
        try {
          ui.api.watch(on);
        } catch (e) {
          console.error("[WorkshopControlBar] tile watch:", e);
        }
      }

      // Builds the cards of the tiles that appeared and takes out those that went (a plugin that stopped, a role that lost it, a plugin
      // that is no longer enabled). Idempotent: it runs on every refresh of the bar.
      function sbSyncTiles() {
        if (!sb.gGlobal || !sb.rail) return;
        var tiles = workshop.barTiles || {};
        var want = sbTileIds(tiles).filter(function (id) {
          return sbTileAvailable(tiles[id], workshopPluginActive);
        });
        var changed = false;
        Object.keys(sbTileUi).forEach(function (id) {
          if (want.indexOf(id) >= 0 && sbTileUi[id].api === tiles[id]) return;
          sbTileDrop(id);
          changed = true;
        });
        want.forEach(function (id) {
          if (sbTileUi[id]) return;
          sbTileBuild(id, tiles[id]);
          changed = true;
        });
        if (!changed) return;
        want.forEach(function (id) {
          sbTileRailBox().appendChild(sbTileUi[id].rail); // appendChild moves the node: the icons stay in the order of the tiles
        });
        sbOrderApply("global"); // the saved order of the person
        if (sb.configBox && sb.configBox.style.display === "flex") sbConfigRender(); // the gear is open: its list of switches changed
      }

      // The buttons of a card: made once per id, painted on every refresh, and the tap always goes to the latest descriptor
      function sbPaintTileButtons(ui, list) {
        var ids = list.map(function (b) {
          return b.id;
        });
        ui.last = {};
        list.forEach(function (d) {
          ui.last[d.id] = d;
          var b = ui.buttons[d.id];
          if (!b) {
            b = ui.buttons[d.id] = sbMakeButton("", SB_TILE_TONES.neutral, function () {
              var cur = ui.last[d.id];
              if (cur && !cur.disabled && typeof cur.onTap === "function") cur.onTap();
            });
            ui.row.appendChild(b);
          }
          sbT(b, d.label);
          b.style.background = SB_TILE_TONES[d.tone];
          b.disabled = d.disabled;
          b.style.opacity = d.disabled ? "0.5" : "1";
        });
        Object.keys(ui.buttons).forEach(function (id) {
          if (ids.indexOf(id) >= 0) return;
          ui.buttons[id].remove();
          delete ui.buttons[id];
        });
      }

      // The state of every tile card and rail icon, and who is watched. Called on every refresh, after sbSyncTiles.
      function sbPaintTiles() {
        Object.keys(sbTileUi).forEach(function (id) {
          var ui = sbTileUi[id];
          var v = ui.view = sbTileView(ui.api); // the Hidden style paints its tile from it (11-hidden-tiles.js)
          sbT(ui.status, v.status);
          ui.status.style.color = v.color;
          sbPaintTileButtons(ui, v.buttons);
          sbT(ui.msg, v.message);
          sbH(ui.rail, sbIconSvg(ui.api.icon, 22, false));
          ui.rail.style.background = v.railColor;
          ui.rail.title = ui.api.title + (v.status ? ": " + v.status : "");
          sbTileWatch(ui, !sidebarCollapsed && !sbKeyHidden(ui.key));
        });
      }

      function sbRefreshTiles() {
        sbSyncTiles();
        sbPaintTiles();
      }

      workshopOnStop(sbTilesReset);
