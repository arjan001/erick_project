-- Migration: Add logo_url column to project_owners table
-- Date: October 12, 2026
-- Description: Add logo_url column for client/company logo uploads

-- Add logo_url column to project_owners table
ALTER TABLE project_owners
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN project_owners.logo_url IS 'URL of the client/company logo image';

-- Add index for logo_url (optional, for queries filtering by logo presence)
CREATE INDEX IF NOT EXISTS idx_project_owners_logo_url ON project_owners(logo_url) WHERE logo_url IS NOT NULL;
