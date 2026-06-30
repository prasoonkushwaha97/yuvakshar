-- Update articles status constraint to allow contributor workflow statuses
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_status_check;

ALTER TABLE public.articles ADD CONSTRAINT articles_status_check CHECK (
    status IN (
        'Draft',
        'Submitted',
        'Under Review',
        'Revision Requested',
        'Approved',
        'Scheduled',
        'Published',
        'Rejected',
        'Archived'
    )
);
