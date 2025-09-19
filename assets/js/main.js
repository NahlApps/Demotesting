// Non-module bootstrap for small UI bindings that touch the map helpers.

// Hook “اظهار موقعي” button
document.addEventListener("DOMContentLoaded", function () {
  var btn = document.getElementById("show-my-location");
  if (btn) {
    btn.addEventListener("click", function () {
      if (typeof window.detectMyLocation === "function") {
        window.detectMyLocation();
      }
    });
  }

  // If your flow needs to set boundaries when area changes:
  var area = document.getElementById("area");
  if (area) {
    area.addEventListener("change", function () {
      if (typeof window.setBoundries === "function") {
        window.setBoundries();
      }
    });
  }
});
