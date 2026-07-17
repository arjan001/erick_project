-- Migration: Add View Counts to Jobs and Projects Tables
-- Created: July 15, 2026
-- Purpose: Add view_count columns to track how many times jobs/projects have been viewed

-- Add view_count column to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add view_count column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add indexes for view_count for sorting by popularity
CREATE INDEX IF NOT EXISTS idx_jobs_view_count ON jobs(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_projects_view_count ON projects(view_count DESC);

-- Add comments for documentation
COMMENT ON COLUMN jobs.view_count IS 'Number of times this job has been viewed';
COMMENT ON COLUMN projects.view_count IS 'Number of times this project has been viewed';
