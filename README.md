# Autodealer

The all-in-one CRM for new car sales — marketing landing page.

A self-contained landing page (GM "Autodealer" style) served by a tiny Express
app. No build step, deploys cleanly on Railway.

## Structure

```
public/
  index.html    # the landing page markup
  styles.css    # all styling (design tokens + responsive layout)
server.js       # Express static server (+ /healthz for Railway)
package.json    # start script + express dependency
```

## Local development

```bash
npm install
npm start        # http://localhost:3000
```

## Deploy

Railway (Nixpacks) auto-detects Node, runs `npm install` then `npm start`,
and injects `PORT`. Push to `main` to deploy. Health check: `/healthz`.
