-- 030_chaupal_feed_schema.sql
-- Description: Creates the Feed schema (Twitter-like stream) distinct from the Discussion Rooms.

-- 1. Create chaupal_posts
CREATE TABLE IF NOT EXISTS public.chaupal_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  poll_question TEXT,
  poll_options JSONB DEFAULT '[]'::jsonb, -- e.g., [{"text": "Option 1", "votes": 0}, {"text": "Option 2", "votes": 0}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Create chaupal_post_likes
CREATE TABLE IF NOT EXISTS public.chaupal_post_likes (
  post_id UUID NOT NULL REFERENCES public.chaupal_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

-- 3. Create chaupal_post_comments
CREATE TABLE IF NOT EXISTS public.chaupal_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.chaupal_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.chaupal_post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. Extend Bookmarks (Reuse global system)
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS chaupal_post_id UUID REFERENCES public.chaupal_posts(id) ON DELETE CASCADE;

-- 5. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_chaupal_posts_created_at ON public.chaupal_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chaupal_post_comments_post_id ON public.chaupal_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_chaupal_rooms_type ON public.chaupal_rooms(type);
CREATE INDEX IF NOT EXISTS idx_chaupal_messages_room_id ON public.chaupal_messages(room_id, created_at DESC);

-- 6. Enable RLS
ALTER TABLE public.chaupal_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chaupal_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chaupal_post_comments ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies

-- chaupal_posts
DROP POLICY IF EXISTS "Public can read posts" ON public.chaupal_posts;
CREATE POLICY "Public can read posts" ON public.chaupal_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users can insert posts" ON public.chaupal_posts;
CREATE POLICY "Auth users can insert posts" ON public.chaupal_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can manage own posts" ON public.chaupal_posts;
CREATE POLICY "Users can manage own posts" ON public.chaupal_posts FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can delete own posts" ON public.chaupal_posts;
CREATE POLICY "Users can delete own posts" ON public.chaupal_posts FOR DELETE USING (auth.uid() = author_id);

-- chaupal_post_likes
DROP POLICY IF EXISTS "Public can read post likes" ON public.chaupal_post_likes;
CREATE POLICY "Public can read post likes" ON public.chaupal_post_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users can manage post likes" ON public.chaupal_post_likes;
CREATE POLICY "Auth users can manage post likes" ON public.chaupal_post_likes FOR ALL USING (auth.uid() = user_id);

-- chaupal_post_comments
DROP POLICY IF EXISTS "Public can read post comments" ON public.chaupal_post_comments;
CREATE POLICY "Public can read post comments" ON public.chaupal_post_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users can insert post comments" ON public.chaupal_post_comments;
CREATE POLICY "Auth users can insert post comments" ON public.chaupal_post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can manage own post comments" ON public.chaupal_post_comments;
CREATE POLICY "Users can manage own post comments" ON public.chaupal_post_comments FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can delete own post comments" ON public.chaupal_post_comments;
CREATE POLICY "Users can delete own post comments" ON public.chaupal_post_comments FOR DELETE USING (auth.uid() = author_id);

-- 8. Real-Time Setup
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='chaupal_posts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chaupal_posts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='chaupal_post_comments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chaupal_post_comments;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='chaupal_post_likes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chaupal_post_likes;
  END IF;
END $$;
