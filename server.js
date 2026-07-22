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
    role: "superuser",
    name: "Cameron Miller",
    salt: superuserSalt,
    hash: superuserHash,
  },
];

function findUser(username) {
  if (!username) return null;
  const u = String(username).trim().toLowerCase();
  return USERS.find((x) => x.username.toLowerCase() === u) || null;
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
  const { username, password } = req.body || {};
  const user = findUser(username);
  if (!user || !verifyPassword(user, password)) {
    return res.status(401).json({ error: "Invalid username or password." });
  }
  const token = signToken({
    u: user.username,
    r: user.role,
    n: user.name,
    exp: Date.now() + SESSION_TTL_MS,
  });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: req.secure,
    maxAge: SESSION_TTL_MS,
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

/* ---------- protected portal (not served as a static file) ---------- */
app.get("/portal", (req, res) => {
  const u = currentUser(req);
  if (!u) return res.redirect("/login");
  const html = fs
    .readFileSync(path.join(__dirname, "views", "portal.html"), "utf8")
    .replaceAll("{{NAME}}", u.n || u.u)
    .replaceAll("{{USERNAME}}", u.u)
    .replaceAll("{{ROLE}}", u.r);
  res.type("html").send(html);
});

// Lightweight health check for Railway
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

/* ---------- static landing + login pages ---------- */
app.use(
  express.static(path.join(__dirname, "public"), {
    extensions: ["html"],
    maxAge: "1h",
  })
);

// Fall back to the landing page for any unmatched route
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Autodealer running on port ${PORT}`);
});
