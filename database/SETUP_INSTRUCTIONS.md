# Supabase Database Setup Instructions

## Status: ✅ All SQL Errors Fixed

The schema file has been fully audited and fixed. All duplicate table definitions, missing triggers, and trigger order issues have been resolved.

## Order to Run SQL Files

Run these files in your Supabase SQL Editor in this order:

### 1. Main Schema (REQUIRED)
**File:** `database/supabase_schema.sql`

This creates all the core tables for the SmartGigs Kenya platform:
- Users, Creators, Teams, Clients, Backers
- Projects, Jobs, Applications
- Messaging, Shop, Orders
- Roles, Permissions, Audit Logs
- Cart, Wishlist, Feature Flags
- Popups, Voice Recordings, Featured Content
- Shop Auctions, Auction Bids
- And all other core tables

**Fixed Issues:**
- ✅ Removed duplicate `audit_logs` table
- ✅ Removed duplicate `wishlist` table
- ✅ Removed duplicate `trg_makamesco_transactions_updated_at` trigger
- ✅ Moved all triggers to after their table definitions
- ✅ Added missing triggers for popups, voice_recordings, featured_creatives, featured_brands, shop_auctions

### 2. Analytics Tables (OPTIONAL - for tracking)
**File:** `database/migrations/add_analytics_tables.sql`

This adds analytics and tracking tables:
- `user_sessions` - Session tracking
- `page_views` - Page view analytics
- `live_users` - Real-time user tracking
- `analytics_events` - Custom events
- `error_logs` - Error tracking

**Note:** The main schema does NOT include `user_sessions` to avoid conflicts with this migration.

### 3. Storage Buckets (REQUIRED for file uploads)
**File:** `database/legacy_sql/STORAGE_BUCKETS.sql`

This creates Supabase Storage buckets for:
- Artist, Team, Client, Backer profile images
- Portfolio clips and thumbnails
- Job images and attachments
- Shop images
- CMS assets
- And other file uploads

### 4. Additional Migrations (As Needed)

Run these if you need specific features:

- `database/migrations/add_makamesco_integration.sql` - M-Pesa payment integration
- `database/migrations/create_payment_tables.sql` - Payment tables
- `database/migrations/seed_team_test_account.sql` - Test team account

## Quick Start

For minimal setup to get the app running:

1. Run `database/supabase_schema.sql`
2. Run `database/legacy_sql/STORAGE_BUCKETS.sql`

For full setup with analytics:

1. Run `database/supabase_schema.sql`
2. Run `database/migrations/add_analytics_tables.sql`
3. Run `database/legacy_sql/STORAGE_BUCKETS.sql`

## Troubleshooting

If you get any SQL errors:
- Make sure you're using the latest version of `supabase_schema.sql` (commit af4c567)
- Check that the previous file completed successfully before running the next one
- All known duplicate and dependency issues have been fixed
