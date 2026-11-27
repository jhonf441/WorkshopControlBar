      // ---- Block with reason in the control bar (step 8 of the access control, document PASO8-PLUGINS: "Despues: los que ya comprueban por nivel") ----
      // The bar already locks its parts by the table of the role (09-role.js: dimmed, with the sentence of the role as tooltip, and ONE note at the end of the bar).
      // This EXTENDS it: under each group of sensitive buttons ONE note (class wf-reason, the shared 09-access-reason.js) says why the service would refuse the
      // group to this person (profile and rule, ceiling, no rule, condition, or the role) from ONE batched auth.can per screen. The sentence of the role stays as
      // the fallback while the service has not answered. The buttons keep what they do and how they are confirmed.
      //   Notifications card      notifications.mute, notifications.get
      //   How it shuts down       power.method
      //   Restart everything      power.full_reset
      //   Shut down when done     power.after_job   (target workshop:power:timer/after_job)
      //   Shut down with a timer  power.timer, power.timer_cancel   (target workshop:power:timer/shutdown)
      // NEVER here: power.off (Shut down now) and livejob.stop_safe (Stop safely) are stops: they are never asked, never blocked, never wrapped, never covered by
      // a note (workshopAccessIsStop leaves them out anyway, and 19-sidebar-livestop.js / sbBuildPowerNow call nothing of this file).
      // Not covered: the mirror of the status LEDs (lights.save) is an indicator, not a group of buttons; the Hidden style tiles lend the same cards.
      var SB_REASON_OPS = {
        notice: ["notifications.mute", "notifications.get"],
        method: ["power.method"],
        restart: ["power.full_reset"],
        when_done: ["power.after_job"],
        timer: ["power.timer", "power.timer_cancel"],
      };
      // the role the table of the service asks for the group (the fallback sentence names it until the service answers)
      var SB_REASON_NEED = { notice: "operator", method: "technician", restart: "admin", when_done: "operator", timer: "operator" };
      // the operations of a group the service names by target (access_targets.py: the timer itself)
      var SB_REASON_TARGET = {
        "power.after_job": "workshop:power:timer/after_job",
        "power.timer": "workshop:power:timer/shutdown",
        "power.timer_cancel": "workshop:power:timer/shutdown",
      };

      // The items asked for a group: operation names, or { operation, target } for the ones the target names
      function sbReasonItems(group) {
        return (SB_REASON_OPS[group] || []).map(function (op) {
          return SB_REASON_TARGET[op] ? { operation: op, target: SB_REASON_TARGET[op] } : op;
        });
      }

      // The note of a group: an empty element that fills itself when something blocks (and says nothing when nothing does). It is NOT one of the parts that
      // 09-role.js dims, so it stays readable when its group is locked.
      function sbReasonEl(group) {
        if (typeof workshopReasonGroupEl !== "function") return document.createComment("");
        var box = workshopReasonGroupEl(sbReasonItems(group), { need: SB_REASON_NEED[group], subject: i18nT("subjects_controlbar." + group) });
        box.style.marginTop = "4px";
        box.style.fontSize = "12px";
        sbReasonWatch();
        return box;
      }

      // The answers of the service move the locks too (workshopCan follows them): the bar repaints its locks when they arrive or are forgotten. Once.
      var sbReasonOff = null;
      function sbReasonWatch() {
        if (sbReasonOff || typeof workshopAccessPageStore !== "function") return;
        var store = workshopAccessPageStore();
        if (!store) return;
        sbReasonOff = store.onChange(function () { if (!pluginStopped && typeof sbRoleApply === "function") sbRoleApply(); });
        if (typeof workshopOnStop === "function") workshopOnStop(function () { if (sbReasonOff) sbReasonOff(); sbReasonOff = null; });
      }

      // The sentence the service gives for ONE operation (the tooltip of a locked part), or "" while it has not answered (the sentence of the role stays).
      // A stop never has one.
      function sbReasonSentence(op) {
        if (typeof workshopAccessNote !== "function" || typeof workshopAccessIsStop !== "function" || workshopAccessIsStop(op)) return "";
        var note = workshopAccessNote([SB_REASON_TARGET[op] ? { operation: op, target: SB_REASON_TARGET[op] } : op], { need: sbRoleNeed(op), service: false });
        return note ? note.text : "";
      }
