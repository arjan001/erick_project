-- ============================================
-- CREATE ADMIN SETTINGS TABLE
-- ============================================

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);

-- Add comments
COMMENT ON TABLE admin_settings IS 'System-wide settings for admin configuration';
COMMENT ON COLUMN admin_settings.setting_key IS 'Unique key for the setting';
COMMENT ON COLUMN admin_settings.setting_value IS 'Value of the setting';
COMMENT ON COLUMN admin_settings.setting_type IS 'Data type of the setting (string, number, boolean, json)';
COMMENT ON COLUMN admin_settings.description IS 'Description of what the setting does';
COMMENT ON COLUMN admin_settings.updated_at IS 'Last time the setting was updated';

-- Insert default maintenance settings
INSERT INTO admin_settings (setting_key, setting_value, setting_type, description) VALUES
('maintenance_mode', 'false', 'boolean', 'Whether maintenance mode is enabled'),
('maintenance_message', '<h2>Site Under Maintenance</h2><p>We are currently performing scheduled maintenance. Please check back soon.</p>', 'string', 'Message displayed during maintenance'),
('maintenance_start_time', NULL, 'string', 'Scheduled maintenance start time'),
('maintenance_end_time', NULL, 'string', 'Scheduled maintenance end time'),
('maintenance_allowed_ips', '[]', 'json', 'IP addresses allowed during maintenance'),
('maintenance_show_countdown', 'true', 'boolean', 'Whether to show countdown timer'),
('maintenance_contact_email', 'support@studio22.app', 'string', 'Contact email displayed during maintenance'),
('maintenance_template', 'default', 'string', 'Selected maintenance template')
ON CONFLICT (setting_key) DO NOTHING;
