-- Recreate newsletter tables with correct schema
-- This will drop existing tables and recreate them with proper structure
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.newsletter_campaigns CASCADE;
DROP TABLE IF EXISTS public.newsletter_templates CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;

-- Newsletter Subscribers Table
CREATE TABLE public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'landing', 'footer', 'import')),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Campaigns Table
CREATE TABLE public.newsletter_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_id UUID,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Templates Table
CREATE TABLE public.newsletter_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'welcome', 'update', 'promotion', 'announcement')),
  subject TEXT,
  html_content TEXT,
  text_content TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for newsletter_subscribers
DROP POLICY IF EXISTS "Anyone can view newsletter_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can insert newsletter_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can update newsletter_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can delete newsletter_subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can view newsletter_subscribers" ON public.newsletter_subscribers FOR SELECT USING (true);
CREATE POLICY "Admins can insert newsletter_subscribers" ON public.newsletter_subscribers FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update newsletter_subscribers" ON public.newsletter_subscribers FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete newsletter_subscribers" ON public.newsletter_subscribers FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for newsletter_campaigns
DROP POLICY IF EXISTS "Anyone can view newsletter_campaigns" ON public.newsletter_campaigns;
DROP POLICY IF EXISTS "Admins can insert newsletter_campaigns" ON public.newsletter_campaigns;
DROP POLICY IF EXISTS "Admins can update newsletter_campaigns" ON public.newsletter_campaigns;
DROP POLICY IF EXISTS "Admins can delete newsletter_campaigns" ON public.newsletter_campaigns;

CREATE POLICY "Anyone can view newsletter_campaigns" ON public.newsletter_campaigns FOR SELECT USING (true);
CREATE POLICY "Admins can insert newsletter_campaigns" ON public.newsletter_campaigns FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update newsletter_campaigns" ON public.newsletter_campaigns FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete newsletter_campaigns" ON public.newsletter_campaigns FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for newsletter_templates
DROP POLICY IF EXISTS "Anyone can view newsletter_templates" ON public.newsletter_templates;
DROP POLICY IF EXISTS "Admins can insert newsletter_templates" ON public.newsletter_templates;
DROP POLICY IF EXISTS "Admins can update newsletter_templates" ON public.newsletter_templates;
DROP POLICY IF EXISTS "Admins can delete newsletter_templates" ON public.newsletter_templates;

CREATE POLICY "Anyone can view newsletter_templates" ON public.newsletter_templates FOR SELECT USING (true);
CREATE POLICY "Admins can insert newsletter_templates" ON public.newsletter_templates FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update newsletter_templates" ON public.newsletter_templates FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete newsletter_templates" ON public.newsletter_templates FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for better performance
DROP INDEX IF EXISTS idx_newsletter_subscribers_email;
DROP INDEX IF EXISTS idx_newsletter_subscribers_status;
DROP INDEX IF EXISTS idx_newsletter_campaigns_status;
DROP INDEX IF EXISTS idx_newsletter_campaigns_scheduled_for;

CREATE INDEX idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON public.newsletter_subscribers(status);
CREATE INDEX idx_newsletter_campaigns_status ON public.newsletter_campaigns(status);
CREATE INDEX idx_newsletter_campaigns_scheduled_for ON public.newsletter_campaigns(scheduled_for);

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_newsletter_subscribers_updated_at ON public.newsletter_subscribers;
DROP TRIGGER IF EXISTS update_newsletter_campaigns_updated_at ON public.newsletter_campaigns;
DROP TRIGGER IF EXISTS update_newsletter_templates_updated_at ON public.newsletter_templates;

CREATE TRIGGER update_newsletter_subscribers_updated_at BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_campaigns_updated_at BEFORE UPDATE ON public.newsletter_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_templates_updated_at BEFORE UPDATE ON public.newsletter_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
