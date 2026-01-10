-- Storage Bucket Setup
-- Run this in Supabase SQL Editor after the other migrations

-- ============================================
-- CREATE STORAGE BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'aiwear-media',
  'aiwear-media',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE RLS POLICIES
-- ============================================
-- Users can only access their own files
-- Path pattern: {user_id}/{kind}/{filename}

-- Read own files
CREATE POLICY "storage: read own" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'aiwear-media' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Upload own files
CREATE POLICY "storage: upload own" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'aiwear-media' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete own files
CREATE POLICY "storage: delete own" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'aiwear-media' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
