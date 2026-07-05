-- ============================================
-- SUPABASE SCHEMA UPDATE FOR INVITE CODES
-- ============================================
-- Run this in your Supabase SQL Editor to update the database schema

-- 1. Add invite_code column to artists table
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20);

-- 2. Add invite_code column to teams table
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20);

-- 3. Add invite_code column to backers table
ALTER TABLE backers 
ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20);

-- 4. Add invite_code column to project_owners table
ALTER TABLE project_owners 
ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20);

-- 5. Create indexes for invite codes for faster lookups
CREATE INDEX IF NOT EXISTS idx_artists_invite_code ON artists(invite_code);
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON teams(invite_code);
CREATE INDEX IF NOT EXISTS idx_backers_invite_code ON backers(invite_code);
CREATE INDEX IF NOT EXISTS idx_project_owners_invite_code ON project_owners(invite_code);

-- 6. Create indexes for referred_by for tracking referrals
CREATE INDEX IF NOT EXISTS idx_artists_referred_by ON artists(referred_by);
CREATE INDEX IF NOT EXISTS idx_teams_referred_by ON teams(referred_by);
CREATE INDEX IF NOT EXISTS idx_backers_referred_by ON backers(referred_by);
CREATE INDEX IF NOT EXISTS idx_project_owners_referred_by ON project_owners(referred_by);

-- ============================================
-- CONTENT CATEGORIES TABLE SETUP
-- ============================================
-- Ensure content_categories table exists and has proper structure

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS content_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories if table is empty
INSERT INTO content_categories (name, slug, description, image_url, status, display_order)
VALUES 
  ('Documentary', 'documentary', 'Professional documentary filmmaking and production services', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600', 'active', 1),
  ('Commercial', 'commercial', 'High-end commercial and advertising production', 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600', 'active', 2),
  ('Music Video', 'music-video', 'Creative music video production and direction', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600', 'active', 3),
  ('Film Production', 'film-production', 'Full-scale film production services', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600', 'active', 4),
  ('Photography', 'photography', 'Professional photography services', 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600', 'active', 5),
  ('Animation', 'animation', '2D and 3D animation services', 'https://images.unsplash.com/photo-1531297461136-82af022f5b80?w=600', 'active', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- INVITES TABLE (for tracking invite usage)
-- ============================================
-- Create invites table if it doesn't exist
CREATE TABLE IF NOT EXISTS invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  creator_email VARCHAR(255) NOT NULL,
  creator_type VARCHAR(50) NOT NULL, -- 'artist', 'team', 'backer', 'client'
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 100,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for invites (only after table exists)
CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_creator ON invites(creator_email);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE backers ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Artists table policies
CREATE POLICY IF NOT EXISTS "Artists can view own profile" ON artists
  FOR SELECT USING (email = auth.email());

CREATE POLICY IF NOT EXISTS "Artists can update own profile" ON artists
  FOR UPDATE USING (email = auth.email());

CREATE POLICY IF NOT EXISTS "Public can view artists" ON artists
  FOR SELECT USING (true);

-- Teams table policies
CREATE POLICY IF NOT EXISTS "Teams can view own profile" ON teams
  FOR SELECT USING (contact_email = auth.email());

CREATE POLICY IF NOT EXISTS "Teams can update own profile" ON teams
  FOR UPDATE USING (contact_email = auth.email());

CREATE POLICY IF NOT EXISTS "Public can view teams" ON teams
  FOR SELECT USING (true);

-- Backers table policies
CREATE POLICY IF NOT EXISTS "Backers can view own profile" ON backers
  FOR SELECT USING (contact_email = auth.email());

CREATE POLICY IF NOT EXISTS "Backers can update own profile" ON backers
  FOR UPDATE USING (contact_email = auth.email());

CREATE POLICY IF NOT EXISTS "Public can view backers" ON backers
  FOR SELECT USING (true);

-- Project owners table policies
CREATE POLICY IF NOT EXISTS "Project owners can view own profile" ON project_owners
  FOR SELECT USING (email = auth.email());

CREATE POLICY IF NOT EXISTS "Project owners can update own profile" ON project_owners
  FOR UPDATE USING (email = auth.email());

CREATE POLICY IF NOT EXISTS "Public can view project owners" ON project_owners
  FOR SELECT USING (true);

-- Content categories policies (public read)
CREATE POLICY IF NOT EXISTS "Public can view categories" ON content_categories
  FOR SELECT USING (status = 'active');

-- Invites policies
CREATE POLICY IF NOT EXISTS "Users can view invites" ON invites
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can create invites" ON invites
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update invites" ON invites
  FOR UPDATE USING (true);

-- ============================================
-- FUNCTIONS FOR AUTO-UPDATING UPDATED_AT
-- ============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
DROP TRIGGER IF EXISTS update_content_categories_updated_at ON content_categories;
CREATE TRIGGER update_content_categories_updated_at
  BEFORE UPDATE ON content_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invites_updated_at ON invites;
CREATE TRIGGER update_invites_updated_at
  BEFORE UPDATE ON invites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
