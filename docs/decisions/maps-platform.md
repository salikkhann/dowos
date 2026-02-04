# Decision: Maps Platform & Architecture

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Day 4 decision sprint

---

## 1. What was already locked (do not re-debate)

| Item | Decision |
|---|---|
| Backend / DB | Supabase – PostgreSQL + Realtime |
| Mobile delivery | Capacitor native shell (Day 7 decision pending, but Capacitor is the leading candidate — architecture below is Capacitor-compatible) |
| Push notifications | Firebase Cloud Messaging |
| Mobile-first viewport | 375 px min; touch targets ≥ 44 × 44 px |
| Maps mention in PRD | `src/app/(app)/maps/` route; "Point Routes" listed under Phase 5 |

---

## 2. What this doc resolves

The PRD listed one map feature ("Point Routes — campus walking paths"). Product discovery (Day 4) revealed two distinct maps with fundamentally different requirements:

### Map A — Campus & CHK (indoor wayfinding)
- Find places inside Dow Medical College and CHK (Civil Hospital Karachi)
- Navigate between floors inside buildings
- Floor-plan data does **not yet exist** — will need to be sourced and drawn
- Lower urgency; Phase 5 delivery target

### Map B — Point (bus) Routes ← **higher priority**
- 20–30 bus routes, currently undigitised, known only by word of mouth
- Team will trace routes manually as GeoJSON before launch
- Students search "I want to go to [any Karachi location]" → app finds the best bus stop and route
- Phase 2 adds live tracking: driver phones stream GPS via a lightweight Capacitor app; Supabase Realtime Broadcast relays positions to all connected students in real time
- This is the feature that saves students 10–15 min of peer-asking every single day — highest daily-active engagement lever in the product

**Open questions this doc resolves:**

1. Which map rendering library for each map?
2. How are tiles served, and can the Point map work offline (campus Wi-Fi is patchy)?
3. How does place-search + geocoding work at Karachi scale?
4. How does Phase 2 live GPS fit into the same layer architecture?
5. What is the total cost at 2 000 DAU?

---

## 3. Options evaluated

Three candidates were compared across both maps.

### Option A — Google Maps JS SDK (for both maps)

Google's hosted, proprietary map platform. Tiles, geocoding, and routing all billed per request via SKUs.

**Pros:**
- Excellent Karachi coverage out of the box (proprietary data, regularly updated)
- Geocoding API has strong accuracy on Pakistani addresses
- Familiar API; large ecosystem of tutorials
- Dynamic Maps SKU: first 10 000 loads/month free

**Cons:**
- **Cost at 2 000 DAU:** Dynamic Maps SKU is $7.00 / 1 000 loads. A student opening the Point map once per day = ~60 000 loads / month → ~$350 / month for the map tile loads alone. Add Geocoding ($5 / 1 000 req) and it climbs further. See §5 for the full model.
- No offline capability for the map tiles — students on campus with patchy Wi-Fi will see blank tiles or spinners
- Indoor floor plans are not natively supported; would need to layer custom overlays on top of Google base tiles anyway
- High vendor lock-in: switching later means rewriting all geo logic

### Option B — OpenStreetMap + OpenLayers

Open-source map library rendering OSM vector tiles. Self-hosted tiles, zero per-request cost.

**Pros:**
- Zero tile cost — tiles served from self-hosted PMTiles or OSM CDN
- Full styling control for custom overlays (routes, stops, floors)
- No vendor lock-in; BSD-licensed

**Cons:**
- **Android WebView performance is a known problem.** OpenLayers' default renderer is Canvas-based. Community reports document flicker and garbage-collector pauses on mid-range Android WebViews (the exact hardware 90 % of Dow students carry). WebGL vector rendering in OpenLayers is still experimental and lacks text support.
- Offline tile caching is a DIY problem — no official plugin; localStorage approach is fragile and slow to populate
- OSM geocoding (Nominatim) has a hard 1-request/second rate limit and Karachi sub-street coverage is patchy. Would need a paid geocoder anyway, which means a second API dependency

### Option C — MapLibre GL JS + PMTiles + Google Geocoding ✓ CHOSEN

MapLibre GL JS is the open-source, community-governed fork of Mapbox GL JS (BSD-3-Clause). It renders vector tiles via WebGL on the GPU. Tiles are packaged as PMTiles — a single flat file that can be served statically from Supabase Storage or Vercel CDN, and read entirely offline via a browser fetch-range request. Google Geocoding API is used only for the place-search query (one call per search), not for map rendering.

**Pros:**
- **Zero tile cost.** PMTiles hosted on Supabase Storage / Vercel. No per-load SKU.
- **First-class offline.** PMTiles is a single-file format; the browser reads byte-ranges. The campus-area tile extract (~2–5 MB for Karachi) can be bundled or pre-cached on first app open. Students on patchy Wi-Fi see the map instantly.
- **Best-in-class WebView performance.** Academic benchmarks (MDPI, 2025) and practitioner reports confirm MapLibre GL JS outperforms OpenLayers on mid-range Android WebViews for vector tile rendering. It supports WebGL1 fallback for older devices.
- **Geocoding is scoped.** Google Geocoding fires only on a student's place-search query — not on every map load. At 2 000 DAU with ~1 search / session, that's ~60 000 geocode calls / month. First 10 000 free; remainder costs ~$250 / month. See §5.
- **Live tracking in Phase 2 fits naturally.** Driver GPS → Supabase Realtime Broadcast channel → MapLibre GL JS updates a GeoJSON source in real time. No WebSocket library to add; Supabase client already installed.
- **Next.js integration is clean.** Dynamic `import()` lazy-loads MapLibre so the initial page bundle stays small. CSP-safe worker bundle available for strict Vercel deployments.
- **No vendor lock-in.** Tiles are standard MVT/PMTiles. Geocoding is the only paid dependency, and it's a single HTTP call — trivially swappable.

**Cons:**
- Slightly more initial setup than Google Maps (register PMTiles protocol, lazy-load in Next.js, CSP worker config). Offset by the fact that we need custom overlays on both maps anyway — there is no "just drop in Google Maps and done" path here.
- OSM data quality in Karachi is good at the street level but not perfect. Acceptable for a bus-route map where routes are team-traced GeoJSON overlaid on the base map; the base map only needs to show streets and landmarks correctly.

---

## 4. Chosen architecture — detailed spec

Two maps, one rendering library, shared tile source, separate GeoJSON layers.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MapLibre GL JS                                │
│          (single npm package, lazy-loaded via next/dynamic)          │
└───────────┬────────────────────────────────┬────────────────────────┘
            │                                │
            ▼                                ▼
   ┌── Map B: Point ──┐           ┌── Map A: Campus/CHK ──┐
   │  (Phase 5 build, │           │  (Phase 5 build,       │
   │   live track      │           │   floor plans          │
   │   Phase 2 addon)  │           │   Phase 5+)            │
   └──────────────────┘           └────────────────────────┘
```

### 4.1 Tile layer — shared by both maps

| Parameter | Value | Rationale |
|---|---|---|
| Library | `maplibre-gl` (npm) | WebGL-first, best Android WebView perf, BSD-3 |
| Base tiles format | PMTiles (vector) | Single-file, offline-capable, no tile server |
| Tile extract | Karachi metro bounding box (~24.6–24.9 N, 67.0–67.2 E) | Covers all bus routes + campus + CHK. Extract generated once via `tippecanoe` from OSM PBF |
| Tile host | Supabase Storage (same bucket as textbook uploads) | Zero extra infra; CDN-cached via Vercel |
| Offline strategy | Pre-cache the PMTiles file on first app open (service worker or on-demand fetch). File size target: 3–6 MB for the Karachi extract | Students on campus Wi-Fi download once; all subsequent opens are instant |
| Style | Custom JSON style matching DowOS design tokens (Navy `#1A2B4C` roads, Teal `#00A896` bus routes, Gold `#D4A574` stops) | Brand-consistent; full control |

### 4.2 Map B — Point (bus routes) — data & interaction layers

This is the higher-priority map. The data model is simple: routes are polylines, stops are points, and each has metadata (bus number, schedule, route name).

```
┌────────────────────────────────────────────────────────────┐
│  Student opens Point map                                   │
│    → MapLibre renders PMTiles base + GeoJSON overlay       │
│                                                            │
│  GeoJSON layers (all stored in Supabase, fetched on load): │
│    • bus_routes   – LineString per route, styled Teal      │
│    • bus_stops    – Point per stop, styled Gold circle     │
│    • dow_campus   – Polygon outline of Dow + CHK           │
│                                                            │
│  Search bar at top:                                        │
│    Student types "Defence Housing"                         │
│         │                                                  │
│         ▼                                                  │
│    Google Geocoding API → { lat, lng }                     │
│         │                                                  │
│         ▼                                                  │
│    Client-side: calculate distance from geocoded point     │
│    to every bus_stop in the GeoJSON (Haversine, < 1 ms     │
│    for 100 stops). Sort. Return top-3 nearest stops +      │
│    their routes. No server round-trip for the matching.    │
│         │                                                  │
│         ▼                                                  │
│    UI: "Take Route 12 from Stop C (200 m walk)"           │
│    Map pans to show the geocoded point + nearest stop      │
│    + the highlighted route                                 │
└────────────────────────────────────────────────────────────┘
```

**Why Haversine client-side, not a routing API:**
Students are asking "which bus do I take?" — not "give me turn-by-turn walking directions to the stop." The nearest stop within 200–400 m is the answer 95 % of the time. Haversine distance to each stop is a few microseconds of JS math. No Directions API call, no extra cost, no latency.

**Route tracing workflow (pre-launch):**
Team uses QGIS or umap.com to draw each route over the OSM base, exports as GeoJSON, uploads to a `bus_routes` table in Supabase. Each route row: `route_id`, `route_name`, `bus_number`, `geojson` (LineString), `departure_time` (08:30), `return_time` (15:15), `notes`.

### 4.3 Map B — Phase 2 live tracking layer

This layer is architecturally planned now but built in Phase 2. It plugs into the same MapLibre map instance on top of the static route layer.

```
┌─────────────────────────────────────────────────────────────┐
│  Driver opens lightweight Capacitor tracking app            │
│    → Background GPS (Capacitor Geolocation plugin,         │
│      highAccuracy, interval 5 s)                            │
│    → Broadcasts to Supabase Realtime channel                │
│      `point:bus:{bus_id}`                                   │
│      payload: { lat, lng, speed, timestamp }                │
│                                                             │
│  Student's Point map is subscribed to all active channels  │
│    → On each message, update a live_buses GeoJSON source   │
│    → MapLibre re-renders bus marker at new position        │
│      (GPU-accelerated; no DOM churn)                        │
│                                                             │
│  Fallback: if no broadcast in last 30 s, marker goes grey  │
│  (bus not reporting). No crash, no error — just visual.     │
└─────────────────────────────────────────────────────────────┘
```

**Why Supabase Realtime Broadcast, not Postgres Changes:**
Bus positions are ephemeral — no one needs to query "where was bus 7 at 10:42 AM yesterday." Broadcast is fire-and-forget over WebSocket; it doesn't write to the database. This means zero write load on Postgres for location updates. Latency is essentially the ping to the nearest Supabase Realtime node (typically < 100 ms in Asia). Default limit is 100 events/sec per tenant — 30 buses at 1 update/5 s = 6 events/sec. Well within limits.

**Driver app scope:**
A minimal Capacitor app (can live in the same repo under a `/driver` route, gated by a `is_driver` role). It does one thing: start GPS, connect to Realtime, stream coordinates. No map rendering needed on the driver side.

### 4.4 Map A — Campus & CHK (indoor wayfinding) — full MVP spec

Same MapLibre instance as Map B, different screen. No indoor routing engine — MVP is **pin + floor indicator**. Students search for a place, the map shows them which floor it's on and highlights the room polygon. They take it from there physically.

#### 4.4.1 POI categories (what students search for)

| Category | Examples | Icon set |
|---|---|---|
| Departments / Wards | Surgery, Medicine, Physiology, Cardiology | `stethoscope` |
| Labs & Dissection halls | Anatomy lab, Biochem lab, Micro lab | `microscope` |
| Classrooms / Lecture halls | Lecture Hall 1, Seminar Room 3 | `book-open` |
| Facilities | Canteen, Library, Prayer room, Toilets | context-specific (`utensils`, `book`, `mosque`, `accessibility`) |

All icons from Lucide React (already installed). Each POI is a Point feature in a `campus_places` GeoJSON with: `place_id`, `place_name`, `category`, `floor_id`, `building_id`, `lat`, `lng`.

#### 4.4.2 MapLibre layer stack (render order, bottom → top)

```
┌─── MapLibre GL JS — Campus map screen ─────────────────────────┐
│                                                                 │
│  Layer 1: PMTiles base (same Karachi extract as Point map)      │
│                                                                 │
│  Layer 2: campus_outline – Navy polygon, 0.3 opacity fill       │
│           Dow boundary + CHK boundary                           │
│                                                                 │
│  Layer 3: building_footprints – Navy stroke, transparent fill   │
│           Each building as a labelled polygon                   │
│                                                                 │
│  Layer 4: floor_plan_walls – White stroke on dark fill          │
│           Rooms / corridors as polygons for the ACTIVE floor    │
│           Only one floor rendered at a time (see floor toggle)  │
│                                                                 │
│  Layer 5: campus_places – POI markers                           │
│           Points with category icons + labels                   │
│           ONLY places on the active floor are visible           │
│           Tapped place → bottom sheet with name + floor + cat   │
│                                                                 │
│  Layer 6: highlight – single Polygon, Teal fill 0.4 opacity    │
│           The room polygon of the currently selected place.     │
│           Cleared when user taps elsewhere.                     │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.4.3 Floor selector UI

A compact horizontal pill strip at the bottom of the map (above the nav bar). Pills: `G`, `1`, `2`, `3`, … one per floor of Dow main building. Tapping a pill:

1. Filters `floor_plan_walls` to that floor's GeoJSON only
2. Filters `campus_places` markers to that floor
3. Animates map camera to that floor's bounding box (so the user isn't staring at the wrong part of the building)

If the user searched for and selected a specific place, the floor pill auto-selects to that place's floor — no manual floor-switching needed for the common case.

#### 4.4.4 Data model — Supabase tables

| Table | Purpose | Key columns |
|---|---|---|
| `campus_buildings` | Registry of buildings | `id`, `building_name` (`Dow Main`, `CHK Main`), `campus` (`dow` \| `chk`), `outline_geojson` (Polygon) |
| `campus_floors` | One row per floor per building | `id`, `building_id` (FK), `floor_label` (`G`, `1`, `2` …), `floor_plan_geojson` (FeatureCollection — all room polygons for this floor), `bbox` (bounding box for camera zoom) |
| `campus_places` | Every searchable POI | `id`, `place_name`, `category` (enum: `department` \| `lab` \| `classroom` \| `facility`), `floor_id` (FK), `building_id` (FK), `lat`, `lng`, `room_polygon_id` (nullable — links to the specific room polygon inside `floor_plan_geojson` so it can be highlighted) |

RLS: all three tables are **read-only for authenticated users**, write via service-role only (same pattern as `knowledge_chunks`). Floor-plan data is static content seeded by the team — students never write to it.

#### 4.4.5 Search → highlight flow

```
Student types "Anatomy Lab"
     │
     ▼
Client-side fuzzy match against campus_places.place_name
(all places already loaded — small dataset, < 200 rows)
     │
     ▼
Match found → { place_id, floor_id, lat, lng, room_polygon_id }
     │
     ├── Auto-select floor pill to place.floor_id
     ├── Pan + zoom map to place.lat, place.lng
     ├── Render highlight layer on place.room_polygon_id
     └── Show bottom sheet: "Anatomy Lab · Floor 2 · Department"
```

No geocoding call. No server round-trip. The entire interaction from keystroke to highlighted room is client-side.

#### 4.4.6 Digitisation workflow — how the team produces the GeoJSON

This is the pre-build dependency. The team needs to produce three deliverables before a single line of map code is written:

**Step 1 — Request CAD/PDF from Dow admin.**
Contact facilities / registrar for architectural drawings of Dow main building. Even a low-res PDF scan is enough — QGIS can georeference and trace over it.

**Step 2 — Georeference in QGIS.**
One team member (the "GIS lead" for this task) installs QGIS (free). They:
1. Add an OSM or satellite base map (built into QGIS via the XYZ tile layers)
2. Load the Dow floor-plan PDF/image as a raster layer
3. Use the Georeferencer plugin to pin 3–4 corners of the building image to their real GPS coordinates (visible on the satellite base). This locks the image to the real world.
4. Export the georeferenced image as a GeoTIFF — this becomes the tracing base for the rest of the team.

**Step 3 — Trace rooms as polygons.**
Each team member traces a subset of floors. Per floor:
1. Create a new Shapefile layer (Polygon, EPSG:4326)
2. Enable snapping (vertex + segment, ~12 px tolerance)
3. Use the Shape Digitizing toolbar — rectangles and regular shapes snap cleanly
4. For each room: draw the polygon, then add attributes in the attribute table: `room_id`, `room_name`, `category`
5. Simplify circles (Vector → Geometry Tools → Simplify, 0.05 m) to keep file size sane

**Step 4 — Place POIs.**
On a separate Point layer, drop a point in each room and fill in: `place_name`, `category`, `floor_label`. Link it to the room polygon's `room_id`.

**Step 5 — Export.**
Each floor exported as a separate GeoJSON file:
- `dow_floor_G.geojson` — ground floor room polygons
- `dow_floor_1.geojson` — first floor room polygons
- … and so on
- `dow_places.geojson` — all POI points across all floors

**Step 6 — Upload to Supabase.**
Dev seeds `campus_buildings`, `campus_floors` (one row per GeoJSON file, bbox calculated), and `campus_places` (one row per POI point). Done. The map renders.

### 4.5 Search UX — shared component

Both maps use the same search bar component. Behaviour differs by context:

| Map | Search intent | Backend call | Matching logic |
|---|---|---|---|
| Point | "Where do I want to go?" | Google Geocoding (1 call) | Haversine to all stops, client-side |
| Campus | "Where is [department/lab]?" | None — filtered from the `places` GeoJSON already loaded | String match on `place_name`, client-side |

### 4.6 Next.js integration notes

| Concern | Solution |
|---|---|
| Bundle size | `maplibre-gl` is ~600 KB gzipped. Lazy-load via `next/dynamic` with `{ ssr: false }` — maps are client-only |
| CSP (Vercel) | Use `maplibre-gl-csp` bundle + set worker path manually. Add `blob:` to `script-src` in `next.config.js` |
| Server components | Map component is a `'use client'` leaf. Parent layout/page can be a Server Component |
| PMTiles protocol | Register once at app init: `import { Protocol } from 'pmtiles'; new Protocol().register();` |

---

## 5. Cost model — at 2 000 DAU

### 5.1 Tile serving

PMTiles file (~4 MB) served from Supabase Storage. Bandwidth cost at Supabase Pro: included in the 5 GB / month storage egress (free tier). Even at 2 000 users downloading 4 MB each once = 8 GB — that's the Pro plan's bandwidth cap; upgrade to Team ($599 / month) only if egress exceeds it. In practice, browser caching means repeat visits cost zero egress.

**Tile cost: $0 / month** (or absorbed into Supabase plan already paid for the rest of the app).

### 5.2 Google Geocoding

Only fires when a student uses the place-search bar. Assumption: 1 search per session, not every session uses search. Conservative estimate: 40 % of DAU search once per day.

| Volume | Requests / month | Cost |
|---|---|---|
| Free tier | 10 000 | $0 |
| 2 000 DAU × 40 % × 30 days = 24 000 total | 24 000 | First 10 000 free; remaining 14 000 × $0.005 = **$70** |

**Geocoding cost: ~$70 / month.** Drops further if caching is added (cache geocoded results in Supabase for 30 days per Google ToS — repeated searches for the same address cost zero).

### 5.3 Supabase Realtime (Phase 2 live tracking)

Broadcast is included in all Supabase plans at no extra charge. 30 buses × 1 event / 5 s = 6 events / second. Well under the 100 events/sec default tenant limit. Connected students subscribe to all active bus channels — Supabase fans out via WebSocket.

**Realtime cost: $0 / month** (included in existing Supabase plan).

### 5.4 Total maps cost

| Line item | Monthly cost |
|---|---|
| Tile serving (PMTiles on Supabase) | $0 |
| Google Geocoding | ~$70 |
| Supabase Realtime (Phase 2) | $0 |
| **Total** | **~$70 / month** |

Compare to Option A (Google Maps JS SDK for both maps): Dynamic Maps alone would cost ~$350 / month at the same DAU, before geocoding or routing API calls are added. MapLibre + targeted geocoding is **5× cheaper** and the only cost line is the one service that genuinely needs Google's Karachi coverage.

---

## 6. What to build and when

### Phase 5 — Map B: Point routes (static, no live tracking)

| Day | Work item |
|---|---|
| 31 | Set up MapLibre GL JS in the Next.js project: lazy-load, CSP worker, PMTiles protocol registration. Generate Karachi tile extract from OSM PBF via `tippecanoe`. Upload PMTiles to Supabase Storage. Smoke-test render. |
| 32 | Create Supabase tables: `bus_routes` (route_id, bus_number, route_name, geojson, departure_time, return_time), `bus_stops` (stop_id, route_id, stop_name, lat, lng, sequence). Seed with team-traced GeoJSON for all 20–30 routes. |
| 33 | Build Point map screen: render base tiles + route polylines + stop markers. Tap a stop → card shows route info + schedule. |
| 34 | Build place-search: input → Google Geocoding → Haversine match → top-3 stops card → tap to pan map + highlight route. |
| 35 | QA on mid-range Android WebView (Capacitor dev server). Test with Wi-Fi off (PMTiles offline). Polish UI to 375 px. |

### Pre-build dependency — Campus map digitisation (runs in parallel with Phase 3–4 coding)

The digitisation work below does **not** block the Point map build. It runs in parallel while the AI and Viva features are being coded. The GeoJSON files must be ready before Day 31 (when Phase 5 coding starts) or the Campus map ships as a simplified fallback (see Day 35 below).

| Who | Task | When (target) |
|---|---|---|
| Team member A | Request CAD/PDF floor plans from Dow admin | Day 10–12 (early Phase 2 — send the email now, admin is slow) |
| Team member A | Georeference the PDF in QGIS — produce the GeoTIFF tracing base | Day 15 (once PDF arrives) |
| Team members A + B | Trace all floors of Dow main building — room polygons + POI points | Days 16–22 (during Phase 3 coding sprint) |
| Team member A | QA the GeoJSON: open in geojson.io, verify every room is closed, no gaps | Day 23 |
| Dev | Seed `campus_buildings`, `campus_floors`, `campus_places` in Supabase | Day 30 (end of Phase 4, before Phase 5 build starts) |

Estimated tracing effort: **one person-day per floor** (draw polygons, label rooms, drop POI points). If Dow main has 4–5 floors, that's 4–5 person-days of tracing spread across 2 people over ~1 week. Achievable alongside other team tasks.

### Phase 5 — Map A: Campus/CHK (indoor wayfinding)

Runs on the same days as Map B. MapLibre and PMTiles are already set up by Day 31 — Map A is purely about rendering the campus GeoJSON on top.

| Day | Work item |
|---|---|
| 31 | Create Supabase tables: `campus_buildings`, `campus_floors`, `campus_places`. Seed with the digitised GeoJSON (produced during Phase 3–4). Write the data-fetch Server Component that returns all three tables. |
| 32 | Build the Campus map screen: render base tiles → campus outline → building footprints → active floor's room polygons → POI markers. Wire the floor pill selector: tap a pill → swap the floor GeoJSON layer + filter POI markers + zoom to that floor's bbox. |
| 33 | Build the search → highlight flow: input → client-side fuzzy match on `campus_places` → auto-select floor → pan/zoom → highlight room polygon → bottom sheet. |
| 34 | Polish: icon set per POI category (Lucide), bottom sheet card design, dark-mode, 375 px mobile layout. Ensure touch targets on floor pills and POI markers are ≥ 44 × 44 px. |
| 35 | QA on mid-range Android WebView. **Fallback gate:** if digitised GeoJSON is not ready by this day, ship a simplified version — campus outline + building footprints + POI markers with no room polygons and no floor selector. Students can still search and find "Anatomy Lab is in Dow Main" even without the indoor floor detail. Full indoor map added in a follow-up sprint once data arrives. |

### Phase 2 addon — Live tracking

| Day | Work item |
|---|---|
| TBD (after Phase 5 Point map ships) | Build driver tracking screen: Capacitor app, background geolocation, Supabase Realtime Broadcast stream. |
| TBD+1 | Subscribe Point map to live bus channels. Render moving markers. Add staleness indicator (grey if no update in 30 s). |
| TBD+2 | Test with 2–3 real driver phones on actual routes. Measure end-to-end latency (GPS → map update). Target: < 5 s. |

---

## 7. Sources consulted

- [Google Maps Platform — Pricing](https://developers.google.com/maps/billing-and-pricing/pricing)
- [Google Geocoding API — Usage & Billing](https://developers.google.com/maps/documentation/geocoding/usage-and-billing)
- [MapLibre GL JS — Docs](https://maplibre.org/maplibre-gl-js/docs/)
- [MapLibre GL JS — npm](https://www.npmjs.com/package/maplibre-gl)
- [PMTiles — self-hosted tiles with MapLibre](https://www.keimaps.com/articles/self-hosted-basemap-maplibre)
- [OpenLayers — offline map discussions (GitHub #9126, #16699)](https://github.com/openlayers/openlayers/issues/9126)
- [Vector Data Rendering Performance — MDPI 2025 (Leaflet / OL / Mapbox GL / MapLibre GL benchmark)](https://www.mdpi.com/2220-9964/14/9/336)
- [Supabase Realtime — Broadcast docs](https://supabase.com/docs/guides/realtime/broadcast)
- [Supabase Realtime — Benchmarks](https://supabase.com/docs/guides/realtime/benchmarks)
- [MapLibre GL JS vs OpenLayers — Wappalyzer](https://www.wappalyzer.com/compare/maplibre-gl-js-vs-openlayers/)
- [map-gl-offline plugin — MapLibre](https://maplibre.org/maplibre-gl-js/docs/plugins/)
- [QGIS — PDF / image to GeoJSON tracing workflow](https://xrnavigation.io/how-to-convert-from-pdf-to-geojson-using-qgis/)
- [Indoor Mapping Data Format (IMDF) — OGC standard](https://www.ogc.org/standards/indoor-mapping-data-format/)
- [MapLibre + IMDF indoor map rendering — FOSS4G 2025 talk](https://talks.osgeo.org/foss4g-2025/talk/Y3UMBY/)
- [IndoorEqual — open-source indoor map viewer (GeoJSON / IMDF)](https://github.com/indoorequal/indoorequal.org)
- [Convert floor plans to interactive indoor maps — Mapsted guide](https://mapsted.com/blog/how-to-convert-floor-plans-into-interactive-indoor-maps)
- [ArcGIS Indoors — digitisation workflow overview](https://pro.arcgis.com/en/pro-app/latest/help/data/indoors/data-creation-workflow.htm)
- Skills consulted: `nextjs-app-router-patterns`, `react-patterns`, `tailwind-design-system`
