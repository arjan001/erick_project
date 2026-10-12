-- Migration: Add cast_count column to job_roles table
-- Date: October 12, 2026
-- Description: Add cast_count field to specify number of people needed per role

-- Add cast_count column to job_roles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_roles' AND column_name = 'cast_count'
  ) THEN
    ALTER TABLE public.job_roles ADD COLUMN cast_count INTEGER DEFAULT 1;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN job_roles.cast_count IS 'Number of people needed for this role (default: 1)';
