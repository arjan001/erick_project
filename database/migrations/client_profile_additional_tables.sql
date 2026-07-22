-- Migration: Client Profile Additional Tables
-- Date: July 22, 2026
-- Description: Add tables for team members, billing, and security settings

-- ============================================
-- DROP EXISTING TABLES IF THEY EXIST WITH WRONG SCHEMA
-- ============================================

DROP TABLE IF EXISTS active_sessions CASCADE;
DROP TABLE IF EXISTS security_settings CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS billing_info CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES project_owners(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(100) DEFAULT 'member',
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for team members
CREATE INDEX idx_team_members_client_id ON team_members(client_id);
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_team_members_status ON team_members(status);

-- ============================================
-- BILLING INFORMATION TABLE
-- ============================================

CREATE TABLE billing_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES project_owners(id) ON DELETE CASCADE,
  payment_method_type VARCHAR(50) CHECK (payment_method_type IN ('card', 'bank_account', 'paypal')),
  payment_method_details JSONB,
  is_default BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for billing info
CREATE INDEX idx_billing_info_client_id ON billing_info(client_id);
CREATE INDEX idx_billing_info_status ON billing_info(status);

-- ============================================
-- INVOICES TABLE
-- ============================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES project_owners(id) ON DELETE CASCADE,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for invoices
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- ============================================
-- SECURITY SETTINGS TABLE
-- ============================================

CREATE TABLE security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES project_owners(id) ON DELETE CASCADE,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  password_last_changed TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP WITH TIME ZONE,
  login_notifications BOOLEAN DEFAULT true,
  ip_whitelist TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for security settings
CREATE INDEX idx_security_settings_client_id ON security_settings(client_id);

-- ============================================
-- ACTIVE SESSIONS TABLE
-- ============================================

CREATE TABLE active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES project_owners(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(100),
  browser VARCHAR(100),
  location_country VARCHAR(100),
  location_city VARCHAR(100),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Index for active sessions
CREATE INDEX idx_active_sessions_client_id ON active_sessions(client_id);
CREATE INDEX idx_active_sessions_token ON active_sessions(session_token);
CREATE INDEX idx_active_sessions_expires_at ON active_sessions(expires_at);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE team_members IS 'Stores team members who can access client accounts';
COMMENT ON TABLE billing_info IS 'Stores payment methods and billing information for clients';
COMMENT ON TABLE invoices IS 'Stores invoice records for client billing';
COMMENT ON TABLE security_settings IS 'Stores security settings including 2FA and session management';
COMMENT ON TABLE active_sessions IS 'Stores active login sessions for clients';
