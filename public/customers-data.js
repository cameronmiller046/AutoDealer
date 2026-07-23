/* ===================================================================
   Autodealer — shared customer dataset for the Customers pages.
   VIP rule: 3+ vehicles purchased OR $100k+ total spend.
   =================================================================== */
(function () {
  // { name, phone, email, purchases, spent, lastDate, lastType, salesperson, status, recent, color }
  const LIST = [
    ["John Smith", "(404) 555-0123", "jsmith@email.com", 4, 145680, "07/21/2026", "Phone Call", "Cameron Miller", "active", 1, "#3b82f6"],
    ["Ashley Martinez", "(770) 555-0198", "amartinez@email.com", 5, 28450, "07/20/2026", "Text Message", "Sarah Johnson", "active", 1, "#a855f7"],
    ["Robert Williams", "(678) 555-0145", "rwilliams@email.com", 3, 3210, "07/18/2026", "Service Visit", "Mike Davis", "active", 0, "#22c55e"],
    ["Kimberly Lee", "(404) 555-0167", "klee@email.com", 3, 128400, "07/15/2026", "Email", "Cameron Miller", "active", 1, "#f59e0b"],
    ["David Thompson", "(770) 555-0178", "dthompson@email.com", 4, 19560, "07/14/2026", "Phone Call", "Jessica Brown", "active", 0, "#14b8a6"],
    ["Sarah Chen", "(404) 555-0112", "schen@email.com", 6, 134120, "07/12/2026", "Text Message", "Sarah Johnson", "active", 0, "#ec4899"],
    ["Michael Johnson", "(678) 555-0156", "mjohnson@email.com", 1, 890, "07/10/2026", "Service Visit", "Mike Davis", "active", 0, "#2563eb"],
    ["Lisa Brown", "(770) 555-0189", "lbrown@email.com", 3, 11250, "07/08/2026", "Email", "Jessica Brown", "active", 0, "#eab308"],
    ["Marcus Webb", "(404) 555-0231", "mwebb@email.com", 5, 210300, "07/19/2026", "Phone Call", "Cameron Miller", "active", 1, "#6366f1"],
    ["Priya Nair", "(678) 555-0244", "pnair@email.com", 2, 102900, "07/17/2026", "Email", "Sarah Johnson", "active", 1, "#f43f5e"],
    ["Daniel Cho", "(770) 555-0290", "dcho@email.com", 6, 189750, "07/16/2026", "Text Message", "Mike Davis", "active", 1, "#06b6d4"],
    ["Olivia Grant", "(404) 555-0318", "ogrant@email.com", 3, 134600, "07/13/2026", "Phone Call", "Jessica Brown", "active", 0, "#8b5cf6"],
    ["Ethan Ross", "(678) 555-0361", "eross@email.com", 2, 54200, "05/28/2026", "Email", "Cameron Miller", "inactive", 0, "#64748b"],
    ["Grace Kim", "(770) 555-0402", "gkim@email.com", 1, 32900, "05/20/2026", "Service Visit", "Sarah Johnson", "inactive", 0, "#0ea5e9"],
    ["Noah Patel", "(404) 555-0455", "npatel@email.com", 2, 118500, "07/22/2026", "Phone Call", "Mike Davis", "active", 1, "#f97316"],
    ["Emma Davis", "(678) 555-0487", "edavis@email.com", 4, 76300, "06/02/2026", "Text Message", "Jessica Brown", "inactive", 0, "#d946ef"],
    ["Liam Foster", "(770) 555-0510", "lfoster@email.com", 3, 99900, "07/11/2026", "Email", "Cameron Miller", "active", 0, "#10b981"],
    ["Sofia Reyes", "(404) 555-0548", "sreyes@email.com", 5, 165400, "07/09/2026", "Phone Call", "Sarah Johnson", "active", 0, "#3b82f6"],
    ["Jack Turner", "(678) 555-0573", "jturner@email.com", 1, 8700, "05/15/2026", "Service Visit", "Mike Davis", "inactive", 0, "#eab308"],
    ["Ava Bennett", "(770) 555-0606", "abennett@email.com", 2, 121000, "07/23/2026", "Email", "Jessica Brown", "active", 1, "#8b5cf6"],
    ["Mason Clark", "(404) 555-0641", "mclark@email.com", 3, 44500, "07/06/2026", "Text Message", "Cameron Miller", "active", 0, "#06b6d4"],
    ["Isabella Cruz", "(678) 555-0679", "icruz@email.com", 4, 158900, "07/24/2026", "Phone Call", "Sarah Johnson", "active", 1, "#f43f5e"],
  ].map((r) => ({
    name: r[0], phone: r[1], email: r[2], purchases: r[3], spent: r[4],
    lastDate: r[5], lastType: r[6], salesperson: r[7], status: r[8], recent: !!r[9], color: r[10],
  }));

  const isVip = (c) => c.purchases >= 3 || c.spent >= 100000;

  window.CUSTOMERS = {
    all: () => LIST.slice(),
    recent: () => LIST.filter((c) => c.recent),
    vip: () => LIST.filter(isVip),
    inactive: () => LIST.filter((c) => c.status === "inactive"),
    isVip,
    money: (n) => "$" + Number(n).toLocaleString("en-US"),
  };
})();
