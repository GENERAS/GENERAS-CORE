-- =====================================================
-- SERVICE QUOTES TABLE
-- "Get a quote" requests from the Services page (/service).
--
-- Deliberately separate from:
--   mentorship_applications  -> paid cohort mentorship seats (payment proof)
--   project_inquiries        -> the older /hire-me custom project wizard
--   collaboration_requests   -> ideas/partnerships, not buying a service
--
-- So the dashboard can answer "who ordered what, and what did I quote them?"
-- Run this in your Supabase SQL Editor. Idempotent: safe to re-run.
-- =====================================================

CREATE TABLE IF NOT EXISTS service_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id TEXT NOT NULL UNIQUE,
  tracking_token TEXT DEFAULT gen_random_uuid()::text,

  -- What they want to buy (service_id is NULL for a custom build)
  service_id BIGINT,
  service_title TEXT,
  service_slug TEXT,
  need_key TEXT,
  custom_build BOOLEAN NOT NULL DEFAULT FALSE,

  -- What they told us
  project_summary TEXT NOT NULL,
  current_problem TEXT,
  budget_band TEXT,
  deadline TEXT,

  -- Who they are
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,

  -- What we quoted back (set from the admin dashboard)
  quoted_amount NUMERIC,
  quoted_currency TEXT NOT NULL DEFAULT 'USD',
  deposit_paid NUMERIC NOT NULL DEFAULT 0,
  quote_notes TEXT,
  quoted_at TIMESTAMPTZ,

  -- Pipeline
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  admin_notes_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'service_page',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Existing installs: every quote must get a tracking token, even if the
-- request never set one (used later for public quote tracking).
ALTER TABLE service_quotes ALTER COLUMN tracking_token SET DEFAULT gen_random_uuid()::text;
UPDATE service_quotes SET tracking_token = gen_random_uuid()::text WHERE tracking_token IS NULL;

CREATE OR REPLACE FUNCTION public.touch_service_quote()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status IN ('quoted', 'accepted') AND NEW.quoted_at IS NULL THEN
    NEW.quoted_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS service_quotes_touch ON public.service_quotes;
CREATE TRIGGER service_quotes_touch
  BEFORE UPDATE ON public.service_quotes
  FOR EACH ROW EXECUTE FUNCTION public.touch_service_quote();

CREATE INDEX IF NOT EXISTS service_quotes_status_idx ON public.service_quotes (status);
CREATE INDEX IF NOT EXISTS service_quotes_created_idx ON public.service_quotes (created_at DESC);
CREATE INDEX IF NOT EXISTS service_quotes_service_idx ON public.service_quotes (service_id);

-- Enable RLS
ALTER TABLE service_quotes ENABLE ROW LEVEL SECURITY;

-- Public can request a quote from the services page
DROP POLICY IF EXISTS "Public can insert service quotes" ON service_quotes;
CREATE POLICY "Public can insert service quotes" ON service_quotes
  FOR INSERT WITH CHECK (true);

-- Only admins read the pipeline
DROP POLICY IF EXISTS "Admin can view service quotes" ON service_quotes;
CREATE POLICY "Admin can view service quotes" ON service_quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins set the quoted amount, status, notes
DROP POLICY IF EXISTS "Admin can update service quotes" ON service_quotes;
CREATE POLICY "Admin can update service quotes" ON service_quotes
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

DROP POLICY IF EXISTS "Admin can delete service quotes" ON service_quotes;
CREATE POLICY "Admin can delete service quotes" ON service_quotes
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
      AND tablename = 'service_quotes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE service_quotes;
  END IF;
END
$$;