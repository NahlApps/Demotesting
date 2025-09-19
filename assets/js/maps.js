// /assets/js/maps.js

// ---------- Shared state ----------
let map = null;
let infoWindow = null;
let marker = null;
let polygon = null;

let position = ""; // Google Maps share URL
const prePosition = "https://www.google.com/maps/search/?api=1&query=";

// Default center
let defaultLocation = { lat: 26.34165524787632, lng: 50.11524831545726 };

// Publish minimal state for other scripts (optional)
function publishMapState() {
  window.__MAP_STATE__ = { map, infoWindow, marker, polygon, position };
}

// ---------- INIT ----------
function myMap() {
  const mapEl = document.getElementById("googleMap");
  if (!mapEl) {
    console.warn("googleMap element not found.");
    return;
  }

  map = new google.maps.Map(mapEl, {
    center: defaultLocation,
    zoom: 12,
    disableDoubleClickZoom: true
  });

  infoWindow = new google.maps.InfoWindow();

  marker = new google.maps.Marker({
    position: defaultLocation,
    map,
    draggable: true,
    title: "اضغط أو اسحب لتحديد الموقع"
  });

  // Drag to set
  marker.addListener("dragend", (e) => validateAndSetPosition(e.latLng));
  // Click to set
  map.addListener("click", (e) => validateAndSetPosition(e.latLng));
  // Double click: prevent default zoom & set
  map.addListener("dblclick", (e) => {
    if (e && typeof e.stop === "function") e.stop();
    validateAndSetPosition(e.latLng);
  });

  // Long press (mobile-ish)
  let pressTimer = null;
  map.addListener("mousedown", (e) => {
    pressTimer = setTimeout(() => validateAndSetPosition(e.latLng), 600);
  });
  map.addListener("mouseup", () => clearTimeout(pressTimer));
  map.addListener("touchstart", (e) => {
    pressTimer = setTimeout(() => validateAndSetPosition(e.latLng), 600);
  });
  map.addListener("touchend", () => clearTimeout(pressTimer));

  // Hide drag hint
  const dragHint = document.getElementById("drag-instructions");
  if (dragHint) {
    setTimeout(() => { dragHint.style.display = "none"; }, 5000);
    map.addListener("dragstart", () => { dragHint.style.display = "none"; });
  }

  // Wire button
  const locationBtn = document.getElementById("show-my-location");
  if (locationBtn) locationBtn.addEventListener("click", detectMyLocation);

  publishMapState();
}

// ---------- HELPERS ----------
function validateAndSetPosition(latLng) {
  if (!latLng) return;

  if (polygon && !google.maps.geometry.poly.containsLocation(latLng, polygon)) {
    alert("⚠️ عذرًا، موقعك خارج نطاق الخدمة");
    position = "";
    if (map && infoWindow) {
      infoWindow.setContent("🚫 موقع خارج الخدمة");
      infoWindow.setPosition(map.getCenter());
      infoWindow.open(map);
    }
    publishMapState();
    return;
  }

  if (marker) marker.setPosition(latLng);
  if (map) {
    map.panTo(latLng);
    map.setZoom(17);
  }

  position = `${prePosition}${latLng.lat()},${latLng.lng()}`;

  if (infoWindow) {
    infoWindow.setContent("✅ تم تحديث موقعك هنا");
    infoWindow.open(map, marker);
  }

  publishMapState();
}

// ---------- AREAS / BOUNDARIES ----------
function setBoundries() {
  const areaSelect = document.getElementById("area");
  if (!areaSelect) return;

  const selectedArea = areaSelect.options[areaSelect.selectedIndex]?.text?.trim() || "";
  let APP_Location;
  let polygonCoords;

  if (selectedArea === "العزيزية - الخبر") {
    APP_Location = {
      north: 26.237892901838705,
      south: 26.15102181049713,
      west: 50.090294685184475,
      east: 50.234894203935546
    };
    polygonCoords = [
      { lng: 50.215045355428195, lat: 26.219724394350184 },
      { lng: 50.2135291654911,   lat: 26.1870383495685   },
      { lng: 50.137875179099595, lat: 26.069703060741347 },
      { lng: 50.10628808282646,  lat: 26.15001891083389  },
      { lng: 50.143828288837895, lat: 26.21660551929113  },
      { lng: 50.19603263782255,  lat: 26.21897351180097  }
    ];
  } else if (selectedArea === "أجيال - أرامكو") {
    APP_Location = {
      north: 26.289037271670438,
      south: 26.237817336683204,
      west: 50.05143566513406,
      east: 50.096905737932595
    };
    polygonCoords = [
      { lng: 50.06256215323989,  lat: 26.275519772515292 },
      { lng: 50.070562455580834, lat: 26.277608292466685 },
      { lng: 50.08514528516432,  lat: 26.257720425641132 },
      { lng: 50.06822454797902,  lat: 26.24524748257814  },
      { lng: 50.06115405632103,  lat: 26.262628935642045 },
      { lng: 50.05894452767791,  lat: 26.267950423932856 }
    ];
  } else if (selectedArea === "الدوحة و الدانة") {
    APP_Location = {
      north: 26.37969652644046,
      south: 26.277002257490476,
      west: 50.11899625151807,
      east: 50.195753733969404
    };
    polygonCoords = [
      { lng: 50.11488540829821,  lat: 26.341056543806932  },
      { lng: 50.136645122501264, lat: 26.353671078060277  },
      { lng: 50.14577577434936,  lat: 26.363004767230812  },
      { lng: 50.178697561294584, lat: 26.332926849815745  },
      { lng: 50.17972636713662,  lat: 26.31448441448552   },
      { lng: 50.16468008169681,  lat: 26.29799900302895   }
    ];
  } else {
    alert("⚠️ المنطقة غير معرفة، يرجى الاختيار الصحيح");
    return;
  }

  defaultLocation = {
    lat: (APP_Location.north + APP_Location.south) / 2,
    lng: (APP_Location.east + APP_Location.west) / 2
  };

  if (polygon) {
    polygon.setMap(null);
    polygon = null;
  }

  polygon = new google.maps.Polygon({
    paths: polygonCoords,
    strokeColor: "#ff0000",
    strokeOpacity: 0.4,
    strokeWeight: 2,
    fillColor: "#00ff00",
    fillOpacity: 0.1
  });
  polygon.setMap(map);

  if (map) {
    map.setCenter(defaultLocation);
    map.setZoom(14);
  }
  if (marker) marker.setPosition(defaultLocation);

  position = `${prePosition}${defaultLocation.lat},${defaultLocation.lng}`;
  publishMapState();
}

// ---------- GEOLOCATION ----------
function detectMyLocation() {
  if (!navigator.geolocation) {
    handleLocationError(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userPos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

      if (polygon && !google.maps.geometry.poly.containsLocation(userPos, polygon)) {
        alert("⚠️ عذرًا، موقعك خارج نطاق الخدمة");
        return;
      }

      if (marker) marker.setPosition(userPos);
      if (map) {
        map.panTo(userPos);
        map.setZoom(17);
      }

      position = `${prePosition}${pos.coords.latitude},${pos.coords.longitude}`;
      if (infoWindow) infoWindow.close();

      publishMapState();
    },
    () => handleLocationError(true)
  );
}

function handleLocationError(browserHasGeolocation) {
  if (!map || !infoWindow) return;
  infoWindow.setPosition(map.getCenter());
  infoWindow.setContent(
    browserHasGeolocation
      ? "⚠️ تعذر الحصول على موقعك. يرجى السماح بالوصول للموقع."
      : "⚠️ جهازك لا يدعم تحديد الموقع."
  );
  infoWindow.open(map);
}

// ---------- EXPORTS + GLOBALS ----------
// ES module exports (so main.js can import)
export { myMap, setBoundries, detectMyLocation };

// Also attach to window so Google’s callback and non-module code can see them
window.myMap = myMap;
window.setBoundries = setBoundries;
window.detectMyLocation = detectMyLocation;

// Optional: expose read-only state
Object.defineProperty(window, "__MAP_STATE__", {
  get() { return { map, infoWindow, marker, polygon, position }; }
});
