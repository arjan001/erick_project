-- Add is_featured field to projects table
-- This allows admin to manually feature projects on landing page
-- Popular and New tags are computed dynamically based on budget and creation date

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'is_featured') THEN
        ALTER TABLE projects ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add index for featured projects query performance
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);

-- Add comment for documentation
COMMENT ON COLUMN projects.is_featured IS 'Manually set by admin to feature projects on landing page';
