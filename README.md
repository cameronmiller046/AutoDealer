# Autodealer

Clean slate. A minimal Express server that serves static files from `public/`.

## Structure

```
public/index.html   # placeholder page
server.js           # static server (+ /healthz for Railway)
package.json        # start script + express
```

## Local development

```bash
npm install
npm start        # http://localhost:3000
```

## Deploy

Railway auto-detects Node, runs `npm install` then `npm start`, and injects `PORT`.
Push to `main` to deploy. Health check: `/healthz`.
