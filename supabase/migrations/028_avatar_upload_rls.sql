-- Migration: 028_avatar_upload_rls.sql
-- Purpose: Setup Storage RLS policies for avatars bucket and ensure profiles table allows updates.

-- 1. Storage setup (bucket + policies on storage.objects)
-- These may fail with insufficient_privilege if the migration user doesn't own storage.objects.
-- In that case, storage policies should be configured via the Supabase Dashboard.
DO $$
BEGIN
  -- Ensure avatars bucket exists and is public
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

  -- Enable RLS on storage.objects
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  -- Storage Policies for Avatars bucket
  DROP POLICY IF EXISTS "Public avatars are viewable by everyone" ON storage.objects;
  CREATE POLICY "Public avatars are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

  DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
  CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
      bucket_id = 'avatars' 
      AND auth.role() = 'authenticated'
      AND (storage.foldername(name))[1] = auth.uid()::text
  );

  DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
  CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
      bucket_id = 'avatars' 
      AND auth.role() = 'authenticated'
      AND (storage.foldername(name))[1] = auth.uid()::text
  );

  DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
  CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
      bucket_id = 'avatars' 
      AND auth.role() = 'authenticated'
      AND (storage.foldername(name))[1] = auth.uid()::text
  );

EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Cannot modify storage.objects policies (insufficient privilege). Configure storage policies via the Supabase Dashboard.';
END $$;

-- 2. Ensure RLS on profiles allows the user to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Just to be safe, make sure they can also select their own or everyone's profile
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);
