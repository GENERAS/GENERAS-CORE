-- Secure inquiry tracking lookup
--
-- Why this exists
-- ---------------
-- project_inquiries has RLS enabled with a single policy, "Admins have full
-- access", for the authenticated role. That is deliberate: the anon key ships
-- in the browser bundle, so an anonymous SELECT policy would let anyone read
-- every inquiry that has ever been submitted.
--
-- The tracking screen therefore had no way to work. ServicePage.jsx and
-- ClientDashboard.jsx both did
--
--   supabase.from('project_inquiries').select('*').eq('tracking_token', token)
--
-- which RLS filters down to zero rows for an anonymous visitor, so every code
-- came back as "No application found for that code".
--
-- This function is the narrow exception: it reads one row, and only when the
-- caller already holds that row's unguessable tracking token.
--
-- Why it is safe
-- --------------
--   * Tracking tokens carry 75 bits of entropy from generateTrackingToken()
--     (TRK-XXXXX-XXXXX-XXXXX, 32-symbol alphabet), or 122 bits for the legacy
--     UUID values. Both are impractical to guess, so the token is the secret.
--   * No email lookup. An earlier version matched on the submitter's email
--     address, which is public knowledge and exposed other people's project
--     details to anyone who could guess it. That path is not restored here.
--   * admin_notes is deliberately omitted. It is the one column meant for the
--     admin's eyes only, and a SECURITY DEFINER function bypasses RLS, so
--     naming the columns explicitly is what keeps it private. Never
--     substitute SELECT * here.
--   * search_path is pinned so a hostile object in another schema cannot be
--     substituted for project_inquiries.
--
-- Idempotent: re-running replaces the function and re-applies the grants.

create or replace function public.get_project_inquiry_by_tracking_token(p_token text)
returns table (
  id bigint,
  tracking_token text,
  inquiry_id text,
  project_name text,
  project_type text,
  full_name text,
  email text,
  phone text,
  company text,
  service text,
  service_name text,
  status text,
  description text,
  requirements text[],
  budget_range text,
  timeline text,
  additional_info text,
  created_at timestamp without time zone
)
language sql
stable
security definer
set search_path = public
as $$
  select
    i.id,
    i.tracking_token,
    i.inquiry_id,
    i.project_name,
    i.project_type,
    i.full_name,
    i.email,
    i.phone,
    i.company,
    i.service,
    i.service_name,
    i.status,
    i.description,
    i.requirements,
    i.budget_range,
    i.timeline,
    i.additional_info,
    i.created_at
  from public.project_inquiries i
  where btrim(coalesce(p_token, '')) <> ''
    -- Mirrors normalizeTrackingToken() in src/utils/trackingToken.js so a
    -- pasted code matches regardless of case or stray whitespace. Needed
    -- because the legacy rows store lowercase UUIDs while the client
    -- uppercases whatever the visitor types.
    and upper(regexp_replace(btrim(p_token), '\s', '', 'g'))
        = upper(regexp_replace(i.tracking_token, '\s', '', 'g'))
  order by i.created_at desc
  limit 1;
$$;

comment on function public.get_project_inquiry_by_tracking_token(text) is
  'Returns the single inquiry matching a caller-supplied tracking token. Safe to expose to anon because the token is unguessable; admin_notes is intentionally excluded.';

revoke all on function public.get_project_inquiry_by_tracking_token(text) from public;
grant execute on function public.get_project_inquiry_by_tracking_token(text) to anon, authenticated;

-- Backs the lookup above. Without it every track attempt is a sequential scan.
create index if not exists project_inquiries_tracking_token_idx
  on public.project_inquiries (tracking_token);