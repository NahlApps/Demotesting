// assets/js/main.js
import { initPhoneInput, attachPlateSanitizer } from "./validation.js";
import { loadLocationsToSelect, loadServicesForLocation } from "./services.js";
import { initAppointments, onDateChange } from "./appointments.js";
import { initNavigation } from "./navigation.js";
import { initMapButtons } from "./maps.js";
import { initTermsFlow } from "./terms.js";
import { initBrands } from "./brands.js";
import { DateTime, els } from "./config.js";

(function boot() {
  // 1) Phone input & saved values
  const iti = initPhoneInput();

  // 2) Brands select
  initBrands();

  // 3) Appointments date init (min + default + headers)
  initAppointments();

  // 4) Load locations -> then services for selected location
  loadLocationsToSelect().catch(console.error);

  // When area changes, fetch services
  document.getElementById("area")?.addEventListener("change", (e) => {
    const val = e.target.value;
    if (!val) return;
    loadServicesForLocation(val)
      .then(() => {
        // after services refresh, refresh times for selected date
        document.getElementById("date")?.dispatchEvent(new Event("change"));
      })
      .catch(console.error);
  });

  // When service changes, refresh appointments list for date
  document.getElementById("service")?.addEventListener("change", () => {
    document.getElementById("date")?.dispatchEvent(new Event("change"));
  });

  // 5) Map helpers buttons
  initMapButtons();

  // 6) Terms → submit flow on Page 6
  initTermsFlow();

  // 7) Navigation (next/back + auto-advance behavior)
  initNavigation();

  // 8) Plate sanitize + hidden description updater
  attachPlateSanitizer();

  // 9) RTL/LTR date input dir
  try {
    document.getElementById("date")?.setAttribute("dir",
      (navigator.language || "").includes("ar") ? "rtl" : "ltr"
    );
  } catch {}

  // 10) Default today in yyyy-MM-dd
  try { els.date().value = DateTime.now().toFormat("yyyy-MM-dd"); } catch {}

  console.log("[main] boot ok");
})();
