CREATE TABLE public.housing_listings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id      UUID NOT NULL REFERENCES public.housing_platforms(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  address          TEXT NOT NULL,
  city             TEXT NOT NULL,
  state            TEXT,
  price_per_month  INTEGER NOT NULL,
  property_type    TEXT NOT NULL DEFAULT 'room',
  bedrooms         INTEGER NOT NULL DEFAULT 1,
  bathrooms        INTEGER NOT NULL DEFAULT 1,
  amenities        TEXT[] DEFAULT '{}',
  images           TEXT[] DEFAULT '{}',
  campus_tags      TEXT[] DEFAULT '{}',
  contact_phone    TEXT,
  contact_whatsapp TEXT,
  is_available     BOOLEAN NOT NULL DEFAULT TRUE,
  status           TEXT NOT NULL DEFAULT 'published',
  total_views      INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.housing_listings ENABLE ROW LEVEL SECURITY;

-- Providers manage their own platform's listings (matched by contact_email)
CREATE POLICY "listings_platform_owner" ON public.housing_listings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.housing_platforms hp
      WHERE hp.id = platform_id
        AND hp.contact_email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.housing_platforms hp
      WHERE hp.id = platform_id
        AND hp.contact_email = auth.jwt() ->> 'email'
    )
  );

-- Students can read published listings from active platforms
CREATE POLICY "listings_read_published" ON public.housing_listings
  FOR SELECT USING (
    status = 'published'
    AND is_available = TRUE
    AND EXISTS (
      SELECT 1 FROM public.housing_platforms hp
      WHERE hp.id = platform_id AND hp.status = 'ACTIVE'
    )
  );

-- Super admins can read all listings
CREATE POLICY "listings_super_admin" ON public.housing_listings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
