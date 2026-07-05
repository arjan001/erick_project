-- Content Categories Table
-- For managing content categories displayed on homepage
CREATE TABLE IF NOT EXISTS content_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'hidden'
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Featured Work Table
-- For managing featured artist work (paid subscription feature)
CREATE TABLE IF NOT EXISTS featured_work (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  featured_type VARCHAR(50) DEFAULT 'paid', -- 'paid', 'subscription', 'admin_pick'
  featured_until TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'expired'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Success Stories Table
-- For approving and displaying artist/client success stories
CREATE TABLE IF NOT EXISTS success_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(50) NOT NULL, -- 'artist' or 'client'
  title VARCHAR(255) NOT NULL,
  story TEXT NOT NULL,
  testimonial TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  score DECIMAL(3,1), -- Rating out of 10
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recent Projects Table
-- For managing recent projects displayed on homepage (limit 4)
CREATE TABLE IF NOT EXISTS recent_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  studio VARCHAR(255),
  type VARCHAR(100),
  images JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_categories_slug ON content_categories(slug);
CREATE INDEX IF NOT EXISTS idx_content_categories_status ON content_categories(status);
CREATE INDEX IF NOT EXISTS idx_featured_work_artist_id ON featured_work(artist_id);
CREATE INDEX IF NOT EXISTS idx_featured_work_status ON featured_work(status);
CREATE INDEX IF NOT EXISTS idx_success_stories_user_id ON success_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_success_stories_status ON success_stories(status);
CREATE INDEX IF NOT EXISTS idx_recent_projects_is_active ON recent_projects(is_active);

-- Enable Row Level Security
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_categories
DROP POLICY IF EXISTS "Admins can view all categories" ON content_categories;
CREATE POLICY "Admins can view all categories" ON content_categories FOR SELECT USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Admins can insert categories" ON content_categories;
CREATE POLICY "Admins can insert categories" ON content_categories FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Admins can update categories" ON content_categories;
CREATE POLICY "Admins can update categories" ON content_categories FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Admins can delete categories" ON content_categories;
CREATE POLICY "Admins can delete categories" ON content_categories FOR DELETE USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Public can view active categories" ON content_categories;
CREATE POLICY "Public can view active categories" ON content_categories FOR SELECT USING (status = 'active');

-- RLS Policies for featured_work
DROP POLICY IF EXISTS "Admins can view all featured work" ON featured_work;
CREATE POLICY "Admins can view all featured work" ON featured_work FOR SELECT USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Admins can insert featured work" ON featured_work;
CREATE POLICY "Admins can insert featured work" ON featured_work FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Admins can update featured work" ON featured_work;
CREATE POLICY "Admins can update featured work" ON featured_work FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Admins can delete featured work" ON featured_work;
CREATE POLICY "Admins can delete featured work" ON featured_work FOR DELETE USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Public can view active featured work" ON featured_work;
CREATE POLICY "Public can view active featured work" ON featured_work FOR SELECT USING (status = 'active');

-- RLS Policies for success_stories
DROP POLICY IF EXISTS "Admins can view all success stories" ON success_stories;
CREATE POLICY "Admins can view all success stories" ON success_stories FOR SELECT USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Admins can insert success stories" ON success_stories;
CREATE POLICY "Admins can insert success stories" ON success_stories FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Admins can update success stories" ON success_stories;
CREATE POLICY "Admins can update success stories" ON success_stories FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Admins can delete success stories" ON success_stories;
CREATE POLICY "Admins can delete success stories" ON success_stories FOR DELETE USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Users can view their own success stories" ON success_stories;
CREATE POLICY "Users can view their own success stories" ON success_stories FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public can view approved success stories" ON success_stories;
CREATE POLICY "Public can view approved success stories" ON success_stories FOR SELECT USING (status = 'published');

-- RLS Policies for recent_projects
DROP POLICY IF EXISTS "Admins can view all recent projects" ON recent_projects;
CREATE POLICY "Admins can view all recent projects" ON recent_projects FOR SELECT USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Admins can insert recent projects" ON recent_projects;
CREATE POLICY "Admins can insert recent projects" ON recent_projects FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Admins can update recent projects" ON recent_projects;
CREATE POLICY "Admins can update recent projects" ON recent_projects FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Admins can delete recent projects" ON recent_projects;
CREATE POLICY "Admins can delete recent projects" ON recent_projects FOR DELETE USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);
DROP POLICY IF EXISTS "Public can view active recent projects" ON recent_projects;
CREATE POLICY "Public can view active recent projects" ON recent_projects FOR SELECT USING (is_active = true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_content_categories_updated_at ON content_categories;
CREATE TRIGGER update_content_categories_updated_at BEFORE UPDATE ON content_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_featured_work_updated_at ON featured_work;
CREATE TRIGGER update_featured_work_updated_at BEFORE UPDATE ON featured_work
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_success_stories_updated_at ON success_stories;
CREATE TRIGGER update_success_stories_updated_at BEFORE UPDATE ON success_stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_recent_projects_updated_at ON recent_projects;
CREATE TRIGGER update_recent_projects_updated_at BEFORE UPDATE ON recent_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
