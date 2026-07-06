-- Drop existing profiles_read_all policy
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;

-- Re-create profiles_read_all policy to include active profiles and profiles connected with the current user
CREATE POLICY "profiles_read_all" ON public.profiles
  FOR SELECT USING (
    is_active = TRUE
    OR
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE (c.requester_id = public.profiles.id OR c.receiver_id = public.profiles.id)
        AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
    )
  );
