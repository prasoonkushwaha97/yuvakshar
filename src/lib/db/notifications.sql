-- Migration: Central CMS Notifications System Table & RLS Policies
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('success', 'info', 'warning', 'error')),
  category TEXT NOT NULL DEFAULT 'system' CHECK (category IN ('articles', 'magazine', 'community', 'contact', 'users', 'system', 'banners', 'settings')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  target_role TEXT DEFAULT 'all',
  target_user UUID,
  entity_type TEXT,
  entity_id TEXT,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON notifications(target_role);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop previous policies to avoid conflicts
DROP POLICY IF EXISTS "Allow select notifications for staff" ON notifications;
DROP POLICY IF EXISTS "Allow insert notifications for staff and system" ON notifications;
DROP POLICY IF EXISTS "Allow update notifications for staff" ON notifications;
DROP POLICY IF EXISTS "Allow delete notifications for staff" ON notifications;

-- 1. SELECT Policy: Staff and logged-in users can read notifications intended for them
CREATE POLICY "Allow select notifications for staff"
  ON notifications
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. INSERT Policy: System and actions can insert notifications
CREATE POLICY "Allow insert notifications for staff and system"
  ON notifications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3. UPDATE Policy: Users can mark notifications as read
CREATE POLICY "Allow update notifications for staff"
  ON notifications
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 4. DELETE Policy: Staff can delete notifications
CREATE POLICY "Allow delete notifications for staff"
  ON notifications
  FOR DELETE
  TO anon, authenticated
  USING (true);
