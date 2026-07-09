-- 036_chaupal_functional_schema.sql
-- Description: Extends Chaupal schema with moderation, drafts, groups, and a follower system.

-- 1. Extend chaupal_posts for Moderation, Drafts, and Groups
ALTER TABLE public.chaupal_posts
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.chaupal_groups(id) ON DELETE CASCADE;

-- 2. Create Follow System for "Following" Feed
CREATE TABLE IF NOT EXISTS public.user_followers (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Index for quick lookups for the Feed
CREATE INDEX IF NOT EXISTS idx_user_followers_follower_id ON public.user_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_following_id ON public.user_followers(following_id);

-- Enable RLS for Follow System
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Follow System
DROP POLICY IF EXISTS "Public can read followers" ON public.user_followers;
CREATE POLICY "Public can read followers" ON public.user_followers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own follows" ON public.user_followers;
CREATE POLICY "Users can manage their own follows" ON public.user_followers FOR ALL USING (auth.uid() = follower_id);

-- 3. Extend chaupal_post_comments for rich interactions
ALTER TABLE public.chaupal_post_comments
ADD COLUMN IF NOT EXISTS media_url TEXT;

-- 4. Supabase Storage for Chaupal Media
-- Ensure the chaupal-media bucket exists. We do this via SQL function wrapper for migrations.
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('chaupal-media', 'chaupal-media', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage own media" ON storage.objects;

-- RLS Policies for Storage
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'chaupal-media');

CREATE POLICY "Auth users can upload media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'chaupal-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can manage own media" ON storage.objects FOR UPDATE USING (
  bucket_id = 'chaupal-media' 
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete own media" ON storage.objects FOR DELETE USING (
  bucket_id = 'chaupal-media' 
  AND auth.uid() = owner
);
