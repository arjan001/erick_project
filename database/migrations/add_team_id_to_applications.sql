-- Migration: Add Team ID to Applications Table
-- Created: July 15, 2026
-- Purpose: Add team_id column to applications table for team applications

-- Add team_id column if it doesn't exist
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Add index for team_id for efficient querying
CREATE INDEX IF NOT EXISTS idx_applications_team_id ON applications(team_id);

-- Add constraint to ensure either artist_id or team_id is present, but not both
-- Note: PostgreSQL doesn't support IF NOT EXISTS with ADD CONSTRAINT
-- This will fail if constraint already exists, which is expected
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'application_applicant_check'
        AND conrelid = 'applications'::regclass
    ) THEN
        ALTER TABLE applications
        ADD CONSTRAINT application_applicant_check CHECK (
            (artist_id IS NOT NULL AND team_id IS NULL) OR
            (artist_id IS NULL AND team_id IS NOT NULL)
        );
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN applications.team_id IS 'Foreign key reference to the teams table (for team applications)';
