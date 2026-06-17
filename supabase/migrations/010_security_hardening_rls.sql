-- Migration: 010_security_hardening_rls.sql
-- Purpose: Remove unsafe USING(true) policies and enforce strict RBAC for Editorial & Magazine engines

-- 1. Helper function for checking user roles
CREATE OR REPLACE FUNCTION auth_has_role(role_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.slug = role_slug
  );
$$;

-- Helper function to check if user has ANY of the provided roles
CREATE OR REPLACE FUNCTION auth_has_any_role(role_slugs TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.slug = ANY(role_slugs)
  );
$$;

-- Drop all old unsafe policies
DROP POLICY IF EXISTS "Enable read access for all users" ON review_notes;
DROP POLICY IF EXISTS "Enable all access for service role" ON review_notes;
DROP POLICY IF EXISTS "Enable read access for all users" ON article_assignments;
DROP POLICY IF EXISTS "Enable all access for service role" ON article_assignments;
DROP POLICY IF EXISTS "Enable read access for all users" ON workflow_history;
DROP POLICY IF EXISTS "Enable all access for service role" ON workflow_history;
DROP POLICY IF EXISTS "Enable read access for all users" ON magazine_issues;
DROP POLICY IF EXISTS "Enable all access for service role" ON magazine_issues;
DROP POLICY IF EXISTS "Enable read access for all users" ON magazine_sections;
DROP POLICY IF EXISTS "Enable all access for service role" ON magazine_sections;
DROP POLICY IF EXISTS "Enable read access for all users" ON magazine_issue_articles;
DROP POLICY IF EXISTS "Enable all access for service role" ON magazine_issue_articles;

-- ====================================================================
-- TASK 2: review_notes
-- ====================================================================

-- SELECT: article author, assigned reviewer, editor, founder, admin
CREATE POLICY "review_notes_select" ON review_notes FOR SELECT USING (
  -- Article author
  EXISTS (SELECT 1 FROM articles WHERE id = review_notes.article_id AND author_id = auth.uid()) OR
  -- Assigned reviewer
  EXISTS (SELECT 1 FROM article_assignments WHERE article_id = review_notes.article_id AND user_id = auth.uid() AND role_type = 'reviewer') OR
  -- Editor, Founder, Admin
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

-- INSERT: assigned reviewer, editor, founder
CREATE POLICY "review_notes_insert" ON review_notes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM article_assignments WHERE article_id = review_notes.article_id AND user_id = auth.uid() AND role_type = 'reviewer') OR
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder'])
);

-- UPDATE: creator of note, founder, admin
CREATE POLICY "review_notes_update" ON review_notes FOR UPDATE USING (
  reviewer_id = auth.uid() OR
  auth_has_any_role(ARRAY['founder', 'co_founder', 'admin', 'super_admin'])
);

-- DELETE: founder, admin
CREATE POLICY "review_notes_delete" ON review_notes FOR DELETE USING (
  auth_has_any_role(ARRAY['founder', 'co_founder', 'admin', 'super_admin'])
);


-- ====================================================================
-- TASK 3: article_assignments
-- ====================================================================

-- SELECT: assigned user, article author, editor, founder, admin
CREATE POLICY "article_assignments_select" ON article_assignments FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM articles WHERE id = article_assignments.article_id AND author_id = auth.uid()) OR
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

-- INSERT: editor, founder, admin
CREATE POLICY "article_assignments_insert" ON article_assignments FOR INSERT WITH CHECK (
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

-- UPDATE: editor, founder, admin
CREATE POLICY "article_assignments_update" ON article_assignments FOR UPDATE USING (
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

-- DELETE: founder, admin
CREATE POLICY "article_assignments_delete" ON article_assignments FOR DELETE USING (
  auth_has_any_role(ARRAY['founder', 'co_founder', 'admin', 'super_admin'])
);


-- ====================================================================
-- TASK 4: workflow_history
-- ====================================================================

-- SELECT: article author, reviewer, editor, founder, admin
CREATE POLICY "workflow_history_select" ON workflow_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM articles WHERE id = workflow_history.article_id AND author_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM article_assignments WHERE article_id = workflow_history.article_id AND user_id = auth.uid() AND role_type = 'reviewer') OR
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

-- INSERT: No direct client insert allowed (only service role or triggers).
-- Thus, no INSERT policy is created for authenticated users.
-- UPDATE: NONE
-- DELETE: NONE


-- ====================================================================
-- TASK 5: magazine_issues
-- ====================================================================

-- SELECT: published issues -> public, draft/scheduled -> editor, founder, admin
CREATE POLICY "magazine_issues_select" ON magazine_issues FOR SELECT USING (
  status = 'published' OR
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

-- INSERT: editor, founder, admin
CREATE POLICY "magazine_issues_insert" ON magazine_issues FOR INSERT WITH CHECK (
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

-- UPDATE: editor, founder, admin
CREATE POLICY "magazine_issues_update" ON magazine_issues FOR UPDATE USING (
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

-- DELETE: founder, admin
CREATE POLICY "magazine_issues_delete" ON magazine_issues FOR DELETE USING (
  auth_has_any_role(ARRAY['founder', 'co_founder', 'admin', 'super_admin'])
);


-- ====================================================================
-- TASK 6: magazine_sections
-- ====================================================================

-- SELECT: public only when parent issue published
CREATE POLICY "magazine_sections_select" ON magazine_sections FOR SELECT USING (
  EXISTS (SELECT 1 FROM magazine_issues WHERE id = magazine_sections.issue_id AND status = 'published') OR
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

-- INSERT: editor, founder, admin
CREATE POLICY "magazine_sections_insert" ON magazine_sections FOR INSERT WITH CHECK (
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

-- UPDATE: editor, founder, admin
CREATE POLICY "magazine_sections_update" ON magazine_sections FOR UPDATE USING (
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

-- DELETE: founder, admin
CREATE POLICY "magazine_sections_delete" ON magazine_sections FOR DELETE USING (
  auth_has_any_role(ARRAY['founder', 'co_founder', 'admin', 'super_admin'])
);


-- ====================================================================
-- TASK 7: magazine_issue_articles
-- ====================================================================

-- SELECT: public only when issue published
CREATE POLICY "magazine_issue_articles_select" ON magazine_issue_articles FOR SELECT USING (
  EXISTS (SELECT 1 FROM magazine_issues WHERE id = magazine_issue_articles.issue_id AND status = 'published') OR
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

-- INSERT: editor, founder, admin
CREATE POLICY "magazine_issue_articles_insert" ON magazine_issue_articles FOR INSERT WITH CHECK (
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

-- UPDATE: editor, founder, admin
CREATE POLICY "magazine_issue_articles_update" ON magazine_issue_articles FOR UPDATE USING (
  auth_has_any_role(ARRAY['editor', 'editor_in_chief', 'founder', 'co_founder', 'admin', 'super_admin'])
);

-- DELETE: founder, admin
CREATE POLICY "magazine_issue_articles_delete" ON magazine_issue_articles FOR DELETE USING (
  auth_has_any_role(ARRAY['founder', 'co_founder', 'admin', 'super_admin'])
);
