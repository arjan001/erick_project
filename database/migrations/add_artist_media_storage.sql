-- Create artist-media storage bucket for artist photos and videos
-- Run this in Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artist-media',
  'artist-media',
  true,
  52428800, -- 50MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policies for artist-media bucket
-- Authenticated users can upload (we'll check artist_id in the application layer)
CREATE POLICY "Authenticated users can upload artist media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'artist-media');

-- Authenticated users can view artist media
CREATE POLICY "Authenticated users can view artist media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'artist-media');

-- Public can view artist media (for public profiles)
CREATE POLICY "Public can view artist media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'artist-media');

-- Authenticated users can delete their own files
CREATE POLICY "Authenticated users can delete artist media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'artist-media');

-- Authenticated users can update their own files
CREATE POLICY "Authenticated users can update artist media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'artist-media')
WITH CHECK (bucket_id = 'artist-media');
