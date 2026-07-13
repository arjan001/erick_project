-- Add contact_email field to teams table
-- This field is needed to match team accounts by email and for messaging

ALTER TABLE teams ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);

-- Add index for faster lookups by contact_email
CREATE INDEX IF NOT EXISTS idx_teams_contact_email ON teams(contact_email);

-- Add other missing fields that the code expects
ALTER TABLE teams ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_logo_url TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]'::jsonb;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS availability VARCHAR(50) DEFAULT 'available';
