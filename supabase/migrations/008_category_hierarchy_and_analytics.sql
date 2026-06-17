-- Migration: 005_category_hierarchy_and_analytics
-- Purpose: Adds parent/child hierarchy support, audit fields to categories, and workflow fields to articles.

-- 1. CATEGORIES TABLE UPDATES
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Index for efficient hierarchy queries
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- 2. ARTICLES TABLE UPDATES (Phase 2 Preparation)
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS editor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMP WITH TIME ZONE;

-- Update comments
COMMENT ON COLUMN categories.parent_id IS 'Hierarchical parent category. Null means root level. Max depth allowed by UI is 2.';
COMMENT ON COLUMN articles.reviewer_id IS 'Profile ID of the assigned fact checker/reviewer.';
COMMENT ON COLUMN articles.editor_id IS 'Profile ID of the final editor.';
COMMENT ON COLUMN articles.scheduled_publish_at IS 'When the article should automatically go live if status is scheduled.';
