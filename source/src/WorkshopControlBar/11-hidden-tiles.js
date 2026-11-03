      // ---- The tiles other plugins offer, in the Hidden style (2026-10-31) ----
      // On the home each card of 18-sidebar-tiles.js that this screen shows is one tile of the board, with the short state its plugin gave; tapping
      // it opens the card as the detail (the same card: nothing of what it does is repeated here). The tile goes when the card goes.

      // The title of the card the detail shows when it is a tile's, "" for anything else
      function ocTileTitleOf(view) {
        var id = sbTileIdOf(view);
        return id !== null && sbTileUi[id] ? sbTileUi[id].api.title : "";
      }

      function ocTileMake(ui) {
        var t = ocTile(function () { ocIr(ui.key); });
        t.style.gridColumn = "span 2"; // a full row, as Notices and Shutdown
        sbH(t._ic, sbIconSvg(ui.api.icon, 18, false));
        sbT(t._tit, ui.api.title);
        sbT(t._chev, ">");
        return t;
      }

      // Called by ocRefresh after the cards were painted (sbPaintTiles keeps what each tile said in ui.view)
      function ocPaintTiles() {
        if (!oc || !oc.grid) return;
        var ids = sbTileIds(workshop.barTiles).filter(function (id) { return !!sbTileUi[id]; });
        Object.keys(oc.tiles).forEach(function (id) {
          if (ids.indexOf(id) >= 0 && oc.tiles[id]._ui === sbTileUi[id]) return;
          oc.tiles[id].remove();
          delete oc.tiles[id];
        });
        var added = false;
        ids.forEach(function (id) {
          if (oc.tiles[id]) return;
          oc.tiles[id] = ocTileMake(sbTileUi[id]);
          oc.tiles[id]._ui = sbTileUi[id];
          added = true;
        });
        if (added) ids.forEach(function (id) { oc.grid.appendChild(oc.tiles[id]); }); // appendChild moves the node: the tiles keep their order
        ids.forEach(function (id) {
          var ui = sbTileUi[id];
          var v = ui.view || sbTileView(ui.api);
          sbT(oc.tiles[id]._est, v.summary);
          oc.tiles[id]._est.style.color = v.color;
          oc.tiles[id].dataset.sbHidden = sbKeyHidden(ui.key) ? "1" : "";
        });
      }
