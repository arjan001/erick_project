-- Fix missing tables and columns

-- Check if saved_jobs table exists, if not create it
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID,
    job_title TEXT,
    company TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS trg_saved_jobs_updated_at ON saved_jobs;
CREATE TRIGGER trg_saved_jobs_updated_at BEFORE UPDATE ON saved_jobs
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Check if applications table exists, if not create it
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID,
    job_title TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    cover_letter TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS trg_applications_updated_at ON applications;
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on new tables
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own saved_jobs" ON saved_jobs;
DROP POLICY IF EXISTS "Users can insert saved_jobs" ON saved_jobs;
DROP POLICY IF EXISTS "Users can update own saved_jobs" ON saved_jobs;
DROP POLICY IF EXISTS "Users can delete own saved_jobs" ON saved_jobs;

DROP POLICY IF EXISTS "Users can view own applications" ON applications;
DROP POLICY IF EXISTS "Users can insert applications" ON applications;
DROP POLICY IF EXISTS "Users can update own applications" ON applications;
DROP POLICY IF EXISTS "Users can delete own applications" ON applications;

-- Create RLS policies for saved_jobs
CREATE POLICY "Users can view own saved_jobs" ON saved_jobs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert saved_jobs" ON saved_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own saved_jobs" ON saved_jobs
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own saved_jobs" ON saved_jobs
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for applications
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert applications" ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own applications" ON applications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own applications" ON applications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
