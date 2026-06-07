-- Allow super admins to read and update any profile (for student verification)
CREATE POLICY "profiles_super_admin_all" ON public.profiles
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- Allow super admins to read all connections (for the connections page)
CREATE POLICY "connections_super_admin_read" ON public.connections
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
