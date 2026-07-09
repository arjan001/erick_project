-- Add suspension and disable columns to user tables
-- Run this in Supabase SQL Editor to fix admin suspend/unsuspend functionality

-- Add suspension and disable columns to artists table
ALTER TABLE artists
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT FALSE;

-- Add suspension and disable columns to project_owners table
ALTER TABLE project_owners
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT FALSE;

-- Add suspension and disable columns to backers table
ALTER TABLE backers
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT FALSE;

-- Add suspension and disable columns to teams table
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT FALSE;
