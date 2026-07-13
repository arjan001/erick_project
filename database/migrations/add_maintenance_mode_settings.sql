-- Add maintenance mode settings to admin_settings
-- This migration adds maintenance mode specific settings

DO $$
BEGIN
    -- Insert maintenance mode settings if they don't exist
    INSERT INTO admin_settings (setting_key, setting_value, setting_type, description) VALUES
    ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode'),
    ('maintenance_message', '<h2>Site Under Maintenance</h2><p>We are currently performing scheduled maintenance. Please check back soon.</p>', 'string', 'Custom maintenance message (HTML)'),
    ('maintenance_start_time', '', 'string', 'Maintenance start time (ISO timestamp)'),
    ('maintenance_end_time', '', 'string', 'Maintenance end time (ISO timestamp)'),
    ('maintenance_allowed_ips', '[]', 'json', 'IP addresses allowed during maintenance'),
    ('maintenance_show_countdown', 'true', 'boolean', 'Show countdown timer'),
    ('maintenance_contact_email', 'support@studio22.com', 'string', 'Contact email during maintenance'),
    ('maintenance_template', 'default', 'string', 'Maintenance template (default, coming_soon, update, emergency)')
    ON CONFLICT (setting_key) DO NOTHING;
END $$;
