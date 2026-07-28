const express = require("express");
const path = require("path");
const db = require("./db");

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
