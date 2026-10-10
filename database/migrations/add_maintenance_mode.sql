-- Add maintenance mode tables and settings
-- This migration creates the tables needed for maintenance mode functionality

DO $$
BEGIN
    -- Create admin_settings table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_settings') THEN
        CREATE TABLE public.admin_settings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            setting_key TEXT NOT NULL UNIQUE,
            setting_value TEXT,
            description TEXT,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Index for faster lookups
        CREATE INDEX idx_admin_settings_key ON public.admin_settings(setting_key);

        -- Trigger for updated_at
        CREATE TRIGGER trg_admin_settings_updated_at
            BEFORE UPDATE ON public.admin_settings
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();

        COMMENT ON TABLE public.admin_settings IS 'Admin configuration settings stored as key-value pairs';
        COMMENT ON COLUMN public.admin_settings.setting_key IS 'Unique identifier for the setting';
        COMMENT ON COLUMN public.admin_settings.setting_value IS 'Value of the setting (can be JSON, string, etc.)';
        COMMENT ON COLUMN public.admin_settings.description IS 'Description of what this setting controls';
    END IF;

    -- Create maintenance_access_codes table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'maintenance_access_codes') THEN
        CREATE TABLE public.maintenance_access_codes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            code TEXT NOT NULL UNIQUE,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_by TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE,
            last_used_at TIMESTAMP WITH TIME ZONE,
            usage_count INTEGER DEFAULT 0
        );

        -- Indexes
        CREATE INDEX idx_maintenance_codes_code ON public.maintenance_access_codes(code);
        CREATE INDEX idx_maintenance_codes_active ON public.maintenance_access_codes(is_active, expires_at);

        -- Trigger for updated_at (if we add an updated_at column later)
        COMMENT ON TABLE public.maintenance_access_codes IS 'Access codes to bypass maintenance mode';
        COMMENT ON COLUMN public.maintenance_access_codes.code IS 'Access code to bypass maintenance';
        COMMENT ON COLUMN public.maintenance_access_codes.is_active IS 'Whether the code is currently active';
        COMMENT ON COLUMN public.maintenance_access_codes.created_by IS 'Email of admin who created the code';
        COMMENT ON COLUMN public.maintenance_access_codes.expires_at IS 'Optional expiration time for the code';
        COMMENT ON COLUMN public.maintenance_access_codes.last_used_at IS 'Last time this code was used';
        COMMENT ON COLUMN public.maintenance_access_codes.usage_count IS 'Number of times this code has been used';
    END IF;

    -- Insert default maintenance settings if they don't exist
    INSERT INTO public.admin_settings (setting_key, setting_value, description)
    VALUES
        ('maintenance_mode', 'false', 'Whether maintenance mode is enabled'),
        ('maintenance_message', '<h2>Site Under Maintenance</h2><p>We are currently performing scheduled maintenance. Please check back soon.</p>', 'Message to display during maintenance'),
        ('maintenance_start_time', '', 'Scheduled start time for maintenance (ISO format)'),
        ('maintenance_end_time', '', 'Scheduled end time for maintenance (ISO format)'),
        ('maintenance_allowed_ips', '[]', 'JSON array of IP addresses allowed during maintenance'),
        ('maintenance_show_countdown', 'true', 'Whether to show countdown timer'),
        ('maintenance_contact_email', 'support@smartgigs.ke', 'Contact email displayed during maintenance'),
        ('maintenance_template', 'default', 'Template to use for maintenance page')
    ON CONFLICT (setting_key) DO NOTHING;

END $$;

-- RLS Policies for admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings"
    ON public.admin_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            JOIN user_roles ON auth.users.id = user_roles.user_id
            WHERE auth.users.id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- All authenticated users can read settings (needed for maintenance check)
CREATE POLICY "Authenticated users can read settings"
    ON public.admin_settings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- RLS Policies for maintenance_access_codes
ALTER TABLE public.maintenance_access_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can manage access codes
CREATE POLICY "Admins can manage access codes"
    ON public.maintenance_access_codes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            JOIN user_roles ON auth.users.id = user_roles.user_id
            WHERE auth.users.id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- All authenticated users can check codes (needed for access verification)
CREATE POLICY "Authenticated users can check access codes"
    ON public.maintenance_access_codes
    FOR SELECT
    USING (auth.role() = 'authenticated');
