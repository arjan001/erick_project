-- Fix RLS policies on client-profiles storage bucket
-- Disable all policies to allow public uploads for client profile images

ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('client-profiles', 'client-profiles', true, 10485760, 'image/*')
ON CONFLICT (id) DO UPDATE SET public = true;

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Allow public access for uploads
CREATE POLICY "Public Upload" ON storage.objects
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read" ON storage.objects
FOR SELECT USING (true);

CREATE POLICY "Public Update" ON storage.objects
FOR UPDATE WITH CHECK (true);

CREATE POLICY "Public Delete" ON storage.objects
FOR DELETE WITH CHECK (true);
