      // ---- Two fields of the form that makes or edits a button (BUTTONS section, 15-buttons.js btnRenderButtonForm) ----

      // The macro field of the button form: the two groups of the catalogue, what the chosen one does, and its read-only view.
      function btnFormMacroField(form, f) {
        var inAction = workshopInputEl("select", BTN_INPUT_CSS);
        var hiddenGroup = workshopMacroFill(inAction, btnMacroCat, f.action); // two groups: your macros and the workshop's (07-macro-catalog.js)
        var macroInfo = btnEl("div", "font-size:12px;line-height:1.3;color:rgba(255,255,255,0.75);min-height:2.7em;");
        var macroView = btnSmall(i18nT('macropick.view'), "#455a64", function () {
          workshopMacroView(inAction.value); // read-only dialog, never the editor of DWC
        });
        macroView.title = i18nT('macropick.view_tip');
        function macroPaint() {
          macroView.style.display = inAction.value ? "" : "none";
          macroInfo.textContent = workshopMacroDescription(btnMacroCat, inAction.value) || (hiddenGroup ? i18nT('macropick.hidden_note') : btnMacroCat && !btnMacroCat.ok ? i18nT('macropick.old_service') : "");
        }
        inAction.addEventListener("change", function () {
          f.action = inAction.value;
          macroPaint();
        });
        macroPaint();
        form._field(i18nT('buttons.macro_macros_folder'), inAction);
        form.appendChild(macroInfo);
        form.appendChild(macroView);
      }

      // The "shown ON when" fields of the form: path and value checked against the live model, one fold of help, the Test row (07-state-fields.js).
      function btnFormStateFields(form, f) {
        if (!f.state) f.state = { path: "", value: "" };
        var fields = workshopStateFieldsEl({
          path: f.state.path,
          value: f.state.value,
          css: BTN_INPUT_CSS,
          getModel: function () { return btnLastStatus; },
          onInput: function () {
            f.state.path = fields.pathInput.value;
            var t = fields.valueInput.value.trim();
            f.state.value = t === "true" ? true : t === "false" ? false : t !== "" && !isNaN(Number(t)) ? Number(t) : t;
          },
        });
        form.appendChild(fields.el);
      }
