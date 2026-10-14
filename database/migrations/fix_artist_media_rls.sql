-- Fix RLS policies for artist_media table to allow uploads
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own media" ON public.artist_media;
DROP POLICY IF EXISTS "Users can view own media" ON public.artist_media;
DROP POLICY IF EXISTS "Users can update own media" ON public.artist_media;
DROP POLICY IF EXISTS "Users can delete own media" ON public.artist_media;

-- Enable RLS
ALTER TABLE public.artist_media ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert media
CREATE POLICY "Users can insert own media" ON public.artist_media
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to view all media (needed for portfolio display)
CREATE POLICY "Users can view all media" ON public.artist_media
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow users to update their own media
CREATE POLICY "Users can update own media" ON public.artist_media
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own media
CREATE POLICY "Users can delete own media" ON public.artist_media
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Allow service role full access
CREATE POLICY "Service role full access" ON public.artist_media
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
