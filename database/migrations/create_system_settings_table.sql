-- Create system_settings table for general application settings
-- This table stores key-value pairs for system-wide configuration

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT DEFAULT 'string', -- string, boolean, number, array, json
  category TEXT DEFAULT 'general', -- general, security, email, subscription, maintenance
  description TEXT,
  is_editable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.system_settings IS 'System-wide configuration settings stored as key-value pairs';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON public.system_settings(category);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trg_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER trg_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, category, description) VALUES
-- General Settings
('site_name', 'SmartGigs Kenya', 'string', 'general', 'Site name'),
('site_description', 'Premium video production network', 'string', 'general', 'Site description'),
('site_url', 'https://smartgigs.oneplusafrica.com', 'string', 'general', 'Site URL'),
('contact_email', 'contact@smartgigs.co.ke', 'string', 'general', 'Contact email'),
('support_email', 'support@smartgigs.co.ke', 'string', 'general', 'Support email'),

-- Registration Settings
('allow_registration', 'true', 'boolean', 'general', 'Allow new user registration'),
('require_email_verification', 'true', 'boolean', 'general', 'Require email verification'),
('default_user_role', 'artist', 'string', 'general', 'Default user role for new registrations'),

-- Content Settings
('max_portfolio_clips', '20', 'number', 'general', 'Maximum portfolio clips per artist'),
('max_team_members', '50', 'number', 'general', 'Maximum members per team'),
('auto_moderate_content', 'true', 'boolean', 'general', 'Auto-moderate content'),
('require_approval_for_projects', 'false', 'boolean', 'general', 'Require admin approval for projects'),
('allow_guest_viewing', 'true', 'boolean', 'general', 'Allow non-logged-in users to view content'),

-- File Upload Settings
('max_file_size_mb', '50', 'number', 'general', 'Maximum file upload size in MB'),
('allowed_file_types', '["jpg","jpeg","png","mp4","mov","pdf"]', 'array', 'general', 'Allowed file extensions'),

-- Notification Settings
('email_notifications', 'true', 'boolean', 'general', 'Enable email notifications'),
('push_notifications', 'true', 'boolean', 'general', 'Enable push notifications'),
('notification_retention_days', '90', 'number', 'general', 'Number of days to retain notifications'),

-- Session Settings
('session_timeout_minutes', '30', 'number', 'security', 'Session timeout in minutes'),
('max_login_attempts', '5', 'number', 'security', 'Maximum login attempts before lockout'),
('lockout_duration_minutes', '15', 'number', 'security', 'Account lockout duration in minutes'),
('two_factor_auth', 'false', 'boolean', 'security', 'Enable two-factor authentication'),

-- Password Settings
('password_min_length', '8', 'number', 'security', 'Minimum password length'),
('password_require_special', 'true', 'boolean', 'security', 'Require special characters in password'),
('password_require_number', 'true', 'boolean', 'security', 'Require numbers in password'),

-- API Settings
('api_rate_limit', '100', 'number', 'security', 'API rate limit per minute'),
('upload_rate_limit', '10', 'number', 'security', 'Upload rate limit per minute'),

-- Maintenance Settings
('maintenance_mode', 'false', 'boolean', 'maintenance', 'Maintenance mode'),
('maintenance_message', 'Site is under maintenance. Please check back soon.', 'string', 'maintenance', 'Maintenance mode message'),

-- Analytics Settings
('enable_analytics', 'true', 'boolean', 'general', 'Enable analytics tracking'),
('analytics_retention_days', '365', 'number', 'general', 'Number of days to retain analytics data'),

-- Subscription Settings
('enable_subscriptions', 'true', 'boolean', 'subscription', 'Enable subscription system'),
('free_trial_days', '14', 'number', 'subscription', 'Free trial period in days'),
('subscription_currency', 'KES', 'string', 'subscription', 'Subscription currency'),
('subscription_billing_cycle', 'monthly', 'string', 'subscription', 'Default billing cycle'),
('subscription_grace_period_days', '7', 'number', 'subscription', 'Grace period for payment'),
('subscription_prorate_upgrades', 'true', 'boolean', 'subscription', 'Prorate subscription upgrades'),
('subscription_auto_renew', 'true', 'boolean', 'subscription', 'Auto-renew subscriptions')

ON CONFLICT (setting_key) DO NOTHING;
