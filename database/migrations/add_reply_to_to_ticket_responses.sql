-- Add reply_to column to ticket_responses table
-- This allows users to reply to specific comments in the ticketing system

ALTER TABLE ticket_responses 
ADD COLUMN IF NOT EXISTS reply_to VARCHAR(255);

-- Add comment to document the column
COMMENT ON COLUMN ticket_responses.reply_to IS 'The name of the user this response is replying to (for threaded conversations)';
