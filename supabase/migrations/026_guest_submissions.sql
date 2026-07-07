-- Create guest_submissions table
CREATE TABLE IF NOT EXISTS public.guest_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(50),
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    status VARCHAR(50) DEFAULT 'Submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_guest_submissions_modtime ON public.guest_submissions;
CREATE TRIGGER update_guest_submissions_modtime
BEFORE UPDATE ON public.guest_submissions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable RLS
ALTER TABLE public.guest_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to insert guest submissions
DROP POLICY IF EXISTS "Allow anyone to insert guest submissions" ON public.guest_submissions;
CREATE POLICY "Allow anyone to insert guest submissions" ON public.guest_submissions
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- (Removed "Allow users to view own guest submissions" since there is no author_id)

-- Allow authenticated users to view only if they are admins or editors
-- (For simplicity, assuming admins/editors have specific roles in user_roles or similar, 
-- or we can just restrict to authenticated users for now if we don't have a strict role check in the policy. 
-- Wait, the `articles` table relies on application-level checks or JWT claims. 
-- Let's just create a basic policy to prevent public read access).
DROP POLICY IF EXISTS "Allow editors to view guest submissions" ON public.guest_submissions;
CREATE POLICY "Allow editors to view guest submissions" ON public.guest_submissions
    FOR SELECT 
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('Admin', 'Editor', 'Editor-in-Chief')
      )
    );

DROP POLICY IF EXISTS "Allow editors to update guest submissions" ON public.guest_submissions;
CREATE POLICY "Allow editors to update guest submissions" ON public.guest_submissions
    FOR UPDATE 
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('Admin', 'Editor', 'Editor-in-Chief')
      )
    );
