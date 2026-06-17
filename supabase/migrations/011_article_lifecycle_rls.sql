-- Migration: 011_article_lifecycle_rls.sql
-- Purpose: Complete Phase 3A Security Refinement & Article Lifecycle RLS

-- 1. Enable RLS on core missing tables
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- 2. Article Lifecycle Policies
DROP POLICY IF EXISTS "articles_select" ON articles;
DROP POLICY IF EXISTS "articles_insert" ON articles;
DROP POLICY IF EXISTS "articles_update" ON articles;
DROP POLICY IF EXISTS "articles_delete" ON articles;

CREATE POLICY "articles_select" ON articles FOR SELECT USING (
  -- PUBLISHED: Public
  (status = 'Published' AND auth.role() IN ('anon', 'authenticated')) OR
  
  -- Founder/Admin: All
  auth_has_any_role(ARRAY['founder', 'co_founder', 'admin', 'super_admin']) OR
  
  -- DRAFT
  (status = 'Draft' AND (
      author_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM article_assignments aa WHERE aa.article_id = articles.id AND aa.user_id = auth.uid() AND aa.role_type = 'editor')
  )) OR
  
  -- REVIEW
  (status = 'Review' AND (
      author_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM article_assignments aa WHERE aa.article_id = articles.id AND aa.user_id = auth.uid() AND aa.role_type IN ('reviewer', 'editor'))
  )) OR
  
  -- FACT_CHECK
  (status = 'Fact_Check' AND (
      author_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM article_assignments aa WHERE aa.article_id = articles.id AND aa.user_id = auth.uid() AND aa.role_type IN ('fact_checker', 'editor'))
  )) OR
  
  -- EDITOR_REVIEW
  (status = 'Editor_Review' AND (
      author_id = auth.uid() OR 
      auth_has_any_role(ARRAY['editor', 'editor_in_chief'])
  )) OR
  
  -- SCHEDULED
  (status = 'Scheduled' AND (
      auth_has_any_role(ARRAY['editor', 'editor_in_chief'])
  ))
);

CREATE POLICY "articles_insert" ON articles FOR INSERT WITH CHECK (
  auth_has_any_role(ARRAY['author', 'editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin']) AND
  auth.uid() = author_id
);

CREATE POLICY "articles_update" ON articles FOR UPDATE USING (
  (status = 'Draft' AND author_id = auth.uid()) OR
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

CREATE POLICY "articles_delete" ON articles FOR DELETE USING (
  auth_has_any_role(ARRAY['founder', 'co_founder', 'admin', 'super_admin'])
);


-- 3. Community Policies Cleanup (No USING(true), no ALL)
DROP POLICY IF EXISTS "Public read community_posts" ON public.community_posts;
DROP POLICY IF EXISTS "Auth manage community_posts" ON public.community_posts;

CREATE POLICY "community_posts_select" ON public.community_posts FOR SELECT USING (
  auth.role() IN ('anon', 'authenticated')
);
CREATE POLICY "community_posts_insert" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_posts_update" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "community_posts_delete" ON public.community_posts FOR DELETE USING (auth.uid() = user_id OR auth_has_any_role(ARRAY['moderator', 'admin', 'founder']));

DROP POLICY IF EXISTS "Public read community_post_likes" ON public.community_post_likes;
DROP POLICY IF EXISTS "Auth manage community_post_likes" ON public.community_post_likes;

CREATE POLICY "community_post_likes_select" ON public.community_post_likes FOR SELECT USING (auth.role() IN ('anon', 'authenticated'));
CREATE POLICY "community_post_likes_insert" ON public.community_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_post_likes_delete" ON public.community_post_likes FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public read community_comments" ON public.community_comments;
DROP POLICY IF EXISTS "Auth manage community_comments" ON public.community_comments;

CREATE POLICY "community_comments_select" ON public.community_comments FOR SELECT USING (auth.role() IN ('anon', 'authenticated'));
CREATE POLICY "community_comments_insert" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_comments_update" ON public.community_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "community_comments_delete" ON public.community_comments FOR DELETE USING (auth.uid() = user_id OR auth_has_any_role(ARRAY['moderator', 'admin', 'founder']));

DROP POLICY IF EXISTS "Public read community_comment_likes" ON public.community_comment_likes;
DROP POLICY IF EXISTS "Auth manage community_comment_likes" ON public.community_comment_likes;

CREATE POLICY "community_comment_likes_select" ON public.community_comment_likes FOR SELECT USING (auth.role() IN ('anon', 'authenticated'));
CREATE POLICY "community_comment_likes_insert" ON public.community_comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_comment_likes_delete" ON public.community_comment_likes FOR DELETE USING (auth.uid() = user_id);


-- 4. Basic fallback for categories (read-only for public, admin for rest)
CREATE POLICY "categories_select" ON categories FOR SELECT USING (auth.role() IN ('anon', 'authenticated'));
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (auth_has_any_role(ARRAY['founder', 'admin', 'editor']));
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (auth_has_any_role(ARRAY['founder', 'admin', 'editor']));
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (auth_has_any_role(ARRAY['founder', 'admin']));
