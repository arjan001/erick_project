-- Create artist_media table for portfolio clips
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.artist_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- 'image', 'video', 'audio'
  title TEXT,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  file_size INTEGER,
  order_index INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_artist_media_artist_id ON public.artist_media(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_media_type ON public.artist_media(media_type);

-- Enable RLS
ALTER TABLE public.artist_media ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert own media" ON public.artist_media;
DROP POLICY IF EXISTS "Users can view own media" ON public.artist_media;
DROP POLICY IF EXISTS "Users can update own media" ON public.artist_media;
DROP POLICY IF EXISTS "Users can delete own media" ON public.artist_media;
DROP POLICY IF EXISTS "Users can view all media" ON public.artist_media;
DROP POLICY IF EXISTS "Service role full access" ON public.artist_media;

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
  USING (artist_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.creators WHERE id = artist_id AND user_id = auth.uid()
  ))
  WITH CHECK (artist_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.creators WHERE id = artist_id AND user_id = auth.uid()
  ));

-- Allow users to delete their own media
CREATE POLICY "Users can delete own media" ON public.artist_media
  FOR DELETE
  TO authenticated
  USING (artist_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.creators WHERE id = artist_id AND user_id = auth.uid()
  ));

-- Allow service role full access
CREATE POLICY "Service role full access" ON public.artist_media
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
