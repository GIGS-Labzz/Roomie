CREATE TABLE public.pwa_installs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  platform     TEXT NOT NULL, -- 'iOS', 'Android', 'Windows', 'macOS', 'Linux', or 'Unknown'
  user_agent   TEXT,
  installed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.pwa_installs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous or authenticated clients to log install events
CREATE POLICY "pwa_installs_insert" ON public.pwa_installs
  FOR INSERT WITH CHECK (true);

-- Restrict read permissions to Super Admins only
CREATE POLICY "pwa_installs_select" ON public.pwa_installs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
