-- SEO Settings Table
CREATE TABLE IF NOT EXISTS seo_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Global Settings
    site_title VARCHAR(255) NOT NULL DEFAULT 'Studio22 - Premium Video Production Network',
    site_description TEXT NOT NULL DEFAULT 'Connect with world-class creators, teams, and production studios for your next project.',
    site_keywords TEXT DEFAULT 'video production, filmmakers, creators, studios',
    canonical_url VARCHAR(500) DEFAULT 'https://studio22.com',
    
    -- Sitemap Settings
    sitemap_enabled BOOLEAN DEFAULT true,
    sitemap_priority DECIMAL(2,1) DEFAULT 0.8,
    sitemap_change_freq VARCHAR(20) DEFAULT 'weekly',
    
    -- Robots.txt
    robots_txt TEXT DEFAULT 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/',
    
    -- Open Graph
    og_title VARCHAR(255) DEFAULT 'Studio22 - Premium Video Production Network',
    og_description TEXT DEFAULT 'Connect with world-class creators, teams, and production studios for your next project.',
    og_image VARCHAR(500) DEFAULT '',
    og_type VARCHAR(50) DEFAULT 'website',
    og_locale VARCHAR(10) DEFAULT 'en_US',
    
    -- Twitter Card
    twitter_card VARCHAR(50) DEFAULT 'summary_large_image',
    twitter_site VARCHAR(100) DEFAULT '@studio22',
    twitter_creator VARCHAR(100) DEFAULT '@studio22',
    twitter_image VARCHAR(500) DEFAULT '',
    
    -- JSON-LD Schema
    enable_schema BOOLEAN DEFAULT true,
    organization_name VARCHAR(255) DEFAULT 'Studio22',
    organization_logo VARCHAR(500) DEFAULT '',
    organization_url VARCHAR(500) DEFAULT 'https://studio22.com',
    same_as TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Advanced
    enable_analytics BOOLEAN DEFAULT false,
    google_analytics_id VARCHAR(50) DEFAULT '',
    enable_gtm BOOLEAN DEFAULT false,
    gtm_id VARCHAR(50) DEFAULT '',
    enable_facebook_pixel BOOLEAN DEFAULT false,
    facebook_pixel_id VARCHAR(50) DEFAULT ''
);

-- Page Metadata Table
CREATE TABLE IF NOT EXISTS page_seo_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Page Identification
    page_slug VARCHAR(255) UNIQUE NOT NULL,
    page_title VARCHAR(255) NOT NULL,
    
    -- Meta Tags
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    
    -- Canonical
    canonical_url VARCHAR(500),
    
    -- Open Graph (Page-specific)
    og_image VARCHAR(500),
    og_title VARCHAR(255),
    og_description TEXT,
    
    -- Indexing
    no_index BOOLEAN DEFAULT false,
    no_follow BOOLEAN DEFAULT false,
    
    -- Sitemap
    sitemap_priority DECIMAL(2,1) DEFAULT 0.8,
    sitemap_change_freq VARCHAR(20) DEFAULT 'weekly',
    
    -- Schema (Page-specific)
    schema_type VARCHAR(50) DEFAULT 'WebPage',
    schema_data JSONB DEFAULT '{}'::jsonb
);

-- Sitemap Generation Log
CREATE TABLE IF NOT EXISTS sitemap_generation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Generation Info
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'in_progress'
    url_count INTEGER DEFAULT 0,
    file_size_bytes INTEGER DEFAULT 0,
    error_message TEXT,
    
    -- Duration
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_seo_metadata_slug ON page_seo_metadata(page_slug);
CREATE INDEX IF NOT EXISTS idx_page_seo_metadata_no_index ON page_seo_metadata(no_index) WHERE no_index = false;
CREATE INDEX IF NOT EXISTS idx_sitemap_generation_log_status ON sitemap_generation_log(status);
CREATE INDEX IF NOT EXISTS idx_sitemap_generation_log_created_at ON sitemap_generation_log(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seo_settings_updated_at BEFORE UPDATE ON seo_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_seo_metadata_updated_at BEFORE UPDATE ON page_seo_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default SEO settings
INSERT INTO seo_settings (
    site_title,
    site_description,
    site_keywords,
    canonical_url,
    sitemap_enabled,
    sitemap_priority,
    sitemap_change_freq,
    robots_txt,
    og_title,
    og_description,
    og_type,
    og_locale,
    twitter_card,
    twitter_site,
    twitter_creator,
    enable_schema,
    organization_name,
    organization_url
) VALUES (
    'Studio22 - Premium Video Production Network',
    'Connect with world-class creators, teams, and production studios for your next project. The curated marketplace for video production projects.',
    'video production, filmmakers, creators, studios, production teams, commercial, music video, short film, documentary, branded content, corporate video',
    'https://studio22.com',
    true,
    0.8,
    'weekly',
    'User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://studio22.com/sitemap.xml',
    'Studio22 - Premium Video Production Network',
    'Connect with world-class creators, teams, and production studios for your next project.',
    'website',
    'en_US',
    'summary_large_image',
    '@studio22',
    '@studio22',
    true,
    'Studio22',
    'https://studio22.com'
) ON CONFLICT DO NOTHING;

-- Insert default page metadata
INSERT INTO page_seo_metadata (page_slug, page_title, meta_title, meta_description, canonical_url, no_index, sitemap_priority, sitemap_change_freq) VALUES
('/', 'Home', 'Studio22 - Premium Video Production Network', 'Connect with world-class creators, teams, and production studios for your next video project.', 'https://studio22.com/', false, 1.0, 'daily'),
('/Projects', 'Projects', 'Browse Video Production Projects | Studio22', 'Discover and apply to video production projects from brands and creators worldwide.', 'https://studio22.com/Projects', false, 0.9, 'daily'),
('/ApplyArtist', 'Creators', 'Join as Creator | Studio22', 'Create your profile and apply to video production projects on Studio22.', 'https://studio22.com/ApplyArtist', false, 0.8, 'weekly'),
('/ApplyTeam', 'Teams', 'Join as Production Team | Studio22', 'Register your production team and connect with clients seeking video production services.', 'https://studio22.com/ApplyTeam', false, 0.8, 'weekly'),
('/Services', 'Services', 'Our Services | Studio22', 'Learn about Studio22 services for video production, creator matching, and project management.', 'https://studio22.com/Services', false, 0.7, 'monthly'),
('/BackedProjects', 'Backed Projects', 'Backed Projects | Studio22', 'Explore film and video projects seeking funding and co-production partnerships.', 'https://studio22.com/BackedProjects', false, 0.8, 'daily')
ON CONFLICT (page_slug) DO NOTHING;
