-- Add saved_jobs table for artist/creator saved roles and productions
-- This allows users to save jobs they're interested in

DO $$
BEGIN
    -- Create saved_jobs table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_jobs') THEN
        CREATE TABLE public.saved_jobs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
            job_role_id UUID REFERENCES job_roles(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, job_id, job_role_id)
        );

        -- Add indexes for faster queries
        CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs(user_id);
        CREATE INDEX idx_saved_jobs_job_id ON public.saved_jobs(job_id);
        CREATE INDEX idx_saved_jobs_job_role_id ON public.saved_jobs(job_role_id);
        CREATE INDEX idx_saved_jobs_created_at ON public.saved_jobs(created_at DESC);

        -- Enable RLS
        ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

        -- RLS Policies
        -- Users can view their own saved jobs
        CREATE POLICY "Users can view own saved jobs"
            ON public.saved_jobs FOR SELECT
            USING (auth.uid() = user_id);

        -- Users can insert their own saved jobs
        CREATE POLICY "Users can insert own saved jobs"
            ON public.saved_jobs FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        -- Users can delete their own saved jobs
        CREATE POLICY "Users can delete own saved jobs"
            ON public.saved_jobs FOR DELETE
            USING (auth.uid() = user_id);

        -- Users can update their own saved jobs
        CREATE POLICY "Users can update own saved jobs"
            ON public.saved_jobs FOR UPDATE
            USING (auth.uid() = user_id);

        -- Trigger to update updated_at
        CREATE OR REPLACE FUNCTION update_saved_jobs_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trg_saved_jobs_updated_at ON public.saved_jobs;
        CREATE TRIGGER trg_saved_jobs_updated_at
            BEFORE UPDATE ON public.saved_jobs
            FOR EACH ROW
            EXECUTE FUNCTION update_saved_jobs_updated_at();

        RAISE NOTICE 'saved_jobs table created successfully';
    ELSE
        RAISE NOTICE 'saved_jobs table already exists';
    END IF;
END $$;
