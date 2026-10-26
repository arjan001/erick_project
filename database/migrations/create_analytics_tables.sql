-- Create Analytics Tables for Real-time Dashboard
-- These tables support the Analytics Dashboard with real data

-- 1. Live Users Table - Tracks currently online users
CREATE TABLE IF NOT EXISTS live_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  current_page TEXT,
  country TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Index for live user queries
CREATE INDEX IF NOT EXISTS idx_live_users_last_activity ON live_users(last_activity);
CREATE INDEX IF NOT EXISTS idx_live_users_user_id ON live_users(user_id);

-- 2. User Sessions Table - Tracks user sessions for analytics
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  device_type TEXT, -- desktop, mobile, tablet
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  page_views INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- Indexes for session analytics
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_country ON user_sessions(country);

-- 3. Page Views Table - Tracks individual page views
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES user_sessions(session_id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER,
  ip_address TEXT,
  country TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Indexes for page view analytics
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);

-- 4. Error Logs Table - Tracks application errors
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_name TEXT,
  page_path TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT DEFAULT 'error', -- info, warning, error, critical
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'
);

-- Indexes for error tracking
CREATE INDEX IF NOT EXISTS idx_error_logs_occurred_at ON error_logs(occurred_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);

-- 5. Subscription Analytics Table - Tracks subscription metrics
CREATE TABLE IF NOT EXISTS subscription_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID,
  plan_name TEXT,
  plan_type TEXT, -- monthly, yearly
  monthly_price DECIMAL(10, 2),
  yearly_price DECIMAL(10, 2),
  total_revenue DECIMAL(10, 2),
  currency TEXT DEFAULT 'KES',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  cancellation_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Indexes for subscription analytics
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_user_id ON subscription_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_is_active ON subscription_analytics(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_start_date ON subscription_analytics(start_date);

-- Enable Row Level Security
ALTER TABLE live_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Analytics Tables
-- Admins can read all analytics data
CREATE POLICY "Admins can read all live_users" ON live_users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

CREATE POLICY "Admins can read all user_sessions" ON user_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

CREATE POLICY "Admins can read all page_views" ON page_views
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

CREATE POLICY "Admins can read all error_logs" ON error_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update error_logs" ON error_logs
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

CREATE POLICY "Admins can read all subscription_analytics" ON subscription_analytics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'admin'
    )
  );

-- Users can insert their own live_users (for tracking)
CREATE POLICY "Users can insert own live_users" ON live_users
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can insert their own sessions
CREATE POLICY "Users can insert own user_sessions" ON user_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can insert their own page views
CREATE POLICY "Users can insert own page_views" ON page_views
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can insert error logs
CREATE POLICY "Users can insert error_logs" ON error_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Service role can insert all analytics data (for background jobs)
CREATE POLICY "Service role can insert live_users" ON live_users
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can insert user_sessions" ON user_sessions
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can insert page_views" ON page_views
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can insert error_logs" ON error_logs
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can insert subscription_analytics" ON subscription_analytics
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Function to clean up old live users (run via cron job)
CREATE OR REPLACE FUNCTION cleanup_old_live_users()
RETURNS void AS $$
BEGIN
  DELETE FROM live_users
  WHERE last_activity < NOW() - INTERVAL '30 minutes';
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old page views (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_page_views()
RETURNS void AS $$
BEGIN
  DELETE FROM page_views
  WHERE viewed_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old error logs (older than 180 days)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM error_logs
  WHERE occurred_at < NOW() - INTERVAL '180 days'
  AND resolved = true;
END;
$$ LANGUAGE plpgsql;
