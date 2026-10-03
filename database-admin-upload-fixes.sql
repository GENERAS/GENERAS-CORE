-- ─────────────────────────────────────────────────────────────────
-- Fix broken admin uploads and the write holes behind them
-- ─────────────────────────────────────────────────────────────────
-- Three of the admin upload screens could not write to storage at all:
--
--   photos bucket    had no INSERT policy, so PhotoManager failed on every
--                    upload. AcademicReportsManager also writes report PDFs
--                    and thumbnails into this bucket, so that failed too.
--   avatars bucket   had no policies whatsoever, so the profile avatar
--                    upload in SettingsManager failed.
--
-- Problems found alongside them:
--
--   The photos bucket DELETE policy was USING (bucket_id = 'photos'), so
--   any anonymous visitor could delete any stored photo file.
--
--   The photos table policy "Admin full access photos" was gated on
--   auth.role() = 'authenticated' rather than an admin check, so any
--   signed-in member could insert, edit or delete gallery photos.
--
--   Three columns the managers wrote to did not exist at all
--   (photos.gallery_images, certificates.hard_copy_image_url,
--   blog_posts.likes), so those uploads failed at save time or were
--   silently discarded.
--
--   "Anyone can update photo likes" and "Anyone can update certificate
--   likes" were USING (true) UPDATE grants, which no policy can narrow to
--   one column, so any anonymous visitor could rewrite every field of any
--   row. Replaced with a server-side counter function (section 7).
--
-- Idempotent: every statement is DROP IF EXISTS / ADD COLUMN IF NOT EXISTS
-- / CREATE OR REPLACE, so re-running converges rather than erroring.
-- Verified twice in a row against production.
-- ─────────────────────────────────────────────────────────────────

-- 1 ── photos bucket: admins write, public reads, nobody else deletes
DROP POLICY IF EXISTS "Users can delete own photos 1io9m69_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos 1io9m69_1" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload 1io9m69_0" ON storage.objects;

DROP POLICY IF EXISTS "Allow admin to upload photos" ON storage.objects;
CREATE POLICY "Allow admin to upload photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'photos'
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "Allow admin to update photos" ON storage.objects;
CREATE POLICY "Allow admin to update photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'photos'
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "Allow admin to delete photos" ON storage.objects;
CREATE POLICY "Allow admin to delete photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'photos'
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 2 ── certificates bucket: was open to any signed-in user
-- Both names: the pre-existing one, and the one this script creates, so
-- re-running after a partial apply still converges.
DROP POLICY IF EXISTS "Admin can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to upload certificates" ON storage.objects;
CREATE POLICY "Allow admin to upload certificates"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'certificates'
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 3 ── avatars bucket: no policies existed
DROP POLICY IF EXISTS "Allow public to view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin to delete avatars" ON storage.objects;

CREATE POLICY "Allow public to view avatars"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Allow admin to upload avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Allow admin to update avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Allow admin to delete avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 4 ── photos table: require a real admin, not merely a signed-in user
DROP POLICY IF EXISTS "Admin full access photos" ON photos;
DROP POLICY IF EXISTS "Admins have full access to photos" ON photos;
CREATE POLICY "Admins have full access to photos"
  ON photos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- 5 ── photos.gallery_images: read by the code, but never defined
--
-- PhotoManager set form.gallery_images and CommunityPage builds its lightbox
-- from [photo.image_url, ...(photo.gallery_images || [])], but no such column
-- existed, so every extra image the admin added was silently discarded and
-- the public gallery showed only the single main photo.
ALTER TABLE photos ADD COLUMN IF NOT EXISTS gallery_images text[] NOT NULL DEFAULT '{}';

-- 6 ── certificates.hard_copy_image_url: same problem
--
-- CertificatesManager uploaded the file to storage and then wrote the URL to
-- this column, which did not exist, so every hard copy upload ended in a
-- "column does not exist" error after the file had already been stored.
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS hard_copy_image_url text;

-- 7 ── the "anyone can update likes" hole
--
-- photos and certificates carried these policies:
--
--   Anyone can update photo likes       | UPDATE | USING (true)
--   Anyone can update certificate likes  | UPDATE | USING (true)
--
-- A row-level policy cannot be limited to one column, so USING (true) on
-- UPDATE meant any anonymous visitor could rewrite every field of any photo:
-- title, description, is_premium, image_url. This was confirmed by test: an
-- anonymous update renamed a real row.
--
-- The policies existed because LikeButton computed the new count in the
-- browser and wrote the whole thing back, which is both the vulnerability and
-- a race condition. The function below does the increment on the server, so
-- the policies are no longer needed.
--
-- Admins keep working through "Admins have full access to photos" /
-- "Admin can manage certificates", both of which cover UPDATE.

-- 8 ── blog_posts.likes: missing entirely
--
-- BlogPage and BlogPostPage read and display post.likes, but blog_posts had no
-- likes column, so every blog showed 0 and BlogPage's "most liked" sort
-- compared nothing. LikeButton also mapped any non-certificate type to the
-- photos table, so liking a blog post actually incremented a photo's counter.
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS likes integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_content_likes(
  p_table text,
  p_id    bigint,
  p_delta integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_count integer;
BEGIN
  -- Whitelist before interpolating into the statement below.
  IF p_table NOT IN ('photos', 'certificates', 'blog_posts') THEN
    RAISE EXCEPTION 'unsupported content type: %', p_table;
  END IF;

  EXECUTE format(
    'UPDATE public.%I SET likes = GREATEST(0, COALESCE(likes, 0) + %s) WHERE id = %s RETURNING likes',
    p_table, p_delta, p_id
  ) INTO new_count;

  IF new_count IS NULL THEN
    RAISE EXCEPTION 'no such %: %', p_table, p_id;
  END IF;

  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_content_likes(text, bigint, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_content_likes(text, bigint, integer) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can update photo likes" ON photos;
DROP POLICY IF EXISTS "Anyone can update certificate likes" ON certificates;