-- Migration: Create wardrobe storage bucket
-- Run this in Supabase SQL Editor to create the storage bucket for wardrobe images

-- Create the wardrobe bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'wardrobe',
    'wardrobe',
    true,  -- Public bucket for easy access
    5242880,  -- 5MB limit (compressed images should be ~100KB)
    ARRAY['image/webp', 'image/jpeg', 'image/jpg', 'image/png']::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/jpg', 'image/png']::text[];

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for wardrobe" ON storage.objects;

-- RLS Policy: Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'wardrobe' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'wardrobe' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Allow public read access (bucket is public)
CREATE POLICY "Public read access for wardrobe"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wardrobe');

-- Enable image transformations for this bucket
-- Note: This requires Supabase Pro plan. On free tier, images will be served as-is.
-- The app gracefully falls back to original images if transforms aren't available.
