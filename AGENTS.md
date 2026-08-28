# Studio22 — Base44 Dev Environment

## Overview
Vite + React (JSX) frontend that connects to a remote Base44 backend via `@base44/sdk`.
There is no local database or backend — all data comes from the Base44 cloud.

## Running the app
```bash
docker compose -f docker-compose.base44.yml up -d
```
- Web entry point is on host port **3000** (mapped to Vite's 5173 inside the container).
- The container runs `npm install` then `npx vite --host 0.0.0.0 --port 5173` with the repo bind-mounted at `/app`.
- `node_modules` is stored in a named volume so installs persist across restarts.

## Secrets (optional but needed for backend data)
The app needs three `VITE_*` env vars to talk to the Base44 backend:
- `VITE_BASE44_APP_ID`
- `VITE_BASE44_APP_BASE_URL`
- `VITE_PUBLISHABLE_KEY`

Without them the UI still renders but API calls will fail. Placeholders in `.env.base44-defaults` let the app boot; real values are delivered via `/run/base44/app.env` (platform-managed) and override the placeholders.

## Vite config notes
- `vite.config.js` has `logLevel: 'error'`, so Vite does not print its startup banner — the server is running even if logs look empty.
- `server.host: true` + `server.allowedHosts: true` were added so the preview's external hostname is accepted.

## Verification
```bash
curl -sf -H "Host: external-preview.example.com" http://localhost:3000/   # should return the HTML shell
curl -sf -H "Host: external-preview.example.com" http://localhost:3000/src/main.jsx  # should return transformed JS
```

## Existing production compose
`docker-compose.yml` and `Dockerfile` build a production nginx image — do NOT use these for development; they bake the source and don't support live reload.
