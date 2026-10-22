-- Fix newsletter tables - match actual schema from supabase_schema.sql
-- Run this in Supabase SQL Editor

-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS public.newsletter_campaigns CASCADE;
DROP TABLE IF EXISTS public.newsletter_templates CASCADE;

-- Recreate newsletter_campaigns with actual schema (from supabase_schema.sql)
CREATE TABLE public.newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  opened INTEGER DEFAULT 0,
  clicked INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletter_templates table
CREATE TABLE public.newsletter_templates (
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

-- Add missing columns to mailing_list (mailing_list exists in schema)
ALTER TABLE public.mailing_list
ADD COLUMN name TEXT,
ADD COLUMN unsubscribed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- DISABLE RLS on all tables
ALTER TABLE public.newsletter_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailing_list DISABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_newsletter_campaigns_sent_at ON public.newsletter_campaigns(sent_at);
CREATE INDEX idx_mailing_list_status ON public.mailing_list(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables with updated_at
DROP TRIGGER IF EXISTS update_mailing_list_updated_at ON public.mailing_list;
CREATE TRIGGER update_mailing_list_updated_at BEFORE UPDATE ON public.mailing_list
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletter_templates_updated_at ON public.newsletter_templates;
CREATE TRIGGER update_newsletter_templates_updated_at BEFORE UPDATE ON public.newsletter_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
