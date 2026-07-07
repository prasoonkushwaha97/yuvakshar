-- Allow authenticated users to upload and manage their own media assets
DROP POLICY IF EXISTS "Allow users to upload media assets" ON public.media_assets;
CREATE POLICY "Allow users to upload media assets" ON public.media_assets
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND uploaded_by = auth.uid()
);

DROP POLICY IF EXISTS "Allow users to update their own media assets" ON public.media_assets;
CREATE POLICY "Allow users to update their own media assets" ON public.media_assets
FOR UPDATE USING (
  uploaded_by = auth.uid()
);

DROP POLICY IF EXISTS "Allow users to delete their own media assets" ON public.media_assets;
CREATE POLICY "Allow users to delete their own media assets" ON public.media_assets
FOR DELETE USING (
  uploaded_by = auth.uid()
);
