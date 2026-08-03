/* Google Maps Platform client for the canvassing tools.

   Server-side only — the key never reaches the browser except for the Maps
   JavaScript key, which Google requires client-side and which must be locked
   down with an HTTP-referrer restriction in the Cloud console.

   Env:
     GOOGLE_MAPS_API_KEY      server key: Places, Geocoding, Routes
     GOOGLE_MAPS_BROWSER_KEY  browser key for Maps JS (falls back to the above)

   Everything degrades: with no key the page still renders its own map and
   orders the walk locally, so the app is functional before billing is wired up
   and never hard-fails if a quota is exhausted. */

var SERVER_KEY  = function(){ return (process.env.GOOGLE_MAPS_API_KEY || "").trim(); };
var BROWSER_KEY = function(){ return (process.env.GOOGLE_MAPS_BROWSER_KEY || process.env.GOOGLE_MAPS_API_KEY || "").trim(); };

var PHX = { latitude: 33.63862, longitude: -112.13304 };
var ROUTES_MAX_INTERMEDIATE = 25; // Routes API ceiling for computeRoutes

function hasKey(){ return !!SERVER_KEY(); }

async function call(url, opts, label){
  var res = await fetch(url, opts);
  var body = await res.json().catch(function(){ return {}; });
  if (!res.ok) {
    var msg = (body.error && body.error.message) || body.error_message || res.statusText;
    var err = new Error(label + ": " + msg);
    err.status = res.status;
    throw err;
  }
  return body;
}

/* ---------------- Places Autocomplete (New) ---------------- */
async function autocomplete(input){
  if (!input || input.length < 3) return { suggestions: [], live: false };
  if (!hasKey()) return { suggestions: [], live: false, reason: "no-key" };
  var body = await call("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": SERVER_KEY() },
    body: JSON.stringify({
      input: input,
      includedRegionCodes: ["us"],
      locationBias: { circle: { center: PHX, radius: 50000 } }
    })
  }, "places.autocomplete");
  var out = (body.suggestions || []).map(function(s){
    var p = s.placePrediction || {};
    return {
      placeId: p.placeId,
      text: (p.text && p.text.text) || "",
      main: (p.structuredFormat && p.structuredFormat.mainText && p.structuredFormat.mainText.text) || "",
      secondary: (p.structuredFormat && p.structuredFormat.secondaryText && p.structuredFormat.secondaryText.text) || ""
    };
  }).filter(function(s){ return s.placeId; });
  return { suggestions: out, live: true };
}

/* ---------------- Place Details (New) — placeId -> address + coords ------- */
async function placeDetails(placeId){
  if (!hasKey()) throw new Error("GOOGLE_MAPS_API_KEY is not set");
  var body = await call("https://places.googleapis.com/v1/places/" + encodeURIComponent(placeId), {
    headers: { "X-Goog-Api-Key": SERVER_KEY(), "X-Goog-FieldMask": "id,formattedAddress,location,addressComponents" }
  }, "places.details");
  return normalizePlace(body.formattedAddress, body.location && body.location.latitude,
    body.location && body.location.longitude, body.addressComponents || []);
}

/* ---------------- Geocoding — free-text address -> coords ---------------- */
async function geocode(address){
  if (!hasKey()) throw new Error("GOOGLE_MAPS_API_KEY is not set");
  var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" +
    encodeURIComponent(address) + "&components=country:US&key=" + encodeURIComponent(SERVER_KEY());
  var body = await call(url, {}, "geocode");
  if (body.status !== "OK" || !body.results.length) throw new Error("geocode: " + (body.status || "no result"));
  var r = body.results[0];
  return normalizePlace(r.formatted_address, r.geometry.location.lat, r.geometry.location.lng,
    (r.address_components || []).map(function(c){ return { longText:c.long_name, shortText:c.short_name, types:c.types }; }));
}

function normalizePlace(formatted, lat, lng, components){
  var by = function(type, short){
    var c = components.find(function(x){ return (x.types||[]).indexOf(type) !== -1; });
    return c ? (short ? (c.shortText || c.short_name) : (c.longText || c.long_name)) : "";
  };
  var num = by("street_number"), route = by("route");
  return {
    addr: (num && route) ? (num + " " + route) : (formatted || "").split(",")[0],
    formatted: formatted || "",
    street: route || "",
    city: by("locality") || by("sublocality") || "",
    state: by("administrative_area_level_1", true) || "",
    zip: by("postal_code") || "",
    lat: Number(lat), lng: Number(lng)
  };
}

/* ---------------- Route ----------------
   Waypoint order is optimised locally (nearest-neighbour + 2-opt): the Routes
   API only optimises waypoint order for DRIVE, and canvassing a turf is walked.
   Google is then asked for the real walking distance, duration and geometry
   along that order. */
function haversine(a, b){
  var R = 6371000, toRad = function(d){ return d * Math.PI / 180; };
  var dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  var s = Math.sin(dLat/2)*Math.sin(dLat/2) +
          Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)*Math.sin(dLng/2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

function optimizeOrder(start, stops){
  if (stops.length < 2) return stops.slice();
  // nearest neighbour
  var remaining = stops.slice(), order = [], cur = start;
  while (remaining.length) {
    var bi = 0, bd = Infinity;
    for (var i = 0; i < remaining.length; i++) {
      var d = haversine(cur, remaining[i]);
      if (d < bd) { bd = d; bi = i; }
    }
    cur = remaining[bi];
    order.push(cur);
    remaining.splice(bi, 1);
  }
  // 2-opt: uncross the route
  var len = function(seq){
    var t = haversine(start, seq[0]);
    for (var i = 0; i < seq.length - 1; i++) t += haversine(seq[i], seq[i+1]);
    return t;
  };
  var improved = true, guard = 0;
  while (improved && guard++ < 60) {
    improved = false;
    for (var i = 0; i < order.length - 1; i++) {
      for (var j = i + 1; j < order.length; j++) {
        var cand = order.slice(0, i).concat(order.slice(i, j+1).reverse(), order.slice(j+1));
        if (len(cand) < len(order) - 0.5) { order = cand; improved = true; }
      }
    }
  }
  return order;
}

function walkEstimate(start, order){
  // 1.35 m/s walking + 90s at each door
  var metres = order.length ? haversine(start, order[0]) : 0;
  for (var i = 0; i < order.length - 1; i++) metres += haversine(order[i], order[i+1]);
  return { metres: Math.round(metres), seconds: Math.round(metres / 1.35 + order.length * 90) };
}

async function buildRoute(start, stops, mode){
  var order = optimizeOrder(start, stops);
  var est = walkEstimate(start, order);
  var result = {
    order: order.map(function(s){ return s.id; }),
    distanceMeters: est.metres,
    durationSeconds: est.seconds,
    polyline: null,
    live: false,
    capped: 0
  };
  if (!hasKey() || order.length < 2) {
    result.reason = hasKey() ? "too-few-stops" : "no-key";
    return result;
  }

  var routed = order;
  if (routed.length - 1 > ROUTES_MAX_INTERMEDIATE) {
    result.capped = routed.length - (ROUTES_MAX_INTERMEDIATE + 1);
    routed = routed.slice(0, ROUTES_MAX_INTERMEDIATE + 1);
  }
  var pt = function(p){ return { location: { latLng: { latitude: p.lat, longitude: p.lng } } }; };
  try {
    var body = await call("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": SERVER_KEY(),
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline"
      },
      body: JSON.stringify({
        origin: pt(start),
        destination: pt(routed[routed.length - 1]),
        intermediates: routed.slice(0, -1).map(pt),
        travelMode: mode === "DRIVE" ? "DRIVE" : "WALK",
        polylineQuality: "OVERVIEW"
      })
    }, "routes.computeRoutes");
    var r = (body.routes || [])[0];
    if (r) {
      result.distanceMeters = r.distanceMeters || result.distanceMeters;
      result.durationSeconds = parseInt(String(r.duration || "0").replace("s",""), 10) || result.durationSeconds;
      if (mode !== "DRIVE") result.durationSeconds += routed.length * 90; // time spent at the doors
      result.polyline = (r.polyline && r.polyline.encodedPolyline) || null;
      result.live = true;
    }
  } catch (e) {
    result.reason = e.message; // keep the locally-optimised order; the walk still works
  }
  return result;
}

module.exports = {
  hasKey: hasKey,
  browserKey: BROWSER_KEY,
  autocomplete: autocomplete,
  placeDetails: placeDetails,
  geocode: geocode,
  buildRoute: buildRoute,
  optimizeOrder: optimizeOrder
};
