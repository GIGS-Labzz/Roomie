-- Clean Supabase-free schema for local Postgres.
-- Supabase-specific RLS, policies, auth trigger logic, and storage bucket setup have been removed.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE gender_type AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');
CREATE TYPE sleep_schedule AS ENUM ('early_bird', 'night_owl', 'flexible');
CREATE TYPE cleanliness_level AS ENUM ('very_tidy', 'tidy', 'relaxed', 'messy');
CREATE TYPE noise_preference AS ENUM ('very_quiet', 'quiet', 'moderate', 'lively');
CREATE TYPE connection_status AS ENUM ('PENDING_PAYMENT', 'PAID', 'ACTIVE', 'DECLINED', 'EXPIRED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'ABANDONED');
CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE message_type AS ENUM (
  'text',
  'image',
  'system',
  'agreement_request',
  'agreement_confirmed',
  'agreement_declined',
  'bill_split'
);
CREATE TYPE platform_status AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT,
  age SMALLINT CHECK (age >= 16 AND age <= 35),
  gender gender_type,
  phone TEXT,
  city TEXT,
  state TEXT,
  university TEXT,
  faculty TEXT,
  course TEXT,
  year_of_study SMALLINT CHECK (year_of_study >= 1 AND year_of_study <= 7),
  min_budget INTEGER,
  max_budget INTEGER,
  move_in_date DATE,
  lifestyle_tags TEXT[] DEFAULT '{}',
  sleep_schedule sleep_schedule DEFAULT 'flexible',
  cleanliness cleanliness_level DEFAULT 'tidy',
  noise_pref noise_preference DEFAULT 'moderate',
  allows_smoking BOOLEAN DEFAULT FALSE,
  allows_pets BOOLEAN DEFAULT FALSE,
  allows_guests BOOLEAN DEFAULT TRUE,
  roommate_gender_pref gender_type,
  student_verified BOOLEAN DEFAULT FALSE,
  student_id_front_url TEXT,
  student_id_back_url TEXT,
  verification_status verification_status DEFAULT 'UNVERIFIED',
  verified_at TIMESTAMPTZ,
  onboarding_step SMALLINT DEFAULT 0,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connections
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status connection_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  payment_reference TEXT,
  amount_paid INTEGER,
  paid_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_connection CHECK (requester_id <> receiver_id)
);
CREATE UNIQUE INDEX unique_connection ON public.connections (
  LEAST(requester_id::text, receiver_id::text),
  GREATEST(requester_id::text, receiver_id::text)
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type message_type DEFAULT 'text',
  image_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_connection_id ON public.messages(connection_id, created_at DESC);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.connections(id) ON DELETE SET NULL,
  reference TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  status payment_status DEFAULT 'PENDING',
  payment_channel TEXT,
  gateway_response TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bill splits
CREATE TABLE public.bill_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  total_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'NGN',
  is_settled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.bill_split_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  split_id UUID NOT NULL REFERENCES public.bill_splits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  description TEXT,
  amount INTEGER NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  proof_url TEXT,
  amount_paid INTEGER,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'full')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Housing platforms
CREATE TABLE public.housing_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  logo_url TEXT,
  cities TEXT[] NOT NULL DEFAULT '{}',
  campus_tags TEXT[] DEFAULT '{}',
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status platform_status DEFAULT 'PENDING_REVIEW',
  is_featured BOOLEAN DEFAULT FALSE,
  registered_by UUID REFERENCES public.profiles(id),
  total_clicks INTEGER DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform clicks
CREATE TABLE public.platform_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES public.housing_platforms(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  connection_id UUID REFERENCES public.connections(id),
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Housing listings
CREATE TABLE public.housing_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES public.housing_platforms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  price_per_month INTEGER NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'room',
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  campus_tags TEXT[] DEFAULT '{}',
  contact_phone TEXT,
  contact_whatsapp TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'published',
  total_views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  expiration_time BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT DEFAULT 'super_admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocks
CREATE TABLE public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id),
  blocked_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (blocker_id, blocked_id)
);

-- Posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  city TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  move_in_date DATE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_user_id ON public.posts(user_id);

-- Post likes
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

-- Post comments
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 300),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id, created_at ASC);

-- Roommate agreements
CREATE TABLE public.roommate_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL UNIQUE REFERENCES public.connections(id) ON DELETE CASCADE,
  initiator_id UUID NOT NULL REFERENCES public.profiles(id),
  acceptor_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'DECLINED')),
  payment_reference TEXT UNIQUE,
  payment_channel TEXT,
  amount INTEGER DEFAULT 200000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  CONSTRAINT initiator_not_acceptor CHECK (initiator_id <> acceptor_id)
);
CREATE INDEX idx_agreements_connection ON public.roommate_agreements(connection_id);
CREATE INDEX idx_agreements_status ON public.roommate_agreements(status);

-- Waitlist
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  university TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
