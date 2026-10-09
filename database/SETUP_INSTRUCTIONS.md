# Supabase Database Setup Instructions

## Order to Run SQL Files

Run these files in your Supabase SQL Editor in this order:

### 1. Main Schema (REQUIRED)
**File:** `database/supabase_schema.sql`

This creates all the core tables for the SmartGigs Kenya platform:
- Users, Creators, Teams, Clients, Backers
- Projects, Jobs, Applications
- Messaging, Shop, Orders
- Roles, Permissions, Audit Logs
- And all other core tables

### 2. Analytics Tables (OPTIONAL - for tracking)
**File:** `database/migrations/add_analytics_tables.sql`

This adds analytics and tracking tables:
- `user_sessions` - Session tracking
- `page_views` - Page view analytics
- `live_users` - Real-time user tracking
- `analytics_events` - Custom events
- `error_logs` - Error tracking

**Note:** The main schema was updated to remove duplicate `user_sessions` table definition to avoid conflicts with this migration.

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
- `database/migrations/create_roles_permissions_schema.sql` - Roles and permissions (if not in main schema)
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

If you get an error about `user_sessions` table already existing:
- The main schema file has been updated to remove the duplicate definition
- Make sure you're using the latest version of `supabase_schema.sql`
- Run the analytics migration after the main schema

If you get errors about missing tables:
- Make sure you're running the files in the correct order
- Check that the previous file completed successfully before running the next one
