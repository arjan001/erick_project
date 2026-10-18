-- Migration: Create Team Invitations Table
-- Date: October 19, 2026
-- Description: Create table for team member invitations with token-based acceptance

CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(100) DEFAULT 'member',
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  profile_image TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_expires_at ON team_invitations(expires_at);

-- Add comments for documentation
COMMENT ON TABLE team_invitations IS 'Team member invitations with token-based acceptance flow';
COMMENT ON COLUMN team_invitations.token IS 'Unique token for invitation acceptance';
COMMENT ON COLUMN team_invitations.status IS 'Invitation status: pending, accepted, revoked, expired';
COMMENT ON COLUMN team_invitations.expires_at IS 'Token expiration date (7 days from creation)';
COMMENT ON COLUMN team_invitations.roles IS 'Pre-assigned roles for the team member';
COMMENT ON COLUMN team_invitations.skills IS 'Pre-assigned skills for the team member';
COMMENT ON COLUMN team_invitations.profile_image IS 'Profile image URL from invitation metadata';
