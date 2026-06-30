-- Wave 2: Editorial & Submissions Migration

-- 1. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL DEFAULT 'article', -- 'contact', 'feedback', 'suggestion', 'report', 'article'
    name TEXT NOT NULL,
    email TEXT,
    mobile TEXT,
    subject TEXT,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'New', -- 'New', 'Open', 'In Progress', 'Resolved', 'Archived', 'Approved', 'Rejected'
    category TEXT,
    title TEXT,
    image_url TEXT,
    pdf_url TEXT,
    doc_url TEXT,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Optional if submitted by logged-in user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Submission Attachments
CREATE TABLE IF NOT EXISTS public.submission_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Editorial Cases (Moderation, Support, Editorial checks built on BaseCase)
CREATE TABLE IF NOT EXISTS public.editorial_cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
    article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
    case_type VARCHAR(50) NOT NULL DEFAULT 'Editorial Review', -- 'Moderation', 'Copyright', 'Editorial Review'
    status VARCHAR(50) NOT NULL DEFAULT 'New', -- 'New', 'Triaged', 'Investigating', 'Action Taken', 'Closed'
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    description TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Editorial Assignments
CREATE TABLE IF NOT EXISTS public.editorial_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    section_editor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'Assigned', -- 'Assigned', 'In Progress', 'Under Review', 'Completed', 'Revision Requested'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Editorial Comments (For cases, assignments, revisions)
CREATE TABLE IF NOT EXISTS public.editorial_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    editorial_case_id UUID REFERENCES public.editorial_cases(id) ON DELETE CASCADE,
    editorial_assignment_id UUID REFERENCES public.editorial_assignments(id) ON DELETE CASCADE,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    comment_text TEXT NOT NULL,
    is_internal_only BOOLEAN DEFAULT true, -- If false, author can see it
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Editorial Timeline (Audit Trail for Editorial Workflow)
CREATE TABLE IF NOT EXISTS public.editorial_timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'submission', 'case', 'assignment', 'article'
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'Submission Created', 'Status Changed', 'Assigned'
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Triggers for updated_at
-- ==========================================

CREATE TRIGGER set_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_editorial_cases_updated_at
    BEFORE UPDATE ON public.editorial_cases
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_editorial_assignments_updated_at
    BEFORE UPDATE ON public.editorial_assignments
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_editorial_comments_updated_at
    BEFORE UPDATE ON public.editorial_comments
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ==========================================
-- Indexes for Performance
-- ==========================================
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_editorial_cases_status ON public.editorial_cases(status);
CREATE INDEX idx_editorial_assignments_status ON public.editorial_assignments(status);
CREATE INDEX idx_editorial_timeline_entity ON public.editorial_timeline(entity_type, entity_id);

-- ==========================================
-- Row Level Security (RLS)
-- ==========================================

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_timeline ENABLE ROW LEVEL SECURITY;

-- Submissions
CREATE POLICY "Public can insert submissions" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own submissions" ON public.submissions FOR SELECT USING (submitted_by = auth.uid());
CREATE POLICY "Staff can view all submissions" ON public.submissions FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor', 'Editor', 'Admin', 'Founder')
);
CREATE POLICY "Staff can update submissions" ON public.submissions FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor', 'Editor', 'Admin', 'Founder')
);

-- Editorial Cases
CREATE POLICY "Staff can view cases" ON public.editorial_cases FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor', 'Editor', 'Admin', 'Founder')
);
CREATE POLICY "Staff can insert/update cases" ON public.editorial_cases FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor', 'Editor', 'Admin', 'Founder')
);

-- Editorial Assignments
CREATE POLICY "Authors can view own assignments" ON public.editorial_assignments FOR SELECT USING (
    author_id = auth.uid() OR reviewer_id = auth.uid() OR section_editor_id = auth.uid()
);
CREATE POLICY "Staff can view all assignments" ON public.editorial_assignments FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor', 'Editor', 'Admin', 'Founder')
);
CREATE POLICY "Staff can insert/update assignments" ON public.editorial_assignments FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor', 'Editor', 'Admin', 'Founder')
);

-- Editorial Comments
CREATE POLICY "Users can view own non-internal comments" ON public.editorial_comments FOR SELECT USING (
    user_id = auth.uid() AND is_internal_only = false
);
CREATE POLICY "Staff can view all comments" ON public.editorial_comments FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Super Admin', 'Editor-in-Chief', 'Managing Editor', 'Section Editor', 'Editor', 'Admin', 'Founder')
);
CREATE POLICY "Users can insert comments" ON public.editorial_comments FOR INSERT WITH CHECK (
    user_id = auth.uid()
);
