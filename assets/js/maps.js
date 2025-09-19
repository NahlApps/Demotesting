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
    alert("⚠️ عذرًا، موقعك خارج نطاق الخدم
