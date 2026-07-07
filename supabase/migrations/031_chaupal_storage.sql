-- 031_chaupal_storage.sql
-- Description: Creates the storage bucket for Chaupal media uploads

DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('chaupal_media', 'chaupal_media', true)
  ON CONFLICT (id) DO NOTHING;

  -- Policies for chaupal_media bucket
  DROP POLICY IF EXISTS "Public can view chaupal media" ON storage.objects;
  CREATE POLICY "Public can view chaupal media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chaupal_media');

  DROP POLICY IF EXISTS "Auth users can upload chaupal media" ON storage.objects;
  CREATE POLICY "Auth users can upload chaupal media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chaupal_media' AND auth.role() = 'authenticated');

  DROP POLICY IF EXISTS "Users can update own chaupal media" ON storage.objects;
  CREATE POLICY "Users can update own chaupal media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'chaupal_media' AND auth.uid() = owner);

  DROP POLICY IF EXISTS "Users can delete own chaupal media" ON storage.objects;
  CREATE POLICY "Users can delete own chaupal media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'chaupal_media' AND auth.uid() = owner);

EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Cannot modify storage.objects policies (insufficient privilege). Configure via Supabase Dashboard.';
END $$;
