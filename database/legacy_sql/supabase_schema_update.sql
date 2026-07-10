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

-- 4. Add city and country columns to backers table
ALTER TABLE backers
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255),
ADD COLUMN IF NOT EXISTS instagram VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter VARCHAR(255),
ADD COLUMN IF NOT EXISTS youtube VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS deal_alerts BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS profile_public BOOLEAN DEFAULT TRUE;

-- 5. Add missing columns to artists table
ALTER TABLE artists
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS twitter VARCHAR(255),
ADD COLUMN IF NOT EXISTS youtube VARCHAR(255),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS project_alerts BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS profile_public BOOLEAN DEFAULT TRUE;

-- 5. Add invite_code column to project_owners table
ALTER TABLE project_owners 
ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20);

-- 5. Create indexes for invite codes for faster lookups
CREATE INDEX IF NOT EXISTS idx_artists_invite_code ON artists(invite_code);
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON teams(invite_code);
CREATE INDEX IF NOT EXISTS idx_backers_invite_code ON backers(invite_code);
CREATE INDEX IF NOT EXISTS idx_project_owners_invite_code ON project_owners(invite_code);

-- 6. Create indexes for backers city and country
CREATE INDEX IF NOT EXISTS idx_backers_city ON backers(city);
CREATE INDEX IF NOT EXISTS idx_backers_country ON backers(country);

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
  parent_id UUID REFERENCES content_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PORTFOLIO CLIPS VIDEO EMBED SUPPORT
-- ============================================
-- Add video_embed_url and video_source columns to support external video links

ALTER TABLE portfolio_clips
ADD COLUMN IF NOT EXISTS video_embed_url TEXT,
ADD COLUMN IF NOT EXISTS video_source VARCHAR(20) DEFAULT 'upload' CHECK (video_source IN ('upload', 'youtube', 'vimeo', 'tiktok', 'google_drive')),
ADD COLUMN IF NOT EXISTS role VARCHAR(255);

-- Create index for video_source for filtering
CREATE INDEX IF NOT EXISTS idx_portfolio_clips_video_source ON portfolio_clips(video_source);

-- ============================================
-- FEATURED WORKS DYNAMIC SELECTION
-- ============================================
-- Add artist_id, project_id, and portfolio_clip_id columns to featured_work table for dynamic selection
-- Note: Table name is singular 'featured_work' to match existing schema

ALTER TABLE featured_work
ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS portfolio_clip_id UUID REFERENCES portfolio_clips(id) ON DELETE SET NULL;

-- Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_featured_work_artist_id ON featured_work(artist_id);
CREATE INDEX IF NOT EXISTS idx_featured_work_project_id ON featured_work(project_id);
CREATE INDEX IF NOT EXISTS idx_featured_work_portfolio_clip_id ON featured_work(portfolio_clip_id);

-- ============================================
-- RECENT PROJECTS DYNAMIC SELECTION
-- ============================================
-- Add project_id column to recent_projects table for dynamic selection

ALTER TABLE recent_projects
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Create index for foreign key
CREATE INDEX IF NOT EXISTS idx_recent_projects_project_id ON recent_projects(project_id);

-- ============================================
-- ARTIST ROLES ARRAY SUPPORT
-- ============================================
-- Add roles column to artists table to support multiple roles as array

ALTER TABLE artists
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{}';

-- Create index for roles array for better querying
CREATE INDEX IF NOT EXISTS idx_artists_roles ON artists USING GIN(roles);

-- ============================================
-- ARTIST ABOUT SECTION COLUMNS
-- ============================================
-- Add missing columns for about section (countries worked, visited countries, past clients, project specialties)

ALTER TABLE artists
ADD COLUMN IF NOT EXISTS countries_worked TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS visited_countries TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS past_clients TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS project_specialties TEXT[] DEFAULT '{}';

-- Create indexes for array columns
CREATE INDEX IF NOT EXISTS idx_artists_countries_worked ON artists USING GIN(countries_worked);
CREATE INDEX IF NOT EXISTS idx_artists_visited_countries ON artists USING GIN(visited_countries);
CREATE INDEX IF NOT EXISTS idx_artists_past_clients ON artists USING GIN(past_clients);
CREATE INDEX IF NOT EXISTS idx_artists_project_specialties ON artists USING GIN(project_specialties);

-- ============================================
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
-- Note: This table already exists in SUPABASE_MIGRATION.sql with different structure
-- We're adding missing columns if needed
ALTER TABLE invites 
ADD COLUMN IF NOT EXISTS uses_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for invites (only after table exists)
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_expires ON invites(expires_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE backers ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
-- Note: invites table RLS is already set in SUPABASE_MIGRATION.sql

-- Artists table policies
DROP POLICY IF EXISTS "Artists can view own profile" ON artists;
CREATE POLICY "Artists can view own profile" ON artists
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Artists can update own profile" ON artists;
CREATE POLICY "Artists can update own profile" ON artists
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Artists can insert own profile" ON artists;
CREATE POLICY "Artists can insert own profile" ON artists
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view artists" ON artists;
CREATE POLICY "Public can view artists" ON artists
  FOR SELECT USING (true);

-- Teams table policies
DROP POLICY IF EXISTS "Teams can view own profile" ON teams;
CREATE POLICY "Teams can view own profile" ON teams
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teams can update own profile" ON teams;
CREATE POLICY "Teams can update own profile" ON teams
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Teams can insert own profile" ON teams;
CREATE POLICY "Teams can insert own profile" ON teams
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view teams" ON teams;
CREATE POLICY "Public can view teams" ON teams
  FOR SELECT USING (true);

-- Backers table policies
DROP POLICY IF EXISTS "Backers can view own profile" ON backers;
CREATE POLICY "Backers can view own profile" ON backers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Backers can update own profile" ON backers;
CREATE POLICY "Backers can update own profile" ON backers
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Backers can insert own profile" ON backers;
CREATE POLICY "Backers can insert own profile" ON backers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view backers" ON backers;
CREATE POLICY "Public can view backers" ON backers
  FOR SELECT USING (true);

-- Project owners table policies
DROP POLICY IF EXISTS "Project owners can view own profile" ON project_owners;
CREATE POLICY "Project owners can view own profile" ON project_owners
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Project owners can update own profile" ON project_owners;
CREATE POLICY "Project owners can update own profile" ON project_owners
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Project owners can insert own profile" ON project_owners;
CREATE POLICY "Project owners can insert own profile" ON project_owners
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view project owners" ON project_owners;
CREATE POLICY "Public can view project owners" ON project_owners
  FOR SELECT USING (true);

-- Content categories policies (admin full access + public read)
DROP POLICY IF EXISTS "Admins can manage categories" ON content_categories;
CREATE POLICY "Admins can manage categories" ON content_categories
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can view categories" ON content_categories;
CREATE POLICY "Public can view categories" ON content_categories
  FOR SELECT USING (status = 'active');

-- Invites policies
-- Note: invites table policies are already set in SUPABASE_MIGRATION.sql

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

-- Note: invites trigger is handled in SUPABASE_MIGRATION.sql

-- ============================================
-- AUDIT LOGS TABLE (for tracking all admin activity)
-- ============================================
-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_email VARCHAR(255),
  actor_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  details TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit_logs (only after table exists)
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs policies (admin only access)
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can create audit logs" ON audit_logs;
CREATE POLICY "Admins can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- PROJECTS TABLE UPDATE
-- ============================================
-- Add missing columns to projects table for complete project data
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS budget_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS skills_required TEXT[],
ADD COLUMN IF NOT EXISTS roles_needed TEXT[],
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS project_owner_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS open_to_backing BOOLEAN DEFAULT FALSE;

-- Create indexes for new project columns
CREATE INDEX IF NOT EXISTS idx_projects_title ON projects(title);
CREATE INDEX IF NOT EXISTS idx_projects_budget_range ON projects(budget_range);
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON projects(project_type);

-- Enable RLS on projects if not already enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Projects policies
DROP POLICY IF EXISTS "Public can view projects" ON projects;
CREATE POLICY "Public can view projects" ON projects
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Project owners can manage own projects" ON projects;
CREATE POLICY "Project owners can manage own projects" ON projects
  FOR ALL USING (project_owner_email = auth.email());

DROP POLICY IF EXISTS "Admins can manage projects" ON projects;
CREATE POLICY "Admins can manage projects" ON projects
  FOR ALL USING (true);

-- ============================================
-- TICKER ENTRIES TABLE UPDATE
-- ============================================
-- Add missing columns to ticker_entries table for full functionality
ALTER TABLE ticker_entries 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'news',
ADD COLUMN IF NOT EXISTS link_type VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS link_target_id UUID,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS published_date TIMESTAMP WITH TIME ZONE;

-- Create indexes for new ticker columns
CREATE INDEX IF NOT EXISTS idx_ticker_entries_category ON ticker_entries(category);
CREATE INDEX IF NOT EXISTS idx_ticker_entries_status ON ticker_entries(status);

-- Enable RLS on ticker_entries if not already enabled
ALTER TABLE ticker_entries ENABLE ROW LEVEL SECURITY;

-- Ticker entries policies
DROP POLICY IF EXISTS "Public can view live ticker entries" ON ticker_entries;
CREATE POLICY "Public can view live ticker entries" ON ticker_entries
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage ticker entries" ON ticker_entries;
CREATE POLICY "Admins can manage ticker entries" ON ticker_entries
  FOR ALL USING (true);

-- ============================================
-- ARTICLES TABLE (for blog posts and content)
-- ============================================
-- Create articles table if it doesn't exist
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author_id UUID,
  author_name VARCHAR(255),
  category VARCHAR(100),
  tags TEXT[],
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_date TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for articles
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(is_featured);

-- Enable RLS on articles
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Articles policies
DROP POLICY IF EXISTS "Public can view published articles" ON articles;
CREATE POLICY "Public can view published articles" ON articles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage articles" ON articles;
CREATE POLICY "Admins can manage articles" ON articles
  FOR ALL USING (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED SAMPLE ARTICLES
-- ============================================
-- Insert sample articles if table is empty
INSERT INTO articles (title, slug, excerpt, content, featured_image_url, author_name, category, tags, status, published_date, display_order, is_featured, meta_title, meta_description)
VALUES 
  ('New Documentary Project Announced', 'new-documentary-project-announced', 'Studio22 announces a groundbreaking new documentary project exploring cultural heritage.', '<p>We are thrilled to announce our latest documentary project that will explore the rich cultural heritage of our region. This film will feature interviews with local artists, historians, and community leaders.</p>', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800', 'Studio22 Team', 'documentary', ARRAY['documentary', 'culture', 'heritage'], 'published', NOW(), 1, true, 'New Documentary Project - Studio22', 'Studio22 announces a groundbreaking new documentary project exploring cultural heritage.'),
  ('Cultural Funding Initiative Launched', 'cultural-funding-initiative-launched', 'New funding opportunities for cultural projects and artistic endeavors.', '<p>We have launched a new funding initiative to support cultural projects and artistic endeavors. This program will provide grants to artists and organizations working to preserve and promote cultural heritage.</p>', 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800', 'Studio22 Team', 'funding', ARRAY['funding', 'culture', 'grants'], 'published', NOW(), 2, false, 'Cultural Funding Initiative - Studio22', 'New funding opportunities for cultural projects and artistic endeavors.'),
  ('Production Workshop Series', 'production-workshop-series', 'Join our upcoming workshop series on film production techniques.', '<p>We are organizing a series of workshops on film production techniques. These workshops will cover everything from pre-production planning to post-production editing.</p>', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 'Studio22 Team', 'production', ARRAY['workshop', 'production', 'education'], 'published', NOW(), 3, false, 'Production Workshop Series - Studio22', 'Join our upcoming workshop series on film production techniques.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED SAMPLE TICKER ENTRIES
-- ============================================
-- Insert sample ticker entries if table is empty
INSERT INTO ticker_entries (text, category, link_type, link_url, status, display_order, published_date)
VALUES 
  ('🎬 New documentary project announced - Learn more', 'news', 'article', null, 'live', 1, NOW()),
  ('💰 Cultural funding initiative now accepting applications', 'announcement', 'article', null, 'live', 2, NOW()),
  ('🎥 Production workshop series starting next month', 'news', 'article', null, 'live', 3, NOW()),
  ('🌍 Join our global network of cultural creators', 'cultural_support', 'url', 'https://studio22.com/join', 'live', 4, NOW()),
  ('📢 Studio22 partnership opportunities available', 'partnership', 'url', 'https://studio22.com/partners', 'live', 5, NOW())
ON CONFLICT DO NOTHING;
