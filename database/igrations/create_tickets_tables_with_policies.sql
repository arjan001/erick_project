-- Check if support_tickets table exists and create if not
-- Run this in Supabase SQL Editor

-- Create support_tickets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_responses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ticket_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_admin BOOLEAN DEFAULT false,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_ticket_responses_ticket_id ON public.ticket_responses(ticket_id);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for support_tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id OR is_public = true);

DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tickets" ON public.support_tickets;
CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can update all tickets" ON public.support_tickets;
CREATE POLICY "Admins can update all tickets" ON public.support_tickets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Create policies for ticket_responses
DROP POLICY IF EXISTS "Users can view responses for their tickets" ON public.ticket_responses;
CREATE POLICY "Users can view responses for their tickets" ON public.ticket_responses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets st
    WHERE st.id = ticket_responses.ticket_id 
    AND (st.user_id = auth.uid() OR st.is_public = true)
  )
);

DROP POLICY IF EXISTS "Users can create responses" ON public.ticket_responses;
CREATE POLICY "Users can create responses" ON public.ticket_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all responses" ON public.ticket_responses;
CREATE POLICY "Admins can view all responses" ON public.ticket_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_ticket_responses_updated_at ON public.ticket_responses;
CREATE TRIGGER trg_ticket_responses_updated_at BEFORE UPDATE ON public.ticket_responses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
