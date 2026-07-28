/* Data store for AutoDealer. Uses Postgres when DATABASE_URL is set (persistent),
   otherwise an in-memory store so local dev and the live demo still work.
   Seeds 200 customers (87 equity opportunities) and 120 inventory vehicles. */

var data = require("./data");

var usePg = false;
var pool = null;
var mem = null; // in-memory mirror when no DB

function nowIso(){ return new Date().toISOString(); }

async function init(){
  if (process.env.DATABASE_URL) {
    try {
      var pg = require("pg");
      pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 5 });
      await pool.query("SELECT 1");
      await migrate();
      await seedIfEmpty();
      usePg = true;
      console.log("[db] Postgres connected — persistent mode");
      return;
    } catch (e) {
      console.error("[db] Postgres unavailable, falling back to in-memory:", e.message);
      pool = null;
    }
  }
  // in-memory fallback
  mem = { customers: data.genCustomers(), inventory: data.genInventory(), sales: [] };
  usePg = false;
  console.log("[db] in-memory mode (no DATABASE_URL) — data resets on restart");
}

async function migrate(){
  await pool.query(
    "CREATE TABLE IF NOT EXISTS customers (id INT PRIMARY KEY, is_opp BOOLEAN, score INT, followup BOOLEAN DEFAULT false, data JSONB)");
  await pool.query(
    "CREATE TABLE IF NOT EXISTS inventory (id INT PRIMARY KEY, status TEXT DEFAULT 'available', sold_at TIMESTAMPTZ, data JSONB)");
  await pool.query(
    "CREATE TABLE IF NOT EXISTS sales (id SERIAL PRIMARY KEY, stock TEXT, name TEXT, price INT, sold_at TIMESTAMPTZ DEFAULT now())");
}

async function seedIfEmpty(){
  var c = await pool.query("SELECT COUNT(*)::int AS n FROM customers");
  if (c.rows[0].n === 0) {
    var custs = data.genCustomers();
    for (var i=0;i<custs.length;i++){
      var cu = custs[i];
      await pool.query("INSERT INTO customers(id,is_opp,score,followup,data) VALUES($1,$2,$3,false,$4)",
        [cu.id, cu.isOpp, cu.score, JSON.stringify(cu)]);
    }
    console.log("[db] seeded " + custs.length + " customers");
  }
  var v = await pool.query("SELECT COUNT(*)::int AS n FROM inventory");
  if (v.rows[0].n === 0) {
    var cars = data.genInventory();
    for (var j=0;j<cars.length;j++){
      await pool.query("INSERT INTO inventory(id,status,data) VALUES($1,'available',$2)",
        [cars[j].id, JSON.stringify(cars[j])]);
    }
    console.log("[db] seeded " + cars.length + " inventory vehicles");
  }
}

/* ---------------- equity / customers ---------------- */
async function getEquityData(){
  if (usePg) {
    var opp = (await pool.query("SELECT data, followup FROM customers WHERE is_opp = true")).rows
      .map(function(r){ var d = r.data; d.followup = r.followup; return d; });
    var total = (await pool.query("SELECT COUNT(*)::int AS n FROM customers")).rows[0].n;
    var fu = (await pool.query("SELECT COUNT(*)::int AS n FROM customers WHERE followup = true")).rows[0].n;
    return kpiWrap(opp, total, fu);
  }
  var o = mem.customers.filter(function(c){ return c.isOpp; });
  var f = mem.customers.filter(function(c){ return c.followup; }).length;
  return kpiWrap(o, mem.customers.length, f);
}
function kpiWrap(opp, totalCustomers, followups){
  opp = opp.slice().sort(function(a,b){ return b.score - a.score; });
  var avgEq = opp.length ? Math.round(opp.reduce(function(a,c){ return a + (c.equity>0?c.equity:0); },0) / opp.length) : 0;
  var inMarket = opp.filter(function(c){ return (c.tags||[]).some(function(t){ return t[0]==="hot"; }); }).length;
  return { totalCustomers: totalCustomers, opportunities: opp,
    kpis: { opportunities: opp.length, avgEquity: avgEq, inMarket: inMarket, followups: followups } };
}
async function createFollowup(id){
  id = parseInt(id,10);
  if (usePg) {
    await pool.query("UPDATE customers SET followup = true WHERE id = $1", [id]);
    var fu = (await pool.query("SELECT COUNT(*)::int AS n FROM customers WHERE followup = true")).rows[0].n;
    return { ok:true, followups: fu };
  }
  var c = mem.customers.find(function(x){ return x.id === id; });
  if (c) c.followup = true;
  return { ok:true, followups: mem.customers.filter(function(x){ return x.followup; }).length };
}

/* ---------------- inventory ---------------- */
async function getInventory(){
  if (usePg) {
    var cars = (await pool.query("SELECT data FROM inventory WHERE status='available' ORDER BY (data->>'days')::int ASC")).rows.map(function(r){ return r.data; });
    var avail = cars.length;
    var soldToday = (await pool.query("SELECT COUNT(*)::int AS n FROM sales WHERE sold_at::date = now()::date")).rows[0].n;
    var total = (await pool.query("SELECT COUNT(*)::int AS n FROM inventory")).rows[0].n;
    return { total: total, available: avail, soldToday: soldToday, cars: cars };
  }
  var av = mem.inventory.filter(function(v){ return v.status==="available"; });
  var st = mem.sales.filter(function(s){ return sameDay(s.soldAt); }).length;
  return { total: mem.inventory.length, available: av.length, soldToday: st, cars: av.slice() };
}
function sameDay(iso){ var d=new Date(iso), n=new Date(); return d.getFullYear()===n.getFullYear() && d.getMonth()===n.getMonth() && d.getDate()===n.getDate(); }

async function getInventoryUpdates(sinceIso){
  var since = sinceIso ? new Date(sinceIso) : new Date(Date.now()-60000);
  if (usePg) {
    var sales = (await pool.query("SELECT stock,name,price,sold_at FROM sales WHERE sold_at > $1 ORDER BY sold_at ASC LIMIT 30", [since.toISOString()])).rows
      .map(function(r){ return { stock:r.stock, name:r.name, price:r.price, soldAt:r.sold_at }; });
    var inv = await getInventory();
    return { available: inv.available, soldToday: inv.soldToday, total: inv.total, sales: sales, now: nowIso() };
  }
  var s = mem.sales.filter(function(x){ return new Date(x.soldAt) > since; }).slice(-30);
  var inv2 = await getInventory();
  return { available: inv2.available, soldToday: inv2.soldToday, total: inv2.total, sales: s, now: nowIso() };
}

/* Sell one available car, log it, and restock a new arrival so the lot stays ~120. */
async function sellRandomCar(){
  if (usePg) {
    var pick = (await pool.query("SELECT id,data FROM inventory WHERE status='available' ORDER BY random() LIMIT 1")).rows[0];
    if (!pick) return null;
    var car = pick.data;
    await pool.query("UPDATE inventory SET status='sold', sold_at=now() WHERE id=$1", [pick.id]);
    var name = car.year + " " + car.make + " " + car.model + " " + car.trim;
    await pool.query("INSERT INTO sales(stock,name,price) VALUES($1,$2,$3)", [car.stock, name, car.price]);
    // restock: bring one previously-sold car back as a fresh arrival
    var restock = (await pool.query("SELECT id,data FROM inventory WHERE status='sold' AND id<>$1 ORDER BY sold_at ASC LIMIT 1", [pick.id])).rows[0];
    if (restock) {
      var rd = refreshArrival(restock.data);
      await pool.query("UPDATE inventory SET status='available', sold_at=NULL, data=$2 WHERE id=$1", [restock.id, JSON.stringify(rd)]);
    }
    return { stock: car.stock, name: name, price: car.price, soldAt: nowIso() };
  }
  var avail = mem.inventory.filter(function(v){ return v.status==="available"; });
  if (!avail.length) return null;
  var c = avail[Math.floor(seededIndex() * avail.length)];
  c.status = "sold"; c.soldAt = nowIso();
  var nm = c.year + " " + c.make + " " + c.model + " " + c.trim;
  var rec = { stock: c.stock, name: nm, price: c.price, soldAt: nowIso() };
  mem.sales.push(rec);
  var sold = mem.inventory.filter(function(v){ return v.status==="sold" && v !== c; });
  if (sold.length) { var r = sold[0]; Object.assign(r, refreshArrival(r)); r.status="available"; delete r.soldAt; }
  return rec;
}
var _tick = 0;
function seededIndex(){ _tick = (_tick*9301 + 49297) % 233280; return _tick / 233280; }
function refreshArrival(car){
  var c = Object.assign({}, car);
  c.days = 0; c.miles = c.cond==="new" ? (3 + (c.id%20)) : c.miles;
  c.badges = ["new"].concat((c.badges||[]).filter(function(b){ return b!=="new"; })).slice(0,2);
  c.status = "available";
  return c;
}

async function health(){ return { db: usePg }; }

module.exports = { init: init, getEquityData: getEquityData, createFollowup: createFollowup,
  getInventory: getInventory, getInventoryUpdates: getInventoryUpdates, sellRandomCar: sellRandomCar, health: health,
  isPg: function(){ return usePg; } };
