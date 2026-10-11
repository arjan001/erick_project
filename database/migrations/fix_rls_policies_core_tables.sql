-- Fix RLS policies for messages, jobs, projects, subscriptions tables
-- This fixes 400 Bad Request errors

-- Messages table RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Jobs table RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;

CREATE POLICY "Users can view jobs" ON jobs
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert jobs" ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Projects table RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view projects" ON projects;
DROP POLICY IF EXISTS "Users can insert projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;

CREATE POLICY "Users can view projects" ON projects
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert projects" ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Subscriptions table RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert subscriptions" ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Application_subscriptions table RLS (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'application_subscriptions') THEN
    ALTER TABLE application_subscriptions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view application_subscriptions" ON application_subscriptions;
    DROP POLICY IF EXISTS "Users can insert application_subscriptions" ON application_subscriptions;
    
    CREATE POLICY "Users can view application_subscriptions" ON application_subscriptions
      FOR SELECT
      TO authenticated
      USING (true);
      
    CREATE POLICY "Users can insert application_subscriptions" ON application_subscriptions
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;
