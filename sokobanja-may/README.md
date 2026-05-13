# Sokobanja — 22-25 May 2026

A single-page trip notebook for a three-night stay in Sokobanja, eastern Serbia: cycling, hiking, flora-actually-in-bloom, birds, history, restaurants, logistics.

## Files

- `index.html` — the page
- `style.css` — limestone-warm palette, mobile-first
- `script.js` — Leaflet map initialisation
- `gpx/` — 10 GPX files (4 bike routes + 5 hikes + 1 bonus longer hike)

## Maps

Leaflet 1.9.4 + leaflet-gpx 1.7.0 loaded from CDN (unpkg / jsDelivr). OpenStreetMap tiles. No API keys, no build step, no backend.

## GPX sources (real recorded tracks)

**Hiking** — sourced from Planinarski Savez Srbije (Serbian Mountaineering Federation, [pss.rs](https://pss.rs/)). Real surveyed trails:

- `hike-1-lepterija-sokograd.gpx` — Lepterija → Soko Grad → Golemi Kamen (4.9 km, +398 m)
- `hike-2-vidikovci.gpx` — Vidikovci viewpoint circuit (7.8 km, ~420 m)
- `hike-3-ripaljka.gpx` — Ripaljka waterfall trail
- `hike-4-rtanj-siljak.gpx` — Rtanj Šiljak summit (6.7 km one-way, +950 m)
- `hike-5-ozren-leskovik.gpx` — Ozren-Leskovik 1,174 m (~8 km, +560 m)
- `hike-bonus-ripaljka-jermencic-ozrenska-vrata.gpx` — longer Ozren traverse linking Ripaljka, Jermenčić Monastery, Leskovik, and Ozrenska vrata

**Cycling** — sourced from [Wikiloc](https://www.wikiloc.com/), real GPS recordings by local cyclist Aca Podgorac and others:

- `bike-1-giro-del-rtanj.gpx` — *SB-Jošanica-Vrmdža-Šarbanovac-SB* (33.97 km, +391 m) by Aca Podgorac
- `bike-2-giro-del-bovan.gpx` — *Bovansko okolo* / Around Bovan (39.51 km, +402 m)
- `bike-3-ozren-circular.gpx` — *Ozren - iznad Resnika* (16.21 km, +476 m)
- `bike-4-sokobanja-basin.gpx` — *Vodopad Ripaljka from Soko Banja* (12.46 km, +269 m)

## Open directly

Open `index.html` in a browser. Works offline once cloned (Leaflet from CDN if online; could be vendored locally for full offline).

## Live

https://tseoeo.github.io/random/sokobanja-may/
