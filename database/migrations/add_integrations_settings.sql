-- Create integrations settings table for storing third-party API credentials
CREATE TABLE IF NOT EXISTS integrations_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_name VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups
CREATE INDEX idx_integrations_settings_name ON integrations_settings(integration_name);

-- Add trigger for updated_at
CREATE TRIGGER update_integrations_settings_updated_at 
    BEFORE UPDATE ON integrations_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default Google Drive settings
INSERT INTO integrations_settings (integration_name, settings, is_enabled)
VALUES (
    'google_drive',
    '{"client_id": "", "client_secret": "", "api_key": "", "scopes": ["https://www.googleapis.com/auth/drive.readonly"]}'::jsonb,
    false
) ON CONFLICT (integration_name) DO NOTHING;
