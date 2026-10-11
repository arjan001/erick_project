-- Add created_date columns to tables that are missing them
-- This fixes 400 Bad Request errors where frontend expects created_date but table only has created_at

-- Add created_date to creators table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'creators' AND table_schema = 'public') THEN
    ALTER TABLE creators ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    UPDATE creators SET created_date = created_at WHERE created_date IS NULL;
  END IF;
END $$;

-- Add created_date to artists table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artists' AND table_schema = 'public') THEN
    ALTER TABLE artists ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    UPDATE artists SET created_date = created_at WHERE created_date IS NULL;
  END IF;
END $$;

-- Add created_date to teams table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams' AND table_schema = 'public') THEN
    ALTER TABLE teams ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    UPDATE teams SET created_date = created_at WHERE created_date IS NULL;
  END IF;
END $$;

-- Add created_date to clients table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients' AND table_schema = 'public') THEN
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    UPDATE clients SET created_date = created_at WHERE created_date IS NULL;
  END IF;
END $$;

-- Add created_date to backers table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backers' AND table_schema = 'public') THEN
    ALTER TABLE backers ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    UPDATE backers SET created_date = created_at WHERE created_date IS NULL;
  END IF;
END $$;

-- Add created_date to jobs table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs' AND table_schema = 'public') THEN
    ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    UPDATE jobs SET created_date = created_at WHERE created_date IS NULL;
  END IF;
END $$;

-- Add created_date to projects table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') THEN
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    UPDATE projects SET created_date = created_at WHERE created_date IS NULL;
  END IF;
END $$;

-- Add created_date to connections table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connections' AND table_schema = 'public') THEN
    ALTER TABLE connections ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    UPDATE connections SET created_date = created_at WHERE created_date IS NULL;
  END IF;
END $$;

-- Add created_date to endorsements table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'endorsements' AND table_schema = 'public') THEN
    ALTER TABLE endorsements ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    UPDATE endorsements SET created_date = created_at WHERE created_date IS NULL;
  END IF;
END $$;

-- Add created_date to testimonials table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials' AND table_schema = 'public') THEN
    ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    UPDATE testimonials SET created_date = created_at WHERE created_date IS NULL;
  END IF;
END $$;

-- Add created_date to notifications table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    UPDATE notifications SET created_date = created_at WHERE created_date IS NULL;
  END IF;
END $$;

-- Add created_date to portfolio_clips table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'portfolio_clips' AND table_schema = 'public') THEN
    ALTER TABLE portfolio_clips ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    UPDATE portfolio_clips SET created_date = created_at WHERE created_date IS NULL;
  END IF;
END $$;

-- Add created_date to invites table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invites' AND table_schema = 'public') THEN
    ALTER TABLE invites ADD COLUMN IF NOT EXISTS created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    UPDATE invites SET created_date = created_at WHERE created_date IS NULL;
  END IF;
END $$;

-- Create index for faster sorting (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'creators' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_creators_created_date ON creators(created_date DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artists' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_artists_created_date ON artists(created_date DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_teams_created_date ON teams(created_date DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_clients_created_date ON clients(created_date DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backers' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_backers_created_date ON backers(created_date DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_jobs_created_date ON jobs(created_date DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_projects_created_date ON projects(created_date DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connections' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_connections_created_date ON connections(created_date DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'endorsements' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_endorsements_created_date ON endorsements(created_date DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_testimonials_created_date ON testimonials(created_date DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_created_date ON notifications(created_date DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'portfolio_clips' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_portfolio_clips_created_date ON portfolio_clips(created_date DESC);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invites' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_invites_created_date ON invites(created_date DESC);
  END IF;
END $$;
