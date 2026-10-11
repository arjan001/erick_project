-- Add RLS policies for analytics tables
-- This allows authenticated users to insert analytics data without 403/401 errors

-- Enable RLS on analytics tables
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE live_users ENABLE ROW LEVEL SECURITY;

ALTER TABLE subscription_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert page_views" ON page_views;
DROP POLICY IF EXISTS "Users can insert user_sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can insert analytics_events" ON analytics_events;
DROP POLICY IF EXISTS "Users can insert error_logs" ON error_logs;
DROP POLICY IF EXISTS "Users can insert live_users" ON live_users;
DROP POLICY IF EXISTS "Users can insert subscription_analytics" ON subscription_analytics;

DROP POLICY IF EXISTS "Users can view own page_views" ON page_views;
DROP POLICY IF EXISTS "Users can view own user_sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can view own analytics_events" ON analytics_events;
DROP POLICY IF EXISTS "Users can view own error_logs" ON error_logs;
DROP POLICY IF EXISTS "Users can view own live_users" ON live_users;
DROP POLICY IF EXISTS "Users can view own subscription_analytics" ON subscription_analytics;

-- Allow ALL authenticated users to insert into analytics tables (including anon for public access)
CREATE POLICY "Authenticated and anon can insert page_views" ON page_views
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Authenticated and anon can view page_views" ON page_views
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated and anon can insert user_sessions" ON user_sessions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Authenticated and anon can view user_sessions" ON user_sessions
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated and anon can insert analytics_events" ON analytics_events
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Authenticated and anon can view analytics_events" ON analytics_events
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated and anon can insert error_logs" ON error_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Authenticated and anon can view error_logs" ON error_logs
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated and anon can insert live_users" ON live_users
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Authenticated and anon can view live_users" ON live_users
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated and anon can insert subscription_analytics" ON subscription_analytics
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Authenticated and anon can view subscription_analytics" ON subscription_analytics
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow updates for all authenticated users
CREATE POLICY "Authenticated can update page_views" ON page_views
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can update user_sessions" ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can update live_users" ON live_users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can update error_logs" ON error_logs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can update subscription_analytics" ON subscription_analytics
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
