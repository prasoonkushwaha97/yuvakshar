-- =============================================================================
-- Migration 046: Redesign Notifications Table
-- Replaces the old recipient_id-based schema with a role-broadcast model.
-- =============================================================================

-- Drop old table and dependencies
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Core notifications table
CREATE TABLE public.notifications (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title        TEXT NOT NULL,
    description  TEXT NOT NULL DEFAULT '',
    type         TEXT NOT NULL DEFAULT 'info'
                   CHECK (type IN ('success', 'info', 'warning', 'error')),
    category     TEXT NOT NULL DEFAULT 'system'
                   CHECK (category IN ('articles', 'magazine', 'community', 'contact', 'users', 'system', 'banners', 'settings')),
    priority     TEXT NOT NULL DEFAULT 'medium'
                   CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Targeting: role-broadcast OR individual user
    target_role  TEXT NOT NULL DEFAULT 'all',   -- 'all' | 'founder' | 'admin' | 'editor'
    target_user  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Entity deep-link
    entity_type  TEXT,    -- 'article' | 'magazine' | 'user' | 'contact' | 'banner' | 'setting'
    entity_id    TEXT,    -- the ID of the related entity
    action_url   TEXT,    -- direct URL to navigate to

    -- Read state
    is_read      BOOLEAN NOT NULL DEFAULT FALSE,
    read_at      TIMESTAMPTZ
);

-- -----------------------------------------------------------------------
-- Performance indexes
-- -----------------------------------------------------------------------
CREATE INDEX idx_notif_created_at    ON public.notifications (created_at DESC);
CREATE INDEX idx_notif_is_read       ON public.notifications (is_read);
CREATE INDEX idx_notif_category      ON public.notifications (category);
CREATE INDEX idx_notif_priority      ON public.notifications (priority);
CREATE INDEX idx_notif_target_role   ON public.notifications (target_role);
CREATE INDEX idx_notif_target_user   ON public.notifications (target_user);

-- -----------------------------------------------------------------------
-- Enable Row Level Security
-- -----------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Staff (founder / admin / editor) can see all role-broadcast notifications
CREATE POLICY "Staff can read broadcast notifications"
  ON public.notifications
  FOR SELECT
  USING (
    target_user IS NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('Founder', 'Admin', 'Editor', 'founder', 'admin', 'editor')
    )
  );

-- Individual user can read notifications targeted specifically at them
CREATE POLICY "User can read own targeted notifications"
  ON public.notifications
  FOR SELECT
  USING (target_user = auth.uid());

-- Staff can mark notifications as read (UPDATE is_read / read_at only)
CREATE POLICY "Staff can update notification read state"
  ON public.notifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('Founder', 'Admin', 'Editor', 'founder', 'admin', 'editor')
    )
  )
  WITH CHECK (TRUE);

-- Staff can delete notifications
CREATE POLICY "Staff can delete notifications"
  ON public.notifications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('Founder', 'Admin', 'Editor', 'founder', 'admin', 'editor')
    )
  );

-- Service role / admin can insert (used by supabaseAdmin client in server actions)
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (TRUE);
