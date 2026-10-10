-- Add SEO and CMS tables for SmartGigs Kenya
-- This migration adds SEO settings and enhances the existing cms_pages table

-- Create seo_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.seo_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_title TEXT,
    site_description TEXT,
    site_keywords TEXT,
    canonical_url TEXT,
    sitemap_enabled BOOLEAN DEFAULT true,
    sitemap_priority DECIMAL DEFAULT 0.8,
    sitemap_change_freq TEXT DEFAULT 'weekly',
    robots_txt TEXT,
    -- Open Graph settings
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    og_type TEXT DEFAULT 'website',
    og_locale TEXT DEFAULT 'en_US',
    -- Twitter Card settings
    twitter_card TEXT DEFAULT 'summary_large_image',
    twitter_site TEXT,
    twitter_creator TEXT,
    twitter_image TEXT,
    -- Schema.org settings
    enable_schema BOOLEAN DEFAULT true,
    organization_name TEXT,
    organization_logo TEXT,
    organization_url TEXT,
    same_as TEXT[], -- Array of social media URLs
    -- Analytics settings
    enable_analytics BOOLEAN DEFAULT false,
    google_analytics_id TEXT,
    enable_gtm BOOLEAN DEFAULT false,
    gtm_id TEXT,
    enable_facebook_pixel BOOLEAN DEFAULT false,
    facebook_pixel_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop trigger if exists, then create it
DROP TRIGGER IF EXISTS trg_seo_settings_updated_at ON public.seo_settings;
CREATE TRIGGER trg_seo_settings_updated_at
    BEFORE UPDATE ON public.seo_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.seo_settings IS 'Global SEO settings for the website';
COMMENT ON COLUMN public.seo_settings.site_title IS 'Default site title';
COMMENT ON COLUMN public.seo_settings.site_description IS 'Default site description';
COMMENT ON COLUMN public.seo_settings.site_keywords IS 'Default site keywords (comma-separated)';
COMMENT ON COLUMN public.seo_settings.og_image IS 'Default Open Graph image URL';

-- Enhance existing cms_pages table with additional SEO fields
-- Add columns if they don't exist
DO $$
BEGIN
    -- Check and add meta_keywords if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cms_pages'
        AND column_name = 'meta_keywords'
    ) THEN
        ALTER TABLE public.cms_pages ADD COLUMN meta_keywords TEXT;
    END IF;

    -- Check and add canonical_url if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cms_pages'
        AND column_name = 'canonical_url'
    ) THEN
        ALTER TABLE public.cms_pages ADD COLUMN canonical_url TEXT;
    END IF;

    -- Check and add og_image if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cms_pages'
        AND column_name = 'og_image'
    ) THEN
        ALTER TABLE public.cms_pages ADD COLUMN og_image TEXT;
    END IF;

    -- Check and add og_type if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cms_pages'
        AND column_name = 'og_type'
    ) THEN
        ALTER TABLE public.cms_pages ADD COLUMN og_type TEXT DEFAULT 'website';
    END IF;

    -- Check and add no_index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cms_pages'
        AND column_name = 'no_index'
    ) THEN
        ALTER TABLE public.cms_pages ADD COLUMN no_index BOOLEAN DEFAULT false;
    END IF;

    -- Check and add sitemap_priority if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cms_pages'
        AND column_name = 'sitemap_priority'
    ) THEN
        ALTER TABLE public.cms_pages ADD COLUMN sitemap_priority DECIMAL DEFAULT 0.8;
    END IF;

    -- Check and add sitemap_change_freq if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cms_pages'
        AND column_name = 'sitemap_change_freq'
    ) THEN
        ALTER TABLE public.cms_pages ADD COLUMN sitemap_change_freq TEXT DEFAULT 'weekly';
    END IF;

    -- Check and add is_published if it doesn't exist (published might exist)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cms_pages'
        AND column_name = 'is_published'
    ) THEN
        ALTER TABLE public.cms_pages ADD COLUMN is_published BOOLEAN DEFAULT true;
    END IF;

    -- Check and add published_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cms_pages'
        AND column_name = 'published_at'
    ) THEN
        ALTER TABLE public.cms_pages ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

COMMENT ON COLUMN public.cms_pages.slug IS 'URL slug for the page (e.g., /about)';
COMMENT ON COLUMN public.cms_pages.no_index IS 'Whether to exclude this page from search engines';

-- Insert default SEO settings if they don't exist
INSERT INTO public.seo_settings (
    site_title,
    site_description,
    site_keywords,
    canonical_url,
    og_title,
    og_description,
    organization_name,
    organization_url
)
VALUES (
    'SmartGigs Kenya - The Place to Get Hired for Theater, Film, and TV',
    'SmartGigs Kenya connects actors, crew, producers, and casting directors. Find casting calls, auditions, and jobs in the Kenyan film industry.',
    'acting jobs, casting calls, auditions, film jobs, TV jobs, theater jobs, Kenya, actors, crew, producers, casting directors, voiceover, UGC, lip sync, modeling, extras, background actors',
    'https://smartgigskenya.com',
    'SmartGigs Kenya - The Place to Get Hired for Theater, Film, and TV',
    'SmartGigs Kenya connects actors, crew, producers, and casting directors. Find casting calls, auditions, and jobs in the Kenyan film industry.',
    'SmartGigs Kenya',
    'https://smartgigskenya.com'
)
ON CONFLICT DO NOTHING;

-- RLS Policies for seo_settings
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage SEO settings" ON public.seo_settings;
CREATE POLICY "Admins can manage SEO settings"
    ON public.seo_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Authenticated users can read SEO settings" ON public.seo_settings;
CREATE POLICY "Authenticated users can read SEO settings"
    ON public.seo_settings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- RLS Policies for cms_pages (update existing if needed)
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage CMS pages" ON public.cms_pages;
CREATE POLICY "Admins can manage CMS pages"
    ON public.cms_pages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Published pages are public" ON public.cms_pages;
CREATE POLICY "Published pages are public"
    ON public.cms_pages
    FOR SELECT
    USING (published = true OR is_published = true);

DROP POLICY IF EXISTS "Authenticated users can read all CMS pages" ON public.cms_pages;
CREATE POLICY "Authenticated users can read all CMS pages"
    ON public.cms_pages
    FOR SELECT
    USING (auth.role() = 'authenticated');
