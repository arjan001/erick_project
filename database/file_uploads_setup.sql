-- ============================================
-- FILE UPLOADS BUCKET SETUP
-- ============================================
-- This creates a general file uploads bucket with:
-- - 50MB max file size limit
-- - Block .exe files and other dangerous executables
-- - Support for common file types (txt, pdf, images, zip, etc.)

-- Create the file-uploads bucket with 50MB max file size
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('file-uploads', 'file-uploads', false, 52428800) -- 50MB in bytes
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES FOR FILE UPLOADS
-- ============================================

-- Authenticated users can upload files
CREATE POLICY "Authenticated can upload files" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'file-uploads' 
  AND auth.role() = 'authenticated'
  AND (
    -- Block dangerous file extensions
    LOWER(name) NOT LIKE '%.exe'
    AND LOWER(name) NOT LIKE '%.bat'
    AND LOWER(name) NOT LIKE '%.cmd'
    AND LOWER(name) NOT LIKE '%.scr'
    AND LOWER(name) NOT LIKE '%.pif'
    AND LOWER(name) NOT LIKE '%.com'
    AND LOWER(name) NOT LIKE '%.vbs'
    AND LOWER(name) NOT LIKE '%.js'
    AND LOWER(name) NOT LIKE '%.jar'
    AND LOWER(name) NOT LIKE '%.app'
    AND LOWER(name) NOT LIKE '%.deb'
    AND LOWER(name) NOT LIKE '%.rpm'
    AND LOWER(name) NOT LIKE '%.dmg'
    AND LOWER(name) NOT LIKE '%.msi'
    AND LOWER(name) NOT LIKE '%.sh'
    AND LOWER(name) NOT LIKE '%.ps1'
  )
);

-- Users can only read their own uploaded files
CREATE POLICY "Users can read own files" ON storage.objects FOR SELECT
USING (
  bucket_id = 'file-uploads' 
  AND auth.uid() = owner
);

-- Users can update their own files
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE
USING (
  bucket_id = 'file-uploads' 
  AND auth.uid() = owner
);

-- Users can delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE
USING (
  bucket_id = 'file-uploads' 
  AND auth.uid() = owner
);

-- ============================================
-- SUPPORT TICKETS ATTACHMENTS BUCKET
-- ============================================

-- Create a dedicated bucket for support ticket attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('ticket-attachments', 'ticket-attachments', false, 52428800) -- 50MB
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload ticket attachments
CREATE POLICY "Authenticated can upload ticket attachments" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ticket-attachments' 
  AND auth.role() = 'authenticated'
  AND (
    -- Block dangerous file extensions
    LOWER(name) NOT LIKE '%.exe'
    AND LOWER(name) NOT LIKE '%.bat'
    AND LOWER(name) NOT LIKE '%.cmd'
    AND LOWER(name) NOT LIKE '%.scr'
    AND LOWER(name) NOT LIKE '%.pif'
    AND LOWER(name) NOT LIKE '%.com'
    AND LOWER(name) NOT LIKE '%.vbs'
    AND LOWER(name) NOT LIKE '%.js'
    AND LOWER(name) NOT LIKE '%.jar'
    AND LOWER(name) NOT LIKE '%.app'
    AND LOWER(name) NOT LIKE '%.deb'
    AND LOWER(name) NOT LIKE '%.rpm'
    AND LOWER(name) NOT LIKE '%.dmg'
    AND LOWER(name) NOT LIKE '%.msi'
    AND LOWER(name) NOT LIKE '%.sh'
    AND LOWER(name) NOT LIKE '%.ps1'
  )
);

-- Users can read their own ticket attachments
CREATE POLICY "Users can read own ticket attachments" ON storage.objects FOR SELECT
USING (
  bucket_id = 'ticket-attachments' 
  AND auth.uid() = owner
);

-- Users can update their own ticket attachments
CREATE POLICY "Users can update own ticket attachments" ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ticket-attachments' 
  AND auth.uid() = owner
);

-- Users can delete their own ticket attachments
CREATE POLICY "Users can delete own ticket attachments" ON storage.objects FOR DELETE
USING (
  bucket_id = 'ticket-attachments' 
  AND auth.uid() = owner
);

-- ============================================
-- MESSAGE ATTACHMENTS UPDATE (add file size limit)
-- ============================================

-- Update existing message-attachments bucket to have file size limit
-- Note: This may require recreating the bucket if file_size_limit wasn't set initially
-- If the bucket already exists without a limit, you may need to:
-- 1. Delete the bucket via Supabase dashboard
-- 2. Recreate it with the file size limit

-- For now, add policies to block .exe files from message-attachments
DROP POLICY IF EXISTS "Authenticated upload access" ON storage.objects;

CREATE POLICY "Authenticated upload access" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('profile-photos', 'portfolio-clips', 'project-images', 'team-logos', 'backer-logos', 'message-attachments', 'shop-images') 
  AND auth.role() = 'authenticated'
  AND (
    -- Only apply .exe blocking to message-attachments bucket
    bucket_id != 'message-attachments' 
    OR (
      bucket_id = 'message-attachments'
      AND LOWER(name) NOT LIKE '%.exe'
      AND LOWER(name) NOT LIKE '%.bat'
      AND LOWER(name) NOT LIKE '%.cmd'
      AND LOWER(name) NOT LIKE '%.scr'
      AND LOWER(name) NOT LIKE '%.pif'
      AND LOWER(name) NOT LIKE '%.com'
      AND LOWER(name) NOT LIKE '%.vbs'
      AND LOWER(name) NOT LIKE '%.js'
      AND LOWER(name) NOT LIKE '%.jar'
      AND LOWER(name) NOT LIKE '%.app'
      AND LOWER(name) NOT LIKE '%.deb'
      AND LOWER(name) NOT LIKE '%.rpm'
      AND LOWER(name) NOT LIKE '%.dmg'
      AND LOWER(name) NOT LIKE '%.msi'
      AND LOWER(name) NOT LIKE '%.sh'
      AND LOWER(name) NOT LIKE '%.ps1'
    )
  )
);
