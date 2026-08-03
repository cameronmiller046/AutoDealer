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
      var url = process.env.DATABASE_URL;
      // Railway's private URL (*.railway.internal) and localhost don't use SSL;
      // the public proxy URL does. Pick accordingly so the first connect succeeds.
      var noSsl = /\.railway\.internal/.test(url) || /localhost|127\.0\.0\.1/.test(url);
      pool = new pg.Pool({ connectionString: url, ssl: noSsl ? false : { rejectUnauthorized: false }, max: 5 });
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
  var custs = data.genCustomers();
  mem = { customers: custs, inventory: data.genInventory(), sales: [], doors: data.genCanvassDoors(custs) };
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
  await pool.query(
    "CREATE TABLE IF NOT EXISTS doors (id SERIAL PRIMARY KEY, turf TEXT, street TEXT, addr TEXT, city TEXT, state TEXT, zip TEXT," +
    " lat DOUBLE PRECISION, lng DOUBLE PRECISION, cust_id INT, name TEXT, veh TEXT, score INT," +
    " status TEXT DEFAULT 'todo', note TEXT, visited_at TIMESTAMPTZ, source TEXT DEFAULT 'seed')");
  await pool.query(
    "CREATE TABLE IF NOT EXISTS door_visits (id SERIAL PRIMARY KEY, door_id INT REFERENCES doors(id) ON DELETE CASCADE," +
    " status TEXT, note TEXT, rep TEXT, at TIMESTAMPTZ DEFAULT now())");
  await pool.query("CREATE INDEX IF NOT EXISTS doors_turf_idx ON doors(turf)");
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
  var d = await pool.query("SELECT COUNT(*)::int AS n FROM doors");
  if (d.rows[0].n === 0) {
    var custRows = (await pool.query("SELECT data FROM customers ORDER BY id")).rows.map(function(r){ return r.data; });
    var doors = data.genCanvassDoors(custRows);
    for (var k=0;k<doors.length;k++){
      var dr = doors[k];
      await pool.query(
        "INSERT INTO doors(turf,street,addr,city,state,zip,lat,lng,cust_id,name,veh,score,status,note,source)" +
        " VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)",
        [dr.turf,dr.street,dr.addr,dr.city,dr.state,dr.zip,dr.lat,dr.lng,dr.custId,dr.name,dr.veh,dr.score,dr.status,dr.note,dr.source]);
    }
    console.log("[db] seeded " + doors.length + " canvassing doors");
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

/* ---------------- door-to-door canvassing ---------------- */
var DOOR_COLS = "id,turf,street,addr,city,state,zip,lat,lng,cust_id,name,veh,score,status,note,visited_at,source";
function rowToDoor(r){
  return { id:r.id, turf:r.turf, street:r.street, addr:r.addr, city:r.city, state:r.state, zip:r.zip,
    lat:Number(r.lat), lng:Number(r.lng), custId:r.cust_id, name:r.name, veh:r.veh, score:r.score,
    status:r.status, note:r.note, visitedAt:r.visited_at, source:r.source };
}

/* Returns every door (the whole book is only a few hundred rows, so the page
   filters by turf client-side and switching turfs stays instant). */
async function getDoors(){
  var doors = usePg
    ? (await pool.query("SELECT "+DOOR_COLS+" FROM doors ORDER BY id")).rows.map(rowToDoor)
    : mem.doors.map(function(d){ return Object.assign({}, d); });
  return { dealer: data.DEALER, turfs: await turfSummary(), doors: doors, kpis: doorKpis(doors) };
}

async function turfSummary(){
  var counts = {};
  if (usePg) {
    (await pool.query(
      "SELECT turf, COUNT(*)::int AS doors, COUNT(*) FILTER (WHERE status<>'todo')::int AS done FROM doors GROUP BY turf"
    )).rows.forEach(function(r){ counts[r.turf] = { doors:r.doors, done:r.done }; });
  } else {
    mem.doors.forEach(function(d){
      var c = counts[d.turf] || (counts[d.turf] = { doors:0, done:0 });
      c.doors++; if (d.status !== "todo") c.done++;
    });
  }
  // seeded turfs first, then any "Field Adds" bucket a rep created
  var known = data.genTurfs().map(function(t){
    return Object.assign({}, t, counts[t.name] || { doors:0, done:0 });
  });
  Object.keys(counts).forEach(function(name){
    if (!known.some(function(t){ return t.name === name; })) {
      known.push(Object.assign({ name:name, zip:"", lat:null, lng:null }, counts[name]));
    }
  });
  return known;
}

function doorKpis(doors){
  var done = doors.filter(function(d){ return d.status !== "todo"; });
  return {
    total: doors.length,
    knocked: done.length,
    interested: doors.filter(function(d){ return d.status === "interested"; }).length,
    appointments: doors.filter(function(d){ return d.status === "appointment"; }).length,
    notHome: doors.filter(function(d){ return d.status === "not-home"; }).length,
    dnc: doors.filter(function(d){ return d.status === "dnc"; }).length,
    warm: doors.filter(function(d){ return d.custId; }).length
  };
}

var VALID_STATUS = ["todo","not-home","interested","appointment","not-interested","dnc"];

async function logVisit(id, status, note, rep){
  id = parseInt(id,10);
  if (VALID_STATUS.indexOf(status) === -1) throw new Error("invalid status: " + status);
  if (usePg) {
    var r = (await pool.query(
      "UPDATE doors SET status=$2, note=COALESCE(NULLIF($3,''),note), visited_at=CASE WHEN $2='todo' THEN NULL ELSE now() END" +
      " WHERE id=$1 RETURNING "+DOOR_COLS, [id, status, note||""])).rows[0];
    if (!r) throw new Error("door not found: " + id);
    await pool.query("INSERT INTO door_visits(door_id,status,note,rep) VALUES($1,$2,$3,$4)", [id, status, note||"", rep||"—"]);
    return rowToDoor(r);
  }
  var d = mem.doors.find(function(x){ return x.id === id; });
  if (!d) throw new Error("door not found: " + id);
  d.status = status;
  if (note) d.note = note;
  d.visitedAt = status === "todo" ? null : nowIso();
  return Object.assign({}, d);
}

/* A door a rep added in the field — already geocoded by /api/places/geocode. */
async function addDoor(d){
  if (!d || !d.addr || typeof d.lat !== "number" || typeof d.lng !== "number") throw new Error("addr, lat and lng are required");
  var rec = { turf: d.turf || "Field Adds", street: d.street || d.addr, addr: d.addr,
    city: d.city || "Phoenix", state: d.state || "AZ", zip: d.zip || "",
    lat: d.lat, lng: d.lng, note: d.note || "", source: "field" };
  if (usePg) {
    var r = (await pool.query(
      "INSERT INTO doors(turf,street,addr,city,state,zip,lat,lng,status,note,source)" +
      " VALUES($1,$2,$3,$4,$5,$6,$7,$8,'todo',$9,'field') RETURNING "+DOOR_COLS,
      [rec.turf,rec.street,rec.addr,rec.city,rec.state,rec.zip,rec.lat,rec.lng,rec.note])).rows[0];
    return rowToDoor(r);
  }
  var nextId = mem.doors.reduce(function(m,x){ return Math.max(m,x.id); }, 0) + 1;
  var full = Object.assign({ id: nextId, custId:null, name:null, veh:null, score:null, status:"todo", visitedAt:null }, rec);
  mem.doors.push(full);
  return Object.assign({}, full);
}

async function health(){ return { db: usePg }; }

module.exports = { init: init, getEquityData: getEquityData, createFollowup: createFollowup,
  getInventory: getInventory, getInventoryUpdates: getInventoryUpdates, sellRandomCar: sellRandomCar, health: health,
  getDoors: getDoors, logVisit: logVisit, addDoor: addDoor,
  isPg: function(){ return usePg; } };
