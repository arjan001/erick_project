-- Fix RLS policies for user tables (creators, teams, clients)
-- This allows fetching all users for networking module

-- Creators table RLS
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view creators" ON creators;
DROP POLICY IF EXISTS "Users can insert creators" ON creators;
DROP POLICY IF EXISTS "Users can update own creators" ON creators;
DROP POLICY IF EXISTS "Users can delete own creators" ON creators;

CREATE POLICY "Users can view all creators" ON creators
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert creators" ON creators
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own creators" ON creators
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own creators" ON creators
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Teams table RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view teams" ON teams;
DROP POLICY IF EXISTS "Users can insert teams" ON teams;
DROP POLICY IF EXISTS "Users can update own teams" ON teams;
DROP POLICY IF EXISTS "Users can delete own teams" ON teams;

CREATE POLICY "Users can view all teams" ON teams
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert teams" ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own teams" ON teams
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own teams" ON teams
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Clients table RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view clients" ON clients;
DROP POLICY IF EXISTS "Users can insert clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

CREATE POLICY "Users can view all clients" ON clients
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert clients" ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Backers table RLS
ALTER TABLE backers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view backers" ON backers;
DROP POLICY IF EXISTS "Users can insert backers" ON backers;
DROP POLICY IF EXISTS "Users can update own backers" ON backers;
DROP POLICY IF EXISTS "Users can delete own backers" ON backers;

CREATE POLICY "Users can view all backers" ON backers
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert backers" ON backers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own backers" ON backers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own backers" ON backers
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Connections table RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view connections" ON connections;
DROP POLICY IF EXISTS "Users can insert connections" ON connections;
DROP POLICY IF EXISTS "Users can update own connections" ON connections;
DROP POLICY IF EXISTS "Users can delete own connections" ON connections;

CREATE POLICY "Users can view all connections" ON connections
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert connections" ON connections
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own connections" ON connections
  FOR UPDATE
  TO authenticated
  USING (requester_email = auth.email() OR recipient_email = auth.email())
  WITH CHECK (requester_email = auth.email() OR recipient_email = auth.email());

CREATE POLICY "Users can delete own connections" ON connections
  FOR DELETE
  TO authenticated
  USING (requester_email = auth.email() OR recipient_email = auth.email());
