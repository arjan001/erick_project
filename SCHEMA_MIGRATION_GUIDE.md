# Schema Migration Guide - SmartGigs Kenya

## Overview
This document describes the schema migration from email-based columns to user_id-based columns to fix critical schema errors in the SmartGigs Kenya project.

## Changes Made

### 1. Schema Validator Updates (`src/lib/schemaValidator.js`)

#### Updated Table Definitions to Match DATABASE_SCHEMA.sql:
- **clients**: Removed deprecated columns (`email`, `full_name`, `referred_by`), now uses `user_id` foreign key
- **connections**: Changed from email-based (`requester_email`, `recipient_email`) to user_id-based (`requester_id`, `receiver_id`)
- **notifications**: Changed from `recipient_email` to `user_id`, updated column names (`content` instead of `message`, `is_read` instead of `read`, `link_url` instead of `link`)
- **messages**: Now uses `conversation_id` and `sender_id` instead of `sender_email` and `recipient_email`
- **conversations**: Added new table definition with `participant_1` and `participant_2` columns

#### Added Missing Tables:
- **partners**: Partner organization table
- **invites**: Invite/referral code tracking table
- **artists**: Artist profile table (from DATABASE_SCHEMA.sql)
- **teams**: Team profile table (from DATABASE_SCHEMA.sql)
- **backers**: Backer profile table (from DATABASE_SCHEMA.sql)
- **jobs**: Jobs table (from DATABASE_SCHEMA.sql)
- **applications**: Applications table (from DATABASE_SCHEMA.sql)
- **portfolio_clips**: Portfolio clips table (from DATABASE_SCHEMA.sql)
- **projects**: Projects table (from DATABASE_SCHEMA.sql)

#### Updated Deprecated Columns List:
- Added `clients.email`, `clients.full_name`, `clients.referred_by`
- Added `connections.requester_email`, `connections.recipient_email`, `connections.user_email`, `connections.connected_artist_id`
- Updated `notifications.recipient_email` to `notifications.recipient_id` and `notifications.user_id`

### 2. Migration Scripts Created

#### `database/migrations/migrate_to_user_id_connections.sql`
- Adds `requester_id` and `receiver_id` columns to connections table
- Migrates data from email columns to user_id columns
- Creates indexes for new columns
- Adds constraints after successful migration
- Includes instructions for dropping old columns (commented out for safety)

#### `database/migrations/migrate_to_user_id_notifications.sql`
- Adds `user_id` column to notifications table
- Migrates data from `recipient_email` to `user_id`
- Creates index for new column
- Includes instructions for dropping old column (commented out for safety)

### 3. Updated Migration Files

#### `database/migrations/add_connections_table.sql`
- Changed from email-based schema to user_id-based schema
- New structure: `requester_id`, `receiver_id`, `status`, `created_at`, `updated_at`
- Added foreign key constraints to `users` table
- Added unique constraint and no-self-connection constraint
- Removed deprecated columns: `requester_email`, `recipient_email`, `requester_type`, `recipient_type`, `connection_type`, `connected_artist_id`, `message`

#### `database/migrations/update_notifications_schema.sql`
- Changed from `recipient_email` to `user_id`
- Updated column names: `content` (was `message`), `is_read` (was `read`), `link_url` (was `link`)
- Added logic to drop deprecated `recipient_email` column after migration
- Updated indexes to use `user_id` instead of `recipient_email`

### 4. Code Updates

#### `src/shared/services/notificationService.js`
- Changed `recipient_email` to `user_id`
- Changed `message` to `content`
- Changed `link` to `link_url`
- Changed `read` to `is_read`

#### `src/modules/network/pages/NetworkPage.jsx`
- Updated connection creation to use `requester_id` and `receiver_id` instead of email columns
- Removed `requester_type` and `recipient_type` from connection creation
- Updated notification creation to use `user_id` instead of `recipient_id`
- Updated notification column names: `content`, `link_url`, `is_read`
- Fixed sent/pending request display to use `receiver_id` and `requester_id` instead of email
- Removed `email` field from `toDisplay` function (no longer needed)
- Updated `getMutualConnections` to use user IDs instead of emails

#### `src/components/DashboardTopbar.jsx`
- Updated message fetching to use user_id (temporarily disabled until conversation-based refactor)
- Updated notification fetching to use `user_id` instead of `recipient_email`
- Updated profile fetching to use `user_id` instead of email
- Changed notification read check from `n.read` to `n.is_read`
- Disabled real-time message subscription until conversation-based refactor is complete

#### `src/lib/supabaseEntities.js`
- Added `Conversation` entity with custom methods:
  - `getForUser`: Get conversations for a user with messages
  - `getOrCreate`: Get or create conversation between two users

## Migration Steps

### Step 1: Run Migration Scripts in Order

Run these SQL scripts in your Supabase SQL editor in this exact order:

1. **Recreate connections table with correct schema:**
   ```sql
   -- database/migrations/add_connections_table.sql
   -- This drops the old table and recreates it with user_id, connected_artist_id columns
   ```

2. **Update notifications table schema:**
   ```sql
   -- database/migrations/update_notifications_schema.sql
   -- This drops RLS policies, adds user_id column, drops recipient_email, recreates policies
   ```

3. **Sync auth.users to public.users:**
   ```sql
   -- database/migrations/migrate_legacy_data_to_user_id.sql
   -- This ensures all auth users have corresponding public.users records
   ```

**Note:** The `migrate_to_user_id_connections.sql` and `migrate_to_user_id_notifications.sql` files are now obsolete and will skip automatically if the tables already have the correct schema.

### Step 2: Verify Migration

After running the scripts, verify the changes:

```sql
-- Check connections table has correct schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'connections'
ORDER BY ordinal_position;
-- Should show: id, user_id, connected_artist_id, connection_type, status, metadata, created_at, updated_at

-- Check notifications table has correct schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
-- Should show: id, user_id, type, content, is_read, link_url, metadata, created_at, updated_at
-- Should NOT show: recipient_email

-- Check all auth users have public.users records
SELECT COUNT(*) FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;
-- Should return 0 if migration was successful
```

### Step 3: Test the Application

1. **Restart the development server:**
   ```bash
   npm run dev
   ```

2. **Test key functionality:**
   - Network page: Connection requests should work
   - Notifications: Should appear correctly
   - Dashboard: Should load without errors

## Known Issues & TODOs

### High Priority
1. **Messages System Refactor Required**
   - The messages system still uses the old email-based schema
   - Need to refactor `src/modules/messages/pages/MessagesPage.jsx` to use the conversation-based schema
   - The new schema uses `conversations` table with `participant_1` and `participant_2`
   - Messages are linked to conversations via `conversation_id`

2. **Real-time Messaging Service**
   - Disabled in DashboardTopbar until conversation-based refactor is complete
   - Need to update `realtimeMessagingService` to work with user_ids

### Medium Priority
3. **Other Files Using Deprecated Columns**
   - Several other files still reference deprecated columns (see grep results)
   - These should be updated gradually as they are used:
     - `src/modules/artist/pages/ArtistProfilePage.jsx`
     - `src/modules/jobs/pages/JobsPage.jsx`
     - `src/components/artist/dashboard/RemindersCard.jsx`
     - `src/components/artist/dashboard/RecentConversations.jsx`
     - Various sidebar components

4. **RLS Policies**
   - Row Level Security policies may need updates to work with user_id columns
   - Check and update policies in `database/migrations/fix_user_tables_rls.sql`

## Schema Validation

The schema validator (`src/lib/schemaValidator.js`) now correctly validates against the actual database schema. It will warn you if you try to use deprecated columns.

## Rollback Plan

If you need to rollback:

1. **Restore old columns:**
   ```sql
   ALTER TABLE connections ADD COLUMN requester_email TEXT;
   ALTER TABLE connections ADD COLUMN recipient_email TEXT;
   ALTER TABLE notifications ADD COLUMN recipient_email TEXT;
   ```

2. **Migrate data back:**
   ```sql
   UPDATE connections SET requester_email = u.email FROM users u WHERE connections.requester_id = u.id;
   UPDATE connections SET recipient_email = u.email FROM users u WHERE connections.receiver_id = u.id;
   UPDATE notifications SET recipient_email = u.email FROM users u WHERE notifications.user_id = u.id;
   ```

3. **Restore old code:**
   - Revert changes to the files listed above

## Support

If you encounter issues:
1. Check the browser console for schema validation warnings
2. Verify the migration scripts ran successfully
3. Check Supabase logs for SQL errors
4. Ensure all foreign key constraints are satisfied
