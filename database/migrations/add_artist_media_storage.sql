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
ALTER TABLE storage.objects ENABLE ROW LEVEL ACCESS;

-- Policies for artist-media bucket
-- Artists can upload to their own folder
CREATE POLICY "Artists can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'artist-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Artists can view their own files
CREATE POLICY "Artists can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'artist-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Public can view approved artist media (for public profiles)
CREATE POLICY "Public can view artist media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'artist-media');

-- Artists can delete their own files
CREATE POLICY "Artists can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'artist-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Artists can update their own files
CREATE POLICY "Artists can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'artist-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'artist-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
