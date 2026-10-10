-- Create artist-media storage bucket for artist photos and videos
-- NOTE: This migration requires admin privileges to run
-- If you get "must be owner of table objects" error, create the bucket manually in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Click "New bucket"
-- 3. Name it "artist-media"
-- 4. Make it public
-- 5. Set file size limit to 50MB
-- 6. Allowed MIME types: image/jpeg, image/png, image/webp, image/gif, video/mp4, video/quicktime, video/webm

-- Create the storage bucket (requires admin privileges)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets
        WHERE id = 'artist-media'
    ) THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'artist-media',
            'artist-media',
            true,
            52428800, -- 50MB max file size
            ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
        );
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- If we can't create the bucket (likely permission issue), just log it
    RAISE NOTICE 'Could not create storage bucket (may need admin privileges): %', SQLERRM;
END $$;

-- NOTE: Storage policies require admin privileges to modify storage.objects table
-- These should be configured in Supabase Dashboard under Storage > artist-media > Policies
-- Recommended policies:
-- 1. Public read access (for viewing approved media)
-- 2. Authenticated upload access (for artists uploading their media)
-- 3. Authenticated delete access (for artists managing their media)
