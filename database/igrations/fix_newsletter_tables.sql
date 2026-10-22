-- Fix newsletter tables based on actual schema
-- The schema shows mailing_list table exists, newsletter_campaigns exists without status column
-- We need to add the missing columns to newsletter_campaigns
-- Run this in Supabase SQL Editor

-- Add missing columns to newsletter_campaigns
ALTER TABLE public.newsletter_campaigns 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sent_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS opened_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicked_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS template_id UUID,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to mailing_list
ALTER TABLE public.mailing_list
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create newsletter_templates table (doesn't exist in schema)
CREATE TABLE IF NOT EXISTS public.newsletter_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Enable RLS on newsletter_templates
ALTER TABLE public.newsletter_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for newsletter_templates
CREATE POLICY IF NOT EXISTS "Anyone can view newsletter_templates" ON public.newsletter_templates FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Admins can insert newsletter_templates" ON public.newsletter_templates FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY IF NOT EXISTS "Admins can update newsletter_templates" ON public.newsletter_templates FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY IF NOT EXISTS "Admins can delete newsletter_templates" ON public.newsletter_templates FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON public.newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_scheduled_for ON public.newsletter_campaigns(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_mailing_list_status ON public.mailing_list(status);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_newsletter_campaigns_updated_at ON public.newsletter_campaigns;
CREATE TRIGGER update_newsletter_campaigns_updated_at BEFORE UPDATE ON public.newsletter_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mailing_list_updated_at ON public.mailing_list;
CREATE TRIGGER update_mailing_list_updated_at BEFORE UPDATE ON public.mailing_list
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletter_templates_updated_at ON public.newsletter_templates;
CREATE TRIGGER update_newsletter_templates_updated_at BEFORE UPDATE ON public.newsletter_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
