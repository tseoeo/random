# Sokobanja — 22-25 May 2026

A single-page trip notebook for a three-night stay in Sokobanja, eastern Serbia: cycling, hiking, flora-actually-in-bloom, birds, history, restaurants, logistics.

## Files

- `index.html` — the page
- `style.css` — limestone-warm palette, mobile-first
- `script.js` — Leaflet map initialisation
- `gpx/` — 9 GPX files (4 bike routes + 5 hikes)

## Maps

Leaflet 1.9.4 + leaflet-gpx 1.7.0 loaded from CDN (unpkg / jsDelivr). OpenStreetMap tiles. No API keys, no build step, no backend.

## GPX caveat

The GPX traces in `gpx/` are **corridor approximations** built from a script (`tmp/gen_gpx.py` in the work-tree, not committed) using the named waypoints from the page content. Source GPX pages (Bike Adventure Belgrade, BK Gorski, Sokobanja Tourism, Planinarski Savez Srbije, Komoot, Planine.net) are linked inline per route — **pull the real GPX before riding or hiking.**

## Open directly

Open `index.html` in a browser. Works offline once cloned (Leaflet from CDN if online; could be vendored locally for full offline).
