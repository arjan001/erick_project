-- Fix artist_media table to use artist_id instead of user_id
-- Run this in Supabase SQL Editor

-- Drop the table if it exists with wrong schema
DO $$
BEGIN
  -- Drop the table if it exists with wrong schema
  DROP TABLE IF EXISTS public.artist_media CASCADE;
END $$;

-- Recreate with correct schema matching the actual database
CREATE TABLE public.artist_media (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  artist_id uuid NOT NULL,
  media_type character varying NOT NULL CHECK (media_type::text = ANY (ARRAY['photo'::character varying, 'video'::character varying]::text[])),
  media_url text NOT NULL,
  thumbnail_url text,
  caption text,
  description text,
  order_index integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT artist_media_pkey PRIMARY KEY (id),
  CONSTRAINT fk_artist_media_artist FOREIGN KEY (artist_id) REFERENCES public.artists(id)
);

-- Create indexes
CREATE INDEX idx_artist_media_artist_id ON public.artist_media(artist_id);
CREATE INDEX idx_artist_media_type ON public.artist_media(media_type);
CREATE INDEX idx_artist_media_status ON public.artist_media(status);

-- Enable RLS
ALTER TABLE public.artist_media ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Artists can insert own media" ON public.artist_media
  FOR INSERT
  TO authenticated
  WITH CHECK (artist_id = auth.uid());

CREATE POLICY "Artists can view own media" ON public.artist_media
  FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid());

CREATE POLICY "Artists can update own media" ON public.artist_media
  FOR UPDATE
  TO authenticated
  USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

CREATE POLICY "Artists can delete own media" ON public.artist_media
  FOR DELETE
  TO authenticated
  USING (artist_id = auth.uid());

CREATE POLICY "Public can view approved media" ON public.artist_media
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Service role full access" ON public.artist_media
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
