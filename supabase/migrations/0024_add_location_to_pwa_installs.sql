ALTER TABLE public.pwa_installs
  ADD COLUMN ip_address TEXT,
  ADD COLUMN country TEXT,
  ADD COLUMN region TEXT,
  ADD COLUMN city TEXT;
