import { prePosition } from './config.js';

// Keep in module scope
let map, infoWindow, marker, polygon = null;
let defaultLocation = { lat: 26.34165524787632, lng: 50.11524831545726 };
let position = "";

// expose shared state for other modules
window.__MAP_STATE__ = { map: null, infoWindow: null, marker: null, polygon: null, position: "", defaultLocation };

function updateSharedState() {
  window.__MAP_STATE__.map = map;
  window.__MAP_STATE__.infoWindow = infoWindow;
  window.__MAP_STATE__.marker = marker;
  window.__MAP_STATE__.polygon = polygon;
  window.__MAP_STATE__.position = position;
  window.__MAP_STATE__.defaultLocation = defaultLocation;
}

export function myMap() {
  map = new google.maps.Map(document.getElementById("googleMap"), {
    center: defaultLocation,
    zoom: 12,
    disableDoubleClickZoom: true
  });

  infoWindow = new google.maps.InfoWindow();

  marker = new google.maps.Marker({
    position: defaultLocation,
    map: map,
    draggable: true,
    title: "اضغط أو اسحب لتحديد الموقع",
  });

  marker.addListener("dragend", (e) => validateAndSetPosition(e.latLng));
  map.addListener("click", (e) => validateAndSetPosition(e.latLng));

  // dblclick/long-press handling
  map.addListener("dblclick", (e) => { e.stop(); validateAndSetPosition(e.latLng); });
  let pressTimer;
  map.addListener("mousedown", (e) => { pressTimer = setTimeout(() => validateAndSetPosition(e.latLng), 600); });
  map.addListener("mouseup", () => clearTimeout(pressTimer));
  map.addListener("touchstart", (e) => { pressTimer = setTimeout(() => validateAndSetPosition(e.latLng), 600); });
  map.addListener("touchend", () => clearTimeout(pressTimer));

  const dragHint = document.getElementById("drag-instructions");
  setTimeout(() => { if (dragHint) dragHint.style.display = "none"; }, 5000);
  map.addListener("dragstart", () => { if (dragHint) dragHint.style.display = "none"; });

  updateSharedState();
}

function validateAndSetPosition(latLng) {
  if (polygon && !google.maps.geometry.poly.containsLocation(latLng, polygon)) {
    alert("⚠️ عذرًا، موقعك خارج نطاق الخدمة");
    position = "";
    infoWindow.setContent("🚫 موقع خارج الخدمة");
    infoWindow.open(map);
    updateSharedState();
    return;
  }

  marker.setPosition(latLng);
  map.panTo(latLng);
  map.setZoom(17);
  position = `https://www.google.com/maps/search/?api=1&query=${latLng.lat()},${latLng.lng()}`;
  infoWindow.setContent("✅ تم تحديث موقعك هنا");
  infoWindow.open(map, marker);
  updateSharedState();
}

export function setBoundries() {
  const areaSelect = document.getElementById("area");
  const selectedArea = areaSelect.options[areaSelect.selectedIndex]?.text?.trim();

  let APP_Location, polygonCoords;

  if (selectedArea === "العزيزية - الخبر") {
    APP_Location = { north: 26.237892901838705, south: 26.15102181049713, west: 50.090294685184475, east: 50.234894203935546 };
    polygonCoords = [
      { lng: 50.215045355428195, lat: 26.219724394350184 },
      { lng: 50.2135291654911,   lat: 26.1870383495685 },
      { lng: 50.137875179099595, lat: 26.069703060741347 },
      { lng: 50.10628808282646,  lat: 26.15001891083389 },
      { lng: 50.143828288837895, lat: 26.21660551929113 },
      { lng: 50.19603263782255,  lat: 26.21897351180097 },
    ];
  } else if (selectedArea === "أجيال - أرامكو") {
    APP_Location = { north: 26.289037271670438, south: 26.237817336683204, west: 50.05143566513406, east: 50.096905737932595 };
    polygonCoords = [
      { lng: 50.06256215323989, lat: 26.275519772515292 },
      { lng: 50.070562455580834, lat: 26.277608292466685 },
      { lng: 50.08514528516432,  lat: 26.257720425641132 },
      { lng: 50.06822454797902,  lat: 26.24524748257814 },
      { lng: 50.06115405632103,  lat: 26.262628935642045 },
      { lng: 50.05894452767791,  lat: 26.267950423932856 },
    ];
  } else if (selectedArea === "الدوحة و الدانة") {
    APP_Location = { north: 26.37969652644046, south: 26.277002257490476, west: 50.11899625151807, east: 50.195753733969404 };
    polygonCoords = [
      { lng: 50.11488540829821, lat: 26.341056543806932 },
      { lng: 50.136645122501264, lat: 26.353671078060277 },
      { lng: 50.14577577434936,  lat: 26.363004767230812 },
      { lng: 50.178697561294584,  lat: 26.3329268498157454 },
      { lng: 50.17972636713662,  lat: 26.31448441448552 },
      { lng: 50.16468008169681,  lat: 26.29799900302895 },
    ];
  } else {
    alert("⚠️ المنطقة غير معرفة، يرجى الاختيار الصحيح");
    return;
  }

  defaultLocation = {
    lat: (APP_Location.north + APP_Location.south) / 2,
    lng: (APP_Location.east + APP_Location.west) / 2,
  };

  if (polygon) polygon.setMap(null);
  polygon = new google.maps.Polygon({
    paths: polygonCoords,
    strokeColor: "#ff0000",
    strokeOpacity: 0.4,
    strokeWeight: 2,
    fillColor: "#00ff00",
    fillOpacity: 0.1,
  });
  polygon.setMap(map);

  map.setCenter(defaultLocation);
  map.setZoom(14);
  marker.setPosition(defaultLocation);
  position = `${prePosition}${defaultLocation.lat},${defaultLocation.lng}`;
  updateSharedState();
}

// Locate me
export function detectMyLocation() {
  if (!navigator.geolocation) return handleLocationError(false);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userPos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      if (polygon && !google.maps.geometry.poly.containsLocation(userPos, polygon)) {
        alert("⚠️ عذرًا، موقعك خارج نطاق الخدمة");
        return;
      }
      marker.setPosition(userPos);
      map.panTo(userPos);
      map.setZoom(17);
      position = `${prePosition}${pos.coords.latitude},${pos.coords.longitude}`;
      infoWindow.close();
      updateSharedState();
    },
    () => handleLocationError(true)
  );
}

function handleLocationError(browserHasGeolocation) {
  infoWindow.setPosition(map.getCenter());
  infoWindow.setContent(
    browserHasGeolocation
      ? "⚠️ تعذر الحصول على موقعك. يرجى السماح بالوصول للموقع."
      : "⚠️ جهازك لا يدعم تحديد الموقع."
  );
  infoWindow.open(map);
  updateSharedState();
}

// expose globals for Google callback & HTML inline handlers
window.myMap = myMap;
window.setBoundries = setBoundries;
window.detectMyLocation = detectMyLocation;
