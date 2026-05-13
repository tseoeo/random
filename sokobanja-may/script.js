// Sokobanja May 2026 — initialise Leaflet maps from data-gpx attributes.
// Each .map element gets an OSM-tiled Leaflet map with its GPX track overlaid.

(function () {
  function initMap(el) {
    var gpxUrl = el.getAttribute("data-gpx");
    if (!gpxUrl) return;

    // Default to a Sokobanja-area center; fitBounds will override on load.
    var map = L.map(el, {
      scrollWheelZoom: false, // tap/pinch on mobile; scroll on desktop only after click
      tap: true
    }).setView([43.65, 21.85], 12);

    // Enable scroll zoom only after first user interaction (click/tap into map).
    map.once("focus", function () { map.scrollWheelZoom.enable(); });
    map.on("click", function () { map.scrollWheelZoom.enable(); });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    new L.GPX(gpxUrl, {
      async: true,
      polyline_options: {
        color: el.id && el.id.indexOf("bike") !== -1 ? "#b56b2e" : "#4d7c5a",
        weight: 4,
        opacity: 0.85,
        lineCap: "round"
      },
      marker_options: {
        startIconUrl: null,
        endIconUrl: null,
        shadowUrl: null,
        wptIconUrls: { "": null }
      }
    })
      .on("loaded", function (e) {
        try {
          map.fitBounds(e.target.getBounds(), { padding: [16, 16] });
        } catch (err) {
          /* ignore — keep default view */
        }
      })
      .on("error", function (e) {
        console.error("GPX load error for", gpxUrl, e);
      })
      .addTo(map);
  }

  function ready() {
    if (typeof L === "undefined" || typeof L.GPX === "undefined") {
      // Leaflet or leaflet-gpx not loaded yet — retry shortly.
      setTimeout(ready, 100);
      return;
    }
    var maps = document.querySelectorAll(".map[data-gpx]");
    for (var i = 0; i < maps.length; i++) initMap(maps[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
})();
