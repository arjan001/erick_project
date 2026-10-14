-- Fix artist-profiles bucket to allow video uploads
-- Run this in Supabase SQL Editor

-- Update the artist-profiles bucket to allow video mime types
update storage.buckets
set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'],
    file_size_limit = 104857600 -- 100MB
where id = 'artist-profiles';
