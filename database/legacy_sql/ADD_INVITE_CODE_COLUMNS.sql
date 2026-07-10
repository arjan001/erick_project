-- Add invite_code and referred_by columns to user tables
-- Run this in Supabase SQL Editor to fix invite code generation for existing users

-- Add invite_code and referred_by to artists table
ALTER TABLE artists
  ADD COLUMN IF NOT EXISTS invite_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS referred_by VARCHAR(50);

-- Add invite_code and referred_by to teams table  
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS invite_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS referred_by VARCHAR(50);

-- Add invite_code and referred_by to backers table
ALTER TABLE backers
  ADD COLUMN IF NOT EXISTS invite_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS referred_by VARCHAR(50);

-- Add invite_code and referred_by to project_owners table
ALTER TABLE project_owners
  ADD COLUMN IF NOT EXISTS invite_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS referred_by VARCHAR(50);

-- Create indexes for invite codes for faster lookups
CREATE INDEX IF NOT EXISTS idx_artists_invite_code ON artists(invite_code);
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON teams(invite_code);
CREATE INDEX IF NOT EXISTS idx_backers_invite_code ON backers(invite_code);
CREATE INDEX IF NOT EXISTS idx_project_owners_invite_code ON project_owners(invite_code);
