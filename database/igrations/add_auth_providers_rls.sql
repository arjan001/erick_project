-- Add RLS policies for auth_providers table
-- Run this in Supabase SQL Editor

-- Enable RLS on auth_providers
ALTER TABLE public.auth_providers ENABLE ROW LEVEL SECURITY;

-- Create policies for auth_providers
DROP POLICY IF EXISTS "Anyone can view auth providers" ON public.auth_providers;
CREATE POLICY "Anyone can view auth providers" ON public.auth_providers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage auth providers" ON public.auth_providers;
CREATE POLICY "Admins can manage auth providers" ON public.auth_providers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
