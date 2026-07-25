const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static assets from /public
app.use(express.static(path.join(__dirname, "public")));

// Health check for Railway
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// Fallback to the landing page
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Autodealer running on port ${PORT}`);
});
