-- Add created_date columns to tables that are missing them
-- This fixes 400 Bad Request errors where frontend expects created_date but table only has created_at

-- Add created_date to creators table
ALTER TABLE creators ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE creators SET created_date = created_at WHERE created_date IS NULL;

-- Add created_date to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE artists SET created_date = created_at WHERE created_date IS NULL;

-- Add created_date to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE teams SET created_date = created_at WHERE created_date IS NULL;

-- Add created_date to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE clients SET created_date = created_at WHERE created_date IS NULL;

-- Add created_date to backers table
ALTER TABLE backers ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE backers SET created_date = created_at WHERE created_date IS NULL;

-- Add created_date to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE jobs SET created_date = created_at WHERE created_date IS NULL;

-- Add created_date to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE projects SET created_date = created_at WHERE created_date IS NULL;

-- Add created_date to connections table
ALTER TABLE connections ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE connections SET created_date = created_at WHERE created_date IS NULL;

-- Add created_date to endorsements table
ALTER TABLE endorsements ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE endorsements SET created_date = created_at WHERE created_date IS NULL;

-- Add created_date to testimonials table
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE testimonials SET created_date = created_at WHERE created_date IS NULL;

-- Add created_date to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE notifications SET created_date = created_at WHERE created_date IS NULL;

-- Add created_date to portfolio_clips table
ALTER TABLE portfolio_clips ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE portfolio_clips SET created_date = created_at WHERE created_date IS NULL;

-- Add created_date to invites table
ALTER TABLE invites ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE invites SET created_date = created_at WHERE created_date IS NULL;

-- Create index for faster sorting
CREATE INDEX IF NOT EXISTS idx_creators_created_date ON creators(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_artists_created_date ON artists(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_teams_created_date ON teams(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_clients_created_date ON clients(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_backers_created_date ON backers(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_created_date ON jobs(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_projects_created_date ON projects(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_connections_created_date ON connections(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_endorsements_created_date ON endorsements(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_date ON testimonials(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_date ON notifications(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_clips_created_date ON portfolio_clips(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_invites_created_date ON invites(created_date DESC);
