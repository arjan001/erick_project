-- Migration: Add Client Profile Additional Fields
-- Date: October 19, 2026
-- Description: Add year of film/directing experience and extra important files to project_owners table

-- Add year of film experience column
ALTER TABLE project_owners
ADD COLUMN IF NOT EXISTS years_in_film INTEGER;

-- Add year of directing experience column
ALTER TABLE project_owners
ADD COLUMN IF NOT EXISTS years_in_directing INTEGER;

-- Add extra important files column (JSONB to store file URLs and metadata)
ALTER TABLE project_owners
ADD COLUMN IF NOT EXISTS important_files JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN project_owners.years_in_film IS 'Number of years in film industry';
COMMENT ON COLUMN project_owners.years_in_directing IS 'Number of years in directing';
COMMENT ON COLUMN project_owners.important_files IS 'JSON array of important file URLs and metadata';

-- Ensure logo_url column exists (for profile image upload)
ALTER TABLE project_owners
ADD COLUMN IF NOT EXISTS logo_url TEXT;

COMMENT ON COLUMN project_owners.logo_url IS 'URL of the client/company logo image';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_owners_years_in_film ON project_owners(years_in_film) WHERE years_in_film IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_project_owners_years_in_directing ON project_owners(years_in_directing) WHERE years_in_directing IS NOT NULL;
