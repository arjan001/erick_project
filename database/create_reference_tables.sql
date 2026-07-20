-- ============================================
-- CREATE REFERENCE DATA TABLES
-- Skills, Roles, and Countries for dynamic dropdowns
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SKILLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_active ON skills(is_active);

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roles_category ON roles(category);
CREATE INDEX IF NOT EXISTS idx_roles_active ON roles(is_active);

-- ============================================
-- COUNTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_name VARCHAR(255) NOT NULL UNIQUE,
    country_code VARCHAR(2) NOT NULL UNIQUE,
    dial_code VARCHAR(20),
    flag_emoji VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(country_code);
CREATE INDEX IF NOT EXISTS idx_countries_active ON countries(is_active);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE skills IS 'Reference table for film industry skills organized by category';
COMMENT ON TABLE roles IS 'Reference table for film industry roles organized by category';
COMMENT ON TABLE countries IS 'Reference table for countries with dial codes and flags';

COMMENT ON COLUMN skills.skill_name IS 'Name of the skill (e.g., "3D Modeling", "Cinematography")';
COMMENT ON COLUMN skills.category IS 'Category of the skill (e.g., "3d_cgi", "cinematography")';
COMMENT ON COLUMN skills.display_order IS 'Order for displaying skills in dropdowns';

COMMENT ON COLUMN roles.role_name IS 'Name of the role (e.g., "Director", "3D Generalist")';
COMMENT ON COLUMN roles.category IS 'Category of the role (e.g., "pre_production", "3d_cgi")';
COMMENT ON COLUMN roles.display_order IS 'Order for displaying roles in dropdowns';

COMMENT ON COLUMN countries.country_name IS 'Full country name (e.g., "United States")';
COMMENT ON COLUMN countries.country_code IS 'ISO 2-letter country code (e.g., "US")';
COMMENT ON COLUMN countries.dial_code IS 'International dialing code (e.g., "+1")';
COMMENT ON COLUMN countries.flag_emoji IS 'Country flag emoji (e.g., "🇺🇸")';
