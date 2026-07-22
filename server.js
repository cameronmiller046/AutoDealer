const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.set("trust proxy", 1); // Railway terminates TLS in front of us

/* ============================================================
 *  Auth configuration
 *  Credentials are NEVER stored in plaintext. The password is
 *  kept as a salted scrypt hash. Override in production with the
 *  SUPERUSER_PASSWORD env var (recommended: rotate the value you
 *  committed and set it in Railway).
 * ========================================================== */
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "change-me-in-railway-a-long-random-string-please";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const COOKIE = "ad_session";

function scrypt(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

// First profile: the superuser.
const superuserSalt = "dd68fd227479dd386ee8f271d7fc3768";
const superuserHash = process.env.SUPERUSER_PASSWORD
  ? scrypt(process.env.SUPERUSER_PASSWORD, superuserSalt)
  : "e12d71014563566a61dbd7a75c82b7aeb55d54297649f8cdf63b055d023a642be072c331b7c27fd43eae7eeac9473f81adc8bedf4e3538427a218151408784c5";

const USERS = [
  {
    username: "Cameronmiller046",
    emails: ["cameronmiller046@gmail.com"],
    role: "superuser",
    name: "Cameron Miller",
    salt: superuserSalt,
    hash: superuserHash,
  },
];

// Accept either the username or any registered email (case-insensitive).
function findUser(identifier) {
  if (!identifier) return null;
  const id = String(identifier).trim().toLowerCase();
  return (
    USERS.find(
      (x) =>
        x.username.toLowerCase() === id ||
        (x.emails || []).some((e) => e.toLowerCase() === id)
    ) || null
  );
}

function verifyPassword(user, password) {
  if (!user || typeof password !== "string" || !password) return false;
  const candidate = Buffer.from(scrypt(password, user.salt), "hex");
  const expected = Buffer.from(user.hash, "hex");
  return (
    candidate.length === expected.length &&
    crypto.timingSafeEqual(candidate, expected)
  );
}

/* ---------- session tokens (signed, stateless) ---------- */
function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(body)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  header.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
  });
  return out;
}

function currentUser(req) {
  return verifyToken(parseCookies(req)[COOKIE]);
}

/* ============================================================
 *  Auth routes
 * ========================================================== */
app.post("/api/login", (req, res) => {
  const { username, password, remember } = req.body || {};
  const user = findUser(username);
  if (!user || !verifyPassword(user, password)) {
    return res.status(401).json({ error: "Invalid username or password." });
  }
  // "Remember me" extends the session to 30 days.
  const ttl = remember ? 30 * 24 * 60 * 60 * 1000 : SESSION_TTL_MS;
  const token = signToken({
    u: user.username,
    r: user.role,
    n: user.name,
    exp: Date.now() + ttl,
  });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: req.secure,
    maxAge: ttl,
    path: "/",
  });
  res.json({ ok: true, role: user.role, redirect: "/portal" });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie(COOKIE, { path: "/" });
  res.json({ ok: true });
});

app.get("/api/me", (req, res) => {
  const u = currentUser(req);
  if (!u) return res.status(401).json({ error: "Not signed in." });
  res.json({ username: u.u, role: u.r, name: u.n });
});

// Create a prospect. Auth required; name + phone enforced server-side.
let prospectSeq = 1000;
app.post("/api/prospects", (req, res) => {
  const u = currentUser(req);
  if (!u) return res.status(401).json({ error: "Not signed in." });

  const body = req.body || {};
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const phoneDigits = String(body.phone || "").replace(/\D/g, "");

  if (!firstName || !lastName) {
    return res.status(400).json({ error: "First and last name are required." });
  }
  if (phoneDigits.length < 10) {
    return res.status(400).json({ error: "A valid phone number (at least 10 digits) is required." });
  }
  if (body.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(body.email))) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  // No datastore yet — acknowledge with an id so the UI can confirm.
  const id = ++prospectSeq;
  console.log(`Prospect ${id} created by ${u.u}: ${firstName} ${lastName} / ${phoneDigits}`);
  res.json({ ok: true, id });
});

/* ---------- protected portal pages (not served as static files) ---------- */
function renderView(res, u, file) {
  const html = fs
    .readFileSync(path.join(__dirname, "views", file), "utf8")
    .replaceAll("{{NAME}}", u.n || u.u)
    .replaceAll("{{USERNAME}}", u.u)
    .replaceAll("{{ROLE}}", u.r);
  res.type("html").send(html);
}
app.get("/portal", (req, res) => {
  const u = currentUser(req);
  if (!u) return res.redirect("/login");
  renderView(res, u, "portal.html");
});
app.get("/portal/active", (req, res) => {
  const u = currentUser(req);
  if (!u) return res.redirect("/login");
  renderView(res, u, "active.html");
});
app.get("/portal/inactive", (req, res) => {
  const u = currentUser(req);
  if (!u) return res.redirect("/login");
  renderView(res, u, "inactive.html");
});

// Lightweight health check for Railway
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

/* ---------- static landing + login pages ---------- */
app.use(
  express.static(path.join(__dirname, "public"), {
    extensions: ["html"],
    setHeaders(res, filePath) {
      if (/\.(html|css|js)$/i.test(filePath)) {
        // Always revalidate markup/styles so deploys show up immediately.
        // ETag still yields a cheap 304 when nothing changed.
        res.setHeader("Cache-Control", "no-cache");
      } else {
        // Images and fonts are safe to cache for a while.
        res.setHeader("Cache-Control", "public, max-age=604800");
      }
    },
  })
);

// Fall back to the landing page for any unmatched route
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Autodealer running on port ${PORT}`);
});
