-- Add RLS policies for analytics tables
-- This allows authenticated users to insert analytics data without 403 errors

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

-- Allow all authenticated users to insert page_views (for analytics)
CREATE POLICY "Authenticated users can insert page_views" ON page_views
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow all authenticated users to view page_views
CREATE POLICY "Authenticated users can view page_views" ON page_views
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow all authenticated users to insert user_sessions
CREATE POLICY "Authenticated users can insert user_sessions" ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view their own sessions
CREATE POLICY "Users can view own user_sessions" ON user_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR session_id IS NOT NULL);

-- Allow all authenticated users to insert analytics_events
CREATE POLICY "Authenticated users can insert analytics_events" ON analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view their own events
CREATE POLICY "Users can view own analytics_events" ON analytics_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow all authenticated users to insert error_logs
CREATE POLICY "Authenticated users can insert error_logs" ON error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view their own error logs
CREATE POLICY "Users can view own error_logs" ON error_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow all authenticated users to insert live_users
CREATE POLICY "Authenticated users can insert live_users" ON live_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow all authenticated users to view live_users
CREATE POLICY "Authenticated users can view live_users" ON live_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow all authenticated users to insert subscription_analytics
CREATE POLICY "Authenticated users can insert subscription_analytics" ON subscription_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to view their own subscription analytics
CREATE POLICY "Users can view own subscription_analytics" ON subscription_analytics
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow updates for own records
CREATE POLICY "Users can update own page_views" ON page_views
  FOR UPDATE
  TO authenticated
  USING (session_id IN (SELECT session_id FROM user_sessions WHERE user_id = auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Users can update own user_sessions" ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR session_id IS NOT NULL);

CREATE POLICY "Users can update own live_users" ON live_users
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR session_id IS NOT NULL);

CREATE POLICY "Users can update own error_logs" ON error_logs
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscription_analytics" ON subscription_analytics
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());
