-- Update invites table to support invite code generation
-- Run this in Supabase SQL Editor

-- Add missing columns to invites table
ALTER TABLE invites
  ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS creator_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS creator_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS uses_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS used_by_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add status 'active' to the status check constraint
-- Note: This may require dropping and recreating the constraint if it exists
-- ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_status_check;
-- ALTER TABLE invites ADD CONSTRAINT invites_status_check CHECK (status IN ('pending', 'accepted', 'expired', 'revoked', 'active'));

-- Create index for code lookups
CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
