// Initialise Leaflet + leaflet-gpx for every .route-map[data-gpx] on the page.
// Each map gets OSM tiles, a fitted bounds from the GPX track, and a compact toolbar.

(function () {
  if (typeof L === 'undefined') {
    console.warn('Leaflet not loaded; maps will be blank.');
    return;
  }

  const TILE_URL  = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // Initial fallback view if a GPX fails to load: rough centre of the Sokobanja basin.
  const FALLBACK_CENTER = [43.65, 21.87];
  const FALLBACK_ZOOM   = 12;

  function initMap(container) {
    const gpxFile = container.getAttribute('data-gpx');
    if (!gpxFile) return;

    const map = L.map(container, {
      scrollWheelZoom: false,   // don't hijack page scroll on desktop
      tap: true,
      zoomControl: true,
    }).setView(FALLBACK_CENTER, FALLBACK_ZOOM);

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTR,
      maxZoom: 18,
    }).addTo(map);

    // Enable scroll-zoom on click (mobile-friendly; doesn't hijack on first contact).
    map.on('click', function () { map.scrollWheelZoom.enable(); });
    map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

    if (typeof L.GPX === 'undefined') {
      console.warn('leaflet-gpx plugin not loaded; GPX track not rendered for', gpxFile);
      return;
    }

    new L.GPX(gpxFile, {
      async: true,
      polyline_options: {
        color: '#a0522d',     // terracotta — visible over OSM
        weight: 4,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      },
      marker_options: {
        startIconUrl: null,
        endIconUrl: null,
        shadowUrl: null,
        wptIconUrls: { '': null },
      },
    })
      .on('loaded', function (e) {
        try { map.fitBounds(e.target.getBounds(), { padding: [16, 16] }); }
        catch (err) { /* keep fallback view */ }
      })
      .on('error', function (e) {
        console.warn('GPX load error for', gpxFile, e);
      })
      .addTo(map);
  }

  function initAll() {
    document.querySelectorAll('.route-map[data-gpx]').forEach(initMap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
