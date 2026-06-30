-- 031_chaupal_storage.sql
-- Description: Creates the storage bucket for Chaupal media uploads

INSERT INTO storage.buckets (id, name, public)
VALUES ('chaupal_media', 'chaupal_media', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for chaupal_media bucket
-- 1. Public can view
CREATE POLICY "Public can view chaupal media"
ON storage.objects FOR SELECT
USING (bucket_id = 'chaupal_media');

-- 2. Authenticated users can upload
CREATE POLICY "Auth users can upload chaupal media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chaupal_media' AND auth.role() = 'authenticated');

-- 3. Users can update their own media
CREATE POLICY "Users can update own chaupal media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'chaupal_media' AND auth.uid() = owner);

-- 4. Users can delete their own media
CREATE POLICY "Users can delete own chaupal media"
ON storage.objects FOR DELETE
USING (bucket_id = 'chaupal_media' AND auth.uid() = owner);
