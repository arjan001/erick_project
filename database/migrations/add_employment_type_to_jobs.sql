-- Migration: Add employment_type column to jobs table
-- This adds support for fulltime, day_payment, and gig job types

DO $$
BEGIN
    -- Add employment_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'employment_type'
    ) THEN
        ALTER TABLE jobs ADD COLUMN employment_type VARCHAR(50) CHECK (employment_type IN ('fulltime', 'day_payment', 'gig'));
    END IF;
END $$;
