-- Migration: Add Account Deletion Columns
-- Date: July 22, 2026
-- Description: Add columns for account deletion request and scheduled deletion to project_owners table

-- Add deletion tracking columns to project_owners table
ALTER TABLE project_owners 
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scheduled_deletion_date TIMESTAMP WITH TIME ZONE;

-- Add index for deletion requests
CREATE INDEX IF NOT EXISTS idx_project_owners_deletion_requested ON project_owners(deletion_requested_at) WHERE deletion_requested_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_project_owners_scheduled_deletion ON project_owners(scheduled_deletion_date) WHERE scheduled_deletion_date IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN project_owners.deletion_requested_at IS 'Timestamp when user requested account deletion';
COMMENT ON COLUMN project_owners.scheduled_deletion_date IS 'Date when account will be permanently deleted (90 days after request)';
