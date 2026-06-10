-- AI ASSISTANT STORAGE BUCKETS
-- Storage buckets for AI assistant files, documents, and assets

-- =============================================
-- KNOWLEDGE BASE STORAGE
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ai-knowledge',
  'ai-knowledge',
  false,
  104857600, -- 100MB limit
  ARRAY['text/markdown', 'text/plain', 'application/pdf', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to knowledge files
CREATE POLICY "Public read access to knowledge files"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'ai-knowledge');

-- Policy: Allow authenticated users to read knowledge files
CREATE POLICY "Authenticated read access to knowledge files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ai-knowledge');

-- Policy: Allow service role to upload knowledge files
CREATE POLICY "Service role can upload knowledge files"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'ai-knowledge');

-- Policy: Allow service role to update knowledge files
CREATE POLICY "Service role can update knowledge files"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'ai-knowledge');

-- Policy: Allow service role to delete knowledge files
CREATE POLICY "Service role can delete knowledge files"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'ai-knowledge');

-- =============================================
-- USER DOCUMENTS STORAGE
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ai-documents',
  'ai-documents',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow users to upload their own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ai-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to read their own documents
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ai-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow service role full access to documents
CREATE POLICY "Service role full access to documents"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'ai-documents')
WITH CHECK (bucket_id = 'ai-documents');

-- =============================================
-- AI GENERATED CONTENT STORAGE
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ai-generated',
  'ai-generated',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'text/plain', 'application/json', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow service role full access to generated content
CREATE POLICY "Service role full access to generated content"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'ai-generated')
WITH CHECK (bucket_id = 'ai-generated');

-- Policy: Allow authenticated users to read their generated content
CREATE POLICY "Users can read own generated content"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ai-generated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- VERIFICATION
-- =============================================
SELECT
  'ai-knowledge' as bucket_name,
  EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'ai-knowledge') as created
UNION ALL
SELECT
  'ai-documents',
  EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'ai-documents')
UNION ALL
SELECT
  'ai-generated',
  EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'ai-generated');
