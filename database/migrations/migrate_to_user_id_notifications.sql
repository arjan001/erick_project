-- Migration script to migrate notifications table from email-based to user_id-based
-- This script handles the transition from the old schema to the new user_id-based schema
-- NOTE: This migration is now OBSOLETE - the schema update is handled in update_notifications_schema.sql
-- This script is kept for backward compatibility but will do nothing if table already has correct schema

-- Check if table already has the correct schema (user_id column)
DO $$
BEGIN
    -- If table already has user_id column, skip this migration
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications'
        AND column_name = 'user_id'
    ) THEN
        RAISE NOTICE 'Notifications table already has user_id column. Skipping migration.';
    ELSE
        -- Table still has old schema, but we can't migrate it here
        -- User should run update_notifications_schema.sql instead
        RAISE NOTICE 'Notifications table has old schema. Please run update_notifications_schema.sql to update it.';
    END IF;
END $$;
