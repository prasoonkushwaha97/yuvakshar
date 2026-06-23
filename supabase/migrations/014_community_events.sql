-- ==========================================
-- PHASE 4C: COMMUNITY EVENTS MIGRATION
-- ==========================================

-- 1. Create community_events
CREATE TABLE IF NOT EXISTS public.community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'Meetup',
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_link TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Create community_event_attendees
CREATE TABLE IF NOT EXISTS public.community_event_attendees (
  event_id UUID REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  PRIMARY KEY (event_id, user_id)
);

-- 3. Enable RLS
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_event_attendees ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Public read community_events" ON public.community_events;
CREATE POLICY "Public read community_events" ON public.community_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth insert community_events" ON public.community_events;
-- Anyone with Admin or Founder can create, for now allow anyone authenticated to propose
CREATE POLICY "Auth insert community_events" ON public.community_events FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update community_events" ON public.community_events;
CREATE POLICY "Auth update community_events" ON public.community_events FOR UPDATE TO authenticated USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Public read attendees" ON public.community_event_attendees;
CREATE POLICY "Public read attendees" ON public.community_event_attendees FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth manage attendees" ON public.community_event_attendees;
CREATE POLICY "Auth manage attendees" ON public.community_event_attendees FOR ALL TO authenticated USING (auth.uid() = user_id);
