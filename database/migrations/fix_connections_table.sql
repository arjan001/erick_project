-- Fix connections table column name from connected_artist_id to connected_user_id
-- Run this in Supabase SQL Editor

-- First, check if table exists and has the old column
DO $$
BEGIN
  -- Drop the table if it exists with wrong schema
  DROP TABLE IF EXISTS public.connections CASCADE;
END $$;

-- Recreate with correct schema
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  connected_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  connection_type TEXT DEFAULT 'network',
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- Create indexes
CREATE INDEX idx_connections_user_id ON public.connections(user_id);
CREATE INDEX idx_connections_connected_user_id ON public.connections(connected_user_id);
CREATE INDEX idx_connections_status ON public.connections(status);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own connections" ON public.connections
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR connected_user_id = auth.uid());

CREATE POLICY "Users can insert connections" ON public.connections
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own connections" ON public.connections
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR connected_user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() OR connected_user_id = auth.uid());

CREATE POLICY "Users can delete own connections" ON public.connections
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR connected_user_id = auth.uid());

CREATE POLICY "Service role full access" ON public.connections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
