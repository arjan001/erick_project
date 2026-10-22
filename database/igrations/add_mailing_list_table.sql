-- Mailing List Table Migration
-- This creates mailing list table with proper schema
-- Run this in Supabase SQL Editor

-- Check if update_updated_at_column function exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Drop existing table if it exists to ensure clean slate
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
CREATE POLICY "Anyone can view mailing_list_subscribers" ON public.mailing_list_subscribers FOR SELECT USING (true);
CREATE POLICY "Admins can insert mailing_list_subscribers" ON public.mailing_list_subscribers FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can update mailing_list_subscribers" ON public.mailing_list_subscribers FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can delete mailing_list_subscribers" ON public.mailing_list_subscribers FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes
CREATE INDEX idx_mailing_list_subscribers_email ON public.mailing_list_subscribers(email);
CREATE INDEX idx_mailing_list_subscribers_status ON public.mailing_list_subscribers(status);

-- Updated_at trigger
CREATE TRIGGER update_mailing_list_subscribers_updated_at BEFORE UPDATE ON public.mailing_list_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
