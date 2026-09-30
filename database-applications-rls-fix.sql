-- ─────────────────────────────────────────────────────────────────
-- Close anonymous write access to the application tables
-- ─────────────────────────────────────────────────────────────────
-- Found while auditing for the project_inquiries leak. The pattern below
-- was repeated across five tables: a policy named "Admin read X" that was
-- actually granted to {public} with USING (true), so it allowed anyone
-- holding the publishable anon key to read every applicant row.
--
--   [mentorship_applications] 'Admin full access mentorship_applications'
--     cmd=ALL roles={public} using=true
--
-- ALL includes UPDATE and DELETE, so an anonymous visitor could rewrite or
-- destroy any client's application, not just read it.
--
-- What this script does
--   1. Restricts the write policies to authenticated admins.
--   2. Re-grants the same policies to admins that were misnamed as public.
--
-- Deliberately NOT changed here
--   Anonymous SELECT on mentorship_applications is left in place because
--   SocialProof.jsx counts verified mentors publicly, and MentorshipManager
--   / NotificationCenter / reminderService all sit on top of that table.
--   Locking the reads needs a decision about verified-mentor visibility.
--   These tables currently hold no rows, so the misnamed read policies are
--   a latent risk rather than an active leak.
--
-- Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────

-- 1 ── mentorship_applications: writes are admin-only.
--     The public INSERT policy is kept so the application form still works.
DROP POLICY IF EXISTS "Admin full access mentorship_applications" ON mentorship_applications;
CREATE POLICY "Admins have full access to mentorship applications"
  ON mentorship_applications
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

-- 2 ── Same misnaming on the four empty application tables.
--     Named "Admin read ..." but granted to {public}; they held zero rows,
--     so tightening them to authenticated admins breaks nothing and stops
--     the first applicant's details from leaking the moment one arrives.
DROP POLICY IF EXISTS "Admin read blog" ON blog_applications;
CREATE POLICY "Admins can read blog applications"
  ON blog_applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "Admin read business" ON business_applications;
CREATE POLICY "Admins can read business applications"
  ON business_applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "Admin read dev" ON dev_applications;
CREATE POLICY "Admins can read dev applications"
  ON dev_applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "Admin read trading" ON trading_applications;
CREATE POLICY "Admins can read trading applications"
  ON trading_applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- 3 ── followers: a DELETE grant to {public} lets anyone remove anyone's
--     follow row. Restrict to admins; the public SELECT policies stay, as
--     follower counts are shown publicly.
DROP POLICY IF EXISTS "public_delete" ON followers;
CREATE POLICY "Admins can delete followers"
  ON followers FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
