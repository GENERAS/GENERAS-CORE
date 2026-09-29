-- =====================================================
-- Add service tracking to project_inquiries
-- Lets a quote request carry the service category the user
-- clicked "Get Quote" on, so the admin dashboard can show
-- which service the inquiry is for.
-- Safe to run more than once.
-- =====================================================

ALTER TABLE project_inquiries
  ADD COLUMN IF NOT EXISTS service TEXT;

ALTER TABLE project_inquiries
  ADD COLUMN IF NOT EXISTS service_name TEXT;

-- Index so the dashboard can filter/sort by service
CREATE INDEX IF NOT EXISTS idx_project_inquiries_service
  ON project_inquiries(service);

-- Backfill: nothing to do, existing rows keep service = NULL
