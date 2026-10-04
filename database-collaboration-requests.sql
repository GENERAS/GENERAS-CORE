-- =====================================================
-- COLLABORATION REQUESTS TABLE
-- Proposals from people who have a project, an idea, or something to trade
-- (see the "Start a Project" form on /collaborate).
--
-- Kept separate from contact_submissions on purpose: a contact message is
-- "I have a question", a collaboration request is "here is what I want to
-- build and here is what I bring". The admin dashboard lists them separately
-- under Engagement > Collaborations.
--
-- Run this in your Supabase SQL Editor. Idempotent: safe to re-run.
-- =====================================================

CREATE TABLE IF NOT EXISTS collaboration_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  -- what they are proposing
  collaboration_type TEXT NOT NULL,
  project_title TEXT NOT NULL,
  project_summary TEXT NOT NULL,
  what_they_bring TEXT,
  tech_stack TEXT,
  budget_range TEXT,
  timeline TEXT,
  links TEXT,
  -- pipeline
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  admin_notes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep updated_at honest for status changes made from the admin dashboard.
CREATE OR REPLACE FUNCTION public.touch_collaboration_request()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS collaboration_requests_touch ON public.collaboration_requests;
CREATE TRIGGER collaboration_requests_touch
  BEFORE UPDATE ON public.collaboration_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_collaboration_request();

CREATE INDEX IF NOT EXISTS collaboration_requests_status_idx
  ON public.collaboration_requests (status);
CREATE INDEX IF NOT EXISTS collaboration_requests_created_idx
  ON public.collaboration_requests (created_at DESC);

-- Enable RLS
ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;

-- Public can submit a proposal (the form is on a public page)
DROP POLICY IF EXISTS "Public can insert collaboration requests" ON collaboration_requests;
CREATE POLICY "Public can insert collaboration requests" ON collaboration_requests
  FOR INSERT WITH CHECK (true);

-- Admin can read every proposal
DROP POLICY IF EXISTS "Admin can view collaboration requests" ON collaboration_requests;
CREATE POLICY "Admin can view collaboration requests" ON collaboration_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can move a proposal through the pipeline and add notes
DROP POLICY IF EXISTS "Admin can update collaboration requests" ON collaboration_requests;
CREATE POLICY "Admin can update collaboration requests" ON collaboration_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can delete a proposal
DROP POLICY IF EXISTS "Admin can delete collaboration requests" ON collaboration_requests;
CREATE POLICY "Admin can delete collaboration requests" ON collaboration_requests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Real-time so the sidebar badge updates without a refresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'collaboration_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_requests;
  END IF;
END
$$;