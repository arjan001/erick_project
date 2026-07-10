-- Performance Optimization: Database Indexes for Supabase
-- Run these SQL commands in your Supabase SQL Editor
-- Based on actual database structure from SUPABASE_MIGRATION.sql and SUPABASE_MIGRATION_MODULES.sql

-- Composite index for job filtering
CREATE INDEX IF NOT EXISTS idx_jobs_status_posted ON jobs(status, posted_at DESC);

-- Composite index for job client email filtering
CREATE INDEX IF NOT EXISTS idx_jobs_client_email_status ON jobs(client_email, status);

-- Composite index for artist filtering (using correct column names from migration)
CREATE INDEX IF NOT EXISTS idx_artists_status_location ON artists(status, based_in_country);

-- Composite index for project filtering
CREATE INDEX IF NOT EXISTS idx_projects_status_owner ON projects(status, project_owner_email);

-- Index for full-text search on jobs
CREATE INDEX IF NOT EXISTS idx_jobs_title_gin ON jobs USING gin(to_tsvector('english', title));

-- Composite index for connections status filtering
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- Composite index for connections requester filtering
CREATE INDEX IF NOT EXISTS idx_connections_requester_status ON connections(requester_email, status);

-- Composite index for connections recipient filtering
CREATE INDEX IF NOT EXISTS idx_connections_recipient_status ON connections(recipient_email, status);

-- Index for messages conversation filtering
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- Composite index for messages sender filtering
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON messages(sender_email, created_at DESC);

-- Composite index for messages recipient filtering
CREATE INDEX IF NOT EXISTS idx_messages_recipient_created ON messages(recipient_email, created_at DESC);

-- Index for notifications recipient filtering
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_email);

-- Composite index for notifications recipient and read status
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON notifications(recipient_email, read);

-- Composite index for notifications created at
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Composite index for applications job filtering
CREATE INDEX IF NOT EXISTS idx_applications_job_status ON applications(job_id, status);

-- Composite index for applications artist filtering
CREATE INDEX IF NOT EXISTS idx_applications_artist_status ON applications(artist_email, status);

-- Composite index for applications project filtering
CREATE INDEX IF NOT EXISTS idx_applications_project_status ON applications(project_id, status);

-- Index for backers contact email filtering
CREATE INDEX IF NOT EXISTS idx_backers_contact_email ON backers(contact_email);

-- Index for backers status filtering
CREATE INDEX IF NOT EXISTS idx_backers_status ON backers(status);

-- Index for teams contact email filtering
CREATE INDEX IF NOT EXISTS idx_teams_contact_email ON teams(contact_email);

-- Index for teams status filtering
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);

-- Index for portfolio clips uploaded by filtering
CREATE INDEX IF NOT EXISTS idx_portfolio_clips_uploaded_by ON portfolio_clips(uploaded_by_id);

-- Index for portfolio clips status filtering
CREATE INDEX IF NOT EXISTS idx_portfolio_clips_status ON portfolio_clips(status);

-- Index for endorsements recipient filtering
CREATE INDEX IF NOT EXISTS idx_endorsements_recipient ON endorsements(recipient_email);

-- Index for testimonials recipient filtering
CREATE INDEX IF NOT EXISTS idx_testimonials_recipient ON testimonials(recipient_email);

-- Index for deals backer email filtering
CREATE INDEX IF NOT EXISTS idx_deals_backer_email ON deals(backer_email);

-- Index for deals status filtering
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);

-- Index for partners backer email filtering
CREATE INDEX IF NOT EXISTS idx_partners_backer_email ON partners(backer_email);

-- Index for investment tiers backer email filtering
CREATE INDEX IF NOT EXISTS idx_investment_tiers_backer_email ON investment_tiers(backer_email);

-- Index for project updates backer email filtering
CREATE INDEX IF NOT EXISTS idx_project_updates_backer_email ON project_updates(backer_email);

-- Index for backed projects backer email filtering
CREATE INDEX IF NOT EXISTS idx_backed_projects_backer_email ON backed_projects(backer_email);

-- Index for backed projects status filtering
CREATE INDEX IF NOT EXISTS idx_backed_projects_status ON backed_projects(status);

-- Index for connects transactions artist email filtering
CREATE INDEX IF NOT EXISTS idx_connects_transactions_artist_email ON connects_transactions(artist_email);

-- Index for subscriptions user email filtering
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_email ON subscriptions(user_email);

-- Index for subscriptions status filtering
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Index for notes owner email filtering
CREATE INDEX IF NOT EXISTS idx_notes_owner_email ON notes(owner_email);

-- Index for assignments project filtering
CREATE INDEX IF NOT EXISTS idx_assignments_project_id ON assignments(project_id);

-- Index for creators country filtering
CREATE INDEX IF NOT EXISTS idx_creators_country ON creators(country);

-- Index for creators city filtering
CREATE INDEX IF NOT EXISTS idx_creators_city ON creators(city);
