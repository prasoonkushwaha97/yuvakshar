-- Migration: 042_community_articles_rls.sql
-- Purpose: Allow normal authenticated users to create and submit articles for review

-- 1. Enable RLS on articles (if not already enabled)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "articles_insert" ON public.articles;
DROP POLICY IF EXISTS "articles_update" ON public.articles;
DROP POLICY IF EXISTS "articles_select" ON public.articles;
DROP POLICY IF EXISTS "articles_delete" ON public.articles;

-- 3. SELECT Policy
-- Public can read Published articles
-- Editors/Admins/Founders can read all
-- Authenticated authors can read their own articles
CREATE POLICY "articles_select" ON public.articles FOR SELECT USING (
  status = 'Published' OR
  author_id = auth.uid() OR
  public.auth_has_any_role(ARRAY['founder', 'admin', 'editor'])
);

-- 4. INSERT Policy
-- Authenticated users can insert articles if author_id matches auth.uid() AND status is Draft or Submitted
-- Staff can insert any article
CREATE POLICY "articles_insert" ON public.articles FOR INSERT WITH CHECK (
  (auth.role() = 'authenticated' AND auth.uid() = author_id AND status IN ('Draft', 'Submitted')) OR
  public.auth_has_any_role(ARRAY['founder', 'admin', 'editor'])
);

-- 5. UPDATE Policy
-- Authenticated users can update their own drafts/submitted articles as long as author_id = auth.uid() and status is non-published
-- Staff can update any article
CREATE POLICY "articles_update" ON public.articles FOR UPDATE USING (
  (author_id = auth.uid() AND status IN ('Draft', 'Submitted', 'Revision Requested')) OR
  public.auth_has_any_role(ARRAY['founder', 'admin', 'editor'])
) WITH CHECK (
  (author_id = auth.uid() AND status IN ('Draft', 'Submitted', 'Revision Requested')) OR
  public.auth_has_any_role(ARRAY['founder', 'admin', 'editor'])
);

-- 6. DELETE Policy
-- Authors can delete their own drafts
-- Founders and Admins can delete any article
CREATE POLICY "articles_delete" ON public.articles FOR DELETE USING (
  (author_id = auth.uid() AND status = 'Draft') OR
  public.auth_has_any_role(ARRAY['founder', 'admin'])
);
