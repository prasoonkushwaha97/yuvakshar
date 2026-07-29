-- ==========================================
-- Migration: Create yuvakshar-media Storage Bucket and Policies
-- ==========================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'yuvakshar-media', 
  'yuvakshar-media', 
  true, 
  10485760, 
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 1. Public Read Policy
DROP POLICY IF EXISTS "Public Read Access yuvakshar-media" ON storage.objects;
CREATE POLICY "Public Read Access yuvakshar-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'yuvakshar-media');

-- 2. Authenticated Upload Policy
DROP POLICY IF EXISTS "Authenticated Upload Access yuvakshar-media" ON storage.objects;
CREATE POLICY "Authenticated Upload Access yuvakshar-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'yuvakshar-media');

-- 3. Authenticated Update Policy
DROP POLICY IF EXISTS "Authenticated Update Access yuvakshar-media" ON storage.objects;
CREATE POLICY "Authenticated Update Access yuvakshar-media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'yuvakshar-media');

-- 4. Authenticated Delete Policy
DROP POLICY IF EXISTS "Authenticated Delete Access yuvakshar-media" ON storage.objects;
CREATE POLICY "Authenticated Delete Access yuvakshar-media"
ON storage.objects FOR DELETE
USING (bucket_id = 'yuvakshar-media');
