-- Add project suspension, pause, and deletion functionality with reason tracking
-- This allows admins to suspend/pause/delete projects and provide reasons for clients

-- Step 1: Add status field to projects table if not exists
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Step 2: Add suspension/pause reason field
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Step 3: Add admin notes for required changes
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Step 4: Add suspension timestamp
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;

-- Step 5: Add who suspended the project (admin user ID)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES users(id);

-- Step 6: Add deletion timestamp (soft delete)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Step 7: Add who deleted the project (admin user ID)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);

-- Step 8: Add deletion reason
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Step 9: Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Step 10: Create index for suspended projects
CREATE INDEX IF NOT EXISTS idx_projects_suspended_at ON projects(suspended_at) WHERE suspended_at IS NOT NULL;

-- Step 11: Create index for deleted projects (soft delete)
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at) WHERE deleted_at IS NOT NULL;

-- Step 12: Update existing projects to have valid status before adding constraint
UPDATE projects 
SET status = CASE 
  WHEN status IN ('submitted', 'verified', 'in_progress', 'rejected') THEN status
  WHEN status IS NULL THEN 'active'
  ELSE 'active'
END
WHERE status NOT IN ('active', 'suspended', 'paused', 'deleted') OR status IS NULL;

-- Step 13: Add check constraint for valid status values
ALTER TABLE projects 
ADD CONSTRAINT chk_projects_status 
CHECK (status IN ('active', 'submitted', 'verified', 'in_progress', 'rejected', 'suspended', 'paused', 'deleted'));

-- Step 14: Create a function to automatically set deleted_at and status when soft delete
-- DROP TRIGGER IF EXISTS trigger_soft_delete_project ON projects;
-- CREATE TRIGGER trigger_soft_delete_project
--     BEFORE UPDATE ON projects
--     FOR EACH ROW
--     WHEN (NEW.status = 'deleted' AND OLD.status != 'deleted')
--     EXECUTE FUNCTION soft_delete_project();

-- Step 15: Add comment to document the new fields
COMMENT ON COLUMN projects.status IS 'Project status: active, suspended, paused, or deleted';
COMMENT ON COLUMN projects.suspension_reason IS 'Reason provided by admin for suspending/pausing the project';
COMMENT ON COLUMN projects.admin_notes IS 'Admin notes about required changes or issues with the project';
COMMENT ON COLUMN projects.suspended_at IS 'Timestamp when project was suspended/paused';
COMMENT ON COLUMN projects.suspended_by IS 'ID of admin user who suspended/paused the project';
COMMENT ON COLUMN projects.deleted_at IS 'Timestamp when project was soft deleted';
COMMENT ON COLUMN projects.deleted_by IS 'ID of admin user who deleted the project';
COMMENT ON COLUMN projects.deletion_reason IS 'Reason provided by admin for deleting the project';

-- Step 16: Update existing projects to have 'active' status if null
UPDATE projects 
SET status = 'active' 
WHERE status IS NULL;
