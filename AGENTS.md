# SmartGigs Kenya — Supabase Dev Environment

## Overview
Vite + React (JSX) frontend that connects to Supabase backend for database, authentication, and storage.
All data operations use Supabase entities defined in `src/lib/supabaseEntities.js`.

## Running the app
```bash
npm install
npm run dev
```
- Web entry point is on port **5173** (Vite default).
- The app uses `npx vite --host 0.0.0.0 --port 5173` for development.
- Hot module replacement is enabled for live reload.

## Secrets (REQUIRED for backend data)
The app needs these `VITE_*` env vars to talk to Supabase:
- `VITE_SUPABASE_URL` — Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Your Supabase anon/public key

Optional payment gateway env vars:
- `VITE_MAKAMESCO_PUBLIC_KEY` — Makamesco/Nexus Pay public key
- `VITE_MAKAMESCO_SECRET_KEY` — Makamesco/Nexus Pay secret key (use backend endpoint in production)

Email service env vars (choose one):
- `VITE_RESEND_API_KEY` — Resend API key (recommended)
- SMTP credentials for custom email server

See `.env.example` for complete configuration.

## Vite config notes
- `vite.config.js` has `logLevel: 'error'`, so Vite does not print its startup banner — the server is running even if logs look empty.
- `server.host: true` + `server.allowedHosts: true` were added so the preview's external hostname is accepted.
- VitePWA plugin is conditionally enabled (production only) to avoid service worker interference in dev.
- Service worker registration in `src/main.jsx` is gated behind `import.meta.env.PROD`.

## Supabase configuration
- `src/lib/supabase.js` — Supabase client initialization with fallback placeholder values so the app boots without credentials.
- `src/lib/supabaseEntities.js` — Entity wrappers for all database tables (Artist, Team, Client, Backer, Job, Application, Message, etc.)
- `src/lib/AuthContext.jsx` — Supabase Auth context for authentication state management.
- `database/supabase_schema.sql` — Complete database schema with all tables and RLS policies.
- `database/legacy_sql/STORAGE_BUCKETS.sql` — Storage buckets configuration for file uploads.

## Landing page redesign
- The landing page (`src/pages/Home.jsx`) was redesigned with a dark, cinematic film-industry aesthetic.
- New components in `src/components/landing/`: `Hero.jsx` (parallax), `Stats.jsx`, `FeaturedJobs.jsx`, `Disciplines.jsx`, `HowItWorks.jsx`, `CTA.jsx`.
- `MainLayout.jsx` was updated to show a transparent header with white text over the dark hero on the Home page only (other pages unchanged).
- Color scheme: `#0A0A0A` background, `#C9A962` gold accent, white text — no AI gradients.

## Verification
```bash
npm run dev
# Server starts on http://localhost:5173
```

## M-Pesa & Payment Gateway
- `src/services/makamescoService.js` — Makamesco/Nexus Pay API service: STK Push, B2C disbursements, status checking.
- `src/modules/admin/api/payment.api.js` — CRUD for `payment_settings` Supabase entity (Makamesco, card payments, general settings) and `makamesco_transactions` entity.
- `src/modules/admin/pages/AdminPaymentSettingsPage.jsx` — Admin UI that loads settings on mount and persists via the API.
- `database/migrations/add_makamesco_integration.sql` — tables: `makamesco_transactions` with triggers for `updated_at`.

## Email Service
- `src/services/emailService.js` — Email service supporting both Resend API and SMTP.
- `src/modules/admin/pages/AdminEmailSettingsPage.jsx` — Admin UI for email configuration.
- Email settings stored in `email_settings` Supabase table.
- Templates include: team invitations, password reset, OTP, order confirmations.

## Storage Buckets
The following Supabase Storage buckets are configured:
- `artist-profiles` — Artist profile photos
- `team-profiles` — Team profile images
- `client-profiles` — Client profile images
- `backer-profiles` — Backer profile images
- `portfolio-clips` — Portfolio video clips and thumbnails
- `job-images` — Job posting images
- `job-attachments` — Job attachment files
- `shop-images` — Product images
- `cms-assets` — CMS-managed assets
- `featured-content` — Featured content images
- `category-images` — Category images
- `message-attachments` — Message attachments
- `general-uploads` — General file uploads

## Authentication
- Primary: Supabase Auth
- Backup: Clerk (optional, configured in AdminAuthProvidersPage, disabled by default)
- Test credentials preserved for testing purposes

## Deployment
See `DEPLOYMENT.md` for deployment guides:
- cPanel deployment with Node.js app
- VPS deployment with Nginx, PM2, and SSL
- Environment setup and configuration
