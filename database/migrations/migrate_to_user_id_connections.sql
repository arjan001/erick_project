-- Migration script to migrate connections table from email-based to user_id-based
-- This script handles the transition from the old schema to the new user_id-based schema
-- NOTE: This migration is now OBSOLETE - the table is recreated with correct schema in add_connections_table.sql
-- This script is kept for backward compatibility but will do nothing if table already has correct schema

-- Check if table already has the correct schema (user_id, connected_artist_id)
DO $$
BEGIN
    -- If table already has user_id and connected_artist_id columns, skip this migration
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'connections'
        AND column_name = 'user_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'connections'
        AND column_name = 'connected_artist_id'
    ) THEN
        RAISE NOTICE 'Connections table already has correct schema (user_id, connected_artist_id). Skipping migration.';
    ELSE
        -- Table still has old schema, but we can't migrate it here
        -- User should run add_connections_table.sql instead which drops and recreates the table
        RAISE NOTICE 'Connections table has old schema. Please run add_connections_table.sql to recreate it.';
    END IF;
END $$;
