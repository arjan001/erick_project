-- Remove all RLS policies from artist_media table to make it unrestricted
-- Run this in Supabase SQL Editor

-- Disable RLS entirely on artist_media table
ALTER TABLE public.artist_media DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on artist_media table
DROP POLICY IF EXISTS "Artists can insert own media" ON public.artist_media;
DROP POLICY IF EXISTS "Artists can view own media" ON public.artist_media;
DROP POLICY IF EXISTS "Artists can update own media" ON public.artist_media;
DROP POLICY IF EXISTS "Artists can delete own media" ON public.artist_media;
DROP POLICY IF EXISTS "Public can view approved media" ON public.artist_media;
DROP POLICY IF EXISTS "Service role full access" ON public.artist_media;
