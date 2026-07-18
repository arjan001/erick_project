-- ============================================
-- ADD ATTACHMENT COLUMN TO MESSAGES TABLE
-- ============================================

-- Add attachment column to messages table (JSONB to store file metadata)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment JSONB DEFAULT NULL;

-- Create index for faster queries on messages with attachments
CREATE INDEX IF NOT EXISTS idx_messages_has_attachment ON messages((attachment IS NOT NULL));

-- Add comment to document the column structure
COMMENT ON COLUMN messages.attachment IS 'Stores file attachment metadata: { path, url, fileName, fileSize, fileType }';
