      // ---- Who has the control, in the header of the bar (F1-D, 2026-10-21) ----
      // A small chip next to the title: the name of whoever holds the control of the movement when it is not this browser, and the
      // button to take it (technician or administrator, double tap). The data and the texts are in src/_shared/07-control-holder.js.
      var sbControlTimer = null;
      
      function sbControlMount(head) {
        var chip = document.createElement("div");
        chip.style.cssText = "display:none;flex:0 1 auto;align-items:center;gap:6px;min-width:0;font-size:11px;color:#ffcc80;";
        head.appendChild(chip);
        var key = "";
        function paint() {
          var c = workshopControl();
          var can = workshopControlCanTake();
          var k = [c.held, c.mine, c.name, c.device, c.since, can, sidebarCollapsed].join("|");
          if (k === key) return;
          key = k;
          chip.innerHTML = "";
          if (!c.held || c.mine || sidebarCollapsed) {
            chip.style.display = "none";
            return;
          }
          chip.style.display = "flex";
          var t = document.createElement("span");
          t.textContent = workshopControlWho(c);
          t.title = workshopControlText(c);
          t.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:90px;";
          chip.appendChild(t);
          var b = workshopControlTakeButton();
          if (b) {
            b.title = i18nT("control.take_tip");
            chip.appendChild(b);
          }
        }
        clearInterval(sbControlTimer);
        sbControlTimer = setInterval(function () {
          paint();
        }, 1000);
        paint();
      }
