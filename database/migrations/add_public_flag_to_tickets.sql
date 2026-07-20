-- Add is_public flag to support_tickets table
-- This allows tickets to be visible to all users for community support

ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Add index for filtering public tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_is_public ON support_tickets(is_public);

-- Update existing tickets to be public by default
UPDATE support_tickets 
SET is_public = TRUE 
WHERE is_public IS NULL;
