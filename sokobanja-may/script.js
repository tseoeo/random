// Sokobanja May 2026 — Leaflet + leaflet-gpx initialiser.
// Each .route-map[data-gpx] gets an OSM-tiled map fitted to the GPX track.
// Peony "search areas" (Paeonia peregrina) are overlaid on the hike maps where
// they intersect the route, and a separate .overview-map shows everything.

(function () {
  if (typeof L === 'undefined') {
    console.warn('Leaflet not loaded; maps will be blank.');
    return;
  }

  const TILE_URL  = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const FALLBACK_CENTER = [43.65, 21.87];
  const FALLBACK_ZOOM   = 12;

  // Peony zones — Paeonia peregrina.
  // Sources: 2005 flora survey "Protected Nature areas, Flora and Vegetation in
  // vicinity of Sokobanja" (Tatić & Stevanović), name-level resolution only.
  // Centres are approximate toponym positions, not survey-grade pins — treat
  // each circle as a search area, not a marker.
  const PEONY_ZONES = [
    {
      id: 'lepterija',
      name: 'Lepterija – Sokograd',
      center: [43.6406, 21.8901],
      radius: 600,
      note: 'Meadows above Lepterija picnic ground and the ridge toward Sokograd / Šiljati Kamen.',
      onHikes: ['hike-1', 'hike-2']
    },
    {
      id: 'vidikovci',
      name: 'Vidikovci basin meadows',
      center: [43.6250, 21.8700],
      radius: 600,
      note: 'Basin-edge meadow stretch on the southern arc of the circuit (Borići → Janior viewpoint area).',
      onHikes: ['hike-2']
    },
    {
      id: 'ripaljka',
      name: 'Velika & Mala Ripaljka',
      center: [43.6330, 21.8520],
      radius: 450,
      note: 'Meadow margins near the picnic ground and along the second-cascade approach.',
      onHikes: ['hike-2', 'hike-3', 'hike-bonus']
    },
    {
      id: 'ozrenske-livade',
      name: 'Ozrenske livade',
      center: [43.5970, 21.8290],
      radius: 900,
      note: 'Grazed clearings along the Ozren / Leskovik ridge — forest-edge openings rather than open basin meadow, so peony density lower than Vidikovci.',
      onHikes: ['hike-5', 'hike-bonus']
    },
    {
      id: 'jasenova-glava',
      name: 'Mala Jasenova Glava',
      center: [43.7947, 21.6803],
      radius: 600,
      note: 'Mid-slope karst meadows on the western Rtanj massif (~852 m). About 16 km W of the Šiljak summit and the Hike 4 trailhead — accessed separately via Lukovo / Vrmdža on the W approach.',
      onHikes: []   // OFF-HIKE — appears only on the overview map.
    }
  ];

  const PEONY_STYLE = {
    color: '#9b1c1c',           // peony-red ring
    weight: 2,
    fillColor: '#d62828',
    fillOpacity: 0.18,
  };

  const PEONY_STYLE_OFFHIKE = {
    color: '#6a1b9a',
    weight: 3,
    fillColor: '#9c27b0',
    fillOpacity: 0.22,
    dashArray: '6,4',
  };

  // Hike trailheads for the overview map.
  const TRAILHEADS = [
    { id: 'hike-1', name: '1 · Lepterija → Soko Grad', latlng: [43.6406, 21.8901] },
    { id: 'hike-2', name: '2 · Vidikovci circuit',     latlng: [43.6443, 21.8703] },
    { id: 'hike-3', name: '3 · Ripaljka waterfall',    latlng: [43.5969, 21.8889] },
    { id: 'hike-4', name: '4 · Rtanj Šiljak',          latlng: [43.7700, 21.8900] },
    { id: 'hike-5', name: '5 · Ozren-Leskovik',        latlng: [43.5800, 21.9450] },
  ];

  // Tooltip / popup helpers — build DOM nodes (no innerHTML, no string HTML).
  function buildZoneTooltip(zone, offHike) {
    const wrap = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = zone.name;
    wrap.appendChild(strong);
    if (offHike) {
      const tag = document.createElement('span');
      tag.className = 'peony-offhike-tag';
      tag.textContent = ' [off all hikes]';
      wrap.appendChild(tag);
    }
    wrap.appendChild(document.createElement('br'));
    const em = document.createElement('em');
    em.textContent = 'Paeonia peregrina';
    wrap.appendChild(em);
    const trailing = document.createTextNode(' search area');
    wrap.appendChild(trailing);
    return wrap;
  }

  function buildZonePopup(zone, offHike) {
    const wrap = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = zone.name;
    wrap.appendChild(strong);
    if (offHike) {
      const tag = document.createElement('span');
      tag.className = 'peony-offhike-tag';
      tag.textContent = ' [off all hikes]';
      wrap.appendChild(tag);
    }
    wrap.appendChild(document.createElement('br'));
    const em = document.createElement('em');
    em.textContent = 'Paeonia peregrina';
    wrap.appendChild(em);
    wrap.appendChild(document.createElement('br'));
    const noteNode = document.createTextNode(zone.note);
    wrap.appendChild(noteNode);
    return wrap;
  }

  function addPeonyZones(map, hikeId) {
    PEONY_ZONES
      .filter(z => z.onHikes.includes(hikeId))
      .forEach(z => {
        L.circle(z.center, { radius: z.radius, ...PEONY_STYLE })
          .bindTooltip(buildZoneTooltip(z, false), { direction: 'top', sticky: true })
          .bindPopup(buildZonePopup(z, false))
          .addTo(map);
      });
  }

  function initHikeMap(container) {
    const gpxFile = container.getAttribute('data-gpx');
    if (!gpxFile) return;

    // Hike id derived from the container id, e.g. "map-hike-1" → "hike-1".
    const hikeId = (container.id || '').replace(/^map-/, '');

    const map = L.map(container, {
      scrollWheelZoom: false,
      tap: true,
      zoomControl: true,
    }).setView(FALLBACK_CENTER, FALLBACK_ZOOM);

    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 18 }).addTo(map);

    map.on('click',    () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());

    if (typeof L.GPX === 'undefined') {
      console.warn('leaflet-gpx not loaded; track not rendered for', gpxFile);
      addPeonyZones(map, hikeId);
      return;
    }

    new L.GPX(gpxFile, {
      async: true,
      polyline_options: {
        color: '#a0522d',
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
        addPeonyZones(map, hikeId);
      })
      .on('error', function (e) {
        console.warn('GPX load error for', gpxFile, e);
        addPeonyZones(map, hikeId);
      })
      .addTo(map);
  }

  function buildLegend() {
    const div = L.DomUtil.create('div', 'map-legend');

    function row(swatchClass, label) {
      const sw = L.DomUtil.create('span', 'sw ' + swatchClass, div);
      sw.setAttribute('aria-hidden', 'true');
      const text = document.createTextNode(' ' + label);
      div.appendChild(text);
      div.appendChild(document.createElement('br'));
    }

    row('on',  'on a hike route');
    row('off', 'off all hikes');
    row('th',  'hike trailhead');

    // Remove the trailing <br>.
    if (div.lastChild && div.lastChild.nodeName === 'BR') div.removeChild(div.lastChild);
    return div;
  }

  function initOverviewMap(container) {
    const map = L.map(container, {
      scrollWheelZoom: false,
      tap: true,
      zoomControl: true,
    });

    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 18 }).addTo(map);

    map.on('click',    () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());

    const allBounds = [];

    PEONY_ZONES.forEach(z => {
      const offHike = z.onHikes.length === 0;
      const style = offHike ? PEONY_STYLE_OFFHIKE : PEONY_STYLE;
      L.circle(z.center, { radius: z.radius, ...style })
        .bindTooltip(buildZoneTooltip(z, offHike), { direction: 'top', sticky: true })
        .bindPopup(buildZonePopup(z, offHike))
        .addTo(map);
      allBounds.push(z.center);
    });

    TRAILHEADS.forEach(t => {
      L.circleMarker(t.latlng, {
        radius: 5,
        color: '#20262d',
        fillColor: '#fff',
        fillOpacity: 1,
        weight: 2,
      })
        .bindTooltip(t.name, { direction: 'top' })
        .addTo(map);
      allBounds.push(t.latlng);
    });

    try { map.fitBounds(L.latLngBounds(allBounds), { padding: [24, 24] }); }
    catch (err) { map.setView([43.70, 21.83], 10); }

    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = buildLegend;
    legend.addTo(map);
  }

  function initAll() {
    document.querySelectorAll('.route-map[data-gpx]').forEach(initHikeMap);
    const overview = document.getElementById('map-overview');
    if (overview) initOverviewMap(overview);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
