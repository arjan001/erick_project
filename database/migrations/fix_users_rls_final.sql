-- Fix RLS policies on users table to allow registration and BrowseTalent
-- Run this in Supabase SQL Editor
-- This script properly handles existing policies

-- First, drop ALL existing policies on users table (IF EXISTS prevents errors)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can insert new users" ON public.users;
DROP POLICY IF EXISTS "Public can view all users" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all users (needed for BrowseTalent)
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anonymous users to view all users (needed for public talent browsing)
CREATE POLICY "Public can view all users" ON public.users
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to insert new users (needed for registration)
CREATE POLICY "Users can insert new users" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own profile only
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role to do everything (needed for system operations)
CREATE POLICY "Service role full access" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
