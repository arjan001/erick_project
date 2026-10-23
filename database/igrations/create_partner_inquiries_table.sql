-- Create partner_inquiries table for contact form
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.partner_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  phone_number TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trg_partner_inquiries_updated_at ON public.partner_inquiries;
CREATE TRIGGER trg_partner_inquiries_updated_at BEFORE UPDATE ON public.partner_inquiries FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
