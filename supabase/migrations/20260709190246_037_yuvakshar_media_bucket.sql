-- 037_yuvakshar_media_bucket.sql
-- Description: Creates the storage bucket for general media uploads (yuvakshar-media) and configures RLS

DO $$
BEGIN
  -- 1. Create the yuvakshar-media bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('yuvakshar-media', 'yuvakshar-media', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

  -- Enable RLS on storage.objects (if not already enabled)
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  -- 2. Policies for yuvakshar-media bucket
  
  -- Allow public read access
  DROP POLICY IF EXISTS "Public can view yuvakshar-media" ON storage.objects;
  CREATE POLICY "Public can view yuvakshar-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'yuvakshar-media');

  -- Allow authenticated users to upload
  DROP POLICY IF EXISTS "Auth users can upload yuvakshar-media" ON storage.objects;
  CREATE POLICY "Auth users can upload yuvakshar-media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'yuvakshar-media' AND auth.role() = 'authenticated');

  -- Allow users to update their own media
  DROP POLICY IF EXISTS "Users can update own yuvakshar-media" ON storage.objects;
  CREATE POLICY "Users can update own yuvakshar-media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'yuvakshar-media' AND auth.uid() = owner);

  -- Allow users to delete their own media
  DROP POLICY IF EXISTS "Users can delete own yuvakshar-media" ON storage.objects;
  CREATE POLICY "Users can delete own yuvakshar-media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'yuvakshar-media' AND auth.uid() = owner);

EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Cannot modify storage.objects policies (insufficient privilege). Configure via Supabase Dashboard.';
END $$;
