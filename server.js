/* Local dev: load .env if present. Railway injects real env vars, so this is a
   no-op in production. process.loadEnvFile is built in (Node 20.6+) — no dep. */
try { if (process.loadEnvFile) process.loadEnvFile(); } catch (_) { /* no .env — fine */ }

const express = require("express");
const path = require("path");
const db = require("./db");
const gmaps = require("./google");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* ---------------- API ---------------- */
app.get("/api/health", async (_req, res) => {
  try { res.json(Object.assign({ ok: true }, await db.health())); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get("/api/equity", async (_req, res) => {
  try { res.json(await db.getEquityData()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/equity/:id/followup", async (req, res) => {
  try { res.json(await db.createFollowup(req.params.id)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/inventory", async (_req, res) => {
  try { res.json(await db.getInventory()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/inventory/updates", async (req, res) => {
  try { res.json(await db.getInventoryUpdates(req.query.since)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------------- door-to-door canvassing ---------------- */
app.get("/api/canvass", async (_req, res) => {
  try { res.json(await db.getDoors()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/canvass/:id/visit", async (req, res) => {
  try { res.json(await db.logVisit(req.params.id, req.body.status, req.body.note, req.body.rep)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

app.post("/api/canvass/doors", async (req, res) => {
  try { res.json(await db.addDoor(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

/* Optimised walking order for a set of doors. Falls back to a local optimiser
   when no Google key is configured, so the route always comes back. */
app.post("/api/canvass/route", async (req, res) => {
  try {
    const { doors: doorIds, mode } = req.body || {};
    if (!Array.isArray(doorIds) || !doorIds.length) return res.status(400).json({ error: "doors[] is required" });
    const all = await db.getDoors();
    const byId = new Map(all.doors.map((d) => [d.id, d]));
    const stops = doorIds.map((id) => byId.get(id)).filter(Boolean);
    if (!stops.length) return res.status(400).json({ error: "no matching doors" });
    res.json(await gmaps.buildRoute(all.dealer, stops, mode));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------------- Google Maps Platform ---------------- */
app.get("/api/maps/config", (_req, res) => {
  res.json({ key: gmaps.browserKey(), hasKey: gmaps.hasKey() });
});

app.get("/api/places/autocomplete", async (req, res) => {
  try { res.json(await gmaps.autocomplete(String(req.query.q || ""))); }
  catch (e) { res.status(502).json({ error: e.message, suggestions: [], live: false }); }
});

app.post("/api/places/resolve", async (req, res) => {
  try {
    const { placeId, address } = req.body || {};
    if (placeId) return res.json(await gmaps.placeDetails(placeId));
    if (address) return res.json(await gmaps.geocode(address));
    res.status(400).json({ error: "placeId or address is required" });
  } catch (e) { res.status(502).json({ error: e.message }); }
});

/* Health check for Railway */
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

/* Serve static assets from /public ("/login" -> login.html) */
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

/* Fallback to the landing page */
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ---------------- auto-sell loop: sell a car every 30s–2min ---------------- */
const SELL_MIN = parseInt(process.env.SELL_MIN_MS || "30000", 10);   // default 30s
const SELL_MAX = parseInt(process.env.SELL_MAX_MS || "120000", 10);  // default 2min
function scheduleNextSale() {
  const delay = SELL_MIN + Math.floor(Math.random() * Math.max(1, SELL_MAX - SELL_MIN));
  setTimeout(async () => {
    try {
      const sale = await db.sellRandomCar();
      if (sale) console.log("[inventory] sold " + sale.name + " (" + sale.stock + ") for $" + sale.price);
    } catch (e) { console.error("[inventory] auto-sell error:", e.message); }
    scheduleNextSale();
  }, delay);
}

db.init()
  .catch((e) => console.error("[db] init error:", e.message))
  .finally(() => {
    app.listen(PORT, () => console.log(`Autodealer running on port ${PORT}`));
    scheduleNextSale();
  });
