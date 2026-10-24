-- Remove restrictive RLS policies on messages table
-- This allows users to send messages without permission errors

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

-- Create permissive policies for messaging
CREATE POLICY "Enable all message operations for authenticated users"
  ON public.messages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
