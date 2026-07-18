-- ============================================
-- ADD DELIVERY AND READ STATUS TO MESSAGES
-- ============================================

-- Add delivery status column
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add read status column (already exists as is_read, but we'll ensure it's there)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Add read_at timestamp column
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create indexes for faster queries on delivery/read status
CREATE INDEX IF NOT EXISTS idx_messages_delivered_at ON messages(delivered_at);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);

-- Add comments to document the columns
COMMENT ON COLUMN messages.delivered_at IS 'Timestamp when message was delivered to recipient';
COMMENT ON COLUMN messages.is_read IS 'Whether the message has been read by the recipient';
COMMENT ON COLUMN messages.read_at IS 'Timestamp when the message was read by the recipient';
