-- Migration: Update Client Post Project Schema
-- Date: July 22, 2026
-- Description: Add roles, skills, team type, and payment fields to projects and jobs tables

-- ============================================
-- UPDATE PROJECTS TABLE
-- ============================================

-- Add roles_needed array
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS roles_needed TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add skills_needed array
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS skills_needed TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add team_type with constraint
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS team_type VARCHAR(50) CHECK (team_type IN ('team', 'solo', 'flexible'));

-- Add payment_type with constraint
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50) CHECK (payment_type IN ('hourly', 'daily', 'fixed', 'negotiable'));

-- Add hourly_rate
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2);

-- Add daily_rate
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10, 2);

-- Add fixed_budget (renamed from budget_custom for clarity)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS fixed_budget DECIMAL(10, 2);

-- ============================================
-- UPDATE JOBS TABLE
-- ============================================

-- Update employment_type constraint to include more options
ALTER TABLE jobs 
DROP CONSTRAINT IF EXISTS jobs_employment_type_check;

ALTER TABLE jobs 
ADD CONSTRAINT jobs_employment_type_check 
CHECK (employment_type IN ('fulltime', 'parttime', 'contract', 'freelance', 'day_payment', 'gig'));

-- Add payment_type with constraint
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50) CHECK (payment_type IN ('hourly', 'daily', 'fixed', 'negotiable'));

-- Add hourly_rate
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2);

-- Add daily_rate
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10, 2);

-- Add fixed_budget
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS fixed_budget DECIMAL(10, 2);

-- Add budget_range
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS budget_range VARCHAR(50);

-- ============================================
-- CREATE INDEXES FOR NEW FIELDS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_projects_team_type ON projects(team_type);
CREATE INDEX IF NOT EXISTS idx_projects_payment_type ON projects(payment_type);
CREATE INDEX IF NOT EXISTS idx_projects_roles_needed ON projects USING GIN(roles_needed);
CREATE INDEX IF NOT EXISTS idx_projects_skills_needed ON projects USING GIN(skills_needed);

CREATE INDEX IF NOT EXISTS idx_jobs_payment_type ON jobs(payment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_budget_range ON jobs(budget_range);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN projects.roles_needed IS 'Array of specific roles required for the project (e.g., Director, Cinematographer, Editor)';
COMMENT ON COLUMN projects.skills_needed IS 'Array of specific skills required for the project (e.g., After Effects, Maya, DaVinci Resolve)';
COMMENT ON COLUMN projects.team_type IS 'Type of team needed: team (full studio), solo (individual freelancers), or flexible (both)';
COMMENT ON COLUMN projects.payment_type IS 'Payment structure: hourly, daily, fixed price, or negotiable';
COMMENT ON COLUMN projects.hourly_rate IS 'Hourly rate when payment_type is hourly';
COMMENT ON COLUMN projects.daily_rate IS 'Daily rate when payment_type is daily';
COMMENT ON COLUMN projects.fixed_budget IS 'Fixed budget amount when payment_type is fixed';

COMMENT ON COLUMN jobs.payment_type IS 'Payment structure for the job: hourly, daily, fixed, or negotiable';
COMMENT ON COLUMN jobs.hourly_rate IS 'Hourly rate for the job';
COMMENT ON COLUMN jobs.daily_rate IS 'Daily rate for the job';
COMMENT ON COLUMN jobs.fixed_budget IS 'Fixed budget for the job';
COMMENT ON COLUMN jobs.budget_range IS 'Budget range category for the job';
