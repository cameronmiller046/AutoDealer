/* ===================================================================
   Autodealer — real-world vehicle reference data (multi-make)
   Powers the cascading Make → Model → Year → Trim selection, body-style
   auto-fill, drivetrain/fuel/transmission constraints, and stock lookup.

   Coverage: major makes sold in North America (current generations).
   Trims can change by model year, so `trimsByYear` overrides the default
   `trims` where a generation changed (e.g. the 2025+ Chevrolet Equinox).
   The set is curated and easily extended — add makes/models to DATA.
   =================================================================== */
(function () {
  const Y = [2026, 2025, 2024, 2023, 2022];
  const Y4 = [2026, 2025, 2024, 2023];
  const Y3 = [2026, 2025, 2024];

  // fuels
  const G = ["Gasoline"], GD = ["Gasoline", "Diesel"], EV = ["Electric"],
        HY = ["Hybrid"], GH = ["Gasoline", "Hybrid"], PHEV = ["Plug-in Hybrid"];
  // drivetrains
  const FWD = ["FWD"], RWD = ["RWD"], AWD = ["AWD"],
        FA = ["FWD", "AWD"], RA = ["RWD", "AWD"], R4 = ["RWD", "4WD"], F4 = ["FWD", "4WD"];
  const AUTO = ["Automatic"], AM = ["Automatic", "Manual"];

  // m(body, fuel, drivetrains, years, trims, trimsByYear?, transmissions?)
  function m(body, fuel, dt, years, trims, tby, trans) {
    return { body, fuel, drivetrains: dt, transmissions: trans || AUTO, years, trims, trimsByYear: tby || null };
  }

  const DATA = {
    Acura: {
      "Integra": m("Sedan", G, FA, Y3, ["Base", "A-Spec", "A-Spec Technology", "Type S"], null, AM),
      "TLX": m("Sedan", G, FA, Y, ["Base", "Technology", "A-Spec", "Type S"]),
      "RDX": m("SUV", G, FA, Y, ["Base", "Technology", "A-Spec", "Advance"]),
      "MDX": m("SUV", G, FA, Y, ["Base", "Technology", "A-Spec", "Advance", "Type S"]),
      "ZDX": m("SUV", EV, RA, Y3, ["A-Spec", "Type S"]),
    },
    Audi: {
      "A3": m("Sedan", G, FA, Y, ["Premium", "Premium Plus", "Prestige"]),
      "A4": m("Sedan", G, FA, Y, ["Premium", "Premium Plus", "Prestige"]),
      "A5": m("Coupe", G, AWD, Y, ["Premium", "Premium Plus", "Prestige"]),
      "A6": m("Sedan", G, FA, Y, ["Premium", "Premium Plus", "Prestige"]),
      "Q3": m("SUV", G, AWD, Y, ["Premium", "Premium Plus"]),
      "Q5": m("SUV", G, AWD, Y, ["Premium", "Premium Plus", "Prestige"]),
      "Q7": m("SUV", G, AWD, Y, ["Premium", "Premium Plus", "Prestige"]),
      "Q8": m("SUV", G, AWD, Y, ["Premium", "Premium Plus", "Prestige"]),
      "Q4 e-tron": m("SUV", EV, RA, Y3, ["Premium", "Premium Plus", "Prestige"]),
    },
    BMW: {
      "2 Series": m("Coupe", G, RA, Y, ["230i", "M240i"]),
      "3 Series": m("Sedan", G, RA, Y, ["330i", "M340i", "330e"]),
      "4 Series": m("Coupe", G, RA, Y, ["430i", "M440i"]),
      "5 Series": m("Sedan", G, RA, Y, ["530i", "540i", "i5"]),
      "X1": m("SUV", G, AWD, Y, ["xDrive28i", "M35i"]),
      "X3": m("SUV", G, RA, Y, ["sDrive30i", "xDrive30i", "M50"]),
      "X5": m("SUV", G, RA, Y, ["sDrive40i", "xDrive40i", "M60i"]),
      "X7": m("SUV", G, AWD, Y, ["xDrive40i", "M60i"]),
      "i4": m("Sedan", EV, RA, Y3, ["eDrive35", "eDrive40", "M50"]),
      "iX": m("SUV", EV, AWD, Y3, ["xDrive50", "M60"]),
    },
    Buick: {
      "Encore GX": m("SUV", G, FA, Y, ["Preferred", "Sport Touring", "Avenir"]),
      "Envista": m("SUV", G, FWD, Y3, ["Preferred", "Sport Touring", "Avenir"]),
      "Envision": m("SUV", G, FA, Y, ["Preferred", "Sport Touring", "Avenir"]),
      "Enclave": m("SUV", G, FA, Y, ["Preferred", "Sport Touring", "Avenir"]),
    },
    Cadillac: {
      "CT4": m("Sedan", G, RA, Y, ["Luxury", "Premium Luxury", "Sport", "V-Series"]),
      "CT5": m("Sedan", G, RA, Y, ["Luxury", "Premium Luxury", "Sport", "V-Series"]),
      "XT4": m("SUV", G, FA, Y, ["Luxury", "Premium Luxury", "Sport"]),
      "XT5": m("SUV", G, FA, Y, ["Luxury", "Premium Luxury", "Sport"]),
      "XT6": m("SUV", G, FA, Y, ["Luxury", "Premium Luxury", "Sport"]),
      "Escalade": m("SUV", GD, R4, Y, ["Luxury", "Premium Luxury", "Sport", "Premium Luxury Platinum", "Sport Platinum"]),
      "LYRIQ": m("SUV", EV, RA, Y4, ["Tech", "Luxury", "Sport"]),
      "OPTIQ": m("SUV", EV, AWD, [2026, 2025], ["Luxury", "Sport"]),
    },
    Chevrolet: {
      "Silverado 1500": m("Truck", GD, R4, Y, ["WT", "Custom", "LT", "RST", "Custom Trail Boss", "LT Trail Boss", "LTZ", "High Country"]),
      "Silverado 2500 HD": m("Truck", GD, R4, Y, ["WT", "Custom", "LT", "LTZ", "High Country"]),
      "Colorado": m("Truck", G, R4, Y4, ["WT", "LT", "Trail Boss", "Z71", "ZR2"]),
      "Equinox": m("SUV", G, FA, Y, ["LS", "LT", "RS", "Premier"], { 2026: ["LT", "RS", "ACTIV"], 2025: ["LT", "RS", "ACTIV"] }),
      "Equinox EV": m("SUV", EV, FA, Y3, ["LT", "RS"]),
      "Traverse": m("SUV", G, FA, Y, ["LS", "LT", "RS", "Z71", "High Country"], { 2026: ["LT", "RS", "Z71", "High Country"], 2025: ["LT", "RS", "Z71", "High Country"], 2024: ["LT", "RS", "Z71", "High Country"] }),
      "Trax": m("SUV", G, FWD, Y3, ["LS", "1RS", "LT", "2RS", "ACTIV"]),
      "Trailblazer": m("SUV", G, FA, Y, ["LS", "LT", "ACTIV", "RS"]),
      "Blazer": m("SUV", G, FA, [2025, 2024, 2023, 2022], ["LT", "RS", "Premier"]),
      "Blazer EV": m("SUV", EV, ["FWD", "RWD", "AWD"], Y3, ["LT", "RS", "SS"]),
      "Tahoe": m("SUV", GD, R4, Y, ["LS", "LT", "RST", "Z71", "Premier", "High Country"]),
      "Suburban": m("SUV", GD, R4, Y, ["LS", "LT", "RST", "Z71", "Premier", "High Country"]),
      "Malibu": m("Sedan", G, FWD, [2025, 2024, 2023, 2022], ["LS", "RS", "LT", "2LT"]),
      "Camaro": m("Coupe", G, RWD, [2024, 2023, 2022], ["1LS", "1LT", "2LT", "3LT", "1SS", "2SS", "ZL1"], null, AM),
      "Corvette": m("Coupe", G, RA, Y, ["Stingray 1LT", "Stingray 2LT", "Stingray 3LT", "Z06", "E-Ray"]),
    },
    Chrysler: {
      "Pacifica": m("Minivan", GH, FA, Y, ["Touring", "Touring L", "Limited", "Pinnacle"]),
      "300": m("Sedan", G, RA, [2023, 2022], ["Touring", "300S", "300C"]),
    },
    Dodge: {
      "Charger": m("Sedan", G, RA, Y, ["SXT", "GT", "R/T", "Scat Pack"]),
      "Challenger": m("Coupe", G, RA, [2023, 2022], ["SXT", "GT", "R/T", "Scat Pack"]),
      "Durango": m("SUV", G, RA, Y, ["SXT", "GT", "R/T", "Citadel", "SRT 392"]),
      "Hornet": m("SUV", GH, AWD, Y3, ["GT", "GT Plus", "R/T"]),
    },
    Ford: {
      "F-150": m("Truck", GH, R4, Y, ["XL", "STX", "XLT", "Lariat", "King Ranch", "Platinum", "Raptor"]),
      "F-150 Lightning": m("Truck", EV, AWD, Y3, ["Pro", "XLT", "Flash", "Lariat", "Platinum"]),
      "Super Duty F-250": m("Truck", GD, R4, Y, ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Limited"]),
      "Ranger": m("Truck", G, R4, Y3, ["XL", "XLT", "Lariat", "Raptor"]),
      "Maverick": m("Truck", GH, FA, Y, ["XL", "XLT", "Lariat", "Lobo", "Tremor"]),
      "Bronco": m("SUV", G, ["4WD"], Y, ["Big Bend", "Black Diamond", "Outer Banks", "Badlands", "Wildtrak", "Raptor"]),
      "Bronco Sport": m("SUV", G, AWD, Y, ["Big Bend", "Heritage", "Outer Banks", "Badlands"]),
      "Escape": m("SUV", GH, FA, Y, ["Active", "ST-Line", "ST-Line Select", "Platinum"]),
      "Explorer": m("SUV", G, R4, Y, ["Active", "ST-Line", "ST", "Platinum"]),
      "Expedition": m("SUV", G, R4, Y, ["XLT", "Limited", "Timberline", "King Ranch", "Platinum"]),
      "Mustang": m("Coupe", G, RWD, Y, ["EcoBoost", "GT", "Dark Horse"], null, AM),
      "Mustang Mach-E": m("SUV", EV, RA, Y, ["Select", "Premium", "GT", "Rally"]),
    },
    GMC: {
      "Sierra 1500": m("Truck", GD, R4, Y, ["Pro", "SLE", "Elevation", "SLT", "AT4", "Denali", "AT4X", "Denali Ultimate"]),
      "Sierra 2500 HD": m("Truck", GD, R4, Y, ["Pro", "SLE", "SLT", "AT4", "Denali", "Denali Ultimate"]),
      "Canyon": m("Truck", G, R4, Y4, ["Elevation", "AT4", "Denali", "AT4X"]),
      "Terrain": m("SUV", G, FA, Y, ["SLE", "SLT", "AT4", "Denali"]),
      "Acadia": m("SUV", G, FA, Y, ["Elevation", "AT4", "Denali"]),
      "Yukon": m("SUV", GD, R4, Y, ["SLE", "SLT", "AT4", "Denali", "Denali Ultimate"]),
      "Yukon XL": m("SUV", GD, R4, Y, ["SLE", "SLT", "AT4", "Denali", "Denali Ultimate"]),
      "Hummer EV Pickup": m("Truck", EV, AWD, Y, ["EV2", "EV2X", "EV3X", "Edition 1"]),
    },
    Honda: {
      "Civic": m("Sedan", GH, FWD, Y, ["LX", "Sport", "EX", "Sport Touring", "Si"], null, AM),
      "Civic Type R": m("Hatchback", G, FWD, Y, ["Base"], null, ["Manual"]),
      "Accord": m("Sedan", GH, FWD, Y, ["LX", "EX", "Sport", "EX-L", "Sport-L", "Touring"]),
      "HR-V": m("SUV", G, FA, Y, ["LX", "Sport", "EX-L"]),
      "CR-V": m("SUV", GH, FA, Y, ["LX", "EX", "EX-L", "Sport", "Sport-L", "Sport Touring"]),
      "Passport": m("SUV", G, AWD, Y, ["EX-L", "TrailSport", "Black Edition"]),
      "Pilot": m("SUV", G, F4, Y, ["Sport", "EX-L", "TrailSport", "Touring", "Elite"]),
      "Ridgeline": m("Truck", G, AWD, Y, ["Sport", "RTL", "TrailSport", "Black Edition"]),
      "Odyssey": m("Minivan", G, FWD, Y, ["EX-L", "Sport-L", "Touring", "Elite"]),
      "Prologue": m("SUV", EV, FA, Y3, ["EX", "Touring", "Elite"]),
    },
    Hyundai: {
      "Elantra": m("Sedan", GH, FWD, Y, ["SE", "SEL", "Limited", "N Line", "N"], null, AM),
      "Sonata": m("Sedan", GH, FA, Y, ["SE", "SEL", "Limited", "N Line"]),
      "Venue": m("SUV", G, FWD, Y, ["SE", "SEL", "Limited"]),
      "Kona": m("SUV", G, FA, Y, ["SE", "SEL", "N Line", "Limited"]),
      "Tucson": m("SUV", GH, FA, Y, ["SE", "SEL", "XRT", "N Line", "Limited"]),
      "Santa Fe": m("SUV", GH, FA, Y, ["SE", "SEL", "XRT", "Limited", "Calligraphy"]),
      "Palisade": m("SUV", G, FA, Y, ["SE", "SEL", "XRT", "Limited", "Calligraphy"]),
      "Santa Cruz": m("Truck", G, FA, Y, ["SE", "SEL", "XRT", "Limited"]),
      "Ioniq 5": m("SUV", EV, RA, Y, ["SE", "SEL", "Limited", "XRT"]),
      "Ioniq 6": m("Sedan", EV, RA, Y3, ["SE", "SEL", "Limited"]),
    },
    Jeep: {
      "Renegade": m("SUV", G, F4, [2023, 2022], ["Latitude", "Altitude", "Limited", "Trailhawk"]),
      "Compass": m("SUV", G, F4, Y, ["Sport", "Latitude", "Limited", "Trailhawk"]),
      "Cherokee": m("SUV", G, F4, [2023, 2022], ["Latitude", "Altitude", "Limited", "Trailhawk"]),
      "Grand Cherokee": m("SUV", GH, R4, Y, ["Laredo", "Altitude", "Limited", "Overland", "Summit", "Trailhawk"]),
      "Wrangler": m("SUV", GH, ["4WD"], Y, ["Sport", "Willys", "Sahara", "Rubicon"], null, AM),
      "Gladiator": m("Truck", G, ["4WD"], Y, ["Sport", "Willys", "Mojave", "Rubicon"], null, AM),
      "Wagoneer": m("SUV", G, R4, Y, ["Series II", "Series III"]),
      "Grand Wagoneer": m("SUV", G, R4, Y, ["Series II", "Obsidian", "Series III"]),
    },
    Kia: {
      "Forte": m("Sedan", G, FWD, [2024, 2023, 2022], ["LX", "LXS", "GT-Line", "GT"], null, AM),
      "K5": m("Sedan", G, FA, Y, ["LXS", "GT-Line", "EX", "GT"]),
      "Soul": m("Hatchback", G, FWD, Y, ["LX", "S", "GT-Line", "EX"]),
      "Seltos": m("SUV", G, FA, Y, ["LX", "S", "EX", "SX", "X-Line"]),
      "Sportage": m("SUV", GH, FA, Y, ["LX", "EX", "X-Line", "SX", "X-Pro"]),
      "Sorento": m("SUV", GH, FA, Y, ["LX", "S", "EX", "SX", "X-Line", "X-Pro"]),
      "Telluride": m("SUV", G, FA, Y, ["LX", "S", "EX", "SX", "X-Line", "X-Pro"]),
      "Carnival": m("Minivan", GH, FWD, Y, ["LX", "EX", "SX", "SX Prestige"]),
      "EV6": m("SUV", EV, RA, Y, ["Light", "Wind", "GT-Line", "GT"]),
      "Niro": m("SUV", HY, FWD, Y, ["LX", "EX", "SX", "SX Touring"]),
    },
    Lexus: {
      "IS": m("Sedan", G, RA, Y, ["300", "350 F Sport", "500 F Sport Performance"]),
      "ES": m("Sedan", GH, FA, Y, ["250", "300h", "350", "350 F Sport"]),
      "UX": m("SUV", HY, FA, Y, ["300h Premium", "300h Luxury", "300h F Sport"]),
      "NX": m("SUV", GH, FA, Y, ["250", "350", "350h", "450h+ F Sport"]),
      "RX": m("SUV", GH, FA, Y, ["350", "350h", "500h F Sport", "450h+"]),
      "TX": m("SUV", GH, FA, Y3, ["350", "500h F Sport", "550h+"]),
      "GX": m("SUV", G, ["4WD"], Y, ["Premium", "Overtrail", "Luxury"]),
      "LX": m("SUV", GD, ["4WD"], Y, ["600 Premium", "600 F Sport", "600 Luxury", "600 Ultra Luxury"]),
      "RZ": m("SUV", EV, AWD, Y3, ["300e", "450e Premium", "450e Luxury"]),
    },
    Mazda: {
      "Mazda3": m("Sedan", G, FA, Y, ["2.5 S", "2.5 S Select", "2.5 S Preferred", "2.5 Turbo", "2.5 Turbo Premium Plus"], null, AM),
      "CX-30": m("SUV", G, AWD, Y, ["2.5 S", "2.5 S Select", "2.5 S Preferred", "2.5 Turbo", "2.5 Turbo Premium Plus"]),
      "CX-5": m("SUV", G, AWD, Y, ["2.5 S Select", "2.5 S Preferred", "2.5 S Premium", "2.5 Turbo", "2.5 Turbo Signature"]),
      "CX-50": m("SUV", GH, AWD, Y3, ["2.5 S Select", "2.5 S Preferred", "2.5 S Premium", "2.5 Turbo", "2.5 Turbo Premium Plus"]),
      "CX-70": m("SUV", PHEV, AWD, [2026, 2025], ["3.3 Turbo Preferred", "3.3 Turbo Premium", "PHEV Premium Plus"]),
      "CX-90": m("SUV", PHEV, AWD, Y3, ["3.3 Turbo Select", "3.3 Turbo Preferred", "3.3 Turbo Premium", "PHEV Premium Plus"]),
      "MX-5 Miata": m("Coupe", G, RWD, Y, ["Sport", "Club", "Grand Touring"], null, AM),
    },
    "Mercedes-Benz": {
      "A-Class": m("Sedan", G, FA, [2024, 2023, 2022], ["A 220"]),
      "C-Class": m("Sedan", G, RA, Y, ["C 300", "AMG C 43"]),
      "E-Class": m("Sedan", G, RA, Y, ["E 350", "E 450", "AMG E 53"]),
      "S-Class": m("Sedan", G, RA, Y, ["S 500", "S 580", "AMG S 63"]),
      "GLA": m("SUV", G, FA, Y, ["GLA 250", "AMG GLA 35"]),
      "GLB": m("SUV", G, FA, Y, ["GLB 250", "AMG GLB 35"]),
      "GLC": m("SUV", G, AWD, Y, ["GLC 300", "AMG GLC 43"]),
      "GLE": m("SUV", G, AWD, Y, ["GLE 350", "GLE 450", "AMG GLE 53"]),
      "GLS": m("SUV", G, AWD, Y, ["GLS 450", "GLS 580", "AMG GLS 63"]),
      "EQE SUV": m("SUV", EV, RA, Y3, ["350+", "350 4MATIC", "500 4MATIC"]),
    },
    Nissan: {
      "Versa": m("Sedan", G, FWD, Y, ["S", "SV", "SR"], null, AM),
      "Sentra": m("Sedan", G, FWD, Y, ["S", "SV", "SR"]),
      "Altima": m("Sedan", G, FA, Y, ["S", "SV", "SR", "SL"]),
      "Kicks": m("SUV", G, FA, Y, ["S", "SV", "SR"]),
      "Rogue": m("SUV", G, FA, Y, ["S", "SV", "SL", "Platinum"]),
      "Murano": m("SUV", G, FA, Y, ["SV", "SL", "Platinum"]),
      "Pathfinder": m("SUV", G, FA, Y, ["S", "SV", "SL", "Rock Creek", "Platinum"]),
      "Armada": m("SUV", G, R4, Y, ["SV", "SL", "Platinum"]),
      "Frontier": m("Truck", G, R4, Y, ["S", "SV", "PRO-X", "PRO-4X"]),
      "Z": m("Coupe", G, RWD, Y, ["Sport", "Performance", "Nismo"], null, AM),
      "Ariya": m("SUV", EV, FA, Y3, ["Engage", "Venture+", "Evolve+", "Platinum+"]),
    },
    Ram: {
      "1500": m("Truck", GD, R4, Y, ["Tradesman", "Big Horn", "Laramie", "Rebel", "Limited Longhorn", "Limited"]),
      "1500 Classic": m("Truck", G, R4, [2024, 2023, 2022], ["Tradesman", "Warlock", "SLT"]),
      "2500": m("Truck", GD, ["4WD"], Y, ["Tradesman", "Big Horn", "Laramie", "Power Wagon", "Limited Longhorn", "Limited"]),
    },
    Subaru: {
      "Impreza": m("Hatchback", G, AWD, Y, ["Base", "Sport", "RS"]),
      "Legacy": m("Sedan", G, AWD, Y, ["Base", "Premium", "Sport", "Limited", "Touring XT"]),
      "Crosstrek": m("SUV", G, AWD, Y, ["Base", "Premium", "Sport", "Limited", "Wilderness"]),
      "Forester": m("SUV", G, AWD, Y, ["Base", "Premium", "Sport", "Limited", "Touring", "Wilderness"]),
      "Outback": m("SUV", G, AWD, Y, ["Base", "Premium", "Onyx Edition", "Limited", "Touring", "Wilderness"]),
      "Ascent": m("SUV", G, AWD, Y, ["Base", "Premium", "Onyx", "Limited", "Touring"]),
      "WRX": m("Sedan", G, AWD, Y, ["Base", "Premium", "Limited", "GT", "tS"], null, AM),
      "BRZ": m("Coupe", G, RWD, Y, ["Premium", "Limited", "tS"], null, AM),
      "Solterra": m("SUV", EV, AWD, Y3, ["Premium", "Limited", "Touring"]),
    },
    Tesla: {
      "Model 3": m("Sedan", EV, RA, Y, ["RWD", "Long Range", "Performance"]),
      "Model Y": m("SUV", EV, RA, Y, ["RWD", "Long Range", "Performance"]),
      "Model S": m("Sedan", EV, AWD, Y, ["Long Range", "Plaid"]),
      "Model X": m("SUV", EV, AWD, Y, ["Long Range", "Plaid"]),
      "Cybertruck": m("Truck", EV, AWD, Y3, ["Long Range", "All-Wheel Drive", "Cyberbeast"]),
    },
    Toyota: {
      "Corolla": m("Sedan", GH, FWD, Y, ["LE", "SE", "XLE", "XSE"], null, AM),
      "Camry": m("Sedan", GH, FA, Y, ["LE", "SE", "XLE", "XSE"]),
      "Crown": m("Sedan", GH, AWD, Y3, ["XLE", "Limited", "Platinum"]),
      "Prius": m("Hatchback", HY, FA, Y3, ["LE", "XLE", "Limited"]),
      "GR86": m("Coupe", G, RWD, Y, ["Base", "Premium"], null, AM),
      "Corolla Cross": m("SUV", GH, FA, Y, ["L", "LE", "XLE", "S", "SE"]),
      "RAV4": m("SUV", GH, FA, Y, ["LE", "XLE", "XLE Premium", "Adventure", "TRD Off-Road", "Limited"]),
      "Highlander": m("SUV", GH, FA, Y, ["LE", "XLE", "XSE", "Limited", "Platinum"]),
      "Grand Highlander": m("SUV", GH, FA, Y3, ["XLE", "Limited", "Platinum"]),
      "4Runner": m("SUV", GH, R4, Y, ["SR5", "TRD Sport", "TRD Off-Road", "Limited", "TRD Pro", "Trailhunter"]),
      "Tacoma": m("Truck", GH, R4, Y3, ["SR", "SR5", "TRD Sport", "TRD Off-Road", "Limited", "TRD Pro", "Trailhunter"], null, AM),
      "Tundra": m("Truck", GH, R4, Y, ["SR", "SR5", "Limited", "Platinum", "1794 Edition", "TRD Pro"]),
      "Sequoia": m("SUV", HY, R4, Y, ["SR5", "Limited", "Platinum", "TRD Pro", "Capstone"]),
      "Sienna": m("Minivan", HY, FA, Y, ["LE", "XLE", "XSE", "Limited", "Platinum"]),
      "bZ4X": m("SUV", EV, FA, Y3, ["XLE", "Limited"]),
    },
    Volkswagen: {
      "Jetta": m("Sedan", G, FWD, Y, ["S", "SE", "Sport", "SEL", "GLI"], null, AM),
      "Golf GTI": m("Hatchback", G, FWD, Y, ["S", "SE", "Autobahn"], null, AM),
      "Golf R": m("Hatchback", G, AWD, Y, ["Base", "Black Edition"], null, AM),
      "Taos": m("SUV", G, FA, Y, ["S", "SE", "SEL"]),
      "Tiguan": m("SUV", G, FA, Y, ["S", "SE", "SE R-Line Black", "SEL R-Line"]),
      "Atlas": m("SUV", G, FA, Y, ["SE", "SE w/Technology", "Peak Edition SE", "SEL", "SEL Premium R-Line"]),
      "Atlas Cross Sport": m("SUV", G, FA, [2025, 2024, 2023, 2022], ["SE", "SE w/Technology", "SEL", "SEL Premium R-Line"]),
      "ID.4": m("SUV", EV, RA, Y, ["Standard", "Pro", "Pro S", "AWD Pro", "AWD Pro S"]),
    },
    Volvo: {
      "S60": m("Sedan", PHEV, FA, [2024, 2023, 2022], ["Core", "Plus", "Ultimate"]),
      "S90": m("Sedan", PHEV, AWD, Y, ["Plus", "Ultimate"]),
      "XC40": m("SUV", G, FA, Y, ["Core", "Plus", "Ultimate"]),
      "XC60": m("SUV", PHEV, AWD, Y, ["Core", "Plus", "Ultimate"]),
      "XC90": m("SUV", PHEV, AWD, Y, ["Core", "Plus", "Ultimate"]),
      "C40 Recharge": m("SUV", EV, RA, [2025, 2024, 2023], ["Core", "Plus", "Ultimate"]),
    },
  };

  // Sample dealership inventory for stock-number prefill.
  const INVENTORY = {
    GN2648: { make: "Chevrolet", model: "Equinox", year: 2026, trim: "RS", drivetrain: "AWD", transmission: "Automatic", fuel: "Gasoline", exterior: "Blue", interior: "Black", price: 34995, payment: 519 },
    EV7788: { make: "Chevrolet", model: "Equinox EV", year: 2026, trim: "RS", drivetrain: "AWD", transmission: "Automatic", fuel: "Electric", exterior: "Red", interior: "Black", price: 43995, payment: 649 },
    TR3390: { make: "Chevrolet", model: "Traverse", year: 2026, trim: "Z71", drivetrain: "AWD", transmission: "Automatic", fuel: "Gasoline", exterior: "Gray", interior: "Black", price: 47995, payment: 709 },
    T5521A: { make: "Chevrolet", model: "Silverado 1500", year: 2025, trim: "LT", drivetrain: "4WD", transmission: "Automatic", fuel: "Gasoline", exterior: "Black", interior: "Black", price: 52995, payment: 779 },
    GB1180: { make: "GMC", model: "Sierra 1500", year: 2026, trim: "Denali", drivetrain: "4WD", transmission: "Automatic", fuel: "Diesel", exterior: "White", interior: "Tan", price: 71995, payment: 1055 },
    BK4410: { make: "Buick", model: "Enclave", year: 2026, trim: "Avenir", drivetrain: "AWD", transmission: "Automatic", fuel: "Gasoline", exterior: "Dark Blue", interior: "Tan", price: 56900, payment: 839 },
    CX9032: { make: "Cadillac", model: "XT5", year: 2025, trim: "Premium Luxury", drivetrain: "AWD", transmission: "Automatic", fuel: "Gasoline", exterior: "Silver", interior: "Black", price: 54900, payment: 809 },
    HR4501: { make: "Honda", model: "CR-V", year: 2026, trim: "Sport-L", drivetrain: "AWD", transmission: "Automatic", fuel: "Hybrid", exterior: "Gray", interior: "Black", price: 37450, payment: 555 },
    TY8890: { make: "Toyota", model: "RAV4", year: 2025, trim: "XLE Premium", drivetrain: "AWD", transmission: "Automatic", fuel: "Hybrid", exterior: "White", interior: "Black", price: 36990, payment: 545 },
    FD2205: { make: "Ford", model: "F-150", year: 2026, trim: "Lariat", drivetrain: "4WD", transmission: "Automatic", fuel: "Gasoline", exterior: "Blue", interior: "Tan", price: 61995, payment: 909 },
    TS3010: { make: "Tesla", model: "Model Y", year: 2026, trim: "Long Range", drivetrain: "AWD", transmission: "Automatic", fuel: "Electric", exterior: "White", interior: "Black", price: 47990, payment: 705 },
  };

  const EXTERIOR_COLORS = [
    { name: "Black", hex: "#15171c" }, { name: "White", hex: "#eef0f3" },
    { name: "Silver", hex: "#c3c8ce" }, { name: "Gray", hex: "#6b7480" },
    { name: "Red", hex: "#c1121f" }, { name: "Blue", hex: "#2f6fd0" },
    { name: "Dark Blue", hex: "#1c2f5a" },
  ];
  const INTERIOR_COLORS = [
    { name: "Black", hex: "#1b1d23" }, { name: "Gray", hex: "#6b7480" },
    { name: "Tan", hex: "#b98a5e" }, { name: "Cream", hex: "#e4dbc7" },
  ];
  const FEATURES = [
    "Sunroof / Moonroof", "Leather Seats", "Heated Seats", "Ventilated Seats",
    "Navigation", "Blind Spot Monitor", "Adaptive Cruise", "Tow Package",
    "Third Row Seating", "Apple CarPlay", "Premium Audio", "360° Camera",
  ];

  // Models offered with three rows of seating (gates the Third Row feature).
  const THIRD_ROW = new Set([
    "Traverse", "Tahoe", "Suburban", "Yukon", "Yukon XL", "Acadia", "Enclave",
    "Pilot", "Odyssey", "Sienna", "Highlander", "Grand Highlander", "Sequoia",
    "Palisade", "Telluride", "Carnival", "Atlas", "Wagoneer", "Grand Wagoneer",
    "Expedition", "Durango", "Pathfinder", "Armada", "XT6", "Escalade", "MDX",
    "TX", "LX", "GLS", "Model X", "Ascent", "CX-90", "CX-70", "Model Y",
  ]);
  function availableFeatures(make, model) {
    const data = (DATA[make] && DATA[make][model]) || null;
    if (!data) return FEATURES.slice();
    const body = data.body;
    return FEATURES.filter((f) => {
      if (f === "Tow Package") return body === "Truck" || body === "SUV";
      if (f === "Third Row Seating") return THIRD_ROW.has(model);
      return true;
    });
  }

  // Clean side-profile illustrations per body style. Body fill = exterior colour.
  const BODY = {
    SUV: { body: "M12 78 L12 60 Q12 52 24 50 L54 47 L70 32 Q76 28 86 28 L150 28 Q166 28 174 40 L190 46 Q198 49 198 58 L198 78 Z",
      windows: ["M76 34 L106 34 L106 47 L82 47 Q76 47 76 41 Z", "M110 34 L148 34 Q160 34 166 45 L110 47 Z"], wf: 54, wr: 156 },
    Truck: { body: "M10 78 L10 56 Q10 50 20 49 L92 46 L96 30 Q98 27 106 27 L140 27 Q150 27 152 38 L152 49 L196 54 Q200 55 200 60 L200 78 Z",
      windows: ["M104 32 L138 32 Q146 32 148 44 L104 46 Z"], wf: 52, wr: 158 },
    Sedan: { body: "M10 78 L10 62 Q10 55 22 53 L52 50 L74 36 Q82 32 96 33 L132 35 Q158 38 168 52 L188 57 Q196 59 196 66 L196 78 Z",
      windows: ["M80 38 L112 38 L112 50 L86 50 Q80 50 80 44 Z", "M116 38 L140 39 Q156 42 162 51 L116 50 Z"], wf: 52, wr: 150 },
    Coupe: { body: "M10 78 L10 62 Q10 55 24 53 L54 50 L86 34 Q100 29 118 33 L150 42 Q174 48 186 60 L192 66 L192 78 Z",
      windows: ["M86 40 L120 36 Q136 38 152 48 L154 53 L90 53 Q84 53 84 46 Z"], wf: 54, wr: 152 },
    Hatchback: { body: "M12 78 L12 60 Q12 53 24 51 L50 48 L70 32 Q76 28 88 28 L140 29 Q158 31 166 44 L176 50 Q182 53 182 60 L182 78 Z",
      windows: ["M76 34 L108 34 L108 47 L82 47 Q76 47 76 41 Z", "M112 34 L140 35 Q152 37 158 47 L112 47 Z"], wf: 52, wr: 146 },
    Minivan: { body: "M12 78 L12 58 Q12 50 22 49 L48 46 L66 30 Q72 27 84 27 L156 28 Q174 30 182 46 L194 52 Q198 54 198 60 L198 78 Z",
      windows: ["M72 33 L110 33 L110 46 L78 46 Q72 46 72 40 Z", "M114 33 L152 34 Q166 36 170 46 L114 46 Z"], wf: 54, wr: 152 },
  };
  BODY.Other = BODY.SUV;

  function carMarkup(body, hex) {
    const b = BODY[body] || BODY.SUV;
    const win = "rgba(12,17,28,0.5)";
    const wheel = (cx) =>
      `<circle cx="${cx}" cy="83" r="13" fill="#15181e"/><circle cx="${cx}" cy="83" r="5.5" fill="#525a67"/>`;
    return (
      `<ellipse cx="104" cy="94" rx="92" ry="5" fill="rgba(0,0,0,0.16)"/>` +
      wheel(b.wf) + wheel(b.wr) +
      `<path d="${b.body}" fill="${hex}" stroke="rgba(0,0,0,0.28)" stroke-width="1.2" stroke-linejoin="round"/>` +
      b.windows.map((w) => `<path d="${w}" fill="${win}"/>`).join("") +
      wheel(b.wf) + wheel(b.wr)
    );
  }

  window.VEHICLES = {
    makes() { return Object.keys(DATA).sort(); },
    models(make) { return DATA[make] ? Object.keys(DATA[make]).sort() : []; },
    get(make, model) { return (DATA[make] && DATA[make][model]) || null; },
    years(make, model) { const x = this.get(make, model); return x ? x.years.slice() : []; },
    trims(make, model, year) {
      const x = this.get(make, model);
      if (!x) return [];
      if (x.trimsByYear && x.trimsByYear[year]) return x.trimsByYear[year].slice();
      return x.trims.slice();
    },
    stock(code) { return code ? (INVENTORY[String(code).trim().toUpperCase()] || null) : null; },
    stockExamples() { return Object.keys(INVENTORY); },
    exteriorColors() { return EXTERIOR_COLORS.slice(); },
    interiorColors() { return INTERIOR_COLORS.slice(); },
    colorHex(name, kind) {
      const list = kind === "interior" ? INTERIOR_COLORS : EXTERIOR_COLORS;
      const c = list.find((x) => x.name === name);
      return c ? c.hex : "#6b7480";
    },
    features() { return FEATURES.slice(); },
    availableFeatures(make, model) { return availableFeatures(make, model); },
    carMarkup(body, colorName) {
      const hex = colorName ? this.colorHex(colorName, "exterior") : "#5b6675";
      return carMarkup(body, hex);
    },
  };
})();
