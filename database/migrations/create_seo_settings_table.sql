-- Create missing seo_settings table
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_title TEXT,
  site_description TEXT,
  site_keywords TEXT[],
  og_image TEXT,
  twitter_image TEXT,
  default_meta_title TEXT,
  default_meta_description TEXT,
  robots_txt TEXT,
  sitemap_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
