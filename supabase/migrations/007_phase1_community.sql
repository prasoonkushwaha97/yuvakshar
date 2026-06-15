-- ==========================================
-- PHASE 1: COMMUNITY CORE MIGRATION
-- ==========================================

-- 1. Extend Communities
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS current_book VARCHAR(255);

-- 2. Create community_posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  post_type VARCHAR(50) DEFAULT 'text',
  media_url TEXT,
  poll_question TEXT,
  poll_options TEXT[],
  poll_votes JSONB DEFAULT '{}'::jsonb,
  link_url TEXT,
  forum_category VARCHAR(100) DEFAULT 'General',
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false,
  best_answer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Create community_post_likes
CREATE TABLE IF NOT EXISTS public.community_post_likes (
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

-- 4. Create community_comments
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_accepted_answer BOOLEAN DEFAULT false,
  reply_to_name TEXT,
  reply_to_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. Create community_comment_likes
CREATE TABLE IF NOT EXISTS public.community_comment_likes (
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (comment_id, user_id)
);

-- 6. Extend Bookmarks
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE;
ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_article_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_user_article ON public.bookmarks(user_id, article_id) WHERE article_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_user_post ON public.bookmarks(user_id, post_id) WHERE post_id IS NOT NULL;

-- 7. Extend Notifications
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS related_id UUID;

-- 8. Create View for community_groups (Client-compatibility mapping)
CREATE OR REPLACE VIEW public.community_groups AS
SELECT 
  c.id::text AS id,
  c.name,
  c.description,
  c.category,
  c.current_book,
  c.owner_id::text AS owner_id,
  c.created_at::text AS created_at,
  COALESCE(s.require_approval, false) AS is_private,
  (SELECT COUNT(*) FROM community_members m WHERE m.community_id = c.id AND m.status = 'active')::int AS "membersCount"
FROM communities c
LEFT JOIN community_settings s ON c.id = s.community_id;

-- 9. Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comment_likes ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies
CREATE POLICY "Public read community_posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Auth manage community_posts" ON public.community_posts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read community_post_likes" ON public.community_post_likes FOR SELECT USING (true);
CREATE POLICY "Auth manage community_post_likes" ON public.community_post_likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read community_comments" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Auth manage community_comments" ON public.community_comments FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read community_comment_likes" ON public.community_comment_likes FOR SELECT USING (true);
CREATE POLICY "Auth manage community_comment_likes" ON public.community_comment_likes FOR ALL USING (auth.uid() = user_id);
