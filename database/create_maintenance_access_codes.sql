-- ============================================
-- CREATE MAINTENANCE ACCESS CODES TABLE
-- ============================================

-- Create maintenance_access_codes table
CREATE TABLE IF NOT EXISTS maintenance_access_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_maintenance_access_codes_code ON maintenance_access_codes(code);
CREATE INDEX IF NOT EXISTS idx_maintenance_access_codes_active ON maintenance_access_codes(is_active);

-- Add comments
COMMENT ON TABLE maintenance_access_codes IS 'Access codes for bypassing maintenance mode';
COMMENT ON COLUMN maintenance_access_codes.code IS 'The access code used to bypass maintenance mode';
COMMENT ON COLUMN maintenance_access_codes.is_active IS 'Whether the code is currently active';
COMMENT ON COLUMN maintenance_access_codes.created_by IS 'Email of admin who created the code';
COMMENT ON COLUMN maintenance_access_codes.expires_at IS 'Optional expiration time for the code';
COMMENT ON COLUMN maintenance_access_codes.last_used_at IS 'Last time the code was used';
COMMENT ON COLUMN maintenance_access_codes.usage_count IS 'Number of times the code has been used';
