-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE gender_type AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');
CREATE TYPE sleep_schedule AS ENUM ('early_bird', 'night_owl', 'flexible');
CREATE TYPE cleanliness_level AS ENUM ('very_tidy', 'tidy', 'relaxed', 'messy');
CREATE TYPE noise_preference AS ENUM ('very_quiet', 'quiet', 'moderate', 'lively');
CREATE TYPE connection_status AS ENUM ('PENDING_PAYMENT', 'PAID', 'ACTIVE', 'DECLINED', 'EXPIRED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'ABANDONED');
CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE message_type AS ENUM ('text', 'image', 'system');
CREATE TYPE platform_status AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- ─── Profiles ────────────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic identity
  display_name    TEXT NOT NULL DEFAULT '',
  avatar_url      TEXT,
  bio             TEXT,
  age             SMALLINT CHECK (age >= 16 AND age <= 35),
  gender          gender_type,
  phone           TEXT,

  -- Location
  city            TEXT,
  state           TEXT,

  -- University
  university      TEXT,
  faculty         TEXT,
  course          TEXT,
  year_of_study   SMALLINT CHECK (year_of_study >= 1 AND year_of_study <= 7),

  -- Housing preferences
  min_budget      INTEGER,
  max_budget      INTEGER,
  move_in_date    DATE,

  -- Lifestyle tags (array for filtering)
  lifestyle_tags  TEXT[] DEFAULT '{}',

  -- Detailed lifestyle
  sleep_schedule    sleep_schedule DEFAULT 'flexible',
  cleanliness       cleanliness_level DEFAULT 'tidy',
  noise_pref        noise_preference DEFAULT 'moderate',
  allows_smoking    BOOLEAN DEFAULT FALSE,
  allows_pets       BOOLEAN DEFAULT FALSE,
  allows_guests     BOOLEAN DEFAULT TRUE,

  -- Preferred roommate gender
  roommate_gender_pref  gender_type,

  -- Verification
  student_verified      BOOLEAN DEFAULT FALSE,
  student_id_front_url  TEXT,
  student_id_back_url   TEXT,
  verification_status   verification_status DEFAULT 'UNVERIFIED',
  verified_at           TIMESTAMPTZ,

  -- Onboarding state
  onboarding_step       SMALLINT DEFAULT 0,
  onboarding_complete   BOOLEAN DEFAULT FALSE,

  -- Activity
  last_seen_at    TIMESTAMPTZ DEFAULT NOW(),
  is_active       BOOLEAN DEFAULT TRUE,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Connections ─────────────────────────────────────────────────────────────

CREATE TABLE public.connections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status              connection_status NOT NULL DEFAULT 'PENDING_PAYMENT',

  -- Payment
  payment_reference   TEXT,
  amount_paid         INTEGER,
  paid_at             TIMESTAMPTZ,

  -- Timestamps
  connected_at        TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT no_self_connection CHECK (requester_id <> receiver_id)
);

-- Prevent duplicate connections regardless of who initiated
CREATE UNIQUE INDEX unique_connection ON public.connections (
  LEAST(requester_id::text, receiver_id::text),
  GREATEST(requester_id::text, receiver_id::text)
);

-- ─── Messages ────────────────────────────────────────────────────────────────

CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id   UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  message_type    message_type DEFAULT 'text',
  image_url       TEXT,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_connection_id ON public.messages(connection_id, created_at DESC);

-- ─── Payments ────────────────────────────────────────────────────────────────

CREATE TABLE public.payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id     UUID REFERENCES public.connections(id) ON DELETE SET NULL,
  reference         TEXT NOT NULL UNIQUE,
  amount            INTEGER NOT NULL,
  status            payment_status DEFAULT 'PENDING',
  payment_channel   TEXT,
  gateway_response  TEXT,
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Bill Splits ─────────────────────────────────────────────────────────────

CREATE TABLE public.bill_splits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id   UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES public.profiles(id),
  title           TEXT NOT NULL,
  description     TEXT,
  total_amount    INTEGER NOT NULL,
  currency        TEXT DEFAULT 'NGN',
  is_settled      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.bill_split_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  split_id        UUID NOT NULL REFERENCES public.bill_splits(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  description     TEXT,
  amount          INTEGER NOT NULL,
  is_paid         BOOLEAN DEFAULT FALSE,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Housing Platforms ───────────────────────────────────────────────────────

CREATE TABLE public.housing_platforms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  url             TEXT NOT NULL,
  logo_url        TEXT,

  cities          TEXT[] NOT NULL DEFAULT '{}',
  campus_tags     TEXT[] DEFAULT '{}',

  contact_name    TEXT,
  contact_email   TEXT NOT NULL,
  contact_phone   TEXT,

  status          platform_status DEFAULT 'PENDING_REVIEW',
  is_featured     BOOLEAN DEFAULT FALSE,
  registered_by   UUID REFERENCES public.profiles(id),

  total_clicks    INTEGER DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Platform Clicks ─────────────────────────────────────────────────────────

CREATE TABLE public.platform_clicks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id     UUID NOT NULL REFERENCES public.housing_platforms(id),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  connection_id   UUID REFERENCES public.connections(id),
  clicked_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Notifications ───────────────────────────────────────────────────────────

CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  data            JSONB DEFAULT '{}',
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Push Subscriptions ──────────────────────────────────────────────────────

CREATE TABLE public.push_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint        TEXT NOT NULL UNIQUE,
  p256dh          TEXT NOT NULL,
  auth            TEXT NOT NULL,
  expiration_time BIGINT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Admin Users ─────────────────────────────────────────────────────────────

CREATE TABLE public.admin_users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id),
  role            TEXT DEFAULT 'super_admin',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Blocks ──────────────────────────────────────────────────────────────────

CREATE TABLE public.blocks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id    UUID NOT NULL REFERENCES public.profiles(id),
  blocked_id    UUID NOT NULL REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (blocker_id, blocked_id)
);

-- ─── Row-Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_splits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_split_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks             ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read active profiles, only owner can write
CREATE POLICY "profiles_read_all" ON public.profiles
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "profiles_write_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Connections: only involved users
CREATE POLICY "connections_own" ON public.connections
  FOR ALL USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Messages: only members of an ACTIVE connection
CREATE POLICY "messages_connection_members" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = messages.connection_id
        AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
        AND c.status = 'ACTIVE'
    )
  );

-- Payments: read own only — writes go through service role (webhook)
CREATE POLICY "payments_read_own" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Bill splits: connection members only
CREATE POLICY "bill_splits_connection_members" ON public.bill_splits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = bill_splits.connection_id
        AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
    )
  );

CREATE POLICY "bill_split_items_connection_members" ON public.bill_split_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bill_splits bs
      JOIN public.connections c ON c.id = bs.connection_id
      WHERE bs.id = bill_split_items.split_id
        AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
    )
  );

-- Notifications: recipient only
CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- Push subscriptions: owner only
CREATE POLICY "push_subscriptions_own" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Blocks: blocker can read/write their own blocks
CREATE POLICY "blocks_own" ON public.blocks
  FOR ALL USING (auth.uid() = blocker_id);

-- ─── Triggers ────────────────────────────────────────────────────────────────

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER bill_splits_updated_at
  BEFORE UPDATE ON public.bill_splits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
