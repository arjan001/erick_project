-- Create connections table for networking
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  connected_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  connection_type TEXT DEFAULT 'network', -- 'network', 'project', 'collaboration'
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'blocked'
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON public.connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_connected_user_id ON public.connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can insert connections" ON public.connections;
DROP POLICY IF EXISTS "Users can update own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can delete own connections" ON public.connections;
DROP POLICY IF EXISTS "Service role full access" ON public.connections;

-- Allow authenticated users to view connections
CREATE POLICY "Users can view own connections" ON public.connections
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR connected_user_id = auth.uid());

-- Allow authenticated users to insert connections
CREATE POLICY "Users can insert connections" ON public.connections
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own connections
CREATE POLICY "Users can update own connections" ON public.connections
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR connected_user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() OR connected_user_id = auth.uid());

-- Allow users to delete their own connections
CREATE POLICY "Users can delete own connections" ON public.connections
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR connected_user_id = auth.uid());

-- Allow service role full access
CREATE POLICY "Service role full access" ON public.connections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
