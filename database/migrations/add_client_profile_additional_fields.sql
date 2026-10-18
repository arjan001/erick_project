-- Migration: Add Client Profile Additional Fields
-- Date: October 19, 2026
-- Description: Add year of film/directing experience and extra important files to clients table

-- Add year of film experience column
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS years_in_film INTEGER;

-- Add year of directing experience column
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS years_in_directing INTEGER;

-- Add extra important files column (JSONB to store file URLs and metadata)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS important_files JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN clients.years_in_film IS 'Number of years in film industry';
COMMENT ON COLUMN clients.years_in_directing IS 'Number of years in directing';
COMMENT ON COLUMN clients.important_files IS 'JSON array of important file URLs and metadata';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_years_in_film ON clients(years_in_film) WHERE years_in_film IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_years_in_directing ON clients(years_in_directing) WHERE years_in_directing IS NOT NULL;
