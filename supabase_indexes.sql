-- Performance Optimization: Database Indexes for Supabase
-- Run these SQL commands in your Supabase SQL Editor

-- Composite index for job filtering
CREATE INDEX IF NOT EXISTS idx_jobs_status_posted ON jobs(status, posted_at DESC);

-- Composite index for artist filtering
CREATE INDEX IF NOT EXISTS idx_artists_status_availability ON artists(admin_approval_status, availability_status);

-- Composite index for project filtering
CREATE INDEX IF NOT EXISTS idx_projects_status_owner ON projects(status, project_owner_email);

-- Index for full-text search on jobs
CREATE INDEX IF NOT EXISTS idx_jobs_title_gin ON jobs USING gin(to_tsvector('english', title));

-- Index for connections status filtering
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- Index for messages conversation filtering
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- Index for notifications recipient filtering
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_email);

-- Index for notifications read status
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(recipient_email, read);

-- Composite index for applications job filtering
CREATE INDEX IF NOT EXISTS idx_applications_job_status ON applications(job_id, status);

-- Index for project owner email
CREATE INDEX IF NOT EXISTS idx_projects_owner_email ON projects(project_owner_email);

-- Index for artists city/country filtering
CREATE INDEX IF NOT EXISTS idx_artists_location ON artists(city, country);
