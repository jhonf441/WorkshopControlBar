      // ---- Bar: the CSS of the Hidden style (a <style> element added once; sbHiddenCss is called by sidebarSetCollapsed in 10-sidebar.js) ----

      // Own look of the Hidden style (2026-10-10: "I want a style change
      // also with respect to v1"): floating panel separated from the edge,
      // rounded corners, translucent background; sections with a colored label
      // (not the side stripe) and cards with the icon in a box of the
      // color of their section. CSS only on the same nodes: the Classic one does not change.
      function sbHiddenCss() {
        if (document.getElementById("workshop-bar-hidden-css")) return;
        var B = "#" + SIDEBAR_ID;
        var st = document.createElement("style");
        st.id = "workshop-bar-hidden-css";
        st.textContent = [
          B + "{top:var(--tp-sb-top,10px)!important;bottom:var(--tp-sb-bottom,10px)!important;right:10px!important;border-radius:16px!important;border:1px solid rgba(255,255,255,0.14)!important;background:#1e272c!important;box-shadow:0 12px 40px rgba(0,0,0,0.65)!important;}",
          B + ">div:first-child{background:transparent!important;border-bottom:1px solid rgba(255,255,255,0.08)!important;padding:8px 10px!important;}",
          // closed as a rail (44 px): only the toggle fits, centred (the gear and title are hidden)
          B + '[data-sb-closed="1"]>div:first-child{padding:8px 0!important;justify-content:center!important;gap:0!important;}',
          // redesign batch 1 (2026-11-23): sections without boxes (a word in their colour, no pill), cards as rows split by a line (no grey sub-card),
          // the icon of a card in a 24 px box of its section's colour (the one colour cue besides the word)
          B + " [data-sb-group]{border-left:none!important;border-radius:0!important;background:transparent!important;padding:0 0 4px 0!important;gap:0!important;}",
          B + " [data-sb-group]>div:first-child{align-self:flex-start;padding:8px 2px 4px;letter-spacing:0;}",
          B + " [data-sb-card]{background:transparent!important;border:0;border-top:1px solid rgba(255,255,255,0.1);border-radius:0!important;padding:8px 2px!important;}",
          B + " [data-sb-card]>div:first-child>span:first-child{display:inline-flex;width:24px;height:24px;flex:none;border-radius:6px;align-items:center;justify-content:center;background:color-mix(in srgb,var(--sb-c,#42a5f5) 22%,transparent);}",
          B + " [data-sb-card] button{border-radius:6px!important;border-color:rgba(255,255,255,0.16)!important;}",
          // DWC light theme (2026-10-10: "the controls in hidden mode do not
          // have light mode right"): these rules go with !important and
          // 03-theme.js only converts the inline colors; the light version goes
          // here, with the light palette of DESIGN.md (html.tp-bright is set by 03-theme.js)
          "html.tp-bright " + B + "{background:#ffffff!important;border-color:rgba(0,0,0,0.12)!important;box-shadow:0 12px 32px rgba(0,0,0,0.22)!important;}",
          "html.tp-bright " + B + ">div:first-child{border-bottom-color:rgba(0,0,0,0.08)!important;}",
          "html.tp-bright " + B + " [data-sb-card]{background:transparent!important;border-top-color:rgba(0,0,0,0.1);}",
          "html.tp-bright " + B + " [data-sb-card] button{border-color:rgba(0,0,0,0.16)!important;}",
          "html.tp-bright " + B + " [data-sb-group]>div:first-child{background:transparent;}",
        ].join("\n");
        document.head.appendChild(st);
      }
