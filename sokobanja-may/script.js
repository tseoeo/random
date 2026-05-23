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
  // Polygon coordinates are real OSM way geometries (natural=meadow / leisure=park),
  // queried via Overpass API. Where OSM has no polygon, a tight circle stands in.
  const PEONY_ZONES = [
    {
      id: 'lepterija',
      name: 'Lepterija picnic meadow',
      shape: 'circle',
      center: [43.6406, 21.8901],
      radius: 150,
      note: 'Riverside picnic clearing on the Moravica bend. The site is unmapped in OSM, so this is a tight toponym-centred circle — scan the open ground on arrival.',
      onHikes: ['hike-1', 'hike-2']
    },
    {
      id: 'vidikovci-a',
      name: 'Vidikovci basin meadow (north)',
      shape: 'polygon',
      coords: [[43.61950,21.87508],[43.61831,21.87546],[43.61825,21.87560],[43.61829,21.87574],[43.61836,21.87581],[43.61993,21.87658],[43.62018,21.87656],[43.62045,21.87645],[43.62060,21.87623],[43.62068,21.87601],[43.62071,21.87576],[43.62085,21.87516],[43.62097,21.87504],[43.62090,21.87487],[43.62061,21.87493],[43.62069,21.87470],[43.62050,21.87456],[43.62033,21.87471],[43.62033,21.87489],[43.62009,21.87514],[43.61958,21.87524],[43.61950,21.87508]],
      note: 'OSM-tagged meadow on the southern arc of the Vidikovci circuit (way 782784230).',
      onHikes: ['hike-2']
    },
    {
      id: 'vidikovci-b',
      name: 'Vidikovci basin meadow (saddle)',
      shape: 'polygon',
      coords: [[43.61594,21.87233],[43.61579,21.87241],[43.61568,21.87241],[43.61564,21.87237],[43.61545,21.87240],[43.61545,21.87287],[43.61560,21.87291],[43.61588,21.87296],[43.61593,21.87277],[43.61590,21.87270],[43.61591,21.87263],[43.61598,21.87259],[43.61597,21.87240],[43.61594,21.87233]],
      note: 'Small OSM-tagged meadow further W on the circuit (way 840229713).',
      onHikes: ['hike-2']
    },
    {
      id: 'vidikovci-c',
      name: 'Vidikovci basin meadow (east)',
      shape: 'polygon',
      coords: [[43.61341,21.88013],[43.61391,21.87974],[43.61406,21.88001],[43.61452,21.87972],[43.61464,21.87984],[43.61470,21.88018],[43.61426,21.88059],[43.61407,21.88096],[43.61376,21.88112],[43.61348,21.88092],[43.61341,21.88013]],
      note: 'OSM-tagged meadow on the east leg of the loop (way 785217001).',
      onHikes: ['hike-2']
    },
    {
      id: 'ripaljka',
      name: 'Velika & Mala Ripaljka',
      shape: 'polygon',
      coords: [[43.62774,21.85163],[43.62651,21.85275],[43.62590,21.85296],[43.62519,21.85294],[43.62510,21.85464],[43.62586,21.85417],[43.62673,21.85434],[43.62823,21.85356],[43.62774,21.85163]],
      note: 'Named OSM park polygon "Водопад Рипаљка" (way 406051889) — the picnic ground and meadow margins around the waterfall.',
      onHikes: ['hike-2', 'hike-3', 'hike-bonus']
    },
    {
      id: 'ozrenske-livade',
      name: 'Ozrenske livade',
      shape: 'polygon',
      coords: [[43.61819,21.82764],[43.61816,21.82718],[43.61809,21.82646],[43.61800,21.82621],[43.61770,21.82584],[43.61740,21.82603],[43.61706,21.82674],[43.61695,21.82635],[43.61747,21.82513],[43.61736,21.82485],[43.61645,21.82534],[43.61484,21.82550],[43.61464,21.82654],[43.61370,21.82717],[43.61311,21.82661],[43.61245,21.82706],[43.61207,21.82719],[43.61052,21.82774],[43.60923,21.82790],[43.60922,21.82863],[43.60800,21.82965],[43.60644,21.83140],[43.60576,21.83252],[43.60609,21.83335],[43.60799,21.83102],[43.60896,21.83069],[43.60948,21.82960],[43.61085,21.82900],[43.61224,21.82813],[43.61221,21.82934],[43.61006,21.83062],[43.60915,21.83179],[43.60797,21.83313],[43.60661,21.83381],[43.60551,21.83554],[43.60487,21.83465],[43.60504,21.83625],[43.60423,21.83735],[43.60343,21.83680],[43.60241,21.83742],[43.60200,21.83894],[43.60092,21.84024],[43.60084,21.84123],[43.60082,21.84371],[43.60133,21.84433],[43.60198,21.84399],[43.60224,21.84311],[43.60270,21.84232],[43.60251,21.84170],[43.60245,21.84090],[43.60278,21.83931],[43.60375,21.83924],[43.60465,21.83934],[43.60522,21.83943],[43.60481,21.83804],[43.60510,21.83766],[43.60602,21.83792],[43.60585,21.83718],[43.60584,21.83619],[43.60622,21.83528],[43.60692,21.83494],[43.60790,21.83432],[43.60897,21.83772],[43.60916,21.83710],[43.60943,21.83595],[43.60982,21.83552],[43.61040,21.83561],[43.61052,21.83650],[43.61077,21.83712],[43.61180,21.83758],[43.61309,21.83609],[43.61381,21.83460],[43.61484,21.83417],[43.61530,21.83382],[43.61537,21.83258],[43.61526,21.83188],[43.61512,21.83108],[43.61558,21.83013],[43.61523,21.82972],[43.61610,21.82967],[43.61665,21.82977],[43.61705,21.82875],[43.61816,21.82882],[43.61835,21.82773],[43.61819,21.82764]],
      note: 'OSM-tagged meadow complex along the Ozren / Leskovik ridge (way 853270613). Real polygon — boundaries here are accurate.',
      onHikes: ['hike-5', 'hike-bonus']
    },
    {
      id: 'jasenova-glava',
      name: 'Mala Jasenova Glava',
      shape: 'circle',
      center: [43.7947, 21.6803],
      radius: 200,
      note: 'Mid-slope karst meadows on the western Rtanj massif (~852 m). OSM has no meadow polygon here, so this is a tight toponym-centred circle. ~16 km W of the Šiljak summit / Hike 4 trailhead — accessed separately via Lukovo / Vrmdža on the W approach.',
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

  function drawZone(map, z, style, offHike) {
    let layer;
    if (z.shape === 'polygon') {
      layer = L.polygon(z.coords, style);
    } else {
      layer = L.circle(z.center, { radius: z.radius, ...style });
    }
    layer
      .bindTooltip(buildZoneTooltip(z, offHike), { direction: 'top', sticky: true })
      .bindPopup(buildZonePopup(z, offHike))
      .addTo(map);
    return layer;
  }

  function addPeonyZones(map, hikeId) {
    PEONY_ZONES
      .filter(z => z.onHikes.includes(hikeId))
      .forEach(z => drawZone(map, z, PEONY_STYLE, false));
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
      const layer = drawZone(map, z, style, offHike);
      try { allBounds.push(layer.getBounds().getCenter()); }
      catch (err) { if (z.center) allBounds.push(z.center); }
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
