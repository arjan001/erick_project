-- Create mailing list table if it doesn't exist
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.mailing_list_subscribers (
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
CREATE INDEX IF NOT EXISTS idx_mailing_list_subscribers_email ON public.mailing_list_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_mailing_list_subscribers_status ON public.mailing_list_subscribers(status);

-- Updated_at trigger
CREATE TRIGGER update_mailing_list_subscribers_updated_at BEFORE UPDATE ON public.mailing_list_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
