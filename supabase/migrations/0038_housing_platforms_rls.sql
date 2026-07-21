-- Enable RLS on housing_platforms and platform_clicks
ALTER TABLE public.housing_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_clicks ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything on housing_platforms
CREATE POLICY "platforms_super_admin" ON public.housing_platforms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- Anyone can view active housing platforms
CREATE POLICY "platforms_read_active" ON public.housing_platforms
  FOR SELECT USING (status = 'ACTIVE');

-- Providers can select/view their own platform
CREATE POLICY "platforms_read_owner" ON public.housing_platforms
  FOR SELECT USING (contact_email = auth.jwt() ->> 'email');

-- Providers can update their own platform (but not change the status or is_featured fields unless they are super admins)
CREATE POLICY "platforms_update_owner" ON public.housing_platforms
  FOR UPDATE USING (contact_email = auth.jwt() ->> 'email')
  WITH CHECK (
    contact_email = auth.jwt() ->> 'email'
    AND status = (SELECT status FROM public.housing_platforms WHERE id = housing_platforms.id)
    AND is_featured = (SELECT is_featured FROM public.housing_platforms WHERE id = housing_platforms.id)
  );

-- Super admins can do everything on platform_clicks
CREATE POLICY "clicks_super_admin" ON public.platform_clicks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- Providers can read click stats for their own platform
CREATE POLICY "clicks_read_owner" ON public.platform_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.housing_platforms hp
      WHERE hp.id = platform_clicks.platform_id
        AND hp.contact_email = auth.jwt() ->> 'email'
    )
  );

-- Authenticated users can insert click records
CREATE POLICY "clicks_insert_own" ON public.platform_clicks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
