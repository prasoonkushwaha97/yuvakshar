-- ==========================================
-- PHASE 11A: GOVERNANCE FOUNDATION
-- ==========================================
-- Purpose: Moderation, Notifications, Announcements, Audit
-- ==========================================

-- 1. REPORTS TABLE (Moderation Queue)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type VARCHAR(50) NOT NULL, -- 'article', 'comment', 'user', 'community'
  target_id UUID NOT NULL, -- generic reference, not strongly enforced natively to allow multi-type
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'under_review', 'resolved', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE reports IS 'Platform moderation queue for reporting inappropriate content/behavior';
COMMENT ON COLUMN reports.target_type IS 'Type of entity reported (article, comment, user, community)';
COMMENT ON COLUMN reports.status IS 'open, under_review, resolved, dismissed';

CREATE INDEX idx_reports_target ON reports(target_type, target_id);
CREATE INDEX idx_reports_status ON reports(status) WHERE status IN ('open', 'under_review');
CREATE INDEX idx_reports_created ON reports(created_at DESC);


-- 2. NOTIFICATIONS TABLE (Platform Events)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE notifications IS 'Universal event-driven notification engine';
COMMENT ON COLUMN notifications.event_type IS 'e.g., role_assigned, article_approved, review_requested';

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);


-- 3. ANNOUNCEMENTS TABLE (Platform-wide Announcements)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  is_pinned BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE announcements IS 'Founder-created platform announcements';
COMMENT ON COLUMN announcements.status IS 'draft, published, archived';

CREATE INDEX idx_announcements_status ON announcements(status) WHERE status = 'published';
CREATE INDEX idx_announcements_active ON announcements(published_at, expires_at);
CREATE INDEX idx_announcements_pinned ON announcements(is_pinned) WHERE is_pinned = true;


-- 4. GOVERNANCE_AUDIT_LOGS TABLE (Universal Audit)
CREATE TABLE IF NOT EXISTS governance_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL, -- 'rbac', 'moderation', 'editorial', 'community', 'announcement'
  entity_id UUID, -- Optional generic reference
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE governance_audit_logs IS 'Universal system audit for all governance branches';
COMMENT ON COLUMN governance_audit_logs.entity_type IS 'Category of audit event';

CREATE INDEX idx_governance_audit_actor ON governance_audit_logs(actor_id);
CREATE INDEX idx_governance_audit_type ON governance_audit_logs(entity_type, action_type);
CREATE INDEX idx_governance_audit_created ON governance_audit_logs(created_at DESC);

-- ==========================================
-- END MIGRATION
-- ==========================================
