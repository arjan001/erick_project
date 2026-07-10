-- Add onboarding_completed column to user tables
-- Run this in Supabase SQL Editor to fix profile save errors

-- Add onboarding_completed to artists table
ALTER TABLE artists
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add onboarding_completed to teams table
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add onboarding_completed to backers table
ALTER TABLE backers
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add onboarding_completed to project_owners table
ALTER TABLE project_owners
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
