/* Deterministic seed data: 200 scored customers (87 equity opportunities) + 120 inventory vehicles.
   Pure functions, no randomness, so seeds are stable across restarts. */

var FN = ["Michael","Sarah","David","Jennifer","James","Linda","Robert","Patricia","Daniel","Emily","Christopher","Ashley","Matthew","Jessica","Andrew","Amanda","Joshua","Megan","Ryan","Nicole","Brandon","Stephanie","Justin","Rachel","Tyler","Lauren","Kevin","Hannah","Eric","Olivia","Aaron","Sophia","Adam","Grace","Nathan","Chloe","Sean","Victoria","Jordan","Madison","Carlos","Maria","Luis","Ana","Wei","Mei","Raj","Priya","Omar","Fatima","Andre","Aaliyah","Diego","Bella","Hiro","Yuki","Ivan","Elena","Marcus","Naomi","Trevor","Paige","Colin","Renee","Derek","Tanya","Felix","Gina","Curtis","Brooke"];
var LN = ["Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts","Patel","Cooper","Reed","Bailey","Rivas","Foster","Bryant","Russell","Griffin","Hayes","Coleman"];
var COL = ["#3b82f6","#f43f5e","#0ea5e9","#14b8a6","#ec4899","#eab308","#8b5cf6","#f97316","#10b981","#6366f1","#ef4444","#06b6d4"];

function ini(n){ return n.split(" ").map(function(w){return w[0];}).join("").slice(0,2).toUpperCase(); }
function clamp(v,lo,hi){ return Math.max(lo,Math.min(hi,v)); }

/* ---------- customers / equity opportunities ---------- */
var CUST_VH = [
  ["2023 Silverado LT","2026 Silverado High Country","#2f5fb0"],["2024 Cadillac XT5","2026 Cadillac XT6","#eceef1"],
  ["2022 GMC Sierra 1500","2026 Sierra Denali","#e6e7ea"],["2023 Tahoe Premier","2026 Tahoe High Country","#23262b"],
  ["2021 Equinox LT","2026 Equinox RS","#3a7ca5"],["2020 Telluride SX","2026 Telluride SX-P","#556070"],
  ["2022 Toyota RAV4","2026 RAV4 Limited","#3a7ca5"],["2021 Honda CR-V EX","2026 CR-V Hybrid","#2f5fb0"],
  ["2023 Ford F-150 XLT","2026 F-150 Lariat","#23262b"],["2020 Nissan Rogue SL","2026 Rogue Platinum","#4b5563"],
  ["2022 Jeep Grand Cherokee","2026 Grand Cherokee L","#5b3b2e"],["2023 Hyundai Tucson","2026 Tucson Limited","#556070"],
  ["2020 Subaru Outback","2026 Outback Touring","#2e4a3a"],["2022 Mazda CX-5","2026 CX-5 Signature","#7a1c1c"],
  ["2021 Kia Sorento","2026 Sorento SX","#2f3a4a"],["2020 Ram 1500 Big Horn","2026 Ram 1500 Laramie","#4a2f2f"],
  ["2022 VW Tiguan","2026 Tiguan SEL","#2b3a55"],["2021 Toyota Camry SE","2026 Camry XSE","#1c2330"],
  ["2023 Honda Accord","2026 Accord Touring","#2f5fb0"],["2020 Ford Explorer","2026 Explorer ST","#3a3a3a"]];

/* Six hand-authored anchor opportunities keep the page's original hero cards. */
var ANCHORS = [
  {name:"John Smith",ini:"JS",color:"#3b82f6",veh:"2023 Silverado LT",hex:"#2f5fb0",equity:9200,monthly:36,stars:5,score:92,rec:"2026 Silverado High Country",tags:[["hot","In-Market"],["lease","Lease ends 9mo"]],payoff:38100,value:47300,curPay:614,newPay:650,miles:"18,200",age:"3 yrs",demand:"High",
    factors:[["Equity position",92],["Vehicle age",78],["Market demand",95],["Payment fit",88],["Engagement",96],["Service loyalty",84]]},
  {name:"Priya Nair",ini:"PN",color:"#f43f5e",veh:"2024 Cadillac XT5",hex:"#eceef1",equity:6400,monthly:52,stars:5,score:88,rec:"2026 Cadillac XT6",tags:[["hot","In-Market"],["svc","Service-active"]],payoff:42600,value:49000,curPay:788,newPay:840,miles:"7,800",age:"1.5 yrs",demand:"High",
    factors:[["Equity position",78],["Vehicle age",62],["Market demand",90],["Payment fit",84],["Engagement",98],["Service loyalty",92]]},
  {name:"Kevin Anderson",ini:"KA",color:"#0ea5e9",veh:"2022 GMC Sierra 1500",hex:"#e6e7ea",equity:11300,monthly:28,stars:4,score:81,rec:"2026 Sierra Denali",tags:[["svc","Service-active"]],payoff:22000,value:33300,curPay:642,newPay:670,miles:"38,900",age:"2.5 yrs",demand:"Normal",
    factors:[["Equity position",96],["Vehicle age",70],["Market demand",72],["Payment fit",80],["Engagement",68],["Service loyalty",88]]},
  {name:"Robert Brown",ini:"RB",color:"#14b8a6",veh:"2023 Tahoe Premier",hex:"#23262b",equity:8900,monthly:44,stars:4,score:79,rec:"2026 Tahoe High Country",tags:[["lease","Lease ends 5mo"]],payoff:54000,value:62900,curPay:736,newPay:780,miles:"29,400",age:"1.5 yrs",demand:"High",
    factors:[["Equity position",82],["Vehicle age",60],["Market demand",88],["Payment fit",76],["Engagement",74],["Service loyalty",80]]},
  {name:"Amanda Harris",ini:"AH",color:"#ec4899",veh:"2021 Equinox LT",hex:"#3a7ca5",equity:4100,monthly:22,stars:3,score:66,rec:"2026 Equinox RS",tags:[],payoff:16800,value:20900,curPay:398,newPay:420,miles:"41,200",age:"4 yrs",demand:"Normal",
    factors:[["Equity position",64],["Vehicle age",84],["Market demand",60],["Payment fit",70],["Engagement",58],["Service loyalty",62]]},
  {name:"Grace Kim",ini:"GK",color:"#eab308",veh:"2020 Telluride SX",hex:"#556070",equity:6800,monthly:18,stars:3,score:61,rec:"2026 Telluride SX-P",tags:[["svc","Service-active"]],payoff:6800,value:13600,curPay:512,newPay:530,miles:"62,000",age:"5 yrs",demand:"Normal",
    factors:[["Equity position",72],["Vehicle age",92],["Market demand",58],["Payment fit",66],["Engagement",52],["Service loyalty",70]]}
];

function genCustomers(){
  var list = [];
  ANCHORS.forEach(function(a,i){ list.push(Object.assign({ id:i+1, isOpp:true, followup:false }, a)); });
  var id = ANCHORS.length + 1;
  // 81 more opportunities (total 87)
  for (var i=0;i<81;i++){
    var name = FN[(i*7+3)%FN.length] + " " + LN[(i*5+1)%LN.length];
    var v = CUST_VH[i%CUST_VH.length];
    var score = clamp(90 - Math.floor(i*0.45) - ((i*13)%8), 45, 99);
    var st = score>=85?5:score>=72?4:score>=58?3:2;
    var payoff = 12000 + ((i*1370)%42000);
    var equity = 1500 + ((i*940)%11500);
    var monthly = 15 + ((i*7)%55);
    var curPay = 320 + ((i*23)%520);
    var miles = (9000 + ((i*2100)%58000)).toLocaleString();
    var ageY = 1 + (i%5);
    var demand = score>=80?"High":score>=62?"Normal":"Soft";
    var tags = [];
    if (score>=82 && i%2===0) tags.push(["hot","In-Market"]);
    if (i%5===0) tags.push(["lease","Lease ends " + ((i%9)+2) + "mo"]);
    if (i%3===1) tags.push(["svc","Service-active"]);
    var f = function(b){ return clamp(b + ((i*17)%22) - 11, 45, 99); };
    list.push({ id:id++, isOpp:true, followup:false, name:name, ini:ini(name), color:COL[i%COL.length], veh:v[0], hex:v[2],
      equity:equity, monthly:monthly, stars:st, score:score, rec:v[1], tags:tags,
      payoff:payoff, value:payoff+equity, curPay:curPay, newPay:curPay+monthly, miles:miles, age:ageY+(ageY===1?" yr":" yrs"), demand:demand,
      factors:[["Equity position",f(score)],["Vehicle age",f(70)],["Market demand",f(75)],["Payment fit",f(72)],["Engagement",f(68)],["Service loyalty",f(74)]] });
  }
  // 113 non-opportunity customers (scored, but not surfaced — negative/low equity or not upgrade-ready) to reach 200 total
  for (var j=0;j<113;j++){
    var nm = FN[(j*11+5)%FN.length] + " " + LN[(j*3+7)%LN.length];
    var vv = CUST_VH[(j+4)%CUST_VH.length];
    var sc = clamp(30 + ((j*13)%26), 20, 57);
    list.push({ id:id++, isOpp:false, followup:false, name:nm, ini:ini(nm), color:COL[j%COL.length], veh:vv[0], hex:vv[2],
      equity:-((j*430)%3200), monthly:0, stars:2, score:sc, rec:vv[1], tags:[],
      payoff:0, value:0, curPay:0, newPay:0, miles:"—", age:"—", demand:"Soft", factors:[] });
  }
  return list; // 200 total, 87 with isOpp:true
}

/* ---------- inventory ---------- */
var MODELS = [
  ["Chevrolet","Silverado","LT","truck","#2f5fb0","5.3L V8","4WD",52995,["Z71 Off-Road","Heated Seats","Tow Package","Bose Audio","Wireless CarPlay"]],
  ["Chevrolet","Tahoe","High Country","suv","#23262b","6.2L V8","4WD",74995,["Panoramic Roof","Captain's Chairs","Max Trailering","Head-Up Display"]],
  ["Chevrolet","Colorado","Trail Boss","truck","#8a6a3a","2.7L Turbo","4WD",41995,["Off-Road Suspension","Skid Plates","Bed Liner","Remote Start"]],
  ["Chevrolet","Corvette","Stingray 3LT","sedan","#c62b2b","6.2L V8","RWD",76995,["Z51 Package","Carbon Interior","Magnetic Ride","Front Lift"]],
  ["GMC","Sierra","Denali","truck","#e6e7ea","6.2L V8","4WD",68995,["Denali Ultimate","Super Cruise","MultiPro Tailgate","Massaging Seats"]],
  ["Chevrolet","Equinox","RS","suv","#3a7ca5","1.5L Turbo","AWD",31995,["RS Appearance","Panoramic Roof","Adaptive Cruise","Wireless Charging"]],
  ["Chevrolet","Traverse","RS","suv","#6b7280","2.5L Turbo","AWD",47995,["RS Package","Third Row","Google Built-In","Hands-Free Liftgate"]],
  ["Ford","F-150","XLT","truck","#b6bac0","3.5L EcoBoost","4WD",38995,["XLT Sport","Trailer Tow","Twin Panel Moonroof","B&O Audio"]],
  ["Cadillac","XT5","Sport","suv","#eceef1","3.6L V6","AWD",49995,["Sport AWD","Panoramic Roof","AKG Studio Audio","Super Cruise Ready"]],
  ["Toyota","RAV4","XLE","suv","#556070","2.5L I4","AWD",33995,["Blind Spot Monitor","Power Liftgate","Apple CarPlay","Lane Assist"]],
  ["Honda","CR-V","EX-L","suv","#2f5fb0","1.5L Turbo","AWD",35995,["Leather Seats","Sunroof","Heated Seats","Honda Sensing"]],
  ["Ram","1500","Laramie","truck","#4a2f2f","5.7L HEMI","4WD",58995,["Laramie Level 2","Air Suspension","12in Touchscreen","Ventilated Seats"]],
  ["Jeep","Grand Cherokee","Limited","suv","#2e3a2e","3.6L V6","4WD",46995,["Limited Package","Quadra-Trac","Alpine Audio","Hands-Free Liftgate"]],
  ["Cadillac","Escalade","Premium","suv","#1c1c1c","6.2L V8","4WD",96995,["Super Cruise","38in OLED","AKG Reference Audio","Executive Seating"]],
  ["Toyota","Tacoma","TRD Sport","truck","#3a3a3a","2.4L Turbo","4WD",42995,["TRD Sport","Off-Road Tires","Multi-Terrain","Panoramic Roof"]],
  ["Hyundai","Palisade","Calligraphy","suv","#e6e7ea","3.8L V6","AWD",52995,["Nappa Leather","Dual Sunroof","Bose Audio","Heads-Up Display"]]];
var COLORS = ["Summit White","Black","Northsky Blue","Silver Ice","Cherry Red","Sterling Gray","Riptide Blue","White Frost","Cajun Red","Graphite","Iridescent Pearl","Dark Ash"];
var CONDS = ["new","new","new","certified","used","new","certified"];

function genInventory(){
  var cars = [];
  for (var i=0;i<120;i++){
    var m = MODELS[i%MODELS.length];
    var cond = CONDS[i%CONDS.length];
    var isNew = cond==="new";
    var year = isNew ? (2025 + (i%2)) : (2020 + (i%5));
    var basePrice = m[7];
    var priceAdj = ((i*137)%6000) - 2000;
    var price = Math.round((basePrice + priceAdj) / 5) * 5 - 5;
    var reduced = i%4===0;
    var prev = reduced ? price + 1000 + ((i*70)%1500) : 0;
    var miles = isNew ? (3 + (i%40)) : (8000 + ((i*1900)%62000));
    var days = 1 + ((i*7)%88);
    var demand = i%3===0 ? "high" : i%3===1 ? "normal" : "low";
    var badges = [];
    if (days<=4) badges.push("new");
    if (reduced) badges.push("reduced");
    if (demand==="high") badges.push("hot");
    if (i%6===0) badges.push("popular");
    if (i%9===0) badges.push("manager");
    if (!badges.length) badges.push("detailed");
    var stock = (isNew?"T":"S") + (40000 + i*131 % 9999 + i).toString().slice(0,5);
    var vinBody = (i%2? "3GCUKDED":"1GNSKTKL") + (i%9) + "SG" + (140000 + i*13).toString().slice(0,6);
    var views = 40 + ((i*29)%280);
    var saved = 3 + ((i*7)%42);
    var inquiries = ((i*5)%13);
    var priceHist = reduced
      ? [["Listed",prev,false],["Reduced",price+500,true],["Reduced",price,true]]
      : [["Listed",price,false]];
    cars.push({
      id:i+1, year:year, make:m[0], model:m[1], trim:m[2], body:m[3], color:COLORS[i%COLORS.length], hex:m[4],
      engine:m[5], drive:m[6], trans: m[3]==="truck"?"10-Speed Auto":"8-Speed Auto",
      stock:stock, vin:vinBody, miles:miles, price:price, prev:prev, days:days,
      status:"available", cond:cond, badges:badges, views:views, saved:saved, inquiries:inquiries, deals:(i%4===0?1:0),
      rep: i%7===0 ? "Unassigned" : "Jordan", demand:demand, features:m[8],
      priceHist:priceHist.map(function(p){ return [p[0], p[0]==="Listed"?"Listed":"Reduced", p[1], p[2]]; }),
      ai:[[(demand==="high"?"Strong demand — <b>"+views+" views</b> this week.":"Steady interest at current price."), (demand==="high"?"Hold pricing; feature prominently.":"Highlight key features in listings.")]],
      activity:[["#2563eb","Listed to inventory","Recently"],["#0891b2","Window sticker generated","Recently"]]
    });
  }
  return cars; // 120
}

/* ---------- door-to-door canvassing turfs + doors ----------
   Phoenix metro. Doors are laid out along real street grids so the map, the
   walking order and the drive times between turfs all behave realistically
   without spending a Google geocoding call on seed data. Live Google lookups
   are reserved for addresses a rep types in the field (see /api/places/*). */

var DEALER = { name:"Premier Auto Group", addr:"3402 W Bell Rd, Phoenix, AZ 85053", lat:33.63862, lng:-112.13304 };

/* metres -> degrees at Phoenix's latitude (~33.6N) */
var M_LAT = 1/111320, M_LNG = 1/92662;

/* [turf name, zip, centre lat, centre lng, [ [street, orientation, houseBase, count], ... ] ]
   orientation "ns" = north-south street (houses step in latitude),
               "ew" = east-west street (houses step in longitude). */
var TURFS = [
  ["Deer Valley",      "85027", 33.68300, -112.10800, [["W Utopia Rd","ew",3510,14],["N 35th Ave","ns",19420,12],["W Pinnacle Peak Rd","ew",3620,12]]],
  ["Arrowhead Ranch",  "85308", 33.66500, -112.19500, [["W Behrend Dr","ew",6840,13],["N 67th Ave","ns",18240,12],["W Melinda Ln","ew",6910,11]]],
  ["Moon Valley",      "85023", 33.62400, -112.07300, [["N 7th Ave","ns",15120,12],["W Sweetwater Ave","ew",1420,13],["N 15th Ave","ns",15340,11]]],
  ["Norterra",         "85085", 33.72600, -112.11400, [["W Rowel Rd","ew",2740,12],["N 27th Dr","ns",23180,12],["W Sands Dr","ew",2820,11]]],
  ["Desert Ridge",     "85050", 33.68000, -111.97600, [["E Deer Valley Rd","ew",4210,13],["N 46th St","ns",21150,12],["E Mountain Sky Ave","ew",4330,11]]],
  ["Sunnyslope",       "85021", 33.56800, -112.08600, [["W Mountain View Rd","ew",1240,13],["N 19th Ave","ns",9420,12],["W Butler Dr","ew",1310,11]]],
  ["Union Hills",      "85308", 33.65600, -112.15800, [["W Grovers Ave","ew",4520,12],["N 51st Ave","ns",17840,12],["W Paradise Ln","ew",4610,11]]],
  ["Maryvale",         "85033", 33.50900, -112.21400, [["W Campbell Ave","ew",7810,13],["N 75th Ave","ns",4180,12],["W Osborn Rd","ew",7920,11]]]
];

/* Mostly blank — a canvassing book only carries a note where someone actually
   observed something. The empties keep the list honest. */
var DOOR_NOTE = [
  "", "", "", "",
  "Truck in the driveway — lease plate frame.",
  "", "", "",
  "Two vehicles, both tags expiring soon.",
  "", "",
  "Corner lot, dog in the yard — knock at the side gate.",
  "", "", "",
  "Newer build, likely first-time owners.",
  "", "",
  "Boat on a trailer — towing prospect.",
  "", "", "",
  "Solar install last year; household invests in upgrades.",
  "", ""
];

/* Doors: every house on the street, which is what canvassing actually is.
   Roughly 1 in 5 matches a customer already in the CRM (a warm door). */
function genCanvassDoors(customers){
  customers = customers || [];
  var doors = [], id = 1, ci = 0;
  TURFS.forEach(function(t, ti){
    var turf = t[0], zip = t[1], clat = t[2], clng = t[3], streets = t[4];
    streets.forEach(function(s, si){
      var street = s[0], orient = s[1], base = s[2], count = s[3];
      // offset each street off the turf centre so they don't overlap on the map
      var offLat = (si - 1) * 320 * M_LAT;
      var offLng = (si - 1) * 340 * M_LNG;
      for (var h = 0; h < count; h++){
        var lat, lng;
        if (orient === "ns") { lat = clat + offLat + (h - count/2) * 24 * M_LAT; lng = clng + offLng; }
        else                 { lat = clat + offLat; lng = clng + offLng + (h - count/2) * 26 * M_LNG; }
        var num = base + h * 2;                      // even side of the street
        // two independent seeds — one shared seed made every note on a street identical
        var seedIdx = ti * 41 + si * 13 + h * 7;
        var noteIdx = ti * 5 + si * 3 + h;
        var warm = (seedIdx % 5 === 0) && ci < customers.length;
        var cust = warm ? customers[(ci++ * 9 + 3) % customers.length] : null;
        doors.push({
          id: id++,
          turf: turf,
          street: street,
          addr: num + " " + street,
          city: "Phoenix", state: "AZ", zip: zip,
          lat: Math.round(lat * 1e6) / 1e6,
          lng: Math.round(lng * 1e6) / 1e6,
          custId: cust ? cust.id : null,
          name: cust ? cust.name : null,
          veh: cust ? cust.veh : null,
          score: cust ? cust.score : null,
          status: "todo",
          note: DOOR_NOTE[noteIdx % DOOR_NOTE.length],
          visitedAt: null,
          source: "seed"
        });
      }
    });
  });
  return doors;
}

function genTurfs(){ return TURFS.map(function(t){ return { name:t[0], zip:t[1], lat:t[2], lng:t[3] }; }); }

module.exports = { genCustomers: genCustomers, genInventory: genInventory,
  genCanvassDoors: genCanvassDoors, genTurfs: genTurfs, DEALER: DEALER };
