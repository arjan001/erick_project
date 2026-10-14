-- Fix RLS policies on users table to allow registration
-- Run this in Supabase SQL Editor

-- Drop existing RLS policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create new permissive policies for development
-- Allow authenticated users to view all users (needed for BrowseTalent)
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert new users (needed for registration)
CREATE POLICY "Users can insert new users" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow service role to do everything (needed for system operations)
CREATE POLICY "Service role full access" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
