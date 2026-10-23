# Required SQL Migrations

Please run these migrations in Supabase SQL Editor in the order listed:

## 1. API Settings Schema
**File:** `database/migrations/create_api_settings_schema.sql`
- Creates api_configuration table
- Creates rate_limiting_settings table
- Creates integrations_settings table
- Creates api_keys table
- Creates api_usage_logs table

## 2. Tickets Tables
**File:** `database/migrations/create_tickets_tables_with_policies.sql`
- Creates support_tickets table
- Creates ticket_responses table
- Sets up RLS policies

## 3. Auth Providers RLS
**File:** `database/migrations/add_auth_providers_rls.sql`
- Fixes auth_providers table RLS policies

## How to Run:
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste each migration file content
4. Click "Run" for each one
