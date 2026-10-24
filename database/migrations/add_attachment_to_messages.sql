-- Add attachment column to messages table
-- This fixes the error: "Could not find the 'attachment' column of 'messages' in the schema cache"

-- Add attachment column as JSONB to store file metadata
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS attachment JSONB;

-- Add comment to document the column structure
COMMENT ON COLUMN public.messages.attachment IS 'Stores attachment metadata: { url, type, name, size }';

-- The attachment structure:
-- {
--   url: string (Supabase Storage URL),
--   type: string (MIME type, e.g., 'image/jpeg', 'video/mp4', 'audio/webm'),
--   name: string (original filename),
--   size: number (file size in bytes)
-- }
