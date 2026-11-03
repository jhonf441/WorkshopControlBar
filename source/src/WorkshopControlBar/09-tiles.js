      // ---- The tiles other plugins offer to the bar: the pure part (2026-10-31; tested in tests/bar-tiles.test.js) ----
      //
      // The plugin that owns a thing registers a tile for it (workshopRegisterBarTile, _shared/10-registry-tiles.js) and the bar only draws what is
      // registered: it knows no plugin. A tile is in the bar while its plugin is active and the person's role allows it, it is SEEN while the
      // switch of the gear says so (or, on a screen that never chose, while its defaultShown says so). The cards, the rail icons and the tiles of
      // the Hidden style are in 18-sidebar-tiles.js and 11-hidden-tiles.js; this file holds the decisions, without a page.

      var SB_TILE_PREFIX = "tile:"; // the key of a tile card in the bar (data-sb-key, the order, the gear, the sections of the person)

      // the colours of the buttons of a tile (DESIGN.md: primary, success, warning, error, stop, neutral)
      var SB_TILE_TONES = { neutral: "#455a64", primary: "#1976d2", success: "#2e7d32", warning: "#e65100", danger: "#c62828", stop: "#b71c1c" };
      var SB_TILE_TEXT = "rgba(255,255,255,0.6)"; // the colour of a line a tile gave no colour for

      function sbTileKey(id) {
        return SB_TILE_PREFIX + id;
      }

      // The id of the tile a key belongs to, or null when the key is another card of the bar
      function sbTileIdOf(key) {
        return typeof key === "string" && key.indexOf(SB_TILE_PREFIX) === 0 ? key.slice(SB_TILE_PREFIX.length) : null;
      }

      // The ids of the registered tiles in the order they are drawn: their order, then their id
      function sbTileIds(tiles) {
        var t = tiles || {};
        return Object.keys(t).sort(function (a, b) {
          var d = (t[a].order || 0) - (t[b].order || 0);
          return d || (a < b ? -1 : a > b ? 1 : 0);
        });
      }

      // Is the tile one this page can offer now? Its plugin is active (active = workshopPluginActive) and its role gate lets the person in.
      // A tile that fails to answer is not offered.
      function sbTileAvailable(api, active) {
        if (!api || typeof api.state !== "function") return false;
        if (api.plugin && !active(api.plugin)) return false;
        try {
          return typeof api.visible === "function" ? !!api.visible() : true;
        } catch (e) {
          return false;
        }
      }

      // Does this screen show the tile? tiles = what the person chose here ({id: bool}); without a choice, the default the plugin gave
      function sbTileChosen(tiles, id, api) {
        if (tiles && typeof tiles[id] === "boolean") return tiles[id];
        return !!(api && api.defaultShown);
      }

      // The stored choices made safe: only the booleans of a plain object
      function sbTilesRead(raw) {
        var out = {};
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
        Object.keys(raw).forEach(function (id) {
          if (typeof raw[id] === "boolean") out[id] = raw[id];
        });
        return out;
      }

      // What api.state() answered, made safe for the painters: text where text goes, a list of buttons with a known tone, never a throw
      function sbTileView(api) {
        var s = null;
        try {
          s = api.state();
        } catch (e) {
          console.error("[WorkshopControlBar] tile state:", e);
        }
        s = s && typeof s === "object" ? s : {};
        var seen = {};
        var buttons = (Array.isArray(s.buttons) ? s.buttons : []).filter(function (b) {
          if (!b || !b.id || seen[b.id]) return false;
          seen[b.id] = true;
          return true;
        });
        return {
          status: String(s.status || ""),
          color: s.color || SB_TILE_TEXT,
          summary: String(s.summary || s.status || ""),
          railColor: s.railColor || "#37474f",
          message: String(s.message || ""),
          buttons: buttons.map(function (b) {
            return { id: String(b.id), label: String(b.label || ""), tone: SB_TILE_TONES[b.tone] ? b.tone : "neutral", disabled: !!b.disabled, onTap: b.onTap };
          }),
        };
      }
