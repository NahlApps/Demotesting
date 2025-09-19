/* globals google */
// Expose everything we need as globals so your inline code can use them.
window.NAHL_MAPS = window.NAHL_MAPS || {};

(function () {
  // ====== Shared state (globals) ======
  let map, infoWindow, marker, polygon = null;
  let position = "";
  const prePosition = "https://www.google.com/maps/search/?api=1&query=";

  // Reasonable default center until area is chosen
  let defaultLocation = { lat: 26.34165524787632, lng: 50.11524831545726 };

  // Helper: ensure geometry library loaded
  function hasGeometry() {
    return !!(google && google.maps && google.maps.geometry && google.maps.geometry.poly);
  }

  // ====== Init map (Google callback) ======
  function myMap() {
    const el = document.getElementById("googleMap");
    if (!el) return;

    map = new google.maps.Map(el, {
      center: defaultLocation,
      zoom: 12,
      disableDoubleClickZoom: true
    });

    infoWindow = new google.maps.InfoWindow();

    marker = new google.maps.Marker({
      position: defaultLocation,
      map,
      draggable: true,
      title: "اضغط أو اسحب لتحديد الموقع",
    });

    // Marker drag
    marker.addListener("dragend", (e) => validateAndSetPosition(e.latLng));

    // Click / dblclick on map
    map.addListener("click", (e) => validateAndSetPosition(e.latLng));
    map.addListener("dblclick", (e) => {
      if (e.stop) e.stop();
      validateAndSetPosition(e.latLng);
    });

    // Long-press support
    let pressTimer;
    map.addListener("mousedown", (e) => { pressTimer = setTimeout(() => validateAndSetPosition(e.latLng), 600); });
    map.addListener("mouseup",   () => clearTimeout(pressTimer));
    map.addListener("touchstart", (e) => { pressTimer = setTimeout(() => validateAndSetPosition(e.latLng), 600); });
    map.addListener("touchend",   () => clearTimeout(pressTimer));

    // Hide the drag hint when user interacts
    const dragHint = document.getElementById("drag-instructions");
    if (dragHint) {
      setTimeout(() => dragHint.style.display = "none", 5000);
      map.addListener("dragstart", () => { dragHint.style.display = "none"; });
    }
  }

  // ====== Position update with polygon guard ======
  function validateAndSetPosition(latLng) {
    if (polygon && hasGeometry() && !google.maps.geometry.poly.containsLocation(latLng, polygon)) {
      alert("⚠️ عذرًا، موقعك خارج نطاق الخدمة");
      position = "";
      infoWindow.setContent("🚫 موقع خارج الخدمة");
      infoWindow.open(map);
      return;
    }
    marker.setPosition(latLng);
    map.panTo(latLng);
    map.setZoom(17);
    position = `${prePosition}${latLng.lat()},${latLng.lng()}`;
    infoWindow.setContent("✅ تم تحديث موقعك هنا");
    infoWindow.open(map, marker);
  }

  // ====== Area -> bounds/polygon ======
  function setBoundries() {
    const areaSelect = document.getElementById("area");
    if (!areaSelect) return;
    const selectedArea = areaSelect.options[areaSelect.selectedIndex]?.text?.trim() || "";

    let APP_Location, polygonCoords;

    if (selectedArea === "العزيزية - الخبر") {
      APP_Location = {
        north: 26.237892901838705, south: 26.15102181049713,
        west: 50.090294685184475,  east: 50.234894203935546,
      };
      polygonCoords = [
        { lng: 50.215045355428195, lat: 26.219724394350184 },
        { lng: 50.2135291654911,   lat: 26.1870383495685 },
        { lng: 50.137875179099595, lat: 26.069703060741347 },
        { lng: 50.10628808282646,  lat: 26.15001891083389 },
        { lng: 50.143828288837895, lat: 26.21660551929113 },
        { lng: 50.19603263782255,  lat: 26.21897351180097 },
      ];
    } else if (selectedArea === "أجيال - أرامكو") {
      APP_Location = {
        north: 26.289037271670438, south: 26.237817336683204,
        west: 50.05143566513406,   east: 50.096905737932595,
      };
      polygonCoords = [
        { lng: 50.06256215323989, lat: 26.275519772515292 },
        { lng: 50.070562455580834, lat: 26.277608292466685 },
        { lng: 50.08514528516432,  lat: 26.257720425641132 },
        { lng: 50.06822454797902,  lat: 26.24524748257814 },
        { lng: 50.06115405632103,  lat: 26.262628935642045 },
        { lng: 50.05894452767791,  lat: 26.267950423932856 },
      ];
    } else if (selectedArea === "الدوحة و الدانة") {
      APP_Location = {
        north: 26.37969652644046, south: 26.277002257490476,
        west: 50.11899625151807,  east: 50.195753733969404,
      };
      polygonCoords = [
        { lng: 50.11488540829821, lat: 26.341056543806932 },
        { lng: 50.136645122501264, lat: 26.353671078060277 },
        { lng: 50.14577577434936,  lat: 26.363004767230812 },
        { lng: 50.178697561294584, lat: 26.3329268498157454 },
        { lng: 50.17972636713662,  lat: 26.31448441448552 },
        { lng: 50.16468008169681,  lat: 26.29799900302895 },
      ];
    } else {
      alert("⚠️ المنطقة غير معرفة، يرجى الاختيار الصحيح");
      return;
    }

    // recenter
    defaultLocation = {
      lat: (APP_Location.north + APP_Location.south) / 2,
      lng: (APP_Location.east + APP_Location.west) / 2,
    };

    // (Re)create polygon
    if (polygon) { polygon.setMap(null); }
    polygon = new google.maps.Polygon({
      paths: polygonCoords,
      strokeColor: "#ff0000",
      strokeOpacity: 0.4,
      strokeWeight: 2,
      fillColor: "#00ff00",
      fillOpacity: 0.1,
    });
    if (map) polygon.setMap(map);

    // move marker/center to default
    if (map && marker) {
      map.setCenter(defaultLocation);
      map.setZoom(14);
      marker.setPosition(defaultLocation);
      position = `${prePosition}${defaultLocation.lat},${defaultLocation.lng}`;
    }
  }

  // ====== My location ======
  function detectMyLocation() {
    if (!navigator.geolocation) {
      handleLocationError(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

        if (polygon && hasGeometry() && !google.maps.geometry.poly.containsLocation(latLng, polygon)) {
          alert("⚠️ عذرًا، موقعك خارج نطاق الخدمة");
          return;
        }
        if (!map || !marker) return;

        marker.setPosition(latLng);
        map.panTo(latLng);
        map.setZoom(17);
        position = `${prePosition}${pos.coords.latitude},${pos.coords.longitude}`;
        if (infoWindow) infoWindow.close();
      },
      () => handleLocationError(true)
    );
  }

  function handleLocationError(browserHasGeolocation) {
    if (!map) return;
    if (!infoWindow) infoWindow = new google.maps.InfoWindow();
    infoWindow.setPosition(map.getCenter());
    infoWindow.setContent(
      browserHasGeolocation
        ? "⚠️ تعذر الحصول على موقعك. يرجى السماح بالوصول للموقع."
        : "⚠️ جهازك لا يدعم تحديد الموقع."
    );
    infoWindow.open(map);
  }

  // ====== Expose to window (so your inline code can use them) ======
  window.myMap = myMap; // <- REQUIRED for Google callback
  window.setBoundries = setBoundries;
  window.detectMyLocation = detectMyLocation;
  window.validateAndSetPosition = validateAndSetPosition;

  // expose state if your inline code reads them
  Object.assign(window.NAHL_MAPS, {
    get map() { return map; },
    get infoWindow() { return infoWindow; },
    get marker() { return marker; },
    get polygon() { return polygon; },
    get position() { return position; },
    set position(v) { position = v; },
    get defaultLocation() { return defaultLocation; },
    set defaultLocation(v) { defaultLocation = v; }
  });
})();
