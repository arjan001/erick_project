-- ============================================
-- ADD DELETE AND STAR COLUMNS TO MESSAGES
-- ============================================

-- Add deleted_for_everyone column
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS deleted_for_everyone BOOLEAN DEFAULT FALSE;

-- Add deleted_for array column (stores emails of users who deleted the message)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS deleted_for TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add is_starred column
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;

-- Add starred_by array column (stores emails of users who starred the message)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS starred_by TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_deleted_for_everyone ON messages(deleted_for_everyone);
CREATE INDEX IF NOT EXISTS idx_messages_is_starred ON messages(is_starred);

-- Add comments to document the columns
COMMENT ON COLUMN messages.deleted_for_everyone IS 'Whether the message was deleted for all participants';
COMMENT ON COLUMN messages.deleted_for IS 'Array of user emails who have deleted this message';
COMMENT ON COLUMN messages.is_starred IS 'Whether the message is starred by the current user';
COMMENT ON COLUMN messages.starred_by IS 'Array of user emails who have starred this message';
