# ✈️ Flight Viewer

A real-time flight–tracking dashboard. Click anywhere on the map to scan that
area for live aircraft, watch them move along their heading, and browse the
nearby flights with their route, airline, and origin/destination details.

This repository is the **web client** (`flight-tracker-client`). It renders the
UI and talks to a companion **Socket.IO backend** that streams the live flight
data (see [Backend requirement](#backend-requirement)).

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white" />
  <img alt="Leaflet" src="https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white" />
  <img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white" />
</p>

---

## Screenshots

<!-- Add a screenshot or GIF to a `docs/` folder and reference it here, e.g.:
![Flight Viewer dashboard](docs/dashboard.png)
-->

_Run the app locally to see the live dashboard (see [Getting started](#getting-started))._

---

## Features

- **Live map** — Leaflet map (Google base layers: roadmap / satellite / hybrid /
  terrain, plus an OpenStreetMap overlay) with aircraft markers that rotate to
  match each flight's track/heading.
- **Click-to-scan** — click any point on the map to fetch the aircraft within a
  fixed radius and draw the coverage area as a polygon overlay.
- **Nearby flights list** — a scrollable panel of cards showing callsign,
  airline, and the origin → destination route, color-coded per flight. Click a
  card (or a map marker) to open a detail panel.
- **Flight detail off-canvas** — a slide-in panel with the full origin/
  destination airport names, countries, and route.
- **World clocks** — a live clock strip for Japan, London, Philippines,
  Australia, Canada, and India, each with its country flag.
- **KPI row** — at-a-glance stats derived from the live data: active flights,
  routes tracked, coverage radius, and distinct airlines.
- **Clean Dashboard UI** ("Aerodesk") — a light, indigo-accented design system
  with a token set in [`globals.css`](src/app/globals.css), responsive down to
  mobile, and keyboard-accessible flight cards.

---

## Tech stack

| Area        | Tools |
|-------------|-------|
| Framework   | [Next.js 15](https://nextjs.org) (App Router, Turbopack), [React 19](https://react.dev) |
| Language    | [TypeScript 5](https://www.typescriptlang.org) |
| Styling     | [Tailwind CSS v4](https://tailwindcss.com), [Bootstrap 5](https://getbootstrap.com) + [react-bootstrap](https://react-bootstrap.netlify.app), Geist font |
| Mapping     | [Leaflet](https://leafletjs.com) + [react-leaflet](https://react-leaflet.js.org) (with `rotatedmarker`, `compass`, `control-geocoder`, `easybutton`) |
| Realtime    | [socket.io-client](https://socket.io) |
| UI extras   | [react-icons](https://react-icons.github.io/react-icons/), [react-country-flag](https://www.npmjs.com/package/react-country-flag), [react-awesome-reveal](https://react-awesome-reveal.morello.dev), [react-spinners](https://www.npmjs.com/package/react-spinners) |

---

## How it works

The client keeps a single Socket.IO connection to the backend and is fully
event-driven:

```
        ┌─────────────────────────┐   getFlightsOnLocation(lat, lng, r)   ┌──────────────────┐
        │                         │   getRadiusMap(lat, lng, r)           │                  │
        │   Flight Viewer client  │ ─────────────────────────────────────▶│  Socket.IO       │
        │   (this repo)           │                                       │  backend :8000   │
        │                         │◀───────────────────────────────────── │  (separate repo) │
        └─────────────────────────┘   flightDetails / flightsOnLocation    └──────────────────┘
                                       / markRadius
```

1. On mount, [`page.tsx`](src/app/page.tsx) connects the socket and subscribes
   to the inbound events.
2. Clicking the map (in [`map.tsx`](src/app/component/map.tsx)) emits
   `getFlightsOnLocation` and `getRadiusMap` for the clicked coordinates.
3. The backend streams back aircraft positions, route details, and the radius
   polygon, which drive the markers, the nearby-flights list, and the overlay.

### Socket.IO protocol

**Emitted by the client →**

| Event                   | Arguments               | Purpose |
|-------------------------|-------------------------|---------|
| `getFlightsOnLocation`  | `lat, lng, radius` (10) | Request aircraft + routes near a point |
| `getRadiusMap`          | `lat, lng, radius` (20) | Request the coverage-area polygon |

**Listened for by the client ←**

| Event               | Payload (shape)                                                                 | Drives |
|---------------------|---------------------------------------------------------------------------------|--------|
| `flightDetails`     | `[{ hex, flight, lat, lon, track, color, … }]`                                  | Map aircraft markers |
| `flightsOnLocation` | `[{ callsign, callsign_iata, color, airline:{name}, origin:{…}, destination:{…} }]` | Nearby-flights list / KPIs |
| `markRadius`        | array of `[lat, lng]` polygon coordinates                                       | Radius overlay |

---

## Getting started

### Prerequisites

- **Node.js 18.18+** (20 LTS recommended) and npm
- The **Flight Tracker backend** running and reachable (see below)

### Backend requirement

This client expects a Socket.IO server on **`http://localhost:8000`** that
implements the [protocol above](#socketio-protocol). Without it, the UI loads
but no flights appear (you'll see the "No flights nearby" empty state).

The server URL is defined in
[`src/app/component/server.tsx`](src/app/component/server.tsx) — update the host
there if your backend runs elsewhere:

```ts
export const socket = io(`http://${local}:8000`, { autoConnect: false });
```

### Install & run

```bash
# install dependencies
npm install

# start the dev server (Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. With the
backend running, click anywhere on the map to start tracking.

### Production build

```bash
npm run build
npm run start
```

---

## Available scripts

| Script          | Description |
|-----------------|-------------|
| `npm run dev`   | Start the dev server with Turbopack at `:3000` |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint`  | Run ESLint |

---

## Project structure

```
src/app/
├── layout.tsx              # Root layout + sticky app header
├── page.tsx                # HomePage: socket wiring, clock strip, KPI row, mounts the Map
├── globals.css             # Design tokens (Aerodesk) + header / clock / KPI / utility classes
├── component/
│   ├── map.tsx             # Leaflet map, aircraft markers, radius polygon, loading overlay
│   ├── flights.tsx         # FList — nearby-flights cards + empty state
│   ├── offCanvasDetails.tsx# Slide-in flight detail panel
│   ├── time.tsx            # TimeDisplay — world-clock chip
│   └── server.tsx          # socket.io-client instance (backend URL lives here)
└── css/
    └── map.css             # Map / list / flight-card / off-canvas styles
public/                     # airplane.png, map-marker.png, active-map-marker.png
```

---

## Design system — "Aerodesk" (Clean Dashboard, light)

The visual language is a light, professional dashboard with a single indigo
accent. All colors, radii, and shadows are CSS custom properties defined in
[`globals.css`](src/app/globals.css) — prefer these tokens when adding UI:

| Token            | Value     | Use |
|------------------|-----------|-----|
| `--accent`       | `#4F46E5` | Primary indigo accent |
| `--surface`      | `#FFFFFF` | Card / panel background |
| `--surface-muted`| `#F9FAFB` | Page background |
| `--border`       | `#E5E7EB` | Hairline borders |
| `--text-primary` | `#1F2937` | Body text |
| `--text-muted`   | `#6B7280` | Secondary text |

Reusable component classes (`.app-header`, `.clock-strip`, `.kpi-grid`,
`.card-details`, `.custom-offcanvas`, …) live in `globals.css` and `css/map.css`.

---

## Configuration notes

- **Backend URL** — hardcoded in `src/app/component/server.tsx` (`localhost:8000`).
- **Map tiles** — Google Maps tile endpoints are configured in `map.tsx`
  (`getUrl()`), with an OpenStreetMap overlay option.
- **Default view** — the map centers on Tokyo (`35.6895, 139.692`) at zoom 9.

---

## License

No license has been specified for this project. Add a `LICENSE` file if you
intend to allow reuse.
