-- Migration: Contact Messages Management Table & RLS Policies
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT DEFAULT 'contact',
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'READ', 'ARCHIVED')),
  replies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for searching and filtering by status and date
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_category ON contact_messages(category);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop previous policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public insert into contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow public insert to contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow admin/founder full access to contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow founder and admin select on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow founder and admin update on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow founder and admin delete on contact_messages" ON contact_messages;

-- 1. Anyone (anon and authenticated) can INSERT a contact message
CREATE POLICY "Allow public insert into contact_messages"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2. Anyone (anon and authenticated) can SELECT contact messages
CREATE POLICY "Allow select on contact_messages"
  ON contact_messages
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. Allow UPDATE on contact_messages
DROP POLICY IF EXISTS "Allow founder and admin update on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow update on contact_messages" ON contact_messages;
CREATE POLICY "Allow update on contact_messages"
  ON contact_messages
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Allow DELETE on contact_messages
DROP POLICY IF EXISTS "Allow founder and admin delete on contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow delete on contact_messages" ON contact_messages;
CREATE POLICY "Allow delete on contact_messages"
  ON contact_messages
  FOR DELETE
  TO anon, authenticated
  USING (true);

