-- Close the anonymous read hole on mentorship_applications
--
-- The problem
-- -----------
-- The policy is named "Users can read own applications" but its USING clause
-- is literally `true`:
--
--   Users can read own applications | SELECT | {public} | USING: true
--
-- So it grants every anonymous visitor every row in the table: full_name,
-- email, phone, country, sender_phone, current_challenges, goals,
-- project_description, payment_reference, payment_amount and, worst of all,
-- admin_notes and verification_notes. The anon key ships in the browser
-- bundle, so this is not a theoretical exposure.
--
-- "Own" was never enforceable here: the table has no user_id and no link to
-- auth.uid(), because applications are submitted without an account. The only
-- thing that can identify an applicant is a secret they were given, which is
-- what tracking_token below introduces.
--
-- The three things the public site genuinely needed
-- -------------------------------------------------
--   1. Reading your own application after applying. Tracked by email, which is
--      the leak itself: anyone can type an address into a public form and read
--      that person's application. Replaced with an unguessable token.
--   2. .insert().select() so the form could read back the row it just wrote.
--      No longer needed once the token is generated client-side.
--   3. A "mentees helped" count for the social proof strip. Now an aggregate
--      RPC, which returns a number and no rows.
--
-- Idempotent: re-running is safe.

-- 1. Token column, backfilled so existing applicants can already track.
alter table public.mentorship_applications
  add column if not exists tracking_token text;

with src as (
  select id, upper(replace(gen_random_uuid()::text, '-', '')) as h
  from public.mentorship_applications
  where tracking_token is null
)
update public.mentorship_applications m
set tracking_token =
      'TRK-' || substr(s.h, 1, 5) || '-' || substr(s.h, 6, 5) || '-' || substr(s.h, 11, 5)
from src s
where m.id = s.id;

create unique index if not exists mentorship_applications_tracking_token_idx
  on public.mentorship_applications (tracking_token)
  where tracking_token is not null;

-- 2. An anonymous insert must not be able to approve itself.
--
-- The insert policy has WITH CHECK: true, so a visitor could post
-- status: 'completed' or fill in admin_notes, then appear in the admin
-- dashboard and in the verified-mentee count as though they had been vetted.
-- This pins the admin-owned fields to their neutral values.
create or replace function public.mentorship_applications_guard_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service role is this repo's own admin tooling and the backfill above.
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  new.status := 'new';
  new.admin_notes := null;
  new.verification_notes := null;
  new.payment_verified_at := null;
  new.completed_at := null;
  new.email_sent := false;
  new.reminder_sent := false;
  new.whatsapp_sent := false;
  return new;
end;
$$;

drop trigger if exists mentorship_applications_guard_insert on public.mentorship_applications;
create trigger mentorship_applications_guard_insert
before insert on public.mentorship_applications
for each row execute function public.mentorship_applications_guard_insert();

-- 3. The hole itself.
drop policy if exists "Users can read own applications" on public.mentorship_applications;

-- 4. Scoped replacement for tracking.
--
-- Columns are named explicitly because SECURITY DEFINER bypasses RLS, so
-- admin_notes and verification_notes would be exposed by a SELECT *. The
-- payment screenshot URL is withheld too: the bucket is publicly readable, so
-- publishing that path hands over the applicant's payment proof.
create or replace function public.get_mentorship_application_by_tracking_token(p_token text)
returns table (
  id bigint,
  application_id text,
  tracking_token text,
  service_title text,
  package_type text,
  package_name text,
  full_name text,
  email text,
  phone text,
  country text,
  skill_level text,
  trading_goals text[],
  interested_markets text[],
  weekly_hours text,
  current_challenges text,
  project_type text,
  project_name text,
  project_description text,
  budget_range text,
  timeline text,
  company_name text,
  goals text,
  additional_info text,
  selected_payment_method text,
  payment_reference text,
  payment_amount numeric,
  payment_currency text,
  payment_status text,
  status text,
  form_step integer,
  submitted_at timestamp without time zone,
  payment_verified_at timestamp without time zone,
  completed_at timestamp without time zone
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id, a.application_id, a.tracking_token, a.service_title, a.package_type,
    a.package_name, a.full_name, a.email, a.phone, a.country, a.skill_level,
    a.trading_goals, a.interested_markets, a.weekly_hours,
    a.current_challenges, a.project_type, a.project_name, a.project_description,
    a.budget_range, a.timeline, a.company_name, a.goals, a.additional_info,
    a.selected_payment_method, a.payment_reference, a.payment_amount,
    a.payment_currency, a.payment_status, a.status, a.form_step,
    a.submitted_at, a.payment_verified_at, a.completed_at
  from public.mentorship_applications a
  where btrim(coalesce(p_token, '')) <> ''
    and upper(regexp_replace(btrim(p_token), '\s', '', 'g'))
        = upper(regexp_replace(a.tracking_token, '\s', '', 'g'))
  order by a.submitted_at desc
  limit 1;
$$;

comment on function public.get_mentorship_application_by_tracking_token(text) is
  'Returns the single mentorship application matching a caller-supplied tracking token. admin_notes, verification_notes and the payment screenshot URL are deliberately excluded.';

revoke all on function public.get_mentorship_application_by_tracking_token(text) from public;
grant execute on function public.get_mentorship_application_by_tracking_token(text) to anon, authenticated;

-- 5. Aggregate for the social proof strip, so no rows cross the boundary.
create or replace function public.verified_mentorship_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.mentorship_applications
  where payment_status = 'verified';
$$;

comment on function public.verified_mentorship_count() is
  'Number of verified mentees. Aggregate only, returns no rows and no personal data.';

revoke all on function public.verified_mentorship_count() from public;
grant execute on function public.verified_mentorship_count() to anon, authenticated;