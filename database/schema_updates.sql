-- Featured Works Table
-- Stores works that artists have paid to feature or are featured via subscription
CREATE TABLE IF NOT EXISTS featured_works (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  featured_type VARCHAR(50) DEFAULT 'paid', -- 'paid', 'subscription', 'admin_pick'
  featured_until TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'suspended'
  payment_id UUID REFERENCES subscription_orders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Success Stories Table
-- Stores success stories for the success stories section
CREATE TABLE IF NOT EXISTS success_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  client_id UUID REFERENCES project_owners(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  story TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  testimonial TEXT,
  score DECIMAL(2,1) DEFAULT 0.0,
  category VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work Approvals Table
-- Stores work submissions awaiting admin approval
CREATE TABLE IF NOT EXISTS work_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submitter_type VARCHAR(20) NOT NULL, -- 'artist', 'client'
  submitter_id UUID NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  rejection_reason TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  randomize BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recently Posted Projects View
-- This will be queried from the existing projects table with a limit
-- No new table needed, just query projects with ORDER BY created_at DESC LIMIT 4

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_featured_works_artist_id ON featured_works(artist_id);
CREATE INDEX IF NOT EXISTS idx_featured_works_status ON featured_works(status);
CREATE INDEX IF NOT EXISTS idx_featured_works_featured_type ON featured_works(featured_type);
CREATE INDEX IF NOT EXISTS idx_success_stories_status ON success_stories(status);
CREATE INDEX IF NOT EXISTS idx_success_stories_is_featured ON success_stories(is_featured);
CREATE INDEX IF NOT EXISTS idx_work_approvals_status ON work_approvals(status);
CREATE INDEX IF NOT EXISTS idx_work_approvals_submitter ON work_approvals(submitter_type, submitter_id);

-- Row Level Security Policies
ALTER TABLE featured_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_approvals ENABLE ROW LEVEL SECURITY;

-- Featured Works RLS Policies
CREATE POLICY "Admins can view all featured works" ON featured_works
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can insert featured works" ON featured_works
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update featured works" ON featured_works
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete featured works" ON featured_works
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public can view active featured works" ON featured_works
  FOR SELECT USING (status = 'active');

-- Success Stories RLS Policies
CREATE POLICY "Admins can view all success stories" ON success_stories
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can insert success stories" ON success_stories
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update success stories" ON success_stories
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete success stories" ON success_stories
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public can view published success stories" ON success_stories
  FOR SELECT USING (status = 'published');

-- Work Approvals RLS Policies
CREATE POLICY "Admins can view all work approvals" ON work_approvals
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can insert work approvals" ON work_approvals
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update work approvals" ON work_approvals
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete work approvals" ON work_approvals
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Submitters can view their own work approvals" ON work_approvals
  FOR SELECT USING (
    (submitter_type = 'artist' AND submitter_id = auth.uid()) OR
    (submitter_type = 'client' AND submitter_id = auth.uid())
  );

CREATE POLICY "Submitters can insert work approvals" ON work_approvals
  FOR INSERT WITH CHECK (
    (submitter_type = 'artist' AND submitter_id = auth.uid()) OR
    (submitter_type = 'client' AND submitter_id = auth.uid())
  );
