-- Studio22 — Add missing columns to the projects table
-- Run this in your Supabase project's SQL editor.
-- Safe to re-run (uses IF NOT EXISTS).

-- Add columns that the SubmitProject form collects but the table doesn't have yet.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS usage TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS visual_direction_clips JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS departments_needed TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS funding_stage VARCHAR(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seeking_partners TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS rights_collaboration_notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS backing_types TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS backing_notes TEXT;

-- Also add the 'roles' column to portfolio_clips (multi-select roles as tags)
ALTER TABLE portfolio_clips ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Also add 'roles' column to artists (multi-select roles as tags)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Also add 'invite_code' and 'referred_by' and 'onboarding_completed' to artists
ALTER TABLE artists ADD COLUMN IF NOT EXISTS invite_code VARCHAR(50);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS referred_by VARCHAR(50);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Also add 'invite_code' and 'referred_by' to teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS invite_code VARCHAR(50);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS referred_by VARCHAR(50);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Also add 'invite_code' and 'referred_by' to backers
ALTER TABLE backers ADD COLUMN IF NOT EXISTS invite_code VARCHAR(50);
ALTER TABLE backers ADD COLUMN IF NOT EXISTS referred_by VARCHAR(50);

-- Also add 'invite_code' and 'referred_by' to project_owners
ALTER TABLE project_owners ADD COLUMN IF NOT EXISTS invite_code VARCHAR(50);
ALTER TABLE project_owners ADD COLUMN IF NOT EXISTS referred_by VARCHAR(50);

-- Also add 'referred_by' to subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS referred_by VARCHAR(50);

-- Also add 'invitation_only' to subscription_packages
ALTER TABLE subscription_packages ADD COLUMN IF NOT EXISTS invitation_only BOOLEAN DEFAULT FALSE;