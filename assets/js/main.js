/**
 * /assets/js/main.js
 * Plain JS (no modules). Wires page navigation + map helper hooks.
 * Relies on /assets/js/maps.js exposing: window.myMap, window.setBoundries, window.detectMyLocation
 */

(function () {
  "use strict";

  // Small helpers
  function $(id) { return document.getElementById(id); }
  function on(el, evt, fn, opts) { if (el) el.addEventListener(evt, fn, opts || false); }
  function debounce(fn, wait) {
    let t; return function () { clearTimeout(t); t = setTimeout(() => fn.apply(this, arguments), wait); };
  }

  // Page switching with fade classes; falls back to simple display toggles
  function switchPage(fromId, toId) {
    var from = $(fromId), to = $(toId);
    if (!from || !to) return;

    // Ensure destination has proper display
    to.style.display = "flex";

    // Try to use CSS animations if present
    try {
      from.classList.remove("fadeIn");
      from.classList.add("fadeOut");
      to.classList.remove("fadeOut");
      to.classList.add("fadeIn");
      setTimeout(function () {
        from.style.display = "none";
      }, 300); // keep short; your CSS uses 1s but this feels snappier
    } catch (_) {
      // Fallback without animations
      from.style.display = "none";
      to.style.display = "flex";
    }
  }

  // Wire “اظهار موقعي”
  function wireMyLocationButton() {
    on($("show-my-location"), "click", function () {
      if (typeof window.detectMyLocation === "function") {
        window.detectMyLocation();
      } else {
        console.warn("[main.js] detectMyLocation() not ready.");
      }
    });
  }

  // Wire area select → setBoundries()
  function wireAreaSelect() {
    var area = $("area");
    if (!area) return;

    on(area, "change", debounce(function () {
      if (typeof window.setBoundries === "function") {
        window.setBoundries();
      }
    }, 60));

    // In case options arrive asynchronously (Select2 load)
    const mo = new MutationObserver(debounce(function () {
      if (typeof window.setBoundries === "function") {
        window.setBoundries();
      }
    }, 100));
    mo.observe(area, { childList: true, subtree: true });

    // First-run attempt
    if (typeof window.setBoundries === "function") {
      window.setBoundries();
    }
  }

  // Wire “حجز جديد” fallback (keeps your inline handler behaviour if present)
  function wireRebook() {
    on($("rebook"), "click", function (e) {
      // If another script already handled, do nothing
      if (e.defaultPrevented) return;
      try { window.location.href = "https://www.spongnsoap.com/"; } catch (_) {}
    });
  }

  // NEW: Wire the first “Next” button (page1 → page2)
  function wirePage1Next() {
    var btn = $("page1-button");
    if (!btn) return;
    on(btn, "click", function () {
      switchPage("page1", "page2");
    });
  }

  // Optional: wire the rest if you want simple forward/back fallbacks.
  // These won’t clash with your inline logic; they only act if clicked.
  function wireFallbackNav() {
    var map = [
      ["page2-button",   "page2", "page3"],
      ["page3-return",   "page3", "page2"],
      ["page4-return",   "page4", "page2"], // your flow goes back to page2 from page4
      ["page5-return",   "page5", "page4"]
      // Note: page3-button/page4-button/page5-button/page6-button submit/validate
      // are handled in your inline script — we won’t override them here.
    ];
    map.forEach(function (m) {
      var el = $(m[0]);
      if (!el) return;
      on(el, "click", function () { switchPage(m[1], m[2]); });
    });
  }

  function sanityCheck() {
    if ($("googleMap") && typeof window.myMap !== "function") {
      // This is fine; the Google loader will call window.myMap() when ready.
      console.info("[main.js] Waiting for Google Maps to call window.myMap callback…");
    }
  }

  // Boot
  document.addEventListener("DOMContentLoaded", function () {
    wirePage1Next();        // ← Fixes your issue
    wireFallbackNav();      // Optional helpers for other buttons
    wireMyLocationButton(); // Map “my location” button
    wireAreaSelect();       // Area → polygon bounds
    wireRebook();           // Fallback for rebook
    sanityCheck();
  });

  // Optional tiny debug API
  window.NAHL_MAIN = {
    goto: switchPage,
    rewire: function () {
      wirePage1Next();
      wireFallbackNav();
      wireMyLocationButton();
      wireAreaSelect();
      wireRebook();
    }
  };
})();
