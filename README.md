# Autodealer

An Express server behind a dealership CRM front end. Postgres when
`DATABASE_URL` is set, in-memory seed data otherwise, so the app always boots.

## Structure

```
public/             # the CRM pages (static)
public/canvass.html # Door Knocking — field canvassing map + routes
server.js           # API + static server (+ /healthz for Railway)
db.js               # Postgres / in-memory store
data.js             # deterministic seed data (customers, inventory, doors)
google.js           # Google Maps Platform client (Places, Geocoding, Routes)
```

## Local development

```bash
npm install
npm start        # http://localhost:3000
```

Copy `.env.example` to `.env` for local secrets. `.env` is gitignored.

## Door Knocking (`/canvass`)

Field canvassing for door-to-door sales: 288 seeded doors across 8 Phoenix
turfs, ~20% already matched to CRM customers. Pick a turf, build an optimised
walking route, and log an outcome at each door (not home / interested /
appointment / not interested / do not contact). Reps can add a door in the
field via Google Places address search.

Walking order is optimised locally (nearest-neighbour + 2-opt) because the
Routes API only optimises waypoint order for driving. Google is then asked for
the real distance, duration and route geometry along that order.

### Google Maps Platform

Enable on the key: **Places API (New)**, **Geocoding API**, **Routes API**,
**Maps JavaScript API**. Then set:

| Variable | Used by | Notes |
| --- | --- | --- |
| `GOOGLE_MAPS_API_KEY` | Places, Geocoding, Routes | Server-side only. Restrict by IP. |
| `GOOGLE_MAPS_BROWSER_KEY` | Maps JavaScript | Sent to the browser — restrict by HTTP referrer. Falls back to the key above. |

Without a key the page still works: it renders its own map and estimates the
walk locally, and says so in a banner. Nothing hard-fails on a missing key or
an exhausted quota.

Note the Routes API accepts at most 25 intermediate waypoints; longer turfs are
capped for the drawn route and the page reports how many were left off.

## Deploy

Railway auto-detects Node, runs `npm install` then `npm start`, and injects
`PORT` and `DATABASE_URL`. Push to `main` to deploy. Health check: `/healthz`.
Set the Google keys under the service's **Variables** tab.
