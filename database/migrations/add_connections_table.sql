-- Add connections table for networking and saved talent
-- This table handles both network connections and saved talent/creators
-- MIGRATION NOTE: This table now uses user_id instead of email for foreign key relationships

-- Create connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_connection UNIQUE (requester_id, receiver_id),
    CONSTRAINT no_self_connection CHECK (requester_id != receiver_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_connections_requester_id ON public.connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver_id ON public.connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_connections_updated_at ON public.connections;
CREATE TRIGGER trg_connections_updated_at
    BEFORE UPDATE ON public.connections
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Comments
COMMENT ON TABLE public.connections IS 'Network connections between users';
COMMENT ON COLUMN public.connections.requester_id IS 'User ID of the person who sent the connection request';
COMMENT ON COLUMN public.connections.receiver_id IS 'User ID of the person who received the connection request';
COMMENT ON COLUMN public.connections.status IS 'Status: pending, accepted, rejected, blocked';
