-- Add Google Drive integration column to artists table
-- This allows artists to connect their Google Drive folders for portfolio imports

-- Add google_drive_folder_id column to artists table
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS google_drive_folder_id TEXT;

-- Add comment to document the purpose
COMMENT ON COLUMN artists.google_drive_folder_id IS 'Google Drive folder ID for portfolio integration';
