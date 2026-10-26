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

## 4. Messages Attachment Column
**File:** `database/migrations/add_attachment_to_messages.sql`
- Adds attachment JSONB column to messages table
- Fixes message sending with attachments

## 5. Remove Messages RLS
**File:** `database/migrations/remove_messages_rls.sql`
- Removes restrictive RLS policies on messages table
- Allows users to send messages without permission errors
- Creates permissive policies for authenticated users

## 6. Add Applied Role to Applications
**File:** `database/migrations/add_applied_role_to_applications.sql`
- Adds applied_role column to job_applications table
- Allows artists to apply to specific roles in production jobs
- Adds index for faster queries on applied_role

## How to Run:
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste each migration file content
4. Click "Run" for each one
