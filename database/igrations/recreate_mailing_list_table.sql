-- Recreate mailing list table with correct schema
-- This will drop existing table and recreate it with proper structure
-- Run this in Supabase SQL Editor

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.mailing_list_subscribers CASCADE;

-- Create mailing list table
CREATE TABLE public.mailing_list_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'landing', 'footer', 'import', 'admin')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mailing_list_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view mailing_list_subscribers" ON public.mailing_list_subscribers;
DROP POLICY IF EXISTS "Admins can insert mailing_list_subscribers" ON public.mailing_list_subscribers;
DROP POLICY IF EXISTS "Admins can update mailing_list_subscribers" ON public.mailing_list_subscribers;
DROP POLICY IF EXISTS "Admins can delete mailing_list_subscribers" ON public.mailing_list_subscribers;

CREATE POLICY "Anyone can view mailing_list_subscribers" ON public.mailing_list_subscribers FOR SELECT USING (true);
CREATE POLICY "Admins can insert mailing_list_subscribers" ON public.mailing_list_subscribers FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update mailing_list_subscribers" ON public.mailing_list_subscribers FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete mailing_list_subscribers" ON public.mailing_list_subscribers FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes
DROP INDEX IF EXISTS idx_mailing_list_subscribers_email;
DROP INDEX IF EXISTS idx_mailing_list_subscribers_status;

CREATE INDEX idx_mailing_list_subscribers_email ON public.mailing_list_subscribers(email);
CREATE INDEX idx_mailing_list_subscribers_status ON public.mailing_list_subscribers(status);

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_mailing_list_subscribers_updated_at ON public.mailing_list_subscribers;

CREATE TRIGGER update_mailing_list_subscribers_updated_at BEFORE UPDATE ON public.mailing_list_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
