# Eric Rabar — Base44 Dev Environment

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
- VitePWA plugin is conditionally enabled (production only) to avoid service worker interference in dev.
- Service worker registration in `src/main.jsx` is gated behind `import.meta.env.PROD`.

## Critical runtime fix
- `src/lib/supabase.js` — `createClient()` throws `"supabaseUrl is required"` when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing. Added fallback placeholder values so the app boots without credentials. The AuthContext's `getSession()` resolves quickly with null when using the placeholder URL.

## Landing page redesign
- The landing page (`src/pages/Home.jsx`) was redesigned with a dark, cinematic film-industry aesthetic.
- New components in `src/components/landing/`: `Hero.jsx` (parallax), `Stats.jsx`, `FeaturedJobs.jsx`, `Disciplines.jsx`, `HowItWorks.jsx`, `CTA.jsx`.
- `MainLayout.jsx` was updated to show a transparent header with white text over the dark hero on the Home page only (other pages unchanged).
- Color scheme: `#0A0A0A` background, `#C9A962` gold accent, white text — no AI gradients.

## Verification
```bash
curl -sf -H "Host: external-preview.example.com" http://localhost:3000/   # should return the HTML shell
curl -sf -H "Host: external-preview.example.com" http://localhost:3000/src/main.jsx  # should return transformed JS
```

## M-Pesa & Payment Gateway
- `src/services/mpesaService.js` — Daraja API service: OAuth token, STK Push, STK query, callback parser, connection test.
- `src/modules/admin/api/payment.api.js` — CRUD for `payment_settings` Base44 entity (M-Pesa, Mollie, general settings) and `mpesa_transactions` entity.
- `src/modules/admin/pages/AdminPaymentSettingsPage.jsx` — Admin UI that loads settings on mount and persists via the API (no more stub saves).
- `database/migrations/create_payment_tables.sql` + appended to `database/schema.sql` — tables: `payment_settings`, `mpesa_transactions`, `mpesa_c2b_callbacks`, `mollie_payments` with triggers for `updated_at`.

## Existing production compose
`docker-compose.yml` and `Dockerfile` build a production nginx image — do NOT use these for development; they bake the source and don't support live reload.
