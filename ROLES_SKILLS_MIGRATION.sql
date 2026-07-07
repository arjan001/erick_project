-- Migration: Add Film Industry Roles and Enhanced Skills
-- Version: 1.0
-- Date: July 5, 2026

-- Add roles column to artists table (for primary and secondary roles)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS role VARCHAR(100);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS secondary_roles TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add structured skills_experience column (JSONB for skill + proficiency)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS skills_experience JSONB DEFAULT '[]'::jsonb;

-- Add equipment and software preferences
ALTER TABLE artists ADD COLUMN IF NOT EXISTS equipment_owned TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE artists ADD COLUMN IF NOT EXISTS software_proficiency TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add location fields for OpenStreetMap integration
ALTER TABLE artists ADD COLUMN IF NOT EXISTS based_in_city VARCHAR(100);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS based_in_country VARCHAR(100);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS coordinates_lat DECIMAL(10, 8);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS coordinates_lng DECIMAL(11, 8);

-- Add video upload fields (Vimeo, YouTube, TikTok, Google Drive)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS video_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS google_drive_folder_id TEXT;

-- Add invite/referral code field
ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- Add last_active for presence tracking
ALTER TABLE artists ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;

-- Add similar fields to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS equipment_owned TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE teams ADD COLUMN IF NOT EXISTS software_proficiency TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE teams ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS coordinates_lat DECIMAL(10, 8);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS coordinates_lng DECIMAL(11, 8);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS video_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS google_drive_folder_id TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;

-- Add similar fields to project_owners/clients table
ALTER TABLE project_owners ADD COLUMN IF NOT EXISTS based_in_city VARCHAR(100);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS based_in_country VARCHAR(100);
ALTER TABLE project_owners ADD COLUMN IF NOT EXISTS coordinates_lat DECIMAL(10, 8);
ALTER TABLE project_owners ADD COLUMN IF NOT EXISTS coordinates_lng DECIMAL(11, 8);
ALTER TABLE project_owners ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;

-- Add similar fields to backers table
ALTER TABLE backers ADD COLUMN IF NOT EXISTS locations TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE backers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE backers ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE backers ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_artists_role ON artists(role);
CREATE INDEX IF NOT EXISTS idx_artists_city ON artists(based_in_city);
CREATE INDEX IF NOT EXISTS idx_artists_country ON artists(based_in_country);
CREATE INDEX IF NOT EXISTS idx_backers_city ON backers(city);
CREATE INDEX IF NOT EXISTS idx_backers_country ON backers(country);
CREATE INDEX IF NOT EXISTS idx_users_invite_code ON users(invite_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- Create ticker_entries table for dynamic marquee
CREATE TABLE IF NOT EXISTS ticker_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    link_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticker_entries_active ON ticker_entries(is_active);
CREATE INDEX IF NOT EXISTS idx_ticker_entries_order ON ticker_entries(display_order);

-- Create categories table for landing page categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    icon VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Add category to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Create function to generate invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    chars VARCHAR(62) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(20) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * 62 + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate invite codes for new users
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invite_code IS NULL THEN
        NEW.invite_code := generate_invite_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invite_code
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_invite_code();
