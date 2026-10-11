-- =====================================================
-- CONTACT SUBMISSIONS — DIVISION COLUMN
-- Adds the optional `division` field so an enquiry from the
-- GENERAS CORE portal (/core/contact) can record which
-- division it concerns (e.g. generas-digital).
--
-- The contact form still works without this column: it retries
-- the insert without `division` if the column is missing.
-- Run this in your Supabase SQL Editor to enable it.
-- =====================================================

ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS division TEXT;

COMMENT ON COLUMN contact_submissions.division IS
  'Optional division slug the enquiry concerns, e.g. generas-digital';
