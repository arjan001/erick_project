-- ============================================
-- API SETTINGS SCHEMA MIGRATION
-- ============================================
-- This migration creates tables for managing API keys, rate limiting,
-- and general API configuration settings

-- ============================================
-- DROP EXISTING TABLES (for clean migration)
-- ============================================
DROP TABLE IF EXISTS api_usage_logs CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS rate_limiting_settings CASCADE;
DROP TABLE IF EXISTS api_configuration CASCADE;
DROP TABLE IF EXISTS integrations_settings CASCADE;

-- ============================================
-- API KEYS TABLE
-- ============================================
-- Stores API keys for external access to the system
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    public_key VARCHAR(100) UNIQUE NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    scopes TEXT[] DEFAULT ARRAY['read'],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_public ON api_keys(public_key);
CREATE INDEX idx_api_keys_status ON api_keys(status);
CREATE INDEX idx_api_keys_created_by ON api_keys(created_by);

-- Trigger for updated_at (only if function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_api_keys_updated_at') THEN
        DROP TRIGGER update_api_keys_updated_at ON api_keys;
    END IF;
END $$;

CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RATE LIMITING SETTINGS TABLE
-- ============================================
-- Stores rate limiting configuration for API
CREATE TABLE rate_limiting_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enabled BOOLEAN DEFAULT true,
    requests_per_minute INTEGER DEFAULT 100,
    requests_per_hour INTEGER DEFAULT 1000,
    requests_per_day INTEGER DEFAULT 10000,
    burst_limit INTEGER DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default rate limiting settings
INSERT INTO rate_limiting_settings (enabled, requests_per_minute, requests_per_hour, requests_per_day, burst_limit)
VALUES (true, 100, 1000, 10000, 20)
ON CONFLICT DO NOTHING;

-- Trigger for updated_at
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rate_limiting_settings_updated_at') THEN
        DROP TRIGGER update_rate_limiting_settings_updated_at ON rate_limiting_settings;
    END IF;
END $$;

CREATE TRIGGER update_rate_limiting_settings_updated_at 
    BEFORE UPDATE ON rate_limiting_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- API CONFIGURATION SETTINGS TABLE
-- ============================================
-- Stores general API configuration
CREATE TABLE api_configuration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enable_cors BOOLEAN DEFAULT true,
    allowed_origins TEXT[] DEFAULT ARRAY['https://studio22.com', 'https://www.studio22.com'],
    enable_api_key_auth BOOLEAN DEFAULT true,
    enable_jwt_auth BOOLEAN DEFAULT true,
    jwt_expiration_seconds INTEGER DEFAULT 3600,
    enable_webhooks BOOLEAN DEFAULT true,
    webhook_secret VARCHAR(255),
    enable_api_versioning BOOLEAN DEFAULT true,
    current_version VARCHAR(10) DEFAULT 'v1',
    enable_logging BOOLEAN DEFAULT true,
    log_retention_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default API configuration
INSERT INTO api_configuration (
    enable_cors, 
    allowed_origins, 
    enable_api_key_auth, 
    enable_jwt_auth, 
    jwt_expiration_seconds,
    enable_webhooks,
    enable_api_versioning,
    current_version,
    enable_logging,
    log_retention_days
)
VALUES (
    true, 
    ARRAY['https://studio22.com', 'https://www.studio22.com'], 
    true, 
    true, 
    3600,
    true,
    true,
    'v1',
    true,
    30
)
ON CONFLICT DO NOTHING;

-- Trigger for updated_at
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_api_configuration_updated_at') THEN
        DROP TRIGGER update_api_configuration_updated_at ON api_configuration;
    END IF;
END $$;

CREATE TRIGGER update_api_configuration_updated_at 
    BEFORE UPDATE ON api_configuration 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INTEGRATIONS SETTINGS TABLE
-- ============================================
-- Stores third-party API credentials
CREATE TABLE integrations_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_name VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_integrations_settings_name ON integrations_settings(integration_name);

-- Trigger for updated_at
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_integrations_settings_updated_at') THEN
        DROP TRIGGER update_integrations_settings_updated_at ON integrations_settings;
    END IF;
END $$;

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

-- ============================================
-- UPDATE INTEGRATIONS SETTINGS FOR CHATGPT
-- ============================================
-- Add ChatGPT settings to integrations_settings
INSERT INTO integrations_settings (integration_name, settings, is_enabled)
VALUES (
    'chatgpt',
    '{"api_key": "", "model": "gpt-4", "temperature": 0.7, "max_tokens": 2000}'::jsonb,
    false
) ON CONFLICT (integration_name) DO NOTHING;

-- ============================================
-- API USAGE LOGS TABLE
-- ============================================
-- Tracks API usage for monitoring and analytics
CREATE TABLE api_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_usage_logs_api_key ON api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_logs_created_at ON api_usage_logs(created_at);
CREATE INDEX idx_api_usage_logs_endpoint ON api_usage_logs(endpoint);

-- ============================================
-- COMMENTS
-- ============================================
-- This schema provides:
-- 1. API Keys management with CRUD operations
-- 2. Rate limiting configuration
-- 3. General API settings (CORS, Auth, Webhooks, etc.)
-- 4. Integration settings for Google Drive and ChatGPT
-- 5. API usage logging for monitoring
