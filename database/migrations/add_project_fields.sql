-- Add missing fields to projects table for SubmitProject form
-- This adds budget_range and other fields needed for the multi-step form

-- Step 1: Add budget_range field
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS budget_range VARCHAR(50);

-- Step 2: Add location fields
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS location_city VARCHAR(255),
ADD COLUMN IF NOT EXISTS location_country VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT FALSE;

-- Step 3: Add timeline fields
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS timeline_start DATE,
ADD COLUMN IF NOT EXISTS timeline_deadline DATE;

-- Step 4: Add project details fields
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS usage TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS visual_direction_clips TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS departments_needed TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Step 5: Add project owner fields
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_owner_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS project_owner_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS project_owner_company VARCHAR(255);

-- Step 6: Add funding fields
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS funding_stage VARCHAR(50),
ADD COLUMN IF NOT EXISTS seeking_partners TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS rights_collaboration_notes TEXT,
ADD COLUMN IF NOT EXISTS open_to_backing BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS backing_types TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS backing_notes TEXT;

-- Step 7: Add image field
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Step 8: Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_projects_budget_range ON projects(budget_range);
CREATE INDEX IF NOT EXISTS idx_projects_location_city ON projects(location_city);
CREATE INDEX IF NOT EXISTS idx_projects_location_country ON projects(location_country);
CREATE INDEX IF NOT EXISTS idx_projects_project_owner_email ON projects(project_owner_email);
