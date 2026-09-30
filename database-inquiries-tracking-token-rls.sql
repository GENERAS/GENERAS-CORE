-- ─────────────────────────────────────────────────────────────────
-- project_inquiries: tracking tokens + row level security
-- ─────────────────────────────────────────────────────────────────
-- Why this exists
--   project_inquiries stores client names, emails, phone numbers, project
--   descriptions and budgets, and RLS was disabled on the table. With RLS
--   off, the publishable anon key in the browser bundle was enough to read
--   every row:  GET /rest/v1/project_inquiries?select=*
--
-- Why a tracking token
--   The "track your inquiry" screens used to look rows up by email with no
--   authentication, so anyone could type any address and read that person's
--   project details. An RLS policy cannot distinguish the owner from a
--   stranger here, because the email is supplied by an anonymous client.
--   Replacing email with an unguessable token removes the ambiguity.
--   See src/utils/generateInquiryId.js for how the token is produced.
--
-- Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────

-- 1 ── Tracking token
--     Generated in the browser so the visitor can be shown their token
--     without reading the row back (RETURNING needs a SELECT policy).
--     The DEFAULT is a safety net for rows inserted by other clients.
ALTER TABLE project_inquiries
  ADD COLUMN IF NOT EXISTS tracking_token TEXT;

UPDATE project_inquiries
   SET tracking_token = gen_random_uuid()::text
 WHERE tracking_token IS NULL;

ALTER TABLE project_inquiries
  ALTER COLUMN tracking_token SET DEFAULT gen_random_uuid()::text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_inquiries_tracking_token
  ON project_inquiries(tracking_token);

-- 2 ── Lock the table down
ALTER TABLE project_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone may submit a quote: that is the point of the public form.
DROP POLICY IF EXISTS "Allow all inserts" ON project_inquiries;
DROP POLICY IF EXISTS "Anyone can insert project" ON project_inquiries;
CREATE POLICY "Anyone can submit an inquiry"
  ON project_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins: full read plus the status/admin_notes writes ProjectInquiriesManager
-- performs. Without UPDATE/DELETE here the admin panel breaks on first edit.
DROP POLICY IF EXISTS "Admins have full access to project inquiries" ON project_inquiries;
CREATE POLICY "Admins have full access to project inquiries"
  ON project_inquiries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
       WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
       WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- A signed-in client may read their own submissions. Unenforced today
-- (the tracking screens are public and use a token instead) but it means
-- /dashboard can be auth-gated later without reworking the policies.
DROP POLICY IF EXISTS "Clients can read their own inquiries" ON project_inquiries;
CREATE POLICY "Clients can read their own inquiries"
  ON project_inquiries
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

-- Deliberately NO anonymous SELECT policy.
-- This is the line that closes the leak: the anon key can no longer read
-- project_inquiries. Tracking is done with the unguessable token instead.
