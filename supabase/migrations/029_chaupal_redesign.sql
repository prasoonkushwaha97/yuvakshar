-- 029_chaupal_redesign.sql
-- Description: Migrates old community schema to the new Chaupal Slack/WhatsApp hybrid architecture.

-- 1. Drop old community views and tables (Starting fresh for Chaupal)
DROP VIEW IF EXISTS public.community_groups;

DROP TABLE IF EXISTS public.community_comment_likes CASCADE;
DROP TABLE IF EXISTS public.community_comments CASCADE;
DROP TABLE IF EXISTS public.community_post_likes CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;

DROP TABLE IF EXISTS public.community_settings CASCADE;
DROP TABLE IF EXISTS public.community_members CASCADE;
DROP TABLE IF EXISTS public.communities CASCADE;


-- 2. Create Chaupal Tables

-- 2.1 chaupal_rooms (Chat Rooms / Topics)
CREATE TABLE IF NOT EXISTS public.chaupal_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'public', -- editorial, public, announcement, group
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2.2 chaupal_messages (Chat Messages in a room)
CREATE TABLE IF NOT EXISTS public.chaupal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chaupal_rooms(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.chaupal_messages(id) ON DELETE CASCADE, -- For threads/replies
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2.3 chaupal_message_reactions
CREATE TABLE IF NOT EXISTS public.chaupal_message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.chaupal_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(message_id, user_id, emoji)
);

-- 2.4 chaupal_groups (Private/Public groups for isolated chat rooms)
CREATE TABLE IF NOT EXISTS public.chaupal_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  avatar_url TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2.5 chaupal_group_members
CREATE TABLE IF NOT EXISTS public.chaupal_group_members (
  group_id UUID NOT NULL REFERENCES public.chaupal_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- admin, moderator, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  PRIMARY KEY (group_id, user_id)
);

-- 3. Enable RLS
ALTER TABLE public.chaupal_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chaupal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chaupal_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chaupal_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chaupal_group_members ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- chaupal_rooms
-- Public can read all rooms that are NOT of type 'group'. Group rooms will be handled separately.
CREATE POLICY "Public can read non-group rooms" ON public.chaupal_rooms FOR SELECT USING (type != 'group');
-- Only Editorial/Admin can manage rooms (We'll assume 'manage' means insert/update/delete)
-- CREATE POLICY "Editorial manage rooms" ... omitted for brevity, keeping it simple for MVP

-- chaupal_messages
-- Public can read messages from public rooms. For MVP, anyone can read.
CREATE POLICY "Public can read messages" ON public.chaupal_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chaupal_rooms r WHERE r.id = room_id AND r.type != 'group'
  )
);
-- Authenticated users can insert messages
CREATE POLICY "Auth users can insert messages" ON public.chaupal_messages FOR INSERT WITH CHECK (auth.uid() = author_id);
-- Users can manage their own messages
CREATE POLICY "Users can manage own messages" ON public.chaupal_messages FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own messages" ON public.chaupal_messages FOR DELETE USING (auth.uid() = author_id);

-- chaupal_message_reactions
CREATE POLICY "Public can read reactions" ON public.chaupal_message_reactions FOR SELECT USING (true);
CREATE POLICY "Auth users can manage reactions" ON public.chaupal_message_reactions FOR ALL USING (auth.uid() = user_id);

-- chaupal_groups
CREATE POLICY "Public can read groups" ON public.chaupal_groups FOR SELECT USING (true);
CREATE POLICY "Auth users can create groups" ON public.chaupal_groups FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- chaupal_group_members
CREATE POLICY "Public can read group members" ON public.chaupal_group_members FOR SELECT USING (true);
CREATE POLICY "Auth users can join public groups" ON public.chaupal_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 5. Real-Time Setup
-- Enable real-time for chaupal_messages and chaupal_message_reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.chaupal_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chaupal_message_reactions;
