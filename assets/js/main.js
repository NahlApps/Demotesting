/**
 * /assets/js/main.js
 * Lightweight bootstrap that connects page UI to the global map helpers.
 * Depends on /assets/js/maps.js being loaded first (it defines window.myMap, window.setBoundries, window.detectMyLocation).
 *
 * No ES modules here — everything is plain JS and global-safe.
 */

(function () {
  "use strict";

  // Helper: add event listener if the element exists
  function on(el, evt, handler, opts) {
    if (!el) return;
    el.addEventListener(evt, handler, opts || false);
  }

  // Helper: debounce (for noisy events like selects that are programmatically updated)
  function debounce(fn, wait) {
    let t;
    return function () {
      const ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  // Hook up “اظهار موقعي” button -> detectMyLocation()
  function wireMyLocationButton() {
    var btn = document.getElementById("show-my-location");
    on(btn, "click", function () {
      if (typeof window.detectMyLocation === "function") {
        window.detectMyLocation();
      } else {
        console.warn("[main.js] detectMyLocation is not available yet.");
      }
    });
  }

  // Wire area select -> setBoundries()
  function wireAreaSelect() {
    var area = document.getElementById("area");
    if (!area) return;

    // When user changes the dropdown
    on(area, "change", debounce(function () {
      if (typeof window.setBoundries === "function") {
        window.setBoundries();
      } else {
        console.warn("[main.js] setBoundries is not available yet.");
      }
    }, 50));

    // If options are injected later (e.g., after an async load), run once automatically
    const tryApplyBounds = debounce(function () {
      if (!area.value && area.options.length > 0) {
        // Select2 may set value via JS; we still attempt to set bounds using current selection text.
      }
      if (typeof window.setBoundries === "function") {
        window.setBoundries();
      }
    }, 100);

    // Observe changes to the <select> (new options from async load)
    const mo = new MutationObserver(function () {
      tryApplyBounds();
    });
    mo.observe(area, { childList: true, subtree: true });

    // Kick once on load in case values already exist
    tryApplyBounds();
  }

  // Optional: Wire the rebook button to navigate home (keeps behavior in case inline code is absent)
  function wireRebook() {
    var rebook = document.getElementById("rebook");
    on(rebook, "click", function (e) {
      // if inline script already attached, this won't hurt; let navigation happen
      if (!e.defaultPrevented) {
        // fallback: go to homepage if no other handler
        try {
          // You can change the URL below if needed
          window.location.href = "https://www.spongnsoap.com/";
        } catch (_) {}
      }
    });
  }

  // Accessibility: if a #googleMap container exists but the API hasn’t run yet,
  // provide a gentle console note. (The Google callback still initializes the map.)
  function sanityCheck() {
    var mapEl = document.getElementById("googleMap");
    if (mapEl && typeof window.myMap !== "function") {
      // This is fine — Google Maps will call window.myMap() once its script loads.
      // We log just in case the loader tag is missing or placed before maps.js.
      console.info("[main.js] Waiting for Google Maps to call window.myMap callback…");
    }
  }

  // Boot
  document.addEventListener("DOMContentLoaded", function () {
    wireMyLocationButton();
    wireAreaSelect();
    wireRebook();
    sanityCheck();
  });

  // Expose a tiny debug handle (optional)
  window.NAHL_MAIN = {
    rewire: function () {
      wireMyLocationButton();
      wireAreaSelect();
      wireRebook();
    }
  };
})();
