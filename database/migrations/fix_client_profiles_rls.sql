-- Fix RLS policies on client-profiles storage bucket
-- Note: The bucket should already exist in Supabase Storage
-- This migration sets up proper RLS policies for client profile images

-- Allow authenticated users to upload to client-profiles bucket
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-profiles');

-- Allow public read access to client-profiles bucket
CREATE POLICY "Public Read Client Profiles" ON storage.objects
FOR SELECT
USING (bucket_id = 'client-profiles');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated Update Own" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'client-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated Delete Own" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'client-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
