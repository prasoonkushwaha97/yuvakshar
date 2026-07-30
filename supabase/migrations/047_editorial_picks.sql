-- Add Editorial Picks columns to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS is_editor_pick BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS editor_pick_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS editor_pick_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS editor_pick_by UUID REFERENCES profiles(id) ON DELETE SET NULL DEFAULT NULL;

-- Index for fast query sorting on homepage
CREATE INDEX IF NOT EXISTS idx_articles_editor_pick 
ON articles(is_editor_pick, editor_pick_order ASC) 
WHERE is_editor_pick = TRUE;
