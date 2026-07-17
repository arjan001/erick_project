-- Migration: Create Job Views and Project Views Tables
-- Created: July 15, 2026
-- Purpose: Track unique views per user/IP to prevent duplicate view counts

-- Create job_views table to track unique views
CREATE TABLE IF NOT EXISTS job_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45), -- IPv4 or IPv6
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project_views table to track unique views
CREATE TABLE IF NOT EXISTS project_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45), -- IPv4 or IPv6
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_job_views_job_id ON job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_job_views_user_id ON job_views(user_id);
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_user_id ON project_views(user_id);

-- Add partial unique indexes to prevent duplicate views
-- For logged-in users: unique by job_id and user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_views_unique_user ON job_views(job_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_views_unique_user ON project_views(project_id, user_id) WHERE user_id IS NOT NULL;

-- For anonymous users: unique by job_id and ip_address
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_views_unique_ip ON job_views(job_id, ip_address) WHERE user_id IS NULL AND ip_address IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_views_unique_ip ON project_views(project_id, ip_address) WHERE user_id IS NULL AND ip_address IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE job_views IS 'Tracks unique views per job to prevent duplicate view counts';
COMMENT ON TABLE project_views IS 'Tracks unique views per project to prevent duplicate view counts';
COMMENT ON COLUMN job_views.ip_address IS 'IP address for anonymous users or as fallback';
COMMENT ON COLUMN project_views.ip_address IS 'IP address for anonymous users or as fallback';
