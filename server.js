const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the static landing page from /public
app.use(
  express.static(path.join(__dirname, "public"), {
    extensions: ["html"],
    maxAge: "1h",
  })
);

// Lightweight health check for Railway
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// Fall back to the landing page for any unmatched route
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Autodealer landing page running on port ${PORT}`);
});
