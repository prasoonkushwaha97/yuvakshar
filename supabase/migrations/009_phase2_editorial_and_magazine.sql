-- Migration: 009_phase2_editorial_and_magazine.sql
-- Purpose: Schema for reviews, workflow kanban, and magazine publishing engine

-- 1. REVIEW NOTES (Threaded Discussions)
CREATE TABLE IF NOT EXISTS review_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES review_notes(id) ON DELETE CASCADE, -- For threaded discussions
  note TEXT NOT NULL,
  decision VARCHAR(50), -- e.g., 'approve', 'request_changes', 'reject', null for general note
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_review_notes_article ON review_notes(article_id);
CREATE INDEX idx_review_notes_parent ON review_notes(parent_id);

-- 2. ARTICLE ASSIGNMENTS
-- Links an article to assigned roles beyond just creator.
CREATE TABLE IF NOT EXISTS article_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_type VARCHAR(50) NOT NULL, -- e.g., 'reviewer', 'editor', 'fact_checker'
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(article_id, user_id, role_type)
);

CREATE INDEX idx_article_assignments_article ON article_assignments(article_id);
CREATE INDEX idx_article_assignments_user ON article_assignments(user_id);

-- 3. WORKFLOW HISTORY
CREATE TABLE IF NOT EXISTS workflow_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_workflow_history_article ON workflow_history(article_id);

-- 4. MAGAZINE ISSUES
CREATE TABLE IF NOT EXISTS magazine_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  cover_image VARCHAR(500),
  volume INTEGER,
  issue_number INTEGER,
  month INTEGER,
  year INTEGER,
  editorial_note TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, in_production, ready_for_publish, scheduled, published, archived
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_magazine_issues_status ON magazine_issues(status);
CREATE INDEX idx_magazine_issues_slug ON magazine_issues(slug);

-- 5. MAGAZINE SECTIONS
CREATE TABLE IF NOT EXISTS magazine_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES magazine_issues(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_magazine_sections_issue ON magazine_sections(issue_id);

-- 6. MAGAZINE ISSUE ARTICLES
CREATE TABLE IF NOT EXISTS magazine_issue_articles (
  issue_id UUID REFERENCES magazine_issues(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  section_id UUID REFERENCES magazine_sections(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (issue_id, article_id)
);

CREATE INDEX idx_mag_issue_articles_section ON magazine_issue_articles(section_id);

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE review_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazine_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazine_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazine_issue_articles ENABLE ROW LEVEL SECURITY;

-- Temporary public policies for server actions (matching Phase 1 style)
CREATE POLICY "Enable read access for all users" ON review_notes FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON review_notes USING (true);

CREATE POLICY "Enable read access for all users" ON article_assignments FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON article_assignments USING (true);

CREATE POLICY "Enable read access for all users" ON workflow_history FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON workflow_history USING (true);

CREATE POLICY "Enable read access for all users" ON magazine_issues FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON magazine_issues USING (true);

CREATE POLICY "Enable read access for all users" ON magazine_sections FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON magazine_sections USING (true);

CREATE POLICY "Enable read access for all users" ON magazine_issue_articles FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON magazine_issue_articles USING (true);
