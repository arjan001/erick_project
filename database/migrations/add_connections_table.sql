-- Add connections table for networking and saved talent
-- This table handles both network connections and saved talent/creators

DO $$
BEGIN
    -- Create the update function if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE OR REPLACE FUNCTION public.update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'connections') THEN
        CREATE TABLE public.connections (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            requester_email TEXT NOT NULL,
            requester_type TEXT NOT NULL CHECK (requester_type IN ('artist', 'team', 'client', 'backer')),
            recipient_email TEXT NOT NULL,
            recipient_type TEXT NOT NULL CHECK (recipient_type IN ('artist', 'team', 'client', 'backer')),
            connection_type TEXT NOT NULL DEFAULT 'network' CHECK (connection_type IN ('network', 'saved')),
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'revoked', 'active')),
            message TEXT,
            connected_artist_id UUID,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Indexes for common queries
        CREATE INDEX idx_connections_requester ON public.connections(requester_email, status);
        CREATE INDEX idx_connections_recipient ON public.connections(recipient_email, status);
        CREATE INDEX idx_connections_type ON public.connections(connection_type, status);
        CREATE INDEX idx_connections_artist ON public.connections(connected_artist_id);

        -- Trigger for updated_at
        DROP TRIGGER IF EXISTS trg_connections_updated_at ON public.connections;
        CREATE TRIGGER trg_connections_updated_at
            BEFORE UPDATE ON public.connections
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();

        -- Comments
        COMMENT ON TABLE public.connections IS 'Network connections and saved talent/creators';
        COMMENT ON COLUMN public.connections.connection_type IS 'Type: network (friend/follow) or saved (bookmarked)';
        COMMENT ON COLUMN public.connections.connected_artist_id IS 'ID of the connected artist (for saved talent)';
    END IF;
END $$;
