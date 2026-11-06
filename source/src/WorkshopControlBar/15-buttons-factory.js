      // ---- "Add factory buttons" (RL-2, 2026-11-05) ----
      // The bar starts with the factory groups of BUTTONS_INITIAL (15-buttons.js), but only with the buttons whose macro exists on this SD and has at least one
      // line that does something (a macro that is only the example does nothing). On a clean machine none exists yet, so the first read finds nothing to seed.
      // That used to be saved as an empty buttons.json, and from then on the factory buttons never came back when the macros were created later: the file
      // existed, so the seed never ran again. Now an empty seed saves NOTHING (the bar tries again at its next reread, ~30 s, until there is something to
      // seed or the person saves a file), and this button adds the factory buttons whose macros exist at any time, without touching what is already there.

      // The button of the bar, shown when the person edits the buttons or when there is no group yet (btnFactoryPaint).
      function btnFactoryButton() {
        var b = sbMakeButton(i18nT('buttons.factory_add'), "#00897b", function () { btnAddFactory(); });
        b.title = i18nT('buttons.factory_tip');
        return b;
      }

      function btnFactoryPaint() {
        if (sb.btnFactoryBtn) sb.btnFactoryBtn.style.display = (btnEditing && !btnForm) || (btnData && !btnData.groups.length) ? "" : "none";
      }

      // Pure. The factory groups (ini = btnInitialExisting(): only buttons with a macro) added to the groups the person has: a group with the same id gets
      // the buttons it does not have yet (matched by action), a missing group is added whole; nothing that exists is changed or removed.
      // -> { groups: the new list, added: number of buttons added }
      function btnMergeFactory(groups, ini, normalizeGroup, normalizeButton) {
        var out = groups.slice(), added = 0;
        ini.groups.forEach(function (fg) {
          var at = -1;
          out.forEach(function (g, i) { if (g.id === fg.id) at = i; });
          if (at < 0) {
            out.push(normalizeGroup(fg));
            added += fg.buttons.length;
            return;
          }
          var have = out[at].buttons.map(function (b) { return b.action; });
          var fresh = fg.buttons.filter(function (b) { return have.indexOf(b.action) < 0; }).map(normalizeButton);
          if (!fresh.length) return;
          out[at] = Object.assign({}, out[at], { buttons: out[at].buttons.concat(fresh) });
          added += fresh.length;
        });
        return { groups: out, added: added };
      }

      function btnAddFactory() {
        if (!btnData) return Promise.resolve();
        btnMsg = i18nT('buttons.factory_looking');
        btnMsgGroup = null;
        btnRender();
        return btnInitialExisting()
          .then(function (ini) {
            var r = btnMergeFactory(btnData.groups, ini, btnNormalizeGroup, btnNormalize);
            btnMsg = r.added ? i18nT('buttons.factory_added', { n: r.added }) : i18nT('buttons.factory_none');
            btnMsgGroup = null;
            if (!r.added) return btnRender();
            btnData.groups = r.groups;
            return btnSave();
          })
          .catch(function (e) {
            btnMsg = i18nT('buttons.error_saving_the_buttons', { error: (e && e.message) || e });
            btnMsgGroup = null;
            btnRender();
          });
      }
