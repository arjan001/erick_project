-- Migration: Add Artist ID and Project ID to Applications Table
-- Created: July 15, 2026
-- Purpose: Add artist_id and project_id columns to applications table for proper foreign key relationships

-- Add artist_id column if it doesn't exist
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES artists(id) ON DELETE CASCADE;

-- Add project_id column if it doesn't exist (for project applications)
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Make artist_email nullable (legacy field, will be deprecated)
ALTER TABLE applications 
ALTER COLUMN artist_email DROP NOT NULL;

-- Make job_id nullable (since applications can be for projects too)
ALTER TABLE applications 
ALTER COLUMN job_id DROP NOT NULL;

-- Add index for artist_id for efficient querying
CREATE INDEX IF NOT EXISTS idx_applications_artist_id ON applications(artist_id);

-- Add index for project_id for efficient querying
CREATE INDEX IF NOT EXISTS idx_applications_project_id ON applications(project_id);

-- Add comment for documentation
COMMENT ON COLUMN applications.artist_id IS 'Foreign key reference to the artists table';
COMMENT ON COLUMN applications.artist_email IS 'Legacy field - use artist_id instead';
COMMENT ON COLUMN applications.project_id IS 'Foreign key reference to the projects table (for project applications)';
COMMENT ON COLUMN applications.job_id IS 'Foreign key reference to the jobs table (for job applications)';
