-- Add attachment column to messages table
-- Run this in Supabase SQL Editor

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS attachment JSONB;

-- Add index for attachment column if needed
CREATE INDEX IF NOT EXISTS idx_messages_attachment ON public.messages USING GIN (attachment);
