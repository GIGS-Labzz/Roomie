CREATE TABLE public.waitlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  university  TEXT NOT NULL,
  city        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone (anon / authenticated) can sign up
CREATE POLICY "waitlist_public_insert" ON public.waitlist
  FOR INSERT WITH CHECK (true);

-- Only super admins can read the list
CREATE POLICY "waitlist_admin_read" ON public.waitlist
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
