-- Migration: Add duration and is_premium columns to jobs table
-- Run this to add the new columns to the existing jobs table

DO $$
BEGIN
    -- Add duration column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'duration'
    ) THEN
        ALTER TABLE jobs ADD COLUMN duration VARCHAR(50) CHECK (duration IN ('short_term', 'long_term', 'ongoing'));
    END IF;

    -- Add is_premium column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'is_premium'
    ) THEN
        ALTER TABLE jobs ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
