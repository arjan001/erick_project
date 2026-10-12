-- Add connections table for networking and saved talent
-- This table handles both network connections and saved talent/creators
-- MIGRATION NOTE: This table now uses user_id instead of email for foreign key relationships

-- Check if table exists and drop it first to recreate with correct schema
DROP TABLE IF EXISTS public.connections CASCADE;

-- Create connections table with correct schema (user_id, connected_artist_id)
CREATE TABLE public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    connected_artist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    connection_type TEXT NOT NULL DEFAULT 'network' CHECK (connection_type IN ('network', 'saved', 'team')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_connection UNIQUE (user_id, connected_artist_id),
    CONSTRAINT no_self_connection CHECK (user_id != connected_artist_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON public.connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_connected_artist_id ON public.connections(connected_artist_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_type ON public.connections(connection_type);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_connections_updated_at ON public.connections;
CREATE TRIGGER trg_connections_updated_at
    BEFORE UPDATE ON public.connections
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Comments
COMMENT ON TABLE public.connections IS 'Network connections between users';
COMMENT ON COLUMN public.connections.user_id IS 'User ID of the person making the connection';
COMMENT ON COLUMN public.connections.connected_artist_id IS 'User ID of the connected artist/user';
COMMENT ON COLUMN public.connections.connection_type IS 'Type: network, saved, team';
COMMENT ON COLUMN public.connections.status IS 'Status: pending, accepted, rejected, blocked';
