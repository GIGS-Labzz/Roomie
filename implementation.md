# Roomie — Implementation Plan

> **Tagline:** Connect and Cooonnectttt  
> **Type:** SaaS PWA — Student Roommate Matching Platform  
> **Author:** GoFinder Team  
> **Date:** 2026-05-31  
> **Last updated:** 2026-06-02 — Phases 1–6 largely complete: agreement flow, housing, bill splitting, PWA service worker + install prompt all shipped. Remaining: student verification, push notifications (Phase 7), admin dashboard (Phase 8), marketing SPA (Phase 9), Phase 3B live query

---

## Table of Contents

1. [What We Are Building](#1-what-we-are-building)
2. [The Problem We Are Solving](#2-the-problem-we-are-solving)
3. [How the Platform Works — End to End](#3-how-the-platform-works--end-to-end)
4. [User Personas](#4-user-personas)
5. [Business Model](#5-business-model)
6. [Tech Stack — Decisions and Rationale](#6-tech-stack--decisions-and-rationale)
7. [Database Schema (Supabase / PostgreSQL)](#7-database-schema-supabase--postgresql)
8. [Project Structure](#8-project-structure)
9. [App 1 — Marketing SPA (`apps/web`)](#9-app-1--marketing-spa-appsweb)
10. [App 2 — Main PWA (`apps/app`)](#10-app-2--main-pwa-appsapp)
11. [App 3 — Platform Provider Dashboard (`apps/admin`)](#11-app-3--platform-provider-dashboard-appsadmin)
12. [Onboarding Flow — Detailed](#12-onboarding-flow--detailed)
13. [Roommate Discovery Feed](#13-roommate-discovery-feed)
13B. [Social Feed (Twitter-style Posts)](#13b-social-feed-twitter-style-posts)
14. [Connection & Payment Flow (Paystack)](#14-connection--payment-flow-paystack)
15. [In-App Chat Architecture](#15-in-app-chat-architecture)
16. [Bill Splitting Feature](#16-bill-splitting-feature)
17. [Housing Platform Redirect System](#17-housing-platform-redirect-system)
18. [User Verification & KYC System (Grace Period, NDA Proofs & Limitations)](#18-user-verification--kyc-system-grace-period-nda-proofs--limitations)
19. [PWA Architecture](#19-pwa-architecture)
20. [Animated Icons System (Lottie)](#20-animated-icons-system-lottie)
21. [API Routes Reference](#21-api-routes-reference)
22. [Environment Variables](#22-environment-variables)
23. [Complete File Map](#23-complete-file-map)
24. [Package Installation Reference](#24-package-installation-reference)
25. [Implementation Phases](#25-implementation-phases)
26. [GoFinder Code References — What to Reuse](#26-gofinder-code-references--what-to-reuse)
27. [Containerization & Local Development](#27-containerization--local-development)
28. [Security Architecture](#28-security-architecture)

---

## 1. What We Are Building

Roomie is a focused, student-first SaaS platform for finding and connecting with roommates. It is carved out from the GoFinder ecosystem as a standalone product with its own identity, business model, and tech stack.

The simplest description: **Facebook Marketplace, but for student roommates in Nigeria.**

Anyone who opens Roomie arrives with one purpose — finding someone to share accommodation with. There is no landlord-facing side, no listings to browse, no property management. The entire experience is about one human connecting with another human to share a living space.

Once two students connect through Roomie, the platform hands them off to house renting services (agents, platforms, hostels) nearby their campus. This handoff is the monetization moment — the connection fee of ₦2,000 unlocks both the chat and the curated list of housing providers.

Roomie operates three applications under one monorepo:

1. **`apps/web`** — A marketing SPA. Bold, animated, single-page. Converts visitors into sign-ups. Explains the platform. Targets students and housing providers.
2. **`apps/app`** — The main product. A PWA where students browse profiles, match, pay, chat, split bills, and get referred to housing.
3. **`apps/admin`** — A dashboard for housing platform providers and agents to register their services, manage their listings/links, and view referral traffic from Roomie.

---

## 2. The Problem We Are Solving

Finding a roommate as a Nigerian university student is a deeply broken experience. Students post in WhatsApp groups that get buried in minutes. They rely on word-of-mouth. They move into accommodation with strangers they know nothing about. They have no tool to verify compatibility before committing.

The consequences:
- Lifestyle clashes (sleep schedules, cleanliness, noise, guests)
- Budget mismatches discovered after moving in
- No shared ledger for bills — disputes arise
- No curated path from "found a roommate" to "found a place to live"

Roomie solves each of these:
- Structured profiles surface compatibility before connection
- A real-time chat is unlocked immediately after connecting, enabling deeper conversations
- A built-in bill splitter keeps finances transparent
- After connecting and paying ₦2,000, students get a curated shortlist of nearby housing providers

---

## 3. How the Platform Works — End to End

### Student Journey

```mermaid
flowchart TD
    Start[User Visits Roomie] --> OAuth[Google One-Tap OAuth Sign In]
    OAuth --> Onboarding[3-Lane Onboarding Steps 0–10]
    Onboarding --> KYC{KYC Status?}
    
    KYC -- Verified --> FullAccess[Full Access Granted<br/>Unlimited Connections]
    KYC -- Skipped / In Grace --> GraceAccess[30-Day Grace Access<br/>Max 2 Connections/Day]

    FullAccess --> Feed[Social Feed /feed & Discover /discover]
    GraceAccess --> Feed

    Feed --> Connect[Send Free Connection Request]
    Connect --> ChatUnlocked[Instant Direct Chat Unlocked]
    
    ChatUnlocked --> Agreement[User Proposes Roommate Agreement]
    Agreement --> PayGate{Accept & Pay ₦2,000?}
    
    PayGate -- Accept & Pay --> Paystack[Paystack Popup: Card/Transfer/OPay/USSD]
    Paystack --> Webhook[Paystack Webhook Verification]
    Webhook --> HousingUnlocked[Housing Referrals & Partners Unlocked for Both]
    
    HousingUnlocked --> ProviderRedirect[Redirect to Housing Provider]
    ProviderRedirect --> BillSplits[Use Built-In Bill Splitter Post Move-In]
```

### Housing Provider Journey

```
1. Land on Roomie admin registration page → fill public form
   (platform name, URL, city/campus coverage, contact name/email/phone)
2. Roomie super admin reviews and approves → status = ACTIVE
3. Provider appears in the curated list shown to students who paid ₦2,000
4. Provider receives a dashboard login → views referral clicks + analytics
5. Provider can update listing details, add/remove cities, update logo
```

### What Roomie Is Now (Revised Product Description)

Roomie is a **three-surface student roommate platform**:

| Surface | What it is | Who uses it daily |
|---|---|---|
| **Feed** (`/feed`) | Social post board — students broadcast what they need | Everyone; high-frequency engagement |
| **Discover** (`/discover`) | Profile card grid — browse, filter, connect | Active searchers |
| **Chat** (`/chat`) | Direct messaging between connected users | Connected pairs |

The revenue gate sits at the **Roommate Agreement** step — inside the chat. When both parties commit to living together via the in-chat consent flow, the acceptor pays ₦2,000. This unlocks housing referrals for both.

---

## 4. User Personas

### Persona 1 — Amara, 19, 200-level Business Admin, UNILAG
- Moves to Lagos from Kano for university
- Knows nobody. Her aunt's house is 45 minutes away
- Needs someone to split rent of ₦150,000/month
- Is tidy, sleeps early, does not smoke
- Has ₦80,000 budget per month
- Wants a female roommate

**Roomie solves:** She finds Fatimah (same budget, female, UNILAG, non-smoker) in 3 days. They agree on a place. Roomie shows them UniHousing Lagos as a nearby provider.

### Persona 2 — Emeka, 21, 300-level Computer Science, UniAbuja
- Current accommodation expires. Looking for someone to share a self-con near campus
- Night owl, works on his laptop past midnight
- Has ₦60,000/month budget
- Needs a male roommate who is fine with late nights

**Roomie solves:** He filters by "night owl" lifestyle tag + university + male. Finds a match in 1 day.

### Persona 3 — Mr. Balogun, Owner of UniCrib Abuja (Housing Provider)
- Runs a student hostel referral platform
- Wants to reach students actively searching for accommodation
- Not interested in running ads — wants intent-based referrals

**Roomie solves:** He lists UniCrib on Roomie admin dashboard. Gets shown to every Roomie user who connects and is near Abuja. Pays nothing — Roomie is currently free for providers (future: subscription model).

---

## 5. Business Model

### Revenue Stream 1 — Roommate Agreement Fee (Primary)
- ₦2,000 per roommate agreement — paid by the **acceptor** at the moment they confirm the agreement
- Triggered inside the chat: initiator proposes → acceptor pays to accept
- One payment unlocks housing access for **both** users in the connection
- Paystack handles all payment methods (card, bank transfer, USSD, OPay, PalmPay)
- The payment is meaningful: it is attached to a deliberate commitment moment ("we're serious about living together"), not a toll at a navigation gate
- Unlocks curated housing providers + referral tracking
- Future: Split the fee between both parties (₦1,000 each) to reduce friction

### Revenue Stream 2 — Featured Provider Slots (Future)
- Housing platforms pay to appear at the top of the redirect list
- Priced per city per month

### Revenue Stream 3 — Verified Badge Subscription (Future)
- Free: Basic profile
- Pro (₦500/month): Verified student badge prominently shown, appear higher in feed, message before connecting

### Cost Drivers
- Supabase (free tier sufficient to start; Pro plan at ~$25/month handles 50,000 MAU)
- Vercel hosting (free tier for web + app; Pro at $20/month for scale)
- Paystack: 1.5% + ₦100 per transaction, capped at ₦2,000
- **Identity Lookups & KYC Verification Costs (100% Platform Absorbed)**: The platform absorbs all fees associated with identity verification lookups, institution ID checks, and document OCR background checks. Verification is **completely free (₦0)** to all users.

**Unit economics at 50 connected pairs/day paying for housing access:**
- Revenue: 50 pairs × ₦2,000 = ₦100,000/day (conservative estimate: not all pairs pay)
- Paystack fee: ~₦30/transaction × 50 = ₦1,500/day
- Net: ~₦98,500/day = ~₦2.95M/month

---

## 6. Tech Stack — Decisions and Rationale

### Database: Supabase (PostgreSQL) — Not Firebase

**Why Supabase over Firebase:**

| Requirement | Supabase (PostgreSQL) | Firebase (Firestore) |
|---|---|---|
| Complex relational queries (payments, connections) | Excellent — native SQL JOINs | Painful — no JOINs, manual denormalization |
| Real-time chat | Built-in via Postgres Changes | Built-in via onSnapshot |
| Google OAuth | Built-in via Supabase Auth | Built-in |
| Row-level security (privacy) | Native PostgreSQL RLS | Firestore rules (less expressive) |
| Student ID file storage | Supabase Storage (S3-compatible) | Firebase Storage |
| Schema migrations | Supabase migrations (SQL files, version-controlled) | No formal migration system |
| TypeScript type generation | `supabase gen types typescript` — zero-config | Manual or third-party |
| Self-hostable | Yes (open-source) | No (Google-only) |
| Query complexity (analytics, admin views) | Full SQL — aggregations, windows, CTEs | Limited — requires Cloud Functions for aggregations |

Supabase is the right choice. The connection model (user A connects with user B, payment verified, chat unlocked) is inherently relational. Firebase would require significant denormalization and client-side joins.

### Frontend: Next.js 16 (App Router) — All Three Apps

- App Router enables per-route caching, streaming, Server Components
- Shared between all three apps via Turborepo
- PWA via Serwist (same approach documented in GoFinder PWA_PLAN.md)

### Payments: Paystack

- Dominant payment processor in Nigeria
- Supports: Card, Bank Transfer, USSD, OPay, PalmPay, QR
- Inline popup (no redirect) for seamless UX
- Webhooks for reliable payment confirmation
- Paystack's `metadata` field carries `connection_id` for webhook routing

### Animations: Lottie + Framer Motion

- Lottie for rich animated icons (connecting icon, payment success, verified badge, etc.)
- Framer Motion for page transitions, feed card animations
- No emoji usage anywhere in the interface — icons only

### Monorepo: Turborepo

- Same toolchain as GoFinder — consistent developer experience
- Shared `packages/ui`, `packages/db`, `packages/config`

---

## 7. Database Schema (Supabase / PostgreSQL)

### Full Schema

```sql
-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- for full-text search on profiles

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE gender_type AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');
CREATE TYPE sleep_schedule AS ENUM ('early_bird', 'night_owl', 'flexible');
CREATE TYPE cleanliness_level AS ENUM ('very_tidy', 'tidy', 'relaxed', 'messy');
CREATE TYPE noise_preference AS ENUM ('very_quiet', 'quiet', 'moderate', 'lively');
CREATE TYPE connection_status AS ENUM ('ACTIVE', 'DECLINED', 'INACTIVE');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'ABANDONED');
CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE message_type AS ENUM ('text', 'image', 'system');
CREATE TYPE platform_status AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'REJECTED');
CREATE TYPE occupation_type AS ENUM ('student', 'freelancer', 'employed', 'nysc_corps', 'other');
CREATE TYPE proof_of_occupation_type AS ENUM ('student_id', 'admission_letter', 'employment_id', 'offer_letter', 'payslip', 'freelance_receipt', 'invoice', 'nysc_callup', 'nysc_cds_id', 'other');
CREATE TYPE user_archetype AS ENUM ('student', 'nysc_corper', 'young_professional');
CREATE TYPE verification_session_type AS ENUM ('nin_lookup', 'face_match', 'liveness', 'document_upload');
CREATE TYPE verification_session_status AS ENUM ('pending', 'passed', 'failed', 'error', 'manual_review');
CREATE TYPE doc_status AS ENUM ('pending', 'approved', 'rejected');

-- ─── Users ───────────────────────────────────────────────────────────────────
-- Extends Supabase Auth's auth.users table

CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic identity & User Archetype
  user_type       user_archetype DEFAULT 'student',
  display_name    TEXT NOT NULL DEFAULT '',
  avatar_url      TEXT,
  bio             TEXT,
  age             SMALLINT CHECK (age >= 16 AND age <= 35),
  age_range       TEXT,                               -- e.g. '18-24', '25-30'
  gender          gender_type,
  religion        TEXT,                               -- e.g. 'Christianity', 'Islam', 'Other'
  phone           TEXT,
  
  -- Location & Geographic Metadata
  city                  TEXT,
  state                 TEXT,
  state_of_origin       TEXT,                         -- Tribe / State of Origin
  lga_of_origin         TEXT,                         -- LGA of Origin
  cds_group_location    TEXT,                         -- NYSC CDS Group Location / Zone / LGA
  
  -- University & Occupation
  occupation            occupation_type DEFAULT 'student',
  university            TEXT,
  faculty               TEXT,
  course                TEXT,
  year_of_study         SMALLINT CHECK (year_of_study >= 1 AND year_of_study <= 7),
  
  -- Housing preferences
  min_budget      INTEGER,
  max_budget      INTEGER,
  move_in_date    DATE,
  
  -- Lifestyle tags
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
  
  -- NIN Verification (Dojah.io — SHA-256 Hashed, never raw)
  nin_hash              TEXT,                         -- SHA-256 hash of NIN (NDPR Compliant)
  nin_verified          BOOLEAN DEFAULT FALSE,
  nin_verified_at       TIMESTAMPTZ,
  nin_vendor_ref        TEXT,                         -- Dojah vendor check reference ID
  
  -- Facial Recognition & Liveness (Dojah.io)
  face_verified         BOOLEAN DEFAULT FALSE,
  face_verified_at      TIMESTAMPTZ,
  face_vendor_ref       TEXT,
  face_match_score      FLOAT,                        -- Confidence score 0.0–1.0
  
  -- Identity Verification Composite Flag
  identity_verified     BOOLEAN DEFAULT FALSE,        -- True when NIN + face + doc checks pass
  identity_verified_at  TIMESTAMPTZ,
  
  -- Verification & KYC (Non-mandatory signup, 30-day grace period, zero-cost to user)
  student_verified            BOOLEAN DEFAULT FALSE,
  proof_of_occupation_type    proof_of_occupation_type,
  proof_of_occupation_url     TEXT,               -- File URL in private bucket
  proof_of_occupation_back_url TEXT,
  verification_status         verification_status DEFAULT 'UNVERIFIED',
  kyc_grace_period_ends_at    TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  kyc_completed_at            TIMESTAMPTZ,
  is_kyc_restricted           BOOLEAN DEFAULT FALSE, -- True if 30-day grace period expires without verified KYC
  is_legacy_user              BOOLEAN DEFAULT FALSE, -- True for existing 314 users prior to KYC system rollout
  verified_at                 TIMESTAMPTZ,
  
  -- Onboarding state (Extended step range: 0-10)
  onboarding_step       SMALLINT DEFAULT 0,
  onboarding_complete   BOOLEAN DEFAULT FALSE,
  
  -- Activity
  last_seen_at    TIMESTAMPTZ DEFAULT NOW(),
  is_active       BOOLEAN DEFAULT TRUE,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Verification Sessions (Audit & KYC Vendor Log) ──────────────────────────

CREATE TABLE public.verification_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_type    verification_session_type NOT NULL,
  vendor          TEXT NOT NULL DEFAULT 'dojah',      -- 'dojah' | 'smile_identity' | 'manual'
  vendor_ref      TEXT,
  status          verification_session_status NOT NULL DEFAULT 'pending',
  payload         JSONB DEFAULT NULL,                 -- Vendor response (sanitized, no raw NIN)
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

-- ─── Student Verifications ───────────────────────────────────────────────────

CREATE TABLE public.student_verifications (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                     UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  study_status                TEXT CHECK (study_status IN ('undergraduate','postgraduate','diploma','hnd','other')),
  institution_name            TEXT,
  institution_state           TEXT,
  reg_number                  TEXT,
  reg_number_format_matched   BOOLEAN DEFAULT FALSE,
  document_type               TEXT CHECK (document_type IN ('id_card','admission_letter','student_record','other')),
  document_url                TEXT,                   -- Supabase private storage path
  document_status             doc_status DEFAULT 'pending',
  submitted_at                TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at                 TIMESTAMPTZ
);

-- ─── NYSC Verifications ──────────────────────────────────────────────────────

CREATE TABLE public.nysc_verifications (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  call_up_number      TEXT,
  state_of_posting    TEXT,                           -- State assigned during NYSC
  cds_group           TEXT,                           -- CDS group name
  cds_location        TEXT,                           -- CDS meeting location / LGA
  nysc_id_url         TEXT,                           -- Supabase private storage path
  call_up_letter_url  TEXT,
  document_status     doc_status DEFAULT 'pending',
  submitted_at        TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at         TIMESTAMPTZ
);

-- ─── Professional Verifications ──────────────────────────────────────────────

CREATE TABLE public.professional_verifications (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  occupation                TEXT,                           -- Job title / field
  employer_name             TEXT,
  nin_slip_url              TEXT,                           -- Private storage path
  utility_bill_url          TEXT,                           -- Proof of address
  proof_of_occupation_url   TEXT,                           -- Freelance payment receipt / employer letter / payslip
  proof_type                TEXT CHECK (proof_type IN ('employer_letter','payslip','freelance_receipt','linkedin_url','other')),
  proof_note                TEXT,
  document_status           doc_status DEFAULT 'pending',
  submitted_at              TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at               TIMESTAMPTZ
);

-- ─── Connections ─────────────────────────────────────────────────────────────

CREATE TABLE public.connections (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status              connection_status NOT NULL DEFAULT 'ACTIVE',
  
  -- Housing payment (optional — user pays to access housing provider list)
  housing_payment_reference   TEXT,               -- Paystack reference for housing provider access
  housing_payment_status      TEXT DEFAULT 'UNPAID',  -- 'UNPAID' | 'PAID'
  housing_payment_paid_at     TIMESTAMPTZ,
  
  -- Timestamps
  connected_at        TIMESTAMPTZ DEFAULT NOW(),  -- when connection was created
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate connections
  CONSTRAINT no_self_connection CHECK (requester_id <> receiver_id),
  CONSTRAINT unique_connection UNIQUE (
    LEAST(requester_id::text, receiver_id::text)::uuid,
    GREATEST(requester_id::text, receiver_id::text)::uuid
  )
);

-- ─── Messages ────────────────────────────────────────────────────────────────

CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id   UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  message_type    message_type DEFAULT 'text',
  image_url       TEXT,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast message retrieval per connection
CREATE INDEX idx_messages_connection_id ON public.messages(connection_id, created_at DESC);

-- ─── Payments ────────────────────────────────────────────────────────────────

CREATE TABLE public.payments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id     UUID REFERENCES public.connections(id) ON DELETE SET NULL,
  reference         TEXT NOT NULL UNIQUE,       -- Paystack reference
  amount            INTEGER NOT NULL,           -- in kobo (200000 = ₦2,000)
  status            payment_status DEFAULT 'PENDING',
  payment_channel   TEXT,                       -- card, bank_transfer, ussd, mobile_money
  gateway_response  TEXT,
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Bill Splits ─────────────────────────────────────────────────────────────

CREATE TABLE public.bill_splits (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id   UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES public.profiles(id),
  title           TEXT NOT NULL,
  description     TEXT,
  total_amount    INTEGER NOT NULL,             -- in kobo
  currency        TEXT DEFAULT 'NGN',
  is_settled      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.bill_split_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  split_id        UUID NOT NULL REFERENCES public.bill_splits(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  description     TEXT,
  amount          INTEGER NOT NULL,             -- in kobo — this user's share
  is_paid         BOOLEAN DEFAULT FALSE,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Housing Platforms (Provider Records) ────────────────────────────────────

CREATE TABLE public.housing_platforms (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  description     TEXT,
  url             TEXT NOT NULL,
  logo_url        TEXT,
  
  -- Coverage
  cities          TEXT[] NOT NULL DEFAULT '{}',
  campus_tags     TEXT[] DEFAULT '{}',          -- e.g. ['UNILAG', 'LASU', 'Yaba']
  
  -- Contact
  contact_name    TEXT,
  contact_email   TEXT NOT NULL,
  contact_phone   TEXT,
  
  -- Admin
  status          platform_status DEFAULT 'PENDING_REVIEW',
  is_featured     BOOLEAN DEFAULT FALSE,
  registered_by   UUID REFERENCES public.profiles(id),  -- the admin user who onboarded them
  
  -- Analytics (denormalized for fast reads)
  total_clicks    INTEGER DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Platform Clicks (for analytics) ─────────────────────────────────────────

CREATE TABLE public.platform_clicks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_id     UUID NOT NULL REFERENCES public.housing_platforms(id),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  connection_id   UUID REFERENCES public.connections(id),
  clicked_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Notifications ───────────────────────────────────────────────────────────

CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,                -- 'CONNECTION_REQUEST', 'PAYMENT_CONFIRMED', 'NEW_MESSAGE', 'PLATFORM_REVIEW'
  title           TEXT NOT NULL,
  body            TEXT,
  data            JSONB DEFAULT '{}',
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Push Subscriptions (for PWA web push) ───────────────────────────────────

CREATE TABLE public.push_subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  role            TEXT DEFAULT 'super_admin',   -- 'super_admin' | 'platform_admin'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row-Level Security Policies ─────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_split_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read active profiles, only owner can write
CREATE POLICY "profiles_read_all" ON public.profiles
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "profiles_write_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Connections: only involved users can see
CREATE POLICY "connections_own" ON public.connections
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = receiver_id
  );

-- Connections: only involved users can update
CREATE POLICY "connections_update_own" ON public.connections
  FOR UPDATE USING (
    auth.uid() = requester_id OR auth.uid() = receiver_id
  );

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

-- Payments: only the paying user
CREATE POLICY "payments_own" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Bill splits: only members of the connection
CREATE POLICY "bill_splits_connection_members" ON public.bill_splits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = bill_splits.connection_id
        AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
    )
  );

-- Notifications: only the recipient
CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- Push subscriptions: only the owner
CREATE POLICY "push_subscriptions_own" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ─── Triggers ────────────────────────────────────────────────────────────────

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER connections_updated_at BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

---

## 8. Project Structure

### Monorepo System & Component Dependency Architecture

```mermaid
graph TB
    subgraph Clients["Frontend Surface Layer (Next.js 16 App Router)"]
        Web["apps/web<br/>Marketing SPA"]
        App["apps/app<br/>Main Student PWA (Serwist SW)"]
        Admin["apps/admin<br/>Platform Provider Dashboard"]
    end

    subgraph Packages["Turborepo Shared Packages"]
        UI["packages/ui<br/>Component Library & Lottie"]
        DB["packages/db<br/>Supabase Client & Queries"]
        Config["packages/config<br/>Tailwind, TS, ESLint"]
        Anim["packages/animations<br/>Lottie JSON Asset Bundle"]
    end

    subgraph Backend["Supabase Backend Platform (Postgres)"]
        Auth["Supabase Auth<br/>(OAuth PKCE & Cookies)"]
        Postgres["PostgreSQL DB<br/>(RLS & Triggers)"]
        Storage["Supabase Storage<br/>(Private Document Buckets)"]
        Realtime["Supabase Realtime<br/>(Postgres Changes WebSocket)"]
    end

    subgraph Integrations["Third-Party APIs & Services"]
        Paystack["Paystack Gateway<br/>(Payments & Webhooks)"]
        Dojah["Dojah.io KYC Engine<br/>(NIN & Liveness)"]
        Push["Web Push VAPID<br/>(PWA Push Server)"]
    end

    Web --> Packages
    App --> Packages
    Admin --> Packages

    Packages --> Backend
    App --> Paystack
    App --> Dojah
    Backend --> Push
```

---

### Workspace Directory Structure

```
Roomie/
├── apps/
│   ├── web/                     — Marketing SPA (Next.js, static export)
│   ├── app/                     — Main PWA (Next.js 16, App Router)
│   └── admin/                   — Platform provider dashboard (Next.js)
│
├── packages/
│   ├── ui/                      — Shared component library
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   └── lottie-icon.tsx  — Shared Lottie wrapper
│   │   └── package.json
│   │
│   ├── db/                      — Supabase client + generated TypeScript types
│   │   ├── src/
│   │   │   ├── client.ts        — createClient() setup
│   │   │   ├── server.ts        — createServerClient() for SSR
│   │   │   ├── types.ts         — Generated from `supabase gen types`
│   │   │   └── queries/         — Reusable query functions
│   │   │       ├── profiles.ts
│   │   │       ├── connections.ts
│   │   │       ├── messages.ts
│   │   │       └── payments.ts
│   │   └── package.json
│   │
│   ├── config/                  — Shared configuration
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.base.json
│   │   └── eslint.config.mjs
│   │
│   └── animations/              — Lottie JSON animation files
│       ├── connecting.json
│       ├── payment-success.json
│       ├── verified-badge.json
│       ├── chat-typing.json
│       ├── match-found.json
│       └── empty-feed.json
│
├── supabase/
│   ├── migrations/
│   │   └── 0001_initial_schema.sql
│   ├── seed.sql                 — Dev seed data
│   └── config.toml
│
├── package.json                 — Root workspace (Turborepo)
├── turbo.json
└── implementationRoomie.md
```

---

## 9. App 1 — Marketing SPA (`apps/web`)

The marketing site is a single-page, fully animated landing page. It has one job: convert curious visitors into sign-ups.

### Design Principles
- Bold typography — large, expressive headlines
- Lottie animations on every feature illustration (no static illustrations)
- Color palette:
  - Primary: Sage Green `#8AAF6E` — brand anchor, nav active states, primary buttons
  - Accent / CTA: Soft Peach `#FAE8CC` — connection moments, pay button, match celebrations, chat send
  - Surface: Pale Yellow-Green `#EDE8C8` — card backgrounds, page surfaces (warm alternative to stark white)
  - Secondary: Light Sage `#B8CE9E` — hover states, badges, secondary chips, progress fills
  - Text: Rich black `#0a0a0a`
- No emojis anywhere — animated Lottie icons replace all emoji usage
- Highly responsive — built mobile-first

### Sections

**Section 1 — Hero**
```
[Full viewport height]
[Animated background: subtle floating dots/particles, green tinted]

"Connect and"
"Cooonnectttt"     ← The letters stretch out with a Framer Motion stagger animation

[Subline] Find your perfect student roommate. Pay once. Move in together.

[CTA: "Find my roommate" → app.roomie.ng]
[Secondary CTA: "I have a housing platform" → scrolls to #for-providers]

[Animated Lottie illustration: two profile cards sliding together and "connecting"]
```

**Section 2 — How it Works**
Three animated steps, each triggering as the user scrolls into view:
1. "Create your profile" → Lottie: person filling out a card
2. "Browse and connect" → Lottie: swiping cards / matching
3. "Move in together" → Lottie: two people entering a house

**Section 3 — Why Roomie**
Feature grid (2×3 on desktop, stacked on mobile):
- Verified student profiles
- Real-time chat
- Bill splitting tracker
- Curated housing providers nearby
- One-time ₦2,000 connection fee (transparent pricing)
- Works offline (PWA)

**Section 4 — Transparent Pricing**
```
One simple fee.

₦2,000
per connection

That's it. No subscriptions. No hidden charges.
Chat unlocked. Housing providers shown. Move in.

[CTA: Get started for free]
```

**Section 5 — For Housing Providers**
```
id="for-providers"

Reach students who are ALREADY connected and ready to rent.

[3 stats cards: "500+ students connected", "12 cities", "3 min avg. connection time"]

[CTA: List your platform → /admin/register]
```

**Section 6 — App Preview**
Animated phone mockup showing the discovery feed, chat, and bill splitter screens.

**Section 7 — Footer**
- Logo, tagline
- Links: About, Privacy, Terms, Contact
- "For housing providers"
- Social links
- Bottom line: `© 2026 Roomie · A <a href="https://gigsrentals.com">GIGSRentals</a> Product` — "GIGSRentals" is a hyperlink pointing to the GIGSRentals platform (`https://gigsrentals.com`). This attribution must appear on every footer across all three apps (marketing web, main PWA, admin dashboard). It is not optional and should be visually subtle but always present. The link opens in a new tab (`target="_blank" rel="noopener noreferrer"`).

### Routes

```
apps/web/app/
├── page.tsx          — The full SPA (all sections as components)
├── layout.tsx
├── globals.css
├── privacy/
│   └── page.tsx
└── terms/
    └── page.tsx
```

---

## 10. App 2 — Main PWA (`apps/app`)

This is the product. Everything a student uses daily.

### Route Structure

```
apps/app/
├── app/
│   ├── layout.tsx                    — Root layout: providers, SW register
│   ├── page.tsx                      — / → redirect to /discover or /auth/signin
│   ├── manifest.ts                   — PWA manifest
│   ├── offline/
│   │   └── page.tsx
│   │
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx              — Google Sign-In landing page
│   │   └── callback/
│   │       └── route.ts              — Supabase OAuth callback handler
│   │
│   ├── onboarding/
│   │   ├── layout.tsx                — Shared onboarding wrapper
│   │   ├── welcome/
│   │   │   └── page.tsx              — Step 0: Welcome + what is Roomie
│   │   ├── basics/
│   │   │   └── page.tsx              — Step 1: Name, age, gender, city
│   │   ├── university/
│   │   │   └── page.tsx              — Step 2: School, year, course
│   │   ├── vibe/
│   │   │   └── page.tsx              — Step 3: Lifestyle preferences
│   │   ├── budget/
│   │   │   └── page.tsx              — Step 4: Budget range + move-in date
│   │   └── verify/
│   │       └── page.tsx              — Step 5: Profile photo + student ID
│   │
│   ├── discover/
│   │   ├── page.tsx                  — Main discovery feed
│   │   └── [id]/
│   │       └── page.tsx              — Full profile view
│   │
│   ├── connect/
│   │   ├── [id]/
│   │   │   └── page.tsx              — Connection initiation + payment
│   │   └── success/
│   │       └── page.tsx              — Post-payment success screen
│   │
│   ├── chat/
│   │   ├── page.tsx                  — All conversations list
│   │   └── [connectionId]/
│   │       └── page.tsx              — Individual chat room
│   │
│   ├── splits/
│   │   ├── page.tsx                  — All bill splits
│   │   └── [connectionId]/
│   │       └── page.tsx              — Bill split detail + add items
│   │
│   ├── housing/
│   │   └── page.tsx                  — Housing providers (shown after connection)
│   │
│   ├── profile/
│   │   ├── page.tsx                  — Own profile view
│   │   └── edit/
│   │       └── page.tsx              — Edit profile
│   │
│   ├── notifications/
│   │   └── page.tsx
│   │
│   └── api/
│       ├── auth/
│       │   └── callback/
│       │       └── route.ts          — Supabase OAuth
│       ├── payments/
│       │   ├── initialize/
│       │   │   └── route.ts          — Create Paystack transaction
│       │   └── webhook/
│       │       └── route.ts          — Paystack webhook handler
│       └── push/
│           ├── subscribe/
│           │   └── route.ts
│           └── send/
│               └── route.ts
│
└── src/
    ├── components/
    │   ├── auth/
    │   │   └── GoogleSignInButton.tsx
    │   ├── onboarding/
    │   │   ├── OnboardingProgress.tsx
    │   │   ├── StepWrapper.tsx
    │   │   └── LifestyleTagPicker.tsx
    │   ├── discover/
    │   │   ├── ProfileCard.tsx        — Card in the feed
    │   │   ├── ProfileCardSkeleton.tsx
    │   │   ├── FilterDrawer.tsx
    │   │   └── CompatibilityScore.tsx — Visual match score
    │   ├── connect/
    │   │   ├── ConnectionModal.tsx
    │   │   └── PaystackButton.tsx
    │   ├── chat/
    │   │   ├── ChatThread.tsx
    │   │   ├── MessageBubble.tsx
    │   │   ├── ChatInput.tsx
    │   │   └── TypingIndicator.tsx
    │   ├── splits/
    │   │   ├── SplitCard.tsx
    │   │   ├── AddSplitModal.tsx
    │   │   └── SplitItemRow.tsx
    │   ├── housing/
    │   │   └── PlatformCard.tsx
    │   ├── layout/
    │   │   ├── BottomNav.tsx
    │   │   └── AppHeader.tsx
    │   └── pwa/
    │       ├── ServiceWorkerRegister.tsx
    │       ├── InstallPrompt.tsx
    │       └── PushToggle.tsx
    │
    ├── hooks/
    │   ├── useProfile.ts
    │   ├── useConnections.ts
    │   ├── useMessages.ts
    │   ├── useCompatibility.ts
    │   ├── usePaystack.ts
    │   └── usePushSubscription.ts
    │
    ├── context/
    │   ├── AuthContext.tsx
    │   └── NotificationContext.tsx
    │
    └── lib/
        ├── supabase.ts              — Browser Supabase client
        ├── paystack.ts              — Paystack helpers
        ├── compatibility.ts         — Score calculation logic
        └── format.ts                — Currency, date formatters
```

---

## 11. App 3 — Platform Provider Dashboard (`apps/admin`)

Housing providers and agents use this to register their platform and view referral analytics.

### Routes

```
apps/admin/
└── app/
    ├── layout.tsx
    ├── page.tsx               — /admin → redirect to dashboard or register
    │
    ├── register/
    │   └── page.tsx           — Public registration form for new providers
    │
    ├── login/
    │   └── page.tsx           — Provider login
    │
    ├── dashboard/
    │   ├── layout.tsx         — Sidebar + header
    │   ├── page.tsx           — Overview: clicks, referrals, active areas
    │   ├── profile/
    │   │   └── page.tsx       — Update platform details
    │   ├── analytics/
    │   │   └── page.tsx       — Detailed click + referral charts
    │   └── settings/
    │       └── page.tsx
    │
    └── super/                 — Roomie internal admin (super admin only)
        ├── page.tsx           — All providers, approval queue
        ├── providers/
        │   └── [id]/
        │       └── page.tsx   — Approve/reject/suspend provider
        ├── users/
        │   └── page.tsx       — All student users + verification queue
        └── connections/
            └── page.tsx       — All connections + payment status
```

---

### 3-Lane Onboarding Routing Architecture (Steps 0–10)

The onboarding flow splits into **three distinct archetypal lanes** sharing a common trunk. Each step writes to Supabase immediately so progress is saved if a user drops off.

```
COMMON TRUNK (all user types)
  Step 0  → User Type Selection        (/onboarding/type)        ← Student | NYSC Corper | Young Professional
  Step 1  → Personal Details           (/onboarding/basics)      ← Name, Age, Sex, City, State/LGA of Origin, Religion
  Step 2  → Demographics               (/onboarding/demographics) ← Contact prefs, Religion, Language
  Step 3  → NIN Verification           (/onboarding/nin)         ← Enter NIN → Dojah API lookup (SHA-256 hashed)
  Step 4  → Facial Recognition         (/onboarding/face)        ← Dojah Redirect Liveness + Face Match vs NIMC DB

TYPE-SPECIFIC LANE — Student (Steps 5–7)
  Step 5  → Study Details              (/onboarding/student/study)
  Step 6  → Institution & Reg Number   (/onboarding/student/institution) ← Reg number pattern validated
  Step 7  → Document Upload            (/onboarding/student/document)    ← Student ID / Admission Letter

TYPE-SPECIFIC LANE — NYSC Corper (Steps 5–7)
  Step 5  → Call-Up Details            (/onboarding/nysc/callup)
  Step 6  → Posting & CDS             (/onboarding/nysc/posting)        ← State of Posting + CDS Group & Location
  Step 7  → Document Upload            (/onboarding/nysc/documents)      ← NYSC ID + Call-Up Letter

TYPE-SPECIFIC LANE — Young Professional / Freelancer (Steps 5–7)
  Step 5  → Occupation Details         (/onboarding/professional/occupation) ← Job title + Employer / Freelance field
  Step 6  → Location Proof             (/onboarding/professional/location)   ← Utility Bill / Address proof
  Step 7  → Occupation Proof           (/onboarding/professional/proof)      ← NDA-safe Freelance Receipt / Employer Letter

SHARED EXIT (all types)
  Step 8  → Vibe & Lifestyle           (/onboarding/vibe)        ← Lifestyle preferences
  Step 9  → Budget & Timeline          (/onboarding/budget)      ← Budget range + Move-in date
  Step 10 → Success                    (/onboarding/success)     ← Auto-connect to support & land on Feed
```

---

### Step 0 — User Type Selection (`/onboarding/type`)

Select user archetype:
- [ 🎓 **Student** ] — Undergraduate, Postgraduate, HND/Diploma
- [ 🇳🇬 **NYSC Corps Member** ] — Serving Corper (Batch A/B/C)
- [ 💼 **Young Professional / Freelancer** ] — Employed, Freelancer, Independent Contractor

Sets `user_type`, navigates to `/onboarding/basics`.

### Step 1 — Personal Details (`/onboarding/basics`)

Fields:
- Display name (pre-filled from Google)
- Age (number input / slider) & Age Range (`18-24`, `25-30`, etc.)
- Gender (Male / Female / Non-binary)
- Current City & State (searchable dropdown)
- **State of Origin** (searchable dropdown of 36 Nigerian states + FCT)
- **LGA of Origin** (dynamic dropdown based on selected State of Origin)
- Religion (optional dropdown: Christianity, Islam, Other, Prefer not to say)

### Step 2 — Demographics & Preferences (`/onboarding/demographics`)

Fields:
- Primary Language spoken
- Contact preferences (WhatsApp / In-App Only / Phone Call)

### Step 3 — NIN Verification (`/onboarding/nin`)

- Enter 11-digit National Identification Number (NIN).
- Server route `POST /api/kyc/nin` invokes Dojah.io NIN Lookup API.
- **NDPR Privacy**: Raw NIN is **never stored** in plain text. SHA-256 hash (`nin_hash`) + vendor token (`nin_vendor_ref`) are saved.
- Fuzzy name matching compares NIN full name against profile `display_name`.
- *Note*: Optional at signup (30-day Grace Period applies if skipped).

### Step 4 — Facial Recognition & Liveness (`/onboarding/face`)

- Launches Dojah.io redirect-based liveness verification (compatible with iOS Safari & Android).
- User completes liveness challenge (blink/smile/nod).
- Dojah auto-compares selfie photo against official NIMC database photo returned from NIN lookup.
- If `face_match_score >= 0.75` → `face_verified = true`, proceeds to type-specific Step 5.

---

### Step 5–7 — Type-Specific Lanes

#### Student Lane
- **Step 5 (`/onboarding/student/study`)**: Study level (Undergraduate, Postgraduate, HND) + Year of study.
- **Step 6 (`/onboarding/student/institution`)**: University selector + Matriculation/Registration Number. Automated regex format matching validates reg number against known university pattern database.
- **Step 7 (`/onboarding/student/document`)**: Upload Student ID (front/back), Admission Letter, or Student Portal snippet.

#### NYSC Corper Lane
- **Step 5 (`/onboarding/nysc/callup`)**: Call-Up Number (validated against `NIG/YYYY/STATE_CODE/XXXXX` pattern) + Batch.
- **Step 6 (`/onboarding/nysc/posting`)**: State of Posting + **CDS Group Name** + **CDS Group Location** (LGA / Zone / Meeting Center).
- **Step 7 (`/onboarding/nysc/documents`)**: Upload NYSC ID Card photo and Call-Up Letter.

#### Young Professional & Freelancer Lane
- **Step 5 (`/onboarding/professional/occupation`)**: Primary Role/Field (e.g. Frontend Developer, Designer) + Employer Name / Self-Employed status.
- **Step 6 (`/onboarding/professional/location`)**: Upload proof of address (Utility Bill, Tenancy snippet, or Bank Statement header).
- **Step 7 (`/onboarding/professional/proof`)**: Upload Proof of Occupation:
  - *For Freelancers*: NDA-compliant proof (payment receipt from Stripe/Paystack/PayPal/Upwork/Deel/Wise, client payout snippet, or sanitized invoice).
  - *For Employed*: Employment ID Card, Work Badge, Offer Letter, or Payslip.

---

### Step 8–10 — Shared Exit

- **Step 8 (`/onboarding/vibe`)**: Sleep schedule, cleanliness slider, noise tolerance, smoking/pets/guests toggles, lifestyle tags.
- **Step 9 (`/onboarding/budget`)**: Dual-handle budget slider (₦20,000–₦500,000/month), move-in date picker, roommate gender preference.
- **Step 10 (`/onboarding/success`)**: Completion celebration + redirect to `/feed`.

---

## 13. Roommate Discovery Feed

### Feed Design

The discovery feed is the heart of the app. It resembles Facebook Marketplace in layout — a grid of profile cards on desktop, a single-column scroll on mobile.

Unlike Tinder-style swipe (which can feel trivial), Roomie uses a **browse + intentional tap** pattern. The user sees multiple cards at once and taps to see a full profile before deciding to connect.

### Profile Card

Each card shows:
- Avatar (circular, large)
- Display name + age
- University + year
- City
- Budget range (₦X — ₦Y/month)
- Top 3 lifestyle tags as chips
- Compatibility score (calculated client-side)
- "Verified" badge (animated Lottie checkmark if student_verified = true)
- "Connect" button

### Compatibility Score

The score (0–100) is calculated client-side based on the current user's profile vs. the card's profile. It is a heuristic, not machine learning.

```typescript
// packages/db/src/lib/compatibility.ts

export function calculateCompatibility(
  me: Profile,
  them: Profile
): number {
  let score = 0;
  const weights = {
    budget: 30,
    sleepSchedule: 20,
    cleanliness: 15,
    noisePreference: 15,
    city: 10,
    lifestyle_overlap: 10,
  };

  // Budget overlap
  const myMin = me.min_budget ?? 0;
  const myMax = me.max_budget ?? Infinity;
  const theirMin = them.min_budget ?? 0;
  const theirMax = them.max_budget ?? Infinity;
  const overlap = Math.min(myMax, theirMax) - Math.max(myMin, theirMin);
  const myRange = myMax - myMin || 1;
  score += weights.budget * Math.max(0, Math.min(1, overlap / myRange));

  // Sleep schedule
  if (me.sleep_schedule === them.sleep_schedule) score += weights.sleepSchedule;
  else if (me.sleep_schedule === "flexible" || them.sleep_schedule === "flexible")
    score += weights.sleepSchedule * 0.6;

  // Cleanliness (within 1 level = full score, 2 levels = half)
  const cleanLevels = ["very_tidy", "tidy", "relaxed", "messy"];
  const cleanDiff = Math.abs(
    cleanLevels.indexOf(me.cleanliness) - cleanLevels.indexOf(them.cleanliness)
  );
  score += weights.cleanliness * (cleanDiff === 0 ? 1 : cleanDiff === 1 ? 0.5 : 0);

  // Noise preference (same scoring as cleanliness)
  const noiseLevels = ["very_quiet", "quiet", "moderate", "lively"];
  const noiseDiff = Math.abs(
    noiseLevels.indexOf(me.noise_pref) - noiseLevels.indexOf(them.noise_pref)
  );
  score += weights.noisePreference * (noiseDiff === 0 ? 1 : noiseDiff === 1 ? 0.5 : 0);

  // Same city
  if (me.city && them.city && me.city.toLowerCase() === them.city.toLowerCase())
    score += weights.city;

  // Lifestyle tag overlap
  const myTags = new Set(me.lifestyle_tags ?? []);
  const overlap_tags = (them.lifestyle_tags ?? []).filter((t) => myTags.has(t)).length;
  const maxTags = Math.max(myTags.size, (them.lifestyle_tags ?? []).length, 1);
  score += weights.lifestyle_overlap * (overlap_tags / maxTags);

  return Math.round(Math.min(100, score));
}
```

### Filtering

Filter drawer (slides up from bottom on mobile, appears as sidebar on desktop):
- City (multi-select)
- University (multi-select)
- Gender preference
- Budget range (dual slider)
- Move-in date range
- Lifestyle tags (multi-select chips)
- "Verified only" toggle

### Feed Query (Supabase)

```typescript
// packages/db/src/queries/profiles.ts

export async function getDiscoveryFeed(
  supabase: SupabaseClient,
  currentUserId: string,
  filters: DiscoveryFilters,
  page: number = 0
) {
  const PAGE_SIZE = 20;

  // Exclude: current user, already-connected users, DECLINED users
  const connectedUserIds = await getConnectedUserIds(supabase, currentUserId);

  let query = supabase
    .from("profiles")
    .select(`
      id, display_name, avatar_url, age, gender,
      city, university, year_of_study, course,
      min_budget, max_budget, move_in_date,
      lifestyle_tags, sleep_schedule, cleanliness, noise_pref,
      student_verified, allows_smoking, allows_pets, allows_guests,
      last_seen_at
    `)
    .eq("is_active", true)
    .neq("id", currentUserId)
    .not("id", "in", `(${connectedUserIds.join(",")})`)
    .eq("onboarding_complete", true)
    .order("last_seen_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  // Apply filters
  if (filters.city?.length) query = query.in("city", filters.city);
  if (filters.university?.length) query = query.in("university", filters.university);
  if (filters.gender) query = query.eq("gender", filters.gender);
  if (filters.minBudget) query = query.gte("max_budget", filters.minBudget);
  if (filters.maxBudget) query = query.lte("min_budget", filters.maxBudget);
  if (filters.verifiedOnly) query = query.eq("student_verified", true);
  if (filters.tags?.length) {
    query = query.overlaps("lifestyle_tags", filters.tags);
  }

  return query;
}
```

---

## 14. Connection & Housing Payment Flow (Paystack)

### Two-Step Flow

The connection is free and instant. Payment only happens when users want to access the curated housing provider list.

### Step 1: Create Connection (FREE)

```
User taps "Connect" on a profile
         │
         ▼
POST /api/connections
  → Creates connection record: status = 'ACTIVE', housing_payment_status = 'UNPAID'
  → Returns: { connectionId }
         │
         ▼
Both users' chat is instantly unlocked
CTA shows: "Browse housing providers (₦2,000)"
```

### Paystack Payment & Webhook Sequence Architecture

```mermaid
sequenceDiagram
    autonumber
    actor UserA as User A (Initiator)
    actor UserB as User B (Acceptor)
    participant Client as Roomie PWA (User B)
    participant API as POST /api/payments/initialize-housing
    participant Paystack as Paystack Gateway
    participant Webhook as POST /api/payments/webhook
    participant DB as Supabase DB (Postgres)

    UserA->>UserB: Proposes Roommate Agreement in Chat
    UserB->>Client: Taps "Accept & Pay ₦2,000"
    Client->>API: Initialize Housing Payment (connection_id, user_id)
    API->>Paystack: POST /transaction/initialize (amount: 200000 kobo, metadata)
    Paystack-->>API: Returns authorization_url, reference, access_code
    API-->>Client: Returns access_code
    Client->>Paystack: Opens Paystack Inline Popup (Card, Transfer, OPay, USSD)
    UserB->>Paystack: Completes Payment

    par Real-Time Webhook Processing
        Paystack->>Webhook: POST /api/payments/webhook (Payload + HMAC-SHA512 Signature)
        Webhook->>Webhook: Verify x-paystack-signature header
        Webhook->>DB: UPDATE payments SET status='SUCCESS'
        Webhook->>DB: UPDATE connections SET housing_payment_status='PAID'
        Webhook->>DB: INSERT notifications ("Housing unlocked!")
    and Client Redirect
        Paystack-->>Client: Popup closes -> callback_url (/housing/success)
        Client->>DB: Query connection housing_payment_status
        DB-->>Client: Status = 'PAID'
        Client->>UserB: Shows "Housing Providers Unlocked ✓"
    end
```

### Webhook Verification

```typescript
// apps/app/app/api/payments/webhook/route.ts

import crypto from "crypto";
import { createServerClient } from "@repo/db/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  
  // Verify HMAC-SHA512 signature
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest("hex");
  
  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  
  const event = JSON.parse(rawBody) as PaystackEvent;
  
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }
  
  const { reference, metadata } = event.data;
  const connectionId = metadata?.connection_id as string;
  const paymentType = metadata?.type as string;  // 'housing_access'
  
  const supabase = createServerClient();
  
  if (paymentType === 'housing_access') {
    // Update payment record
    await supabase
      .from("payments")
      .update({ status: "SUCCESS", paid_at: new Date().toISOString(), payment_channel: event.data.channel })
      .eq("reference", reference);
    
    // Unlock housing access for this connection
    const { data: connection } = await supabase
      .from("connections")
      .update({ housing_payment_status: "PAID", housing_payment_paid_at: new Date().toISOString() })
      .eq("id", connectionId)
      .select("requester_id, receiver_id")
      .single();
    
    if (connection) {
      const userId = metadata?.user_id as string;
      // Notify the paying user
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "HOUSING_UNLOCKED",
        title: "Housing providers unlocked!",
        body: "You now have access to curated housing providers. Let's find your place!",
        data: { connection_id: connectionId },
      });
    }
  }
  
  return NextResponse.json({ received: true });
}
```

---

## 15. In-App Chat Architecture

Chat is built on **Supabase Realtime** (Postgres Changes). No separate WebSocket server is needed.

### Realtime Chat Architecture

```mermaid
sequenceDiagram
    autonumber
    actor UserA as User A (Sender)
    actor UserB as User B (Receiver)
    participant ClientA as PWA Client (User A)
    participant ClientB as PWA Client (User B)
    participant Realtime as Supabase Realtime Engine
    participant DB as Supabase Postgres DB

    ClientB->>Realtime: Subscribe channel chat:connection_id
    ClientA->>DB: INSERT INTO messages (connection_id, sender_id, content)
    Note over DB: RLS policy verifies auth.uid() is active member
    DB-->>ClientA: Confirm INSERT (Optimistic UI updated)
    DB->>Realtime: Postgres Change Event triggered (INSERT public.messages)
    Realtime->>ClientB: Broadcast payload (new message)
    ClientB->>DB: Fetch sender profile (display_name, avatar_url)
    DB-->>ClientB: Return sender profile
    ClientB->>UserB: Append message to chat thread & play subtle chime
```

### Chat Hook

```typescript
// apps/app/src/hooks/useMessages.ts

"use client";

import { useEffect, useRef, useState } from "react";
import { useSupabase } from "@/context/SupabaseContext";
import type { Message } from "@repo/db/types";

export function useMessages(connectionId: string) {
  const supabase = useSupabase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("messages")
        .select("*, sender:profiles!sender_id(id, display_name, avatar_url)")
        .eq("connection_id", connectionId)
        .order("created_at", { ascending: true })
        .limit(100);
      setMessages(data ?? []);
      setIsLoading(false);
    };
    void load();
  }, [connectionId, supabase]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${connectionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `connection_id=eq.${connectionId}`,
        },
        async (payload) => {
          // Fetch the sender's profile since the change payload doesn't join
          const { data: sender } = await supabase
            .from("profiles")
            .select("id, display_name, avatar_url")
            .eq("id", payload.new.sender_id)
            .single();
          
          const newMsg = { ...payload.new, sender } as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [connectionId, supabase]);

  const sendMessage = async (content: string, senderId: string) => {
    await supabase.from("messages").insert({
      connection_id: connectionId,
      sender_id: senderId,
      content,
      message_type: "text",
    });
  };

  return { messages, isLoading, sendMessage };
}
```

### Chat UI Features
- Auto-scroll to bottom on new message
- "Typing..." indicator (ephemeral Supabase Presence channel, not stored in DB)
- Read receipts (update `read_at` when the other user's messages are visible)
- Send image (upload to Supabase Storage, store URL in `image_url`)

### Typing Indicator (Supabase Presence)

```typescript
// The typing indicator does NOT write to the database.
// It uses the ephemeral Presence feature of Supabase Realtime.

const presenceChannel = supabase.channel(`presence:${connectionId}`);

// When current user is typing:
await presenceChannel.track({ typing: true, user_id: currentUserId });

// When other user tracks with typing:
presenceChannel.on("presence", { event: "sync" }, () => {
  const state = presenceChannel.presenceState();
  const otherUserTyping = Object.values(state).some(
    (presences) => presences.some((p: any) => p.typing && p.user_id !== currentUserId)
  );
  setIsTyping(otherUserTyping);
});
```

---

## 16. Bill Splitting Feature

The bill splitter is a shared expense tracker between two connected users. It does not process payments — it tracks who owes what and allows marking items as paid.

### Data Model

```
BillSplit (e.g. "December Rent")
  ├── title: "December Rent"
  ├── total_amount: 300,000 (₦300k)
  └── BillSplitItems:
      ├── { user: Amara, description: "Her share", amount: 150,000, is_paid: true }
      └── { user: Fatimah, description: "Her share", amount: 150,000, is_paid: false }
```

### UX Flow

1. Either connected user creates a new split
2. Enters title (e.g. "December Rent" / "Electricity Bill")
3. Enters total amount
4. The split is divided equally by default (editable)
5. Each item shows a "Mark as paid" button
6. Settled splits are archived

### Split Calculation Logic

```typescript
// For a two-person connection, split is always 50/50 by default.
// Users can manually adjust individual item amounts.

function createEqualSplit(total: number, userIds: string[]): SplitItem[] {
  const share = Math.floor(total / userIds.length);
  const remainder = total - share * userIds.length;
  
  return userIds.map((userId, index) => ({
    user_id: userId,
    amount: index === 0 ? share + remainder : share,  // first user absorbs rounding
    is_paid: false,
  }));
}
```

### Bill Summary Widget (in Chat)

When a split is marked as partially/fully paid, a system message is injected into the chat:

```
[System message bubble]
"Fatimah marked ₦150,000 as paid for December Rent"
```

This uses `message_type = 'system'` and is styled differently from regular messages.

---

## 17. Housing Platform Redirect System

After a connection is ACTIVE and the ₦2,000 housing access fee is paid, a "Find your place" section appears in the chat screen and on a dedicated `/housing` page. This payment gate ensures engaged users browse curated housing providers.

### How Platforms Are Shown

```typescript
// apps/app/src/queries/housing.ts

export async function getRelevantPlatforms(
  supabase: SupabaseClient,
  userCity: string,
  userUniversity: string
) {
  const { data } = await supabase
    .from("housing_platforms")
    .select("id, name, description, url, logo_url, cities, campus_tags, is_featured")
    .eq("status", "ACTIVE")
    .or(`cities.cs.{"${userCity}"},campus_tags.cs.{"${userUniversity}"}`)
    .order("is_featured", { ascending: false })
    .order("total_clicks", { ascending: false })
    .limit(12);
  
  return data ?? [];
}
```

### Housing Redirect & Click Analytics Pipeline

```mermaid
flowchart TD
    A[User views Curated Housing List] --> B[User clicks Provider Card 'Visit Platform']
    B --> C[Client invokes POST /api/platforms/click]
    C --> D[Server inserts record into platform_clicks table]
    D --> E[Server increments housing_platforms.total_clicks counter]
    E --> F[Client opens provider URL in new tab]
    F --> G[On tab return: Display feedback prompt 'How did it go?']
```

### Platform Card UI

Each card shows:
- Platform logo
- Platform name
- Cities covered
- Campus tags (e.g. "UNILAG, Yaba")
- "Visit platform" button (opens in new tab)
- "Featured" badge if `is_featured = true`

---

## 18. User Verification & KYC System (Dojah.io, Grace Period, NDA Proofs & Limitations)

Roomie implements a high-trust, low-friction identity verification system supporting **three distinct user archetypes** (Student, NYSC Corps Member, Young Professional / Freelancer).

### 1. Vendor Selection & NDPR Data Security

- **Primary Vendor**: **Dojah.io** (Selected for best web redirect liveness flow, NIN lookup, NIMC photo match, and Nigerian regulatory compliance).
- **Vendor Comparison**:
  | Feature | **Dojah.io** (Recommended) | Smile Identity | Prembly (Identitypass) |
  |---|---|---|---|
  | NIN / vNIN Lookup | ✅ Yes | ✅ Yes | ✅ Yes |
  | Face Match vs NIMC DB | ✅ Yes | ✅ Yes | ✅ Yes |
  | Hosted / Web Redirect Liveness | ✅ Yes (Best for PWA) | ✅ SDK + Redirect | ⚠️ Mostly SDK |
  | Documentation & Sandbox | ✅ Excellent | ✅ Excellent | ✅ Good |
- **NIN Privacy & NDPR Compliance**:
  - Raw NIN numbers are **never stored in plain text** in the database.
  - `POST /api/kyc/nin` hashes the NIN using SHA-256 (`nin_hash`) and stores only the Dojah vendor transaction token (`nin_vendor_ref`).
  - Lookup responses are sanitized before saving to audit logs (`verification_sessions`).

---

### 2. Account Limitations & Feature Lock Matrix

KYC verification is **optional at signup** with a **30-day grace period**. The platform absorbs **100% of all lookup & KYC costs (₦0 to user)**.

| Feature / System | Unverified (In Grace Period) | Unverified (Post 30-Day Grace) | KYC Verified User |
|---|---|---|---|
| **Daily Connection Requests** | Capped at **2 requests / day** | Capped at **0 requests / day** (Locked) | **Unlimited** |
| **Roommate Agreements (`/agreements`)** | 🔒 **Locked** (Must complete KYC) | 🔒 **Locked** | ✅ **Unlocked** |
| **Housing Referral Access (`/housing`)** | 🔒 **Locked** (Must complete KYC) | 🔒 **Locked** | ✅ **Unlocked** (after Agreement fee) |
| **Roomie Potential / Search Score** | Penalized (-15% downweighting) | Hidden / Excluded from Search | **100% Boosted & Priority Listed** |
| **Profile Badge** | Amber "Unverified" Chip | Red "KYC Required" Warning | 🛡️ **Verified Roomie Badge** |

---

### 3. Nigerian University Registration Number Format Matching

For student verification, matriculation/registration numbers are automatically validated against a known pattern registry:

| Institution | Format Pattern Regex | Example Valid Number |
|---|---|---|
| **UNILAG** | `^\d{9}$` | `190401001` |
| **UNN** | `^\d{4}\/\d{6}$` | `2019/245678` |
| **OAU** | `^[A-Z]{3}\/\d{4}\/\d{3}$` | `ENG/2019/001` |
| **UI (Ibadan)** | `^\d{2}\/[A-Z0-9]{7}$` | `19/25EE011` |
| **UNILORIN** | `^\d{2}\/\d{2}[A-Z]{2}\d{3}$` | `18/56EF011` |
| **ABU Zaria** | `^\d{2}\/[A-Z]{3}\/\d{4}$` | `19/SCI/3456` |
| **FUTA** | `^F\/[A-Z]{2}\/\d{2}\/[A-Z]{2}\/\d{4}$` | `F/HD/19/EE/3421` |
| **FUOYE** | `^\d{4}-[A-Z]{3}-\d{4}$` | `2019-CSC-0031` |
| **LASU** | `^\d{9}$` | `180211234` |
| **Covenant** | `^[A-Z]{3}\/[A-Z]{3}\/\d{2}\/\d{3}$` | `CST/CIS/19/001` |

*Unlisted institutions bypass pattern regex matching (`reg_number_format_matched = false`), permitting manual document upload.*

---

### 4. Migration Strategy for Existing 314 Users

1. **Database Migration Script**:
   ```sql
   UPDATE profiles
   SET is_legacy_user = TRUE,
       identity_verified = FALSE,
       user_type = 'student'
   WHERE created_at < '2026-06-05' AND is_legacy_user IS FALSE;
   ```
2. **Grace Period & Notification**:
   - 314 legacy users receive a 30-day grace period from migration rollout date.
   - Non-dismissible `KYCStatusBar` banner is displayed at the top of the PWA:
     `⚠️ Complete your identity check to keep full access. [Verify Now] — 23 days remaining`
3. **Retroactive Verification Route (`/verify/identity`)**:
   - Dedicated out-of-onboarding route allowing legacy users to complete NIN + face scan + doc upload without re-running full onboarding.
4. **Day 30 Enforcement**:
   - Automated Supabase cron sets `is_kyc_restricted = TRUE` for legacy users who haven't completed KYC after 30 days.

---

### 5. Complete Architecture & System Sequence Diagrams

#### Diagram 1 — Multi-Archetype Signup & Onboarding System Architecture

```mermaid
graph TB
    subgraph Auth["Authentication Layer"]
        SignIn["/auth/signin"]
        SignUp["/auth/signup"]
        Google["Google OAuth"]
    end

    subgraph CommonTrunk["Common Onboarding Trunk (Steps 0–4)"]
        S0["Step 0: /onboarding/type\nChoose: Student | NYSC | Professional"]
        S1["Step 1: /onboarding/basics\nName, Age, Gender, City\n+ State/LGA of Origin, Religion"]
        S2["Step 2: /onboarding/demographics\nLanguage & Contact prefs"]
        S3["Step 3: /onboarding/nin\nEnter NIN → Dojah API lookup\nSHA-256 Hashed in DB"]
        S4["Step 4: /onboarding/face\nDojah Liveness + Face Match\nSelfie vs NIMC Photo"]
    end

    subgraph StudentLane["Student Lane (Steps 5–7)"]
        ST5["Step 5: /onboarding/student/study\nStudy Level & Year"]
        ST6["Step 6: /onboarding/student/institution\nInstitution & Reg Number Regex Match"]
        ST7["Step 7: /onboarding/student/document\nUpload Student ID / Admission Letter"]
    end

    subgraph NYSCLane["NYSC Corper Lane (Steps 5–7)"]
        NY5["Step 5: /onboarding/nysc/callup\nCall-Up Number + Batch"]
        NY6["Step 6: /onboarding/nysc/posting\nState of Posting + CDS Group & Location"]
        NY7["Step 7: /onboarding/nysc/documents\nUpload NYSC ID + Call-Up Letter"]
    end

    subgraph ProfLane["Young Professional / Freelancer Lane (Steps 5–7)"]
        PR5["Step 5: /onboarding/professional/occupation\nJob Title & Employer / Freelance Role"]
        PR6["Step 6: /onboarding/professional/location\nUpload Utility Bill (Address Proof)"]
        PR7["Step 7: /onboarding/professional/proof\nUpload NDA-Safe Freelance Receipt / Employer Letter"]
    end

    subgraph SharedExit["Shared Exit (Steps 8–10)"]
        S8["Step 8: /onboarding/vibe\nLifestyle preferences"]
        S9["Step 9: /onboarding/budget\nBudget range + Move-in date"]
        S10["Step 10: /onboarding/success\nRedirect to /feed"]
    end

    subgraph KYC["KYC Vendor & Storage"]
        Dojah["Dojah.io API\n(NIN + Face Match)"]
        Storage["Supabase Storage\n(Private Bucket)"]
    end

    Auth --> S0
    S0 --> S1 --> S2 --> S3 --> S4
    S3 --> Dojah
    S4 --> Dojah

    S4 -->|"user_type = student"| ST5 --> ST6 --> ST7
    S4 -->|"user_type = nysc_corper"| NY5 --> NY6 --> NY7
    S4 -->|"user_type = young_professional"| PR5 --> PR6 --> PR7

    ST7 & NY7 & PR7 --> S8 --> S9 --> S10
    ST7 & NY7 & PR7 --> Storage
```

---

#### Diagram 2 — Dojah.io NIN Lookup Sequence (Step 3)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant NINPage as /onboarding/nin
    participant APIRoute as POST /api/kyc/nin
    participant Dojah as Dojah.io API
    participant DB as Supabase DB

    User->>NINPage: Enter 11-digit NIN
    NINPage->>APIRoute: POST { nin }
    APIRoute->>APIRoute: Compute SHA-256 nin_hash
    APIRoute->>Dojah: GET /api/v1/kyc/nin?nin={nin} (Secret Key)
    Dojah-->>APIRoute: { first_name, last_name, dob, photo_base64, ref_id }

    alt NIN Not Found
        APIRoute-->>NINPage: { success: false, error: "NIN not found" }
    else Name Mismatch
        APIRoute->>APIRoute: Fuzzy compare NIN name vs profile display_name
        APIRoute-->>NINPage: { success: false, error: "Name mismatch warning" }
    else NIN Found & Name Match
        APIRoute->>DB: INSERT INTO verification_sessions (type='nin_lookup', status='passed')
        APIRoute->>DB: UPDATE profiles SET nin_hash=hash, nin_verified=true, nin_vendor_ref=ref_id
        APIRoute-->>NINPage: { success: true }
        NINPage->>User: router.push('/onboarding/face')
    end
```

---

#### Diagram 3 — Dojah Web Liveness & Face Match Sequence (Step 4)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FacePage as /onboarding/face
    participant APIRoute as POST /api/kyc/face/init
    participant Dojah as Dojah.io Hosted Page
    participant Callback as GET /api/kyc/face/callback
    participant DB as Supabase DB

    User->>FacePage: Arrives at face step
    FacePage->>APIRoute: POST /api/kyc/face/init
    APIRoute->>Dojah: Create liveness session
    Dojah-->>APIRoute: { redirect_url, session_id }
    APIRoute-->>FacePage: { redirect_url }
    FacePage->>Dojah: User redirected to Dojah hosted liveness URL
    User->>Dojah: Completes challenge (blink/smile) + Selfie captured
    Dojah->>Callback: Redirect back with status & session_id
    Note over Dojah, Callback: Dojah auto-compares selfie vs NIMC photo

    alt Face Match Score >= 0.75
        Callback->>DB: UPDATE profiles SET face_verified=true, face_match_score=0.92
        Callback->>FacePage: Redirect to Type-Specific Step 5
    else Face Match Score < 0.75
        Callback->>DB: INSERT INTO verification_sessions (status='manual_review')
        Callback->>FacePage: Show "Under Admin Review" notification
    end
```

---

#### Diagram 4 — Nigerian University Registration Number Pattern Matching

```mermaid
flowchart TD
    A[User selects institution & enters reg number] --> B[Lookup institution regex in reg_patterns registry]
    B --> C{Pattern Registry Found?}

    C -- Pattern Exists --> D[Test reg number string against regex]
    D --> E{Matches Pattern?}
    E -- Match Passed --> F[Set reg_number_format_matched = true<br/>Save reg_number]
    E -- Match Failed --> G[Show inline hint error<br/>e.g. UNILAG format: 190401001]

    C -- Unlisted School --> H[Skip pattern regex test<br/>Set reg_number_format_matched = false<br/>Save reg_number as-is for manual review]
```

---

#### Diagram 5 — Legacy 314 Users Migration State Machine

```mermaid
stateDiagram-v2
    [*] --> LegacyUnverified: DB migration runs\nis_legacy_user = true\nidentity_verified = false

    LegacyUnverified --> GracePeriodActive: User logs in post-migration\nKYCStatusBar banner displayed

    GracePeriodActive --> VerificationStarted: User taps "Verify Now"\nNavigates to /verify/identity

    VerificationStarted --> NINPassed: NIN lookup passed
    NINPassed --> FacePassed: Face liveness passed
    FacePassed --> DocsSubmitted: Type-specific document uploaded
    DocsSubmitted --> FullyVerified: Admin approves docs\nidentity_verified = true

    GracePeriodActive --> GraceExpired: 30 days elapse without KYC
    GraceExpired --> RestrictedAccess: Soft restriction applied\nis_kyc_restricted = true
    RestrictedAccess --> VerificationStarted: User completes verification
```

---

### 6. Edge Cases & Safety Handling

| Scenario | System Handling |
|---|---|
| **NIN Name Mismatch** | Allow user to edit display name once and retry. After 2 failures, route to manual admin review queue. |
| **NIN Already Claimed** | Reject request: *"This NIN is already registered to another Roomie account."* Hashed bloom filter lookup prevents duplicate NINs. |
| **Liveness Fails 3 Times** | Temporary 24-hour lockout on face step. Displays support contact modal. |
| **Dojah API Outage** | Graceful fallback: set `verification_status = 'PENDING'`, allow user to proceed. Background cron retries lookup when API recovers. |
| **Invalid NYSC Call-Up Format** | Validate against `NIG/YYYY/STATE_CODE/XXXXX` pattern with inline hint. |
| **User Changes Archetype Post-Onboarding** | Allowed via `/settings/profile`. Re-triggers type-specific document upload only; NIN & face checks remain valid. |

---

---

## 19. PWA Architecture

### PWA Service Worker & Offline Sync Architecture

```mermaid
flowchart TD
    Req[PWA Request] --> SW{Service Worker Intercept}
    
    SW -- Static Assets / Fonts --> CacheFirst[CacheFirst Strategy<br/>roomie-static / roomie-fonts]
    SW -- Images / Avatars --> SWR[StaleWhileRevalidate Strategy<br/>roomie-images / roomie-avatars]
    SW -- Discover Feed --> NetFirst[NetworkFirst Strategy<br/>roomie-discover]
    SW -- Chat & Payments --> NetOnly[NetworkOnly Strategy<br/>No Cache]

    NetOnly --> Net{Online?}
    Net -- Yes --> Server[Supabase API / Paystack]
    Net -- No --> BgSync[Queue in IndexedDB BackgroundSync]
    BgSync --> Reconnect[Sync when connection resumes]
```

### Service Worker Caching Strategies

| Route/Asset | Strategy | Cache Name | TTL |
|---|---|---|---|
| JS/CSS chunks | CacheFirst | `roomie-static` | 1 year |
| Next.js images | StaleWhileRevalidate | `roomie-images` | 7 days |
| Avatar photos (Supabase Storage) | StaleWhileRevalidate | `roomie-avatars` | 3 days |
| `/discover` page data | NetworkFirst | `roomie-discover` | 1 hour |
| Chat messages | NetworkOnly | — | Never cache |
| Payments | NetworkOnly | — | Never cache |
| Google Fonts | CacheFirst | `roomie-fonts` | 1 year |

### PWA Manifest Highlights

```typescript
// apps/app/app/manifest.ts
{
  name: "Roomie",
  short_name: "Roomie",
  description: "Find your student roommate. Connect and Cooonnectttt.",
  start_url: "/discover",
  display: "standalone",
  theme_color: "#8AAF6E",
  background_color: "#EDE8C8",
  shortcuts: [
    { name: "Discover", url: "/discover" },
    { name: "My Chats", url: "/chat" },
    { name: "Find Housing", url: "/housing" },
  ]
}
```

### Offline Behavior

| Feature | Offline behavior |
|---|---|
| Discovery feed | Shows cached profiles from last session |
| Chat | Shows cached messages. New sends queued via BackgroundSync |
| Profile edit | Local save, syncs when online |
| Payments | Fully blocked — shows "Payment requires internet" |

---

## 20. Animated Icons System (Lottie)

All visual icons in the interface that would traditionally be emojis are replaced with Lottie animations. A shared `LottieIcon` component wraps the `lottie-react` library.

### Shared Component

```typescript
// packages/ui/src/lottie-icon.tsx

"use client";

import Lottie from "lottie-react";

interface LottieIconProps {
  animationData: object;
  size?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export function LottieIcon({
  animationData,
  size = 40,
  loop = false,
  autoplay = true,
  className,
}: LottieIconProps) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      style={{ width: size, height: size }}
      className={className}
    />
  );
}
```

### Animation Inventory

| File | Used in | Description |
|---|---|---|
| `connecting.json` | Connection modal | Two circles moving together and merging |
| `payment-success.json` | `/connect/success` | Confetti burst + checkmark |
| `verified-badge.json` | Profile card | Animated green shield/check |
| `chat-typing.json` | Chat thread | Three dots pulsing |
| `match-found.json` | Post-onboarding entry | Stars + celebration |
| `empty-feed.json` | Discovery feed (empty) | Person searching with a flashlight |
| `empty-chat.json` | Chat list (empty) | Two speech bubbles appearing |
| `bill-settled.json` | Bill splits | Money bag + checkmark |
| `loading.json` | Global loading | Smooth spinning dots |
| `offline.json` | Offline page | WiFi with X, animated |

Source for free Lottie JSON files: LottieFiles.com (filter by license: free/LottieFiles Free License)

---

## 21. API Routes Reference

### `apps/app/app/api/`

| Method | Route | Auth | Status | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/callback` | — | ✅ | Supabase OAuth callback |
| `GET` | `/api/connections` | Required | ✅ | Get user's connections list |
| `POST` | `/api/connections` | Required | ✅ | Initiate a connection (FREE, creates ACTIVE connection) |
| `GET` | `/api/connections/[id]` | Required | ✅ | Get connection details |
| `PATCH` | `/api/connections/[id]` | Required | ✅ | Update connection (decline/cancel) |
| `POST` | `/api/agreements` | Required | ✅ | Initiate a roommate agreement (injects agreement_request message) |
| `PATCH` | `/api/agreements/[id]` | Required | ✅ | Update agreement (decline/cancel) |
| `POST` | `/api/agreements/[id]/accept` | Required | ✅ | Accept agreement — initializes Paystack payment, returns access_code |
| `POST` | `/api/agreements/[id]/confirm` | Required | ✅ | Client-side confirm after Paystack onSuccess callback |
| `POST` | `/api/payments/webhook` | Paystack sig | ✅ | Handle Paystack webhook — verifies charge.success, confirms agreement |
| `POST` | `/api/platforms/[id]/click` | Required | ✅ | Record a platform click + increment total_clicks |
| `GET` | `/api/splits` | Required | ✅ | List bill splits for a connection (`?connectionId=`) |
| `POST` | `/api/splits` | Required | ✅ | Create a new bill split with shares array |
| `GET` | `/api/splits/[id]` | Required | ✅ | Fetch single split with items |
| `PATCH` | `/api/splits/[id]` | Required | ✅ | Settle an entire split |
| `PATCH` | `/api/splits/[id]/items/[itemId]` | Required | ✅ | Toggle paid status on a split item |
| `POST` | `/api/push/subscribe` | Required | [ ] | Save push subscription |
| `DELETE` | `/api/push/subscribe` | Required | [ ] | Remove push subscription |
| `POST` | `/api/push/send` | Internal | [ ] | Send a push notification (internal use only, VAPID-signed) |

### `apps/admin/app/api/`

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/providers/register` | — | Public provider registration |
| `PATCH` | `/api/providers/[id]` | Admin | Update provider details |
| `POST` | `/api/providers/[id]/approve` | Super admin | Approve a provider |
| `POST` | `/api/providers/[id]/reject` | Super admin | Reject a provider |
| `GET` | `/api/providers/[id]/analytics` | Admin | Get click/referral stats |

---

## 22. Environment Variables

### `apps/app/.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxxxx
SUPABASE_SERVICE_ROLE_KEY=eyxxxx            # Server-side only — never expose to browser

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxx
PAYSTACK_SECRET_KEY=sk_live_xxxx            # Server-side only — webhook verification

# PWA Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=Bxxxx
VAPID_PRIVATE_KEY=xxxx
VAPID_SUBJECT=mailto:admin@roomie.ng

# App
NEXT_PUBLIC_APP_URL=https://app.roomie.ng
NEXT_PUBLIC_ADMIN_URL=https://admin.roomie.ng
NEXT_PUBLIC_HOUSING_ACCESS_FEE=200000       # 200000 kobo = ₦2,000
```

### `apps/admin/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxxxx
SUPABASE_SERVICE_ROLE_KEY=eyxxxx
NEXT_PUBLIC_ADMIN_URL=https://admin.roomie.ng
```

### `apps/web/.env.local`

```env
NEXT_PUBLIC_APP_URL=https://app.roomie.ng
NEXT_PUBLIC_ADMIN_URL=https://admin.roomie.ng
```

---

## 23. Complete File Map

### Files in `apps/app` — Current State (2026-06-02)

**Legend:** ✅ = exists · [ ] = not yet built

```
app/
├── layout.tsx                         ✅
├── page.tsx                           ✅ (/ → /feed or /auth/signin)
├── manifest.ts                        ✅
├── globals.css                        ✅
├── offline/page.tsx                   ✅
├── auth/
│   ├── signin/page.tsx                ✅
│   └── callback/route.ts              ✅
├── onboarding/
│   ├── layout.tsx                     ✅
│   ├── welcome/page.tsx               ✅
│   ├── basics/page.tsx                ✅
│   ├── university/page.tsx            ✅
│   ├── vibe/page.tsx                  ✅
│   ├── budget/page.tsx                ✅
│   └── verify/page.tsx                ✅
├── feed/page.tsx                      ✅
├── discover/
│   ├── page.tsx                       ✅
│   └── [id]/page.tsx                  ✅
├── connect/
│   ├── [id]/page.tsx                  ✅
│   └── success/page.tsx               ✅
├── chat/
│   ├── page.tsx                       ✅
│   └── [connectionId]/page.tsx        ✅
├── splits/
│   ├── page.tsx                       ✅ (index across all connections)
│   └── [connectionId]/page.tsx        ✅ (detail + add splits, live item toggles)
├── housing/page.tsx                   ✅
├── profile/
│   ├── page.tsx                       [ ] PENDING
│   └── edit/page.tsx                  [ ] PENDING
├── notifications/page.tsx             ✅
├── privacy/page.tsx                   ✅
├── terms/page.tsx                     ✅
└── api/
    ├── auth/callback/route.ts         ✅
    ├── connections/route.ts           ✅ (GET + POST)
    ├── connections/[id]/route.ts      ✅ (GET + PATCH)
    ├── agreements/route.ts            ✅ (POST)
    ├── agreements/[id]/route.ts       ✅ (PATCH)
    ├── agreements/[id]/accept/route.ts ✅ (POST — Paystack init)
    ├── agreements/[id]/confirm/route.ts ✅ (POST — client confirm)
    ├── payments/webhook/route.ts      ✅ (POST — Paystack webhook)
    ├── platforms/[id]/click/route.ts      ✅ (POST)
    ├── splits/route.ts                    ✅ (GET + POST)
    ├── splits/[id]/route.ts               ✅ (GET + PATCH settle)
    ├── splits/[id]/items/[itemId]/route.ts ✅ (PATCH isPaid toggle)
    └── push/subscribe/route.ts            [ ] PENDING

src/
├── components/
│   ├── auth/
│   │   ├── EmailPasswordSignIn.tsx    ✅
│   │   └── GoogleSignInButton.tsx     ✅
│   ├── chat/
│   │   ├── AgreementCard.tsx          ✅
│   │   ├── ChatInput.tsx              ✅
│   │   ├── MessageBubble.tsx          ✅
│   │   └── TypingIndicator.tsx        ✅
│   ├── discover/
│   │   ├── CompatibilityScore.tsx     ✅
│   │   ├── FilterDrawer.tsx           ✅
│   │   ├── ProfileCard.tsx            ✅
│   │   └── ProfileCardSkeleton.tsx    ✅
│   ├── feed/
│   │   ├── CommentSheet.tsx           ✅
│   │   ├── PostCard.tsx               ✅
│   │   └── PostComposer.tsx           ✅
│   ├── housing/
│   │   └── PlatformCard.tsx           ✅
│   ├── layout/
│   │   ├── AppSidebar.tsx             ✅
│   │   └── ProfilePreviewCard.tsx     ✅
│   ├── onboarding/
│   │   ├── LifestyleTagPicker.tsx     ✅
│   │   └── OnboardingProgress.tsx     ✅
│   ├── splits/
│   │   ├── AddSplitModal.tsx          ✅
│   │   ├── SplitCard.tsx              ✅
│   │   └── SplitItemRow.tsx           ✅
│   └── pwa/
│       ├── InstallPrompt.tsx          ✅
│       └── ServiceWorkerRegister.tsx  ✅
├── context/
│   ├── AuthContext.tsx                ✅
│   └── NotificationContext.tsx        ✅
├── hooks/
│   ├── useConnections.ts              ✅
│   ├── useMessages.ts                 ✅
│   └── useProfile.ts                  ✅
└── lib/
    ├── agreements.ts                  ✅ (agreement business logic)
    ├── auth-guard.ts                  ✅
    ├── mockProfiles.ts                ✅ (dev mock data — replaced by Supabase in Phase 3B)
    └── paystack.ts                    ✅
```

### Files to Create — `apps/web`

```
app/
├── layout.tsx
├── page.tsx               ← Full SPA
├── globals.css
├── privacy/page.tsx
└── terms/page.tsx

src/components/sections/
├── Hero.tsx
├── HowItWorks.tsx
├── WhyRoomie.tsx
├── Pricing.tsx
├── ForProviders.tsx
├── AppPreview.tsx
└── Footer.tsx
```

### Files to Create — `apps/admin`

```
app/
├── layout.tsx
├── page.tsx
├── register/page.tsx
├── login/page.tsx
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── profile/page.tsx
│   ├── analytics/page.tsx
│   └── settings/page.tsx
└── super/
    ├── page.tsx
    ├── providers/[id]/page.tsx
    ├── users/page.tsx
    └── connections/page.tsx
```

### Files to Create — `packages/`

```
packages/
├── ui/src/
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── modal.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── lottie-icon.tsx
│   └── index.ts
├── db/src/
│   ├── client.ts
│   ├── server.ts
│   ├── types.ts              ← generated by `supabase gen types`
│   └── queries/
│       ├── profiles.ts
│       ├── connections.ts
│       ├── messages.ts
│       └── payments.ts
└── animations/
    ├── connecting.json
    ├── payment-success.json
    ├── verified-badge.json
    ├── chat-typing.json
    ├── match-found.json
    ├── empty-feed.json
    ├── empty-chat.json
    ├── bill-settled.json
    ├── loading.json
    └── offline.json

supabase/
├── migrations/
│   ├── 0001_initial_schema.sql            ✅ — profiles, connections, messages, payments,
│   │                                            bill_splits, housing_platforms, notifications,
│   │                                            push_subscriptions, admin_users, blocks
│   ├── 0002_feed_tables.sql               ✅ — posts, post_likes, post_comments + triggers
│   ├── 0003_roommate_agreements.sql       ✅ — roommate_agreements table + new message_type values
│   ├── 0004_seed_user_passwords.sql       ✅ — seed stub
│   └── 0005_message_notifications_trigger.sql ✅ — auto-notify on new text/image messages
├── seed.sql                               ✅
└── config.toml                            ✅
```

---

## 24. Package Installation Reference

### Root

```bash
npm install -D turbo typescript
```

### `apps/app` and `apps/admin`

```bash
npm install next@latest react@latest react-dom@latest
npm install @supabase/supabase-js @supabase/ssr
npm install @serwist/next serwist
npm install lottie-react
npm install framer-motion
npm install idb
npm install lucide-react
npm install web-push
npm install --save-dev @types/web-push @serwist/build
```

### `apps/web`

```bash
npm install next@latest react@latest react-dom@latest
npm install framer-motion
npm install lottie-react
npm install lucide-react
```

### `packages/db`

```bash
npm install @supabase/supabase-js @supabase/ssr
# After schema is deployed:
npx supabase gen types typescript --project-id <id> > src/types.ts
```

---

## 25. Implementation Phases

> Status markers: `[x]` = done · `[ ]` = pending · `[~]` = in progress / partially done
>
> **Payment rule (applies to every phase):** Connecting with a roommate is **FREE**. The ₦2,000 Paystack charge fires **only** when a connected pair taps "Find Housing" on the `/housing` page. No other action costs money.
>
> **Layout rule:** The main PWA uses an X/Twitter-style 3-column layout on desktop (sidebar left · feed centre · filters/content right) and a full-width single-column with BottomTabNav on mobile.


> **Brand colours:** Primary `#8AAF6E` (Sage Green) · CTA `#FAE8CC` (Soft Peach) · Surface `#EDE8C8` (Pale Yellow-Green) · Secondary `#B8CE9E` (Light Sage)

---

### Phase 1 — Infrastructure & Monorepo Scaffold ✅ DONE

```
[x] Turborepo monorepo — package.json workspace + turbo.json
[x] apps/web, apps/app, apps/admin scaffolded with Next.js (App Router)
[x] packages/config — Tailwind palette, tsconfig.base.json, eslint rules
[x] packages/ui — BottomTabNav (extended for React node icons), Button, Card, Avatar, Badge,
      Modal, AuthInput, AuthLayout, LottieIcon stubs, useAutoHideOnScroll
[x] packages/animations — 10 placeholder JSON files (Lottie assets sourced in Phase 11)
[x] packages/db — singleton createBrowserClient, createServerClient, createServiceClient,
      types.ts (generated), queries/ directory
[x] supabase/ — config.toml, migrations/, seed.sql, local stack running at 127.0.0.1:54321
[x] .env.local in each app
[x] Root scripts: dev, build, lint, check-types
```

---

### Phase 2 — Database, Auth & Onboarding ✅ DONE

#### Database

```
[x] 1.  supabase/migrations/0001_initial_schema.sql written — full schema from §7
          All enums, tables, indexes, RLS policies, triggers (handle_new_user + set_updated_at)
[x] 2.  supabase db reset — migration applies cleanly, tables + triggers confirmed
[x] 3.  supabase gen types typescript --local → packages/db/src/types.ts
[x] 4.  supabase/seed.sql — 25 realistic Nigerian student profiles (varied cities, universities,
          budgets, lifestyle tags), 5 housing platforms, 3 ACTIVE connections
          NOTE: Seed uses fixed UUIDs — idempotent, safe to re-run on db reset
```

#### packages/db Setup

```
[x] 5.  packages/db/src/client.ts — createBrowserClient as true singleton (module-level var)
          IMPORTANT: No auth option overrides — @supabase/ssr manages cookie storage automatically.
          Adding auth options (flowType, persistSession) was found to break SSR cookie sync.
[x] 6.  packages/db/src/server.ts — createServerClient (SSR) + createServiceClient (service role)
[x] 7.  packages/db/src/queries/profiles.ts:
          getDiscoveryFeed(), getProfileById(), updateProfile(), updateOnboardingStep(), updateLastSeen()
[x] 8.  packages/db/src/queries/connections.ts:
          getConnectedUserIds(), createConnection(), getConnectionById(), getUserConnections(), getExistingConnection()
[x]     packages/db/src/queries/payments.ts — createPayment(), getPaymentByReference(), updatePaymentStatus()
[x]     packages/db/src/queries/messages.ts — stub ready
[x]     packages/db/src/lib/compatibility.ts — calculateCompatibility() with weighted scoring (§13)
```

#### Authentication

```
[x] 9.  Google OAuth configured in local Supabase dashboard
[x] 10. GoogleSignInButton.tsx built — Google OAuth only, no email/password
[x] 11. apps/app/app/auth/signin/page.tsx — AuthLayout card, Roomie branding, Background: #EDE8C8
[x] 12. apps/app/app/auth/callback/route.ts — exchanges PKCE code for session, sets cookie,
          redirects to correct onboarding step or /discover
[x] 13. apps/app/src/context/AuthContext.tsx — CORRECTED implementation:
          - supabase client is module-level singleton (not recreated on render)
          - ONLY uses onAuthStateChange() — fires immediately with existing cookie session on mount
          - This is what "remembers" the user without re-authentication
          - getUser() call removed (onAuthStateChange covers it)
          - useMemo on context value prevents unnecessary re-renders
[x] 14. apps/app/app/page.tsx — root redirect: authenticated → /feed, else → /auth/signin
[x]     apps/app/middleware.ts — CORRECTED:
          PUBLIC_ROUTES: /auth/signin, /auth/callback, /offline, /discover (browsable without login)
          PROTECTED_ROUTES: /onboarding, /connect, /chat, /splits, /housing, /profile, /notifications
          Refreshes session cookie on every request to prevent silent expiry
```

#### Onboarding Wizard

```
[x] 15. apps/app/app/onboarding/layout.tsx — shared wrapper with OnboardingProgress
[x] 16. apps/app/src/components/onboarding/OnboardingProgress.tsx — step indicator (brand-500)
[x] 17. All 6 onboarding steps built (each saves to Supabase immediately + increments onboarding_step):
          welcome/page.tsx   — Step 0: full-screen welcome, Lottie placeholder, single CTA
          basics/page.tsx    — Step 1: display name, age, gender, city
          university/page.tsx — Step 2: university, year of study, course/faculty
          vibe/page.tsx      — Step 3: lifestyle tags (GoFinder chip UI), sleep/cleanliness/noise sliders, toggles
          budget/page.tsx    — Step 4: dual-range slider ₦20k–₦500k, move-in date, roommate gender pref
          verify/page.tsx    — Step 5: profile photo + student ID upload (optional, sets verification_status = PENDING)
[x] 18. apps/app/src/hooks/useProfile.ts — getProfile(), updateProfile(), updates last_seen_at on mount
```

#### Deployment

```
[ ] 19. Push schema to Supabase cloud project via `supabase db push`
[ ] 20. Deploy apps/app to Vercel with all env vars
[ ] 21. Verify end-to-end: Google Sign In → profile auto-created → onboarding 0–5 → /discover
[ ] 22. Deploy apps/web placeholder to Vercel (full marketing SPA in Phase 9)
```

**Connects to → Phase 3:** 25 seeded profiles exist. Auth is working. The discover feed is ready to show real data once Supabase query is used instead of mock profiles.

---

### Phase 3 — Discovery Feed ✅ COMPLETE

**Prerequisites:** Phase 2 complete. Profiles table populated with seed data. packages/db queries working. Auth context live.

**What this unlocks:** Users can browse profiles and tap "Connect" — the entry point for Phase 4's free connection flow.

#### Layout — X-Style 3-Column Desktop (NEW — not in original plan)

The discover page uses a Twitter/X-style layout. See the layout architecture decision at the top of §25.

```
[x] NEW  Build apps/app/src/components/layout/ProfilePreviewCard.tsx
          Mini card at top of left sidebar showing logged-in user's avatar, display name,
          university, city, verified badge
          States: skeleton while loading · "Sign in" prompt when unauthenticated · full preview when authed
          Links to /profile on click — chevron icon on the right
[x] NEW  Build apps/app/src/components/layout/AppSidebar.tsx
          Fixed left sidebar on desktop (hidden on mobile — replaced by BottomTabNav)
          Structure (top → bottom):
            - Roomie logomark (leaf/dual-circle icon) + brand name → links to /discover
            - ProfilePreviewCard
            - Horizontal divider
            - Nav items: Discover · Chat · Find Housing · Bill Splits · Notifications · Profile
              Each item: SVG icon + label + active indicator dot + active state (white card, brand-600 text)
            - Footer: Privacy · Terms · Contact links + "© 2026 Roomie · A GIGSRentals Product"
          Active state detection via usePathname()
```

#### Discovery Feed Core

```
[x] 1.  apps/app/src/components/discover/ProfileCard.tsx
          Ported from GoFinder RoommatePost layout
          Shows: avatar (xl, ring), name + age, university + year, city with pin icon,
                 budget range formatted (₦Xk – ₦Yk/mo), top 3 lifestyle tags as chips,
                 compatibility score chip, verified checkmark badge (brand-500 filled circle)
          Card background: white with shadow · Verified badge: brand-500
          CTA: "View profile" → /discover/[id] — status-aware (ACTIVE → "Open chat", PENDING → "Pending")
[x] 2.  apps/app/src/components/discover/ProfileCardSkeleton.tsx — shimmer loading state
[x] 3.  apps/app/app/discover/page.tsx — X-style 3-column layout:
          LEFT: <AppSidebar> (fixed, desktop only)
          CENTER: feed header + 2-col profile card grid
          RIGHT: <FilterDrawer> (fixed, lg+ screens only)
          MOBILE: single-col feed + mobile header + BottomTabNav + FilterDrawer slide-up
          Mock data source: apps/app/src/lib/mockProfiles.ts (25 profiles — bypasses Supabase auth for dev)
          Client-side filtering via useMemo (all filter types applied)
          Empty state with "Clear filters" CTA when filter returns 0 results
[x] 4.  packages/db/src/lib/compatibility.ts — calculateCompatibility()
          Weights: budget 30, sleepSchedule 20, cleanliness 15, noisePreference 15, city 10, lifestyle_overlap 10
          NOTE: Currently uses dummy hash-based score on mock profiles (real scoring in Phase 3B)
[x] 5.  apps/app/src/components/discover/CompatibilityScore.tsx
          Pill chip: green (≥70) · amber (40–69) · grey (<40) · shows "X% match"
[x] 6.  apps/app/src/components/discover/FilterDrawer.tsx
          Slide-up drawer on mobile (backdrop + translate-y animation)
          Fixed right sidebar on desktop (lg+)
          Filters: Verified only toggle · Gender preference chips · Budget min/max inputs ·
                   City chips (15 Nigerian cities) · Lifestyle tag chips (10 tags)
          Active filter count badge on the filter button
[x] 7.  Filter state wired client-side via useMemo on MOCK_PROFILES (Supabase query wiring in Phase 3B)
[x] 8.  apps/app/app/discover/[id]/page.tsx — full profile view
          Back button (router.back()) · compatibility score in header
          Hero card: avatar + name/age + university + year + city + verified badge
          Budget & Move-in card: budget range, move-in date
          Lifestyle card: sleep schedule, cleanliness, noise, smoking/pets/guests, lifestyle tags
          Sticky CTA bar at bottom: compatibility % + "Connect" button (FREE — see business model note)
          404 fallback if profile ID not found in mock data
[x] 9.  apps/app/src/hooks/useConnections.ts
          Loads all connections for logged-in user from Supabase
          getConnectionStatus(profileId) — returns current status or null
          Used to render correct button state on ProfileCard and profile detail page
```

#### Mock Data Layer (temporary — replaced by Supabase query in Phase 3B)

```
[x] NEW  apps/app/src/lib/mockProfiles.ts — 25 typed FeedProfile objects
          25 realistic Nigerian student profiles: 13 female, 12 male, 7 verified
          Spread across Lagos, Abuja, Ibadan, Enugu, Port Harcourt, Kano, Nsukka
          Real avatar URLs from pravatar.cc · varied budgets (₦25k–₦150k) · varied lifestyle tags
          REASON: Supabase query requires the user to be authenticated. During development and UI testing,
          mock data lets the discover feed render and be tested without sign-in.
          TO REPLACE: Swap MOCK_PROFILES for getDiscoveryFeed() Supabase call once Google OAuth
          credentials are configured and local auth is working end-to-end.
```

#### Phase 3B — Wire Live Supabase Query (pending, after auth is confirmed working)

```
[ ] 3B-1. Replace MOCK_PROFILES in discover/page.tsx with getDiscoveryFeed() from @repo/db/queries/profiles
           Restore useCallback + useEffect pattern for infinite scroll with IntersectionObserver
           Add ProfileCardSkeleton grid while loading
[ ] 3B-2. Replace mockScore() in discover/[id]/page.tsx with calculateCompatibility(myProfile, profile)
           Requires useProfile() to have loaded the logged-in user's profile
[ ] 3B-3. Wire useConnections() into ProfileCard.tsx to show real connection status per card
[ ] 3B-4. Verify discover feed loads 20 profiles per page, infinite scroll loads next page
```

**Connects to → Phase 3C (Feed):** Discovery profiles link to user profiles referenced in Feed posts.
**Connects to → Phase 4:** The "Connect" button on `/discover/[id]` calls the free connection creation API built in Phase 4. No payment at this step.

---

### Phase 3C — Social Feed (Twitter-style) ✅ COMPLETE

**Prerequisites:** Phase 3 complete (auth, profiles, discover feed live). Layout components already built.

**What this unlocks:** Students post "Looking for a roommate" updates publicly. Others like, comment, and tap through to connect. Feed is the default landing page (`/` → `/feed`).

#### Database

```
[x] 1.  supabase/migrations/0002_feed_tables.sql
          posts: id, user_id, content (≤500), city, budget_min, budget_max,
                 move_in_date, likes_count, comments_count, created_at, updated_at
          post_likes: UNIQUE(post_id, user_id)
          post_comments: content ≤300 chars
          RLS: SELECT all, INSERT/DELETE own only on all three tables
          SECURITY DEFINER triggers maintain likes_count and comments_count
```

#### Query Layer

```
[x] 2.  packages/db/src/queries/posts.ts
          getFeed, getPostById, createPost, deletePost
          likePost, unlikePost, getLikedPostIds
          getComments, addComment
          Author profile joined via foreign key select on each query
```

#### Components

```
[x] 3.  apps/app/src/components/feed/PostComposer.tsx
          Auto-resize textarea, 500-char limit with colour counter
          Ctrl/Cmd+Enter to submit · peach "Post" button
[x] 4.  apps/app/src/components/feed/PostCard.tsx
          Avatar → /discover/[id] · verified badge · university/city
          Budget + move-in chips · like (optimistic) · comment · "View profile"
[x] 5.  apps/app/src/components/feed/CommentSheet.tsx
          Mobile: slide-up drawer · Desktop: centered modal
          Loads on open, scrolls to bottom, Enter to send
```

#### Feed Page & Navigation

```
[x] 6.  apps/app/app/feed/page.tsx
          X-style layout · PostComposer (auth-gated) · infinite scroll (PAGE_SIZE=20)
          getLikedPostIds hydrates liked_by_me on each load
          Skeleton + empty state
[x] 7.  AppSidebar: Feed added as first nav item, logo links to /feed
[x] 8.  discover/page.tsx BottomTabNav: Feed tab added first
[x] 9.  feed/page.tsx: own BottomTabNav (Feed, Discover, Chat, Profile)
[x] 10. middleware.ts: /feed added to PROTECTED_ROUTES
[x] 11. apps/app/app/page.tsx: root redirect changed from /discover → /feed
```

---

### Phase 4 — Connection Flow (Free) ✅ COMPLETE

**Prerequisites:** Phase 3 complete. Discovery feed live. `connections` table exists with RLS. Auth confirmed working end-to-end.

> **₦0 — Connecting is free.** Connecting creates an ACTIVE connection and unlocks chat immediately. The ₦2,000 fee comes in Phase 6 (housing access), not here.

**What this unlocks:** ACTIVE connections — the prerequisite for Phase 5's real-time chat. The DB RLS policy `messages_connection_members` checks connection exists and is between the two users.

#### Connection API (Free)

```
[x] 1.  Build apps/app/src/lib/auth-guard.ts — withAuth() server helper (§28.2)
          Reads session from cookies via createServerClient()
          Returns { user } or throws 401 — used in all API routes
[x] 2.  Build apps/app/app/api/connections/route.ts (POST)
          withAuth guard + Zod validation: { receiverId: z.string().uuid() }
          Self-connection guard (defence in depth alongside DB constraint)
          Check for existing connection via getExistingConnection() — prevent duplicates
          Create connection: status = 'ACTIVE' (free — no payment step)
          Insert notification for receiver: "You have a new roommate connection!"
          Return: { connectionId }
[x] 3.  Build apps/app/app/api/connections/[id]/route.ts (GET + PATCH)
          GET: fetch connection details for both parties
          PATCH: decline | cancel — only the relevant party can act
```

#### Connect Page UI

```
[x] 4.  Build apps/app/app/connect/[id]/page.tsx
          Two-column layout: receiver profile summary + what connecting unlocks
          Left card: receiver avatar, name, university, compatibility score
          Right card: "Chat with them directly" + "Find housing together"
          "Connect" CTA (peach-200 #FAE8CC) — calls POST /api/connections, no payment popup
          Shows existing connection status if already connected
[x] 5.  Build apps/app/app/connect/success/page.tsx
          Confirmation screen after connection is created
          Shows: "You're connected with [Name]!" + "Go to chat" CTA + housing teaser
          connecting.json Lottie animation placeholder (wired in Phase 9)
```

#### Notifications

```
[x] 6.  Build apps/app/src/context/NotificationContext.tsx
          Port unread count pattern from GoFinder MessageContext (§26.5)
          Subscribe to notifications table via Supabase Realtime
          Expose { unreadCount, markAllRead }
          Wire unread dot to AppSidebar nav item for Notifications
```

> **payments.ts is already built** (Phase 2 db setup) — it will be used in Phase 6, not here.

**Connects to → Phase 5:** Connections are ACTIVE immediately after the free Connect action. RLS now allows both users to read/write `messages`. Chat is ready to be built.

---

### Phase 5 — Real-Time Chat & PWA Foundation ✅ COMPLETE

**Prerequisites:** Phase 4 complete. ACTIVE connections exist in the database. Supabase Realtime enabled on the project. packages/db client set up with real-time support.

**What this unlocks:** The primary daily engagement surface. Also the host for Phase 6's agreement card and system messages. The PWA manifest and offline page registered here are the foundation Phase 7 builds push notifications on top of.

#### Chat Core

```
[x] 1.  Implement apps/app/src/hooks/useMessages.ts (§15)
          Initial load with sender profile join (60 messages per page)
          Supabase Realtime postgres_changes subscription filtered by connection_id
          sendMessage() — insert text or image message
          markMessagesRead(), getUnreadCountPerConnection()
[x] 2.  Build apps/app/src/components/chat/MessageBubble.tsx
          Own messages: right-aligned, brand-500 (#8AAF6E) background
          Other user: left-aligned, #EDE8C8 background
          system message type: centered, muted
          agreement_request, agreement_confirmed, agreement_declined types handled via AgreementCard
[x] 3.  Build apps/app/src/components/chat/ChatInput.tsx
          Text input, send button (peach-200 #FAE8CC), image attach button
          Image flow: file picker → upload to Supabase Storage → send as image type
[x] 4.  Build apps/app/src/components/chat/TypingIndicator.tsx
          Renders chat-typing.json Lottie when isTyping = true
[x] 5.  Implement typing indicator via Supabase Presence (§15)
          presenceChannel.track({ typing: true }) on keydown, auto-clear after 3s idle
[x] 6.  Build apps/app/app/chat/[connectionId]/page.tsx
          Message list with auto-scroll to bottom on new message
          AgreementCard rendered for agreement_request message type
          "Find your place" banner linking to /housing (visible for ACTIVE connections)
          ChatInput pinned at bottom
[x]     Build apps/app/src/components/chat/AgreementCard.tsx
          Special card rendered for agreement_request messages in the chat thread
          Shows initiator name, what agreeing means, cost (₦2,000)
          States: pending (Decline + Accept buttons for acceptor), waiting (Cancel for initiator),
                  confirmed (housing unlocked banner), declined (muted pill)
```

#### Chat List

```
[x] 7.  Build apps/app/app/chat/page.tsx
          All ACTIVE connections sorted by latest message timestamp
          Last message preview + unread badge (uses NotificationContext from Phase 4)
          Empty state: empty-chat.json Lottie
```

#### PWA Setup

```
[x] 8.  Serwist PWA setup complete:
          apps/app/next.config.ts        → withSerwistInit() wrapper, swSrc: "src/sw.ts", swDest: "public/sw.js"
                                           disabled in development (process.env.NODE_ENV === "development")
          apps/app/src/sw.ts             → Serwist v9 service worker with custom runtime caching:
                                           Google Fonts → CacheFirst (roomie-fonts)
                                           Supabase storage / Google avatars → StaleWhileRevalidate (roomie-avatars)
                                           /chat, /api/payments, /api/agreements → NetworkOnly (never cache)
                                           /discover, /feed → NetworkFirst (roomie-discover)
                                           defaultCache from @serwist/next/worker for all Next.js static assets
          apps/app/src/components/pwa/ServiceWorkerRegister.tsx → client component, registers /sw.js on mount
[x] 9.  Build apps/app/app/manifest.ts (§19)
          name: "Roomie", start_url: "/feed"
          theme_color: "#8AAF6E", background_color: "#EDE8C8"
          Shortcuts: Discover, My Chats, Find Housing
[x] 10. Build apps/app/app/offline/page.tsx — offline.json Lottie + "You're offline" message
[x] 11. Build apps/app/src/components/pwa/InstallPrompt.tsx
          Fixed bottom-right card (desktop) / bottom-full-width (mobile)
          Roomie branded icon, "Install" + "Not now" buttons
          Uses beforeinstallprompt event, standalone display mode detection
          Wired into root layout alongside ServiceWorkerRegister
```

**Connects to → Phase 6:** Chat accepts `system` and `agreement_*` message types — Phase 6 agreement flow wires the full Paystack payment and housing unlock. Supabase Storage is confirmed working. PWA manifest is registered — Phase 7 adds VAPID push on top.

---

### Phase 6 — Roommate Agreement, Housing Access & Bills ✅ COMPLETE

**Prerequisites:** Phase 5 complete. Chat live with real-time messaging. ACTIVE connections exist in the database.

**What this unlocks:** The ₦2,000 revenue moment — triggered by mutual consent inside the chat, not at a navigation gate. Housing referrals, bill splitting, and student verification.

> **Status as of 2026-06-18:** Agreement flow, Paystack payment, housing provider page, bill splitting, and student verification file upload (tasks 20–21) all complete. Student verification admin review workflow and Lottie animation (task 22 cosmetic) are Phase 7–9 items.

---

> ### ⚠️ Payment Architecture — Final Decision
>
> **Where the money flows:**
> - Payment is triggered inside the chat when the **acceptor** taps "Accept & Pay ₦2,000"
> - It is NOT triggered by visiting `/housing` — the housing page just shows the list
> - The `/housing` page checks: does this connection have a CONFIRMED agreement? If yes → show providers. If no → prompt to propose an agreement first.
>
> **Who pays:**
> - The **acceptor** of the agreement pays ₦2,000 (one payment per connection, paid by whoever accepts)
> - On payment success → both users in the connection get housing access (agreement status = CONFIRMED)
>
> **Why this is better than a navigation-gate paywall:**
> - The payment is attached to a meaningful commitment moment ("we've decided to live together"), not a UI bottleneck
> - Users feel the value before paying — they've already talked, decided, and are now sealing the deal
> - Churn is lower because the user is emotionally invested before the payment prompt appears

---

#### Database — migrations applied for this phase ✅

```
[x] supabase/migrations/0003_roommate_agreements.sql ✅ APPLIED
      New message_type enum values: agreement_request, agreement_confirmed, agreement_declined
      roommate_agreements table: id, connection_id (UNIQUE), initiator_id, acceptor_id,
        status (PENDING/DECLINED/CONFIRMED), payment_reference, payment_channel,
        amount (200000 kobo), paid_at, created_at, accepted_at
      RLS: agreements_connection_members — only parties to the connection

[x] supabase/migrations/0005_message_notifications_trigger.sql ✅ APPLIED
      Auto-create notifications on new text/image messages (excludes system/agreement types)
      One unread notification per connection (upsert pattern to prevent duplicates)
```

Apply with: `supabase db push`

---

#### Agreement Initiation — inside the chat thread ✅ DONE

```
[x] 1.  Add "Propose Agreement" button to apps/app/app/chat/[connectionId]/page.tsx
          Shown when no PENDING or CONFIRMED agreement exists for this connection
          Tapping calls POST /api/agreements — injects agreement_request message into chat

[x] 2.  Build apps/app/app/api/agreements/route.ts (POST) ✅
          withAuth + service role for writes
          Body: { connectionId: string }
          Guard: user must be a party to this connection
          Guard: no existing PENDING or CONFIRMED agreement for this connection
          Insert into roommate_agreements: { connection_id, initiator_id, status: 'PENDING' }
          Inject system message of type 'agreement_request' into the chat
          Notify receiver via notifications table
          Return: { agreementId }

[x] 3.  Build apps/app/app/api/agreements/[id]/route.ts (PATCH) ✅
          Actions: decline | cancel
          'decline' — receiver only — sets status = 'DECLINED', injects 'agreement_declined' message
          'cancel'  — initiator only — sets status = 'DECLINED'
```

---

#### Agreement Card — rendered in the chat as a special message bubble ✅ DONE

```
[x] 4.  Build apps/app/src/components/chat/AgreementCard.tsx ✅
          Rendered by chat/[connectionId]/page.tsx for agreement_request messages
          Card layout:
            ┌──────────────────────────────────────────┐
            │  Roommate Agreement Proposal             │
            │  [Initiator name] wants to be your      │
            │  official roommate partner.             │
            │                                          │
            │  ✓ Chat together (already unlocked)      │
            │  ✓ Access housing providers              │
            │  ✓ "Roomie Partners" badge on profiles   │
            │                                          │
            │  Cost: ₦2,000 (one-time, paid by you)   │
            │                                          │
            │  [Decline]    [Accept & Pay ₦2,000]      │
            └──────────────────────────────────────────┘
          States:
            - acceptor + PENDING: Decline + Accept buttons → triggers Paystack
            - initiator + PENDING: "Waiting for response..." + Cancel
            - CONFIRMED: "Agreement confirmed — housing unlocked" (brand-500)
            - DECLINED: "Agreement was declined" (muted)

[x] 5.  Handle message_type = 'agreement_confirmed' in MessageBubble ✅
          Celebration system message: "You're official roommate partners! Housing providers unlocked."
          Brand-500 background, full-width centered card

[x] 6.  Handle message_type = 'agreement_declined' in MessageBubble ✅
          Muted centered pill: "[Name] declined the agreement."
```

---

#### Paystack Payment — triggered by "Accept & Pay" ✅ DONE

```
[x] 7.  Build apps/app/app/api/agreements/[id]/accept/route.ts (POST) ✅ — THE PAYMENT TRIGGER
          withAuth + service role for writes
          Only callable by the connection's non-initiator (the acceptor)
          Guard: agreement status = 'PENDING' (idempotent — returns existing if CONFIRMED)
          Amount always from process.env.AGREEMENT_FEE_KOBO (200000) — never from request body
          Call Paystack transactions/initialize:
            { amount: 200000,
              email: user.email,
              currency: "NGN",
              metadata: {
                agreement_id: id,
                connection_id: agreement.connection_id,
                user_id: user.id,
                type: "roommate_agreement"
              },
              channels: ["card","bank","ussd","bank_transfer","mobile_money"],
              callback_url: "/chat/{connectionId}?agreed=true"
            }
          Create pending payment record in payments table
          Set agreement.acceptor_id = user.id
          Return { access_code, reference } to client

[x] 8.  PaystackButton integrated into AgreementCard.tsx ✅
          Loads Paystack Inline JS via script tag (lazy, only when mounted)
          Opens popup with access_code from /api/agreements/[id]/accept
          onSuccess(reference): calls POST /api/agreements/[id]/confirm with reference
          onClose: shows "Payment cancelled — you can try again" toast
          Button: full-width, peach-200 (#FAE8CC)

[x] 9.  Build apps/app/app/api/agreements/[id]/confirm/route.ts (POST) ✅
          Called by client after Paystack popup onSuccess callback
          Verifies reference with Paystack API (belt-and-suspenders alongside webhook)
          Updates agreement status to CONFIRMED
          Injects agreement_confirmed system message into chat

[x]     Build apps/app/app/api/payments/webhook/route.ts ✅ — THE MONEY ACTUALLY ARRIVES HERE
          HMAC-SHA512 signature verification (x-paystack-signature) — runs BEFORE any DB write
          Only processes event = 'charge.success' AND metadata.type = 'roommate_agreement'
          Idempotent check: if payment reference already SUCCESS → return 200, no-op
          Updates payment: status = 'SUCCESS', paid_at, payment_channel
          Updates agreement: status = 'CONFIRMED', accepted_at, paid_at, payment_reference
          Injects message of type 'agreement_confirmed' into the chat for both users
          Notifies both parties via notifications table
          Returns: { received: true }
```

---

#### Housing Page — shows providers after agreement is confirmed ✅ DONE

```
[x] 10. Implement packages/db/src/queries/housing.ts — getRelevantPlatforms() ✅
          Filter status = 'ACTIVE', match by city or university via .or()
          Sort: is_featured DESC, total_clicks DESC
          Limit 12

[x] 11. Build apps/app/app/api/platforms/[id]/click/route.ts (POST) ✅
          Auth guard · insert platform_clicks record
          Increment housing_platforms.total_clicks via direct update

[x] 12. Build apps/app/src/components/housing/PlatformCard.tsx ✅
          Logo, name, cities/campus tags
          "Visit platform" button opens in new tab (click API called first)
          "Featured" badge if is_featured = true

[x] 13. Build apps/app/app/housing/page.tsx ✅
          Gate: connection must have a CONFIRMED agreement → else show "Propose an agreement
                from your chat to unlock housing providers"
          UNLOCKED (agreement = CONFIRMED):
            List from getRelevantPlatforms(userCity, userUniversity)
            Each card: PlatformCard with click tracking
          NO CONNECTION or NO CONFIRMED AGREEMENT:
            Clear CTA linking back to /chat or /discover
```

---

#### Bill Splitting ✅ COMPLETE

```
[x] 14. packages/db/src/queries/billSplits.ts
          getBillSplitsForConnection(), getAllBillSplitsForUser(), getBillSplitById()
          createBillSplit() — creates split + items in one transaction
          markSplitItemPaid(), markSplitItemUnpaid(), settleBillSplit()
          Exported via @repo/db package.json ("./queries/billSplits")

[x] 15. apps/app/app/api/splits/route.ts (GET + POST)
          GET ?connectionId=xxx — lists all splits for a connection (connection membership guard)
          POST — creates new bill split with shares array; validates membership + totalAmount

[x] 16. apps/app/app/api/splits/[id]/route.ts (GET + PATCH)
          GET — fetch single split with items
          PATCH { action: "settle" } — mark entire split as settled

[x] 17. apps/app/app/api/splits/[id]/items/[itemId]/route.ts (PATCH)
          PATCH { isPaid: boolean } — toggle paid status on a split item (either party can mark)

[x] 18. apps/app/src/components/splits/SplitItemRow.tsx
          Optimistic toggle with server revert on failure
          Avatar, name, amount, paid checkbox
[x] 19. apps/app/src/components/splits/SplitCard.tsx
          Progress bar (paid/total), per-item toggle rows
          "Mark as settled" button appears when all items paid
          Settled cards rendered with opacity + "Settled" badge
[x] 20. apps/app/src/components/splits/AddSplitModal.tsx
          Slide-up on mobile, centered on desktop
          Title, description, total amount, per-participant share inputs
          "Split evenly" button divides total by number of participants
          Validates that shares sum equals total before submitting

[x] 21. apps/app/app/splits/page.tsx — index across all active connections
          Loads all connections, fetches splits per connection in parallel
          Each row: other user avatar + name + active/settled count + amount you owe
          Links to /splits/[connectionId]

[x] 22. apps/app/app/splits/[connectionId]/page.tsx
          Header with back button + "New" button
          Sections: Active splits · Settled splits
          AddSplitModal wired, split cards with live item toggle
          Bill Splits shortcut button added to chat thread header (calculator icon)
```

---

#### Student Verification

```
[x] 20. Complete file upload in apps/app/app/onboarding/verify/page.tsx ✅
          JPG/PNG/WebP/PDF, max 5 MB, upload to private student-ids bucket
          Path: {userId}/{side}-{crypto.randomUUID()}.{ext}
          Set verification_status = 'PENDING'
          Upload slots show done/uploading/error states · skip option available
[x] 21. "Get verified" CTA on profile page — shows badge + status nudge ✅
          Unverified: "Get verified" CTA links to /onboarding/verify
          Pending: "Verification under review" with amber styling
          Verified: Hidden, badge displays on profile hero card
[~] 22. Wire verified-badge.json Lottie into ProfileCard — SVG checkmark ready, awaiting Phase 9 ⏳
          Currently displays as SVG badge with white checkmark on brand-500 circle
          Phase 9 task: replace SVG with <LottieIcon animationData={verifiedBadgeJson} />
```

**Connects to → Phase 7:** Payment webhook, agreement events, and verification events all produce `notifications` rows — Phase 7 sends these as push notifications.

**Connects to → Phase 8:** `verification_status = 'PENDING'` feeds the admin review queue. `roommate_agreements` table feeds the connections analytics view.

---

### Phase 7 — Push Notifications & Notification Center

**Prerequisites:** Phase 5 complete (PWA + service worker running). Phase 6 complete (notification triggers from bills and verification). `push_subscriptions` table exists from §7 schema.

**What this unlocks:** Background re-engagement when the app is closed. Completes the notification pipeline started in Phase 4.

```
[ ] 1.  Generate VAPID key pair via web-push CLI
          Set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT in .env.local + Vercel
[ ] 2.  Build apps/app/app/api/push/subscribe/route.ts
          POST: auth guard, rate limit 10/hour (§28.5), upsert into push_subscriptions
          DELETE: remove subscription record
[ ] 3.  Build apps/app/app/api/push/send/route.ts (internal — service role only, never public)
          Accepts { userId, title, body, data }
          Fetches subscriptions from DB, sends via web-push.sendNotification()
[ ] 4.  Wire push send into existing event handlers:
          Agreement proposed (Phase 6) → notify receiver: "[Name] wants to be your roommate partner"
          Paystack webhook — agreement confirmed (Phase 6) → notify both: "Housing unlocked! 🎉"
          Connection created (Phase 4) → notify receiver: "You have a new roommate connection!"
          Bill split mark-paid (Phase 6) → notify other user in the connection
          Verification approve/reject (Phase 8) → notify student
[ ] 5.  Build apps/app/src/components/pwa/PushToggle.tsx
          "Enable notifications" toggle in profile settings
          Requests browser permission → calls subscribe/unsubscribe route
[ ] 6.  Build apps/app/app/notifications/page.tsx
          Full notification history, mark all as read, grouped by date
          Real-time subscription on notifications table for new entries
[ ] 7.  Wire unread dot on AppSidebar Notifications nav item + BottomTabNav via NotificationContext (Phase 4)
```

**Connects to → Phase 8:** Admin approval/rejection of student IDs triggers a push via the send route wired in task 4.

---

### Phase 8 — Admin Dashboard

**Prerequisites:** Phase 6 complete (housing_platforms table populated, student ID uploads in Storage). Phase 7 complete (push send route available for verification notifications).

**What this unlocks:** Housing providers can register and appear in Phase 6's housing list. Student verifications can be reviewed. Roomie is fully operational end-to-end.

#### Provider Registration (Public)

```
[ ] 1.  Build apps/admin/app/register/page.tsx
          Public form: platform name, URL, cities/campus coverage, contact name/email/phone
          POST to /api/providers/register → status = 'PENDING_REVIEW'
[ ] 2.  Build apps/admin/app/api/providers/register/route.ts
          No auth required · Zod validation · Insert into housing_platforms
```

#### Provider Auth & Dashboard

```
[ ] 3.  Configure Supabase Auth for admin app — provider login (email/password or Google)
[ ] 4.  Build apps/admin/app/login/page.tsx
[ ] 5.  Build apps/admin/app/dashboard/layout.tsx — sidebar + header
[ ] 6.  Build apps/admin/app/dashboard/page.tsx
          Overview: total clicks, total referrals, active cities, last 30-day trend
[ ] 7.  Build apps/admin/app/dashboard/profile/page.tsx
          Edit platform details: name, URL, cities, campus_tags, logo — pre-filled from DB
[ ] 8.  Build apps/admin/app/dashboard/analytics/page.tsx
          Click timeline chart (daily) · Referral breakdown by city
```

#### Super Admin Panel (Roomie Internal)

```
[ ] 9.  Seed admin_users table with Roomie team super admin record
[ ] 10. Build apps/admin/app/super/page.tsx
          Provider approval queue (all PENDING_REVIEW entries)
          User list filtered by verification_status
[ ] 11. Build apps/admin/app/super/providers/[id]/page.tsx
          Provider detail view + Approve / Reject / Suspend buttons
          Approval sets status = 'ACTIVE' → provider now appears in student housing list (Phase 6)
[ ] 12. Build apps/admin/app/super/users/page.tsx
          Student list · Pending verifications highlighted
[ ] 13. Build student ID review UI inside user detail page
          Generate signed URL (5-minute expiry) from private Storage bucket (§28.6)
          Display front + back ID images · Approve / Reject buttons
          Approval: student_verified = true, verification_status = 'VERIFIED'
          Triggers push notification to student via Phase 7 push send route
[ ] 14. Build apps/admin/app/super/connections/page.tsx
          All connections with payment status, timestamps, user IDs
```

**Connects to → Phase 9:** The product is functionally complete. All three apps are running. Phase 9 makes it look and feel production-ready.

---

### Phase 9 — Marketing SPA, Animations & Brand Polish

**Prerequisites:** Phases 2–8 complete. Core product functionally verified. LottieFiles.com account ready for asset download.

**What this unlocks:** Public-facing marketing page that drives sign-ups. Full animation system across all apps. Brand identity fully realised.

#### Lottie Animations

```
[ ] 1.  Source all 10 Lottie JSON files from LottieFiles.com (free/LottieFiles Free License):
          connecting.json, payment-success.json, verified-badge.json, chat-typing.json,
          match-found.json, empty-feed.json, empty-chat.json, bill-settled.json,
          loading.json, offline.json
[ ] 2.  Drop into packages/animations/
[ ] 3.  Implement LottieIcon component in packages/ui/src/lottie-icon.tsx (§20)
[ ] 4.  Wire each Lottie into its designated location across apps/app:
          verified-badge.json  → ProfileCard (Phase 3)
          chat-typing.json     → TypingIndicator (Phase 5)
          empty-feed.json      → Discovery feed empty state (Phase 3)
          empty-chat.json      → Chat list empty state (Phase 5)
          payment-success.json → /connect/success page (Phase 4)
          connecting.json      → ConnectionModal (Phase 4)
          bill-settled.json    → Bill split system message (Phase 6)
          loading.json         → Global loading spinner
          offline.json         → Offline page (Phase 5)
          match-found.json     → Post-onboarding entry to /discover (Phase 2)
```

#### Framer Motion

```
[ ] 5.  Add page transition animations to apps/app/app/layout.tsx — fade/slide between routes
[ ] 6.  Animate profile cards entering the discovery feed (stagger children)
[ ] 7.  Animate onboarding step transitions — slide left/right based on direction
```

#### Marketing SPA (apps/web)

```
[ ] 8.  Build apps/web/app/page.tsx — full single-page marketing site, all 7 sections (§9):
          Hero        — animated tagline "Cooonnectttt" (Framer Motion letter stagger)
                        connecting.json Lottie illustration
                        CTA → app.roomie.ng · Secondary CTA → #for-providers
          How It Works — three scroll-triggered animated steps
          Why Roomie  — 2×3 feature grid
          Pricing     — ₦2,000 single fee callout (peach-200 #FAE8CC accent block)
          For Providers — id="for-providers", stats cards, "List your platform" → /admin/register
          App Preview — animated phone mockup (discover feed, chat, bill splitter screens)
          Footer      — logo, links, social
                        REQUIRED: "© 2026 Roomie · A GIGSRentals Product"
                        "GIGSRentals" links to https://gigsrentals.com
                        target="_blank" rel="noopener noreferrer"
[ ] 9.  Verify GIGSRentals attribution footer is present in apps/app layout and apps/admin layout
[ ] 10. Build apps/web/app/privacy/page.tsx and apps/web/app/terms/page.tsx
```

**Connects to → Phase 10:** Product is visually complete. Phase 10 secures, validates, and ships it.

---

### Phase 10 — Security Hardening, QA & Launch

**Prerequisites:** All previous phases complete. Paystack live keys obtained. Custom domains purchased (`roomie.ng`, `app.roomie.ng`, `admin.roomie.ng`). Privacy policy and ToS written.

**What this unlocks:** Production-ready, secure, publicly accessible Roomie.

#### Security (apply across all API routes)

```
[ ] 1.  Install zod — add Zod validation schemas to every POST/PATCH API route (§28.2)
          connectionId, receiverId, content length limits, file types
[ ] 2.  Confirm withAuth() guard applied to every authenticated route
[ ] 3.  Install @upstash/ratelimit + @upstash/redis
          Apply rate limits per §28.5 table:
            POST /api/connections        → 5 per hour per user
            POST /api/payments/initialize → 10 per hour
            GET discovery                → 200 per minute
            POST /api/push/subscribe     → 10 per hour
            POST /api/auth/callback      → 20 per 5 minutes
          Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel env
[ ] 4.  Add CSP + security headers to apps/app/next.config.ts (§28.7)
          Content-Security-Policy, X-Frame-Options: DENY, X-Content-Type-Options: nosniff,
          Referrer-Policy, Permissions-Policy, Strict-Transport-Security
[ ] 5.  Verify payments table has no client-writable INSERT/UPDATE RLS policy
          Payments written only by service role (webhook handler)
[ ] 6.  Verify SUPABASE_SERVICE_ROLE_KEY is absent from all NEXT_PUBLIC_ variables
[ ] 7.  Write and apply supabase/migrations/0003_blocks.sql — blocks table (§28.9)
          NOTE: 0001 = core schema, 0002 = feed tables (already applied). Next is 0003.
          Update getDiscoveryFeed() to exclude users blocked by or blocking the current user
```

#### QA & Audits

```
[ ] 8.  Run Lighthouse audit on apps/app — target: PWA 100, Performance 90+, Accessibility 90+
[ ] 9.  End-to-end test path 1 (student core loop):
          Google Sign In → complete onboarding (5 steps) → browse Feed → write a post
          → browse Discover → tap Connect (FREE) → chat unlocked → send message
          → tap Find Housing → pay ₦2,000 via Paystack test card → see housing providers
          → create bill split with connected roommate
[ ] 10. End-to-end test path 2 (provider loop):
          Fill registration form → super admin approves in admin panel
          → provider appears in student housing list → click tracked
          → analytics updated in provider dashboard
[ ] 11. End-to-end test path 3 (verification loop):
          Student uploads student ID → super admin reviews signed URL
          → approves → student receives push notification
          → verified badge appears on profile card in discovery feed
[ ] 12. Test offline behaviour:
          Discovery feed shows cached profiles · Chat queues messages
          Payment page shows "Payment requires internet" (NetworkOnly)
```

#### Launch

```
[ ] 13. Add output: "standalone" to all three next.config.ts files for Docker compatibility (§27.3)
[ ] 14. Set up custom domains in Vercel:
          roomie.ng        → apps/web
          app.roomie.ng    → apps/app
          admin.roomie.ng  → apps/admin
[ ] 15. Swap Paystack test keys for live keys (pk_live_, sk_live_) in Vercel production env
[ ] 16. Switch all Supabase env vars from local to cloud project values in Vercel production env
[ ] 17. Soft launch — share app.roomie.ng in 3–5 university WhatsApp groups (closed beta)
```

---

### Phase Dependency Chain

```
Phase 1 ✅ (Infrastructure & Scaffold)
    └─► Phase 2 ✅ (Database + Auth + Onboarding)
            └─► Phase 3 ✅ (Discovery Feed — X-Style Layout, Mock Data)
                    ├─► Phase 3B [ ] (Wire Live Supabase Query — after auth confirmed E2E)
                    ├─► Phase 3C ✅ (Social Feed — posts, likes, comments, /feed as root)
                    └─► Phase 4 ✅ (Free Connection Flow — API, connect page, NotificationContext)
                            └─► Phase 5 ✅ (Real-Time Chat + Full PWA — SW, manifest, InstallPrompt)
                                    └─► Phase 6 [~] (Agreement ✅ + Housing ✅ + Bills ✅ + Verification [ ])
                                            │   migration 0003 ✅: roommate_agreements table
                                            │   migration 0005 ✅: message notifications trigger
                                            │   ₦2,000 paid inside chat — agreement flow LIVE
                                            │   /housing unlocked post-agreement — LIVE
                                            │   Bill splitting (API + pages + components) — LIVE
                                            │   Student verification admin review: PENDING
                                            │       └─► Phase 8 [ ] (Admin Dashboard)
                                            │
                                            └─► Phase 7 [ ] (Push Notifications — VAPID + subscribe/send routes)
                                                    └──────────────────────────────────────►
                                                                        Phase 9 [ ] (Marketing SPA + Lottie)
                                                                                └─► Phase 10 [ ] (Security + Launch)
```

**Revenue moment in the chain:**
> The ₦2,000 charge happens inside **Phase 6**, inside the **chat thread**. This is **LIVE**.
>
> Full path to revenue (all steps implemented):
> Sign up (P2) → discover profiles (P3) → connect free (P4) → chat (P5) → tap "Propose Agreement" in chat → agreement_request card appears → **acceptor taps "Accept & Pay ₦2,000"** → Paystack popup opens → charge.success webhook → agreement CONFIRMED → agreement_confirmed message in chat → `/housing` unlocked for both.
>
> The payment is never a UI gate — it's a commitment ceremony. Users pay because they've already decided, not because they hit a wall.

> **Current state (2026-06-02):** Phases 1–6 are largely complete. Service worker (Serwist), PWA install prompt, and bill splitting all shipped in the latest batch. Remaining work: student verification admin review, VAPID push notifications, admin dashboard, marketing SPA, Phase 3B live Supabase query, and security hardening.

---

## 26. GoFinder Code References — What to Reuse

Roomie is a separate project but it is born from GoFinder. The GoFinder dashboard (`C:\Users\admin\Desktop\GoFinder\apps\dashboard`) already contains working implementations of several features Roomie needs. Rather than rebuilding from scratch, each item below is a direct reference to port, adapt, or copy.

The word **adapt** means: copy the file, change the data source (localStorage/mock JSON → Supabase), keep the UI and logic intact. The word **port** means: restructure to fit Roomie's architecture but model the logic closely.

---

### 26.1 UI Components to Copy Directly

These components are pure UI — no GoFinder-specific data dependencies. Copy them into `packages/ui/src/` and remove any GoFinder-specific styling tokens if the Roomie design diverges.

| GoFinder file | Copy to Roomie | Notes |
|---|---|---|
| `src/components/mobile/BottomTabNav.tsx` | `packages/ui/src/bottom-tab-nav.tsx` | Already handles keyboard visibility detection, badge counts, active state. Zero changes needed. |
| `src/components/auth/AuthInput.tsx` | `packages/ui/src/auth-input.tsx` | Reuse as-is for onboarding form fields |
| `src/components/auth/AuthLayout.tsx` | `packages/ui/src/auth-layout.tsx` | The centered card layout used on all auth pages |
| `src/components/auth/OAuthButtons.tsx` | `apps/app/src/components/auth/GoogleSignInButton.tsx` | Adapt: keep Google button, remove email/password option |
| `src/components/layout/Header.tsx` | `apps/app/src/components/layout/AppHeader.tsx` | Adapt: simplify — remove GoFinder-specific nav tabs, keep logo + avatar + notification bell |
| `src/components/user/ProfileEditModal.tsx` | Reference for `apps/app/app/profile/edit/page.tsx` | Port the form field structure — budget, bio, preferences all map to Roomie's `profiles` table columns |
| `src/components/user/InterestsModal.tsx` | Reference for `apps/app/src/components/onboarding/LifestyleTagPicker.tsx` | The multi-select chip UI is exactly what Step 3 (Vibe) needs |
| `src/hooks/useAutoHideOnScroll.ts` | `apps/app/src/hooks/useAutoHideOnScroll.ts` | Copy verbatim — used by BottomTabNav |

---

### 26.2 Roommate Logic to Port

These are the core features GoFinder started building that Roomie completes properly.

**Roommate Group (Invite Link) logic:**

GoFinder source: `app/api/roommates/route.ts` + `app/api/roommates/[id]/route.ts`

The entire group create/join/close API is well-structured. Port the action-based PATCH pattern into Roomie's Supabase mutations:

```typescript
// GoFinder pattern (file-based):
if (action === "join") { ... }
if (action === "close") { ... }

// Roomie equivalent (Supabase):
// packages/db/src/queries/connections.ts
export async function joinConnection(supabase, connectionId, userId) { ... }
export async function declineConnection(supabase, connectionId, userId) { ... }
```

**Join page UI:**

GoFinder source: `app/roommates/join/[id]/page.tsx`

The `JoinRoommatesPage` component already has the right layout: left card (group details + join button) + right card (listing photo + "shared by"). In Roomie this becomes the "Connection Request" page (`app/connect/[id]/page.tsx`). Port the two-column layout and the `isMember` / status-gate button logic.

**Compatibility/Preferences display:**

GoFinder source: `app/roommates/page.tsx` — the `RoommatePost` card with bio, preferences chips, budget display.

Port the card layout directly into Roomie's `ProfileCard.tsx`. The preference chip rendering (`p.preferences.slice(0, 3).map(...)`) becomes Roomie's `lifestyle_tags.slice(0, 3).map(...)`.

**Bill Splitting page:**

GoFinder source: `app/listings/[id]/split-bills/page.tsx`

This page already implements the bill split concept. Port it into `apps/app/app/splits/[connectionId]/page.tsx`, replacing the GoFinder listing context with Roomie's `connection_id`.

---

### 26.3 Auth Context Pattern to Adapt

GoFinder source: `src/context/AuthContext.tsx`

GoFinder's `AuthContext` handles: user state, localStorage persistence, cookie sync, login/signup/logout/switchRole. Roomie replaces ALL of this with Supabase Auth, but the **context shape and provider pattern** should be modeled the same way.

```typescript
// GoFinder pattern — keep this shape:
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

// Roomie AuthContext — same shape, different implementation:
// - user comes from supabase.auth.getUser()
// - isLoading from supabase.auth.onAuthStateChange()
// - logout calls supabase.auth.signOut()
// - no login/signup methods (Google OAuth handles this)
```

The `useMemo` on the context value (GoFinder line 284) is important — keep it in Roomie's context to prevent unnecessary re-renders.

---

### 26.4 PWA Setup to Copy Verbatim

GoFinder already has a fully designed PWA plan (`apps/dashboard/PWA_PLAN.md`). Roomie's PWA implementation follows the **exact same approach** documented there. Do not redesign:

- `next.config.ts` → `withSerwist()` wrapper: copy exactly
- `src/sw.ts` → Service worker file: copy and adjust cache names (`roomie-static` instead of `next-static`) and routes
- `src/components/pwa/ServiceWorkerRegister.tsx` → copy verbatim, zero changes needed
- `src/hooks/useInstallPrompt.ts` → copy verbatim
- `src/components/pwa/InstallPrompt.tsx` → copy, update branding (app name, icon)

The only PWA difference: Roomie's manifest `start_url` is `/feed` (the social feed is the default landing route).

---

### 26.5 Message Context Pattern to Adapt

GoFinder source: `src/context/MessageContext.tsx`

GoFinder's `MessageContext` manages unread count and conversation state. Port the unread count logic into Roomie's `NotificationContext.tsx`. In Roomie this is backed by a Supabase real-time subscription on the `notifications` table rather than in-memory state.

---

### 26.6 Design Tokens to Carry Over

GoFinder and Roomie share the same brand green. The entire Tailwind config can be copied:

```typescript
// GoFinder's brand color is already correct for Roomie
// packages/config/tailwind.config.ts
theme: {
  extend: {
    colors: {
      // Primary brand scale — Sage Green
      brand: {
        50:  "#f4f7ef",
        100: "#e6eeda",
        200: "#ccddb5",
        300: "#b4cc90",
        400: "#9bbb6b",
        500: "#8AAF6E",   // Sage Green — primary
        600: "#72964d",
        700: "#5a7a3a",
        800: "#445e2d",
        900: "#2f4220",
      },
      // Accent scale — Soft Peach (CTA, connection moments, warmth)
      peach: {
        50:  "#fef9f4",
        100: "#fdf3e8",
        200: "#FAE8CC",   // Soft Peach — primary accent / CTA
        300: "#f5d4a6",
        400: "#eeba76",
        500: "#e49e45",
        600: "#c47e28",
        700: "#9d621e",
        800: "#764a17",
        900: "#503210",
      },
      // Sage neutrals — surfaces and secondary elements
      sage: {
        light:   "#B8CE9E",   // Light Sage — hover states, secondary chips, progress fills
        surface: "#EDE8C8",   // Pale Yellow-Green — card backgrounds, page surfaces
      },
    },
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      display: ["Clash Display", "sans-serif"],
    }
  }
}
```

---

### 26.7 What NOT to Copy

These parts of GoFinder are GoFinder-specific and should not be ported to Roomie:

| GoFinder piece | Why not to port |
|---|---|
| `src/data/*.json` (mock data) | Roomie uses Supabase — no mock JSON files |
| `app/api/listings/` routes | Roomie has no concept of listings |
| `src/components/listings/MapComponent.tsx` | Not needed in Roomie Phase 1–3 |
| `app/hosting/` routes | No landlord/hosting side in Roomie |
| `app/becoming-a-host/` | No host flow in Roomie |
| `src/context/AuthContext.tsx` (the implementation) | Completely replaced by Supabase Auth |
| `app/admin/` routes from GoFinder | Roomie's admin is a separate app (`apps/admin`) |

---

## 27. Containerization & Local Development

### Local Docker & Supabase CLI Stack Architecture

```mermaid
graph TD
    subgraph DevMachine["Developer Local Machine"]
        SupabaseCLI["Supabase CLI"]
        DockerEngine["Docker Engine"]
    end

    subgraph SupabaseDockerContainers["Supabase Local Stack (Port 54321)"]
        Postgres["supabase-db (PostgreSQL 15)"]
        AuthContainer["supabase-auth (GoTrue)"]
        StorageContainer["supabase-storage (S3 API)"]
        RealtimeContainer["supabase-realtime (Elixir)"]
        StudioContainer["supabase-studio (Port 54323)"]
        Inbucket["inbucket (Email Capture 54324)"]
    end

    subgraph AppContainer["Next.js Application Container"]
        NextApp["roomie-app:latest (Port 3000)"]
    end

    SupabaseCLI --> DockerEngine
    DockerEngine --> SupabaseDockerContainers
    DockerEngine --> AppContainer
    NextApp --> Postgres
    NextApp --> AuthContainer
    NextApp --> StorageContainer
```

Roomie is deployed on Vercel (Next.js apps) and Supabase Cloud (database). Neither of these requires Docker in production. However, Docker is critical for:

1. **Local Supabase** — running a full Supabase stack locally (PostgreSQL + Auth + Storage + Realtime + Edge Functions) without depending on the cloud during development
2. **Consistent dev environments** — any developer cloning the repo gets an identical database and services without manual setup
3. **CI/CD pipeline** — running tests against a real database in GitHub Actions / any CI environment
4. **Future self-hosting** — if Roomie ever moves off Supabase Cloud to a self-managed stack

---

### 27.1 Supabase Local Development

Supabase provides a local development CLI that runs the entire Supabase stack in Docker containers automatically. This is the primary containerization requirement for Roomie.

**Install:**

```bash
# Install Supabase CLI (Windows — via scoop or npm)
npm install -g supabase

# Or via PowerShell with scoop:
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Initialize in the Roomie repo root:**

```bash
# This creates supabase/ directory with config.toml
supabase init

# Link to your Supabase Cloud project (for migration sync)
supabase link --project-ref <your-project-ref>
```

**Start the local stack:**

```bash
supabase start
```

This pulls and starts these Docker containers automatically:
- `supabase/postgres` — PostgreSQL 15
- `supabase/gotrue` — Auth server
- `supabase/realtime` — WebSocket/Realtime server
- `supabase/storage-api` — Storage server
- `supabase/kong` — API gateway (exposes everything on port 54321)
- `supabase/studio` — Local dashboard at `http://localhost:54323`

Output after `supabase start`:

```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Inbucket URL: http://localhost:54324    ← catches all sent emails locally
anon key: eyJxxxx
service_role key: eyJxxxx
```

Use these local values in `.env.local` during development:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx    # from supabase start output
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx        # from supabase start output
```

**Run migrations against local DB:**

```bash
# Apply all migrations in supabase/migrations/
supabase db reset   # drops and recreates from scratch (dev only)

# Or push just new migrations:
supabase db push
```

**Seed development data:**

```bash
# supabase/seed.sql is applied automatically on supabase db reset
# It inserts: 20 sample profiles, 5 housing platforms, sample connections
```

**Stop:**

```bash
supabase stop       # stops containers but keeps volume data
supabase stop --no-backup   # stops and wipes data
```

---

### 27.2 Docker Compose for Full Local Stack

For developers who want all three Next.js apps + Supabase running together with one command, a `docker-compose.yml` at the repo root covers everything.

**File: `Roomie/docker-compose.yml`**

```yaml
version: "3.9"

services:
  # ─── Supabase stack (via official Supabase Docker Compose) ─────────────────
  # Supabase provides their own docker-compose.yml for self-hosting.
  # For local dev, prefer `supabase start` CLI. This service section
  # is for CI environments and self-hosted production.

  db:
    image: supabase/postgres:15.6.1.143
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: postgres
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./supabase/migrations:/docker-entrypoint-initdb.d:ro
    ports:
      - "54322:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── Main App (apps/app) ────────────────────────────────────────────────────
  app:
    build:
      context: .
      dockerfile: apps/app/Dockerfile
      args:
        NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
        NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: ${NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      PAYSTACK_SECRET_KEY: ${PAYSTACK_SECRET_KEY}
      VAPID_PRIVATE_KEY: ${VAPID_PRIVATE_KEY}
      VAPID_SUBJECT: ${VAPID_SUBJECT}
    depends_on:
      db:
        condition: service_healthy

  # ─── Admin App (apps/admin) ─────────────────────────────────────────────────
  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
      args:
        NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      NODE_ENV: production
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
    depends_on:
      db:
        condition: service_healthy

  # ─── Marketing Web (apps/web) ───────────────────────────────────────────────
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    restart: unless-stopped
    ports:
      - "3002:3000"

volumes:
  db-data:
```

---

### 27.3 Dockerfile for Each Next.js App

All three apps share the same Dockerfile pattern. Use Next.js's recommended multi-stage build.

**File: `apps/app/Dockerfile`**

```dockerfile
# ── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/app/package.json ./apps/app/
COPY packages/ui/package.json ./packages/ui/
COPY packages/db/package.json ./packages/db/
COPY packages/config/package.json ./packages/config/
RUN npm ci --workspace=apps/app --include-workspace-root

# ── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy installed modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/app/node_modules ./apps/app/node_modules

# Copy source
COPY . .

# Build args become NEXT_PUBLIC_ env vars at build time
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=$NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY

RUN npm run build --workspace=apps/app

# ── Stage 3: Production runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only what's needed to run
COPY --from=builder /app/apps/app/public ./apps/app/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/app/.next/static ./apps/app/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/app/server.js"]
```

> **Note:** The standalone output requires `output: "standalone"` in `apps/app/next.config.ts`. Add this before building Docker images.

```typescript
// apps/app/next.config.ts
const nextConfig: NextConfig = {
  output: "standalone",   // add this
  // ...rest of config
};
```

---

### 27.4 `.dockerignore`

**File: `Roomie/.dockerignore`**

```
node_modules
.next
.git
*.md
supabase/.branches
supabase/.temp
**/.env*
!**/.env.example
```

---

### 27.5 CI/CD with Docker (GitHub Actions)

**File: `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      supabase-db:
        image: supabase/postgres:15.6.1.143
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Supabase CLI
        run: npm install -g supabase

      - name: Apply migrations
        run: supabase db push --db-url postgresql://postgres:postgres@localhost:5432/postgres

      - name: Type check
        run: npm run check-types

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_TEST }}

  docker-build:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Build app Docker image
        run: docker build -f apps/app/Dockerfile -t roomie-app:latest .
      - name: Build admin Docker image
        run: docker build -f apps/admin/Dockerfile -t roomie-admin:latest .
```

---

### 27.6 Environment File Strategy

| File | Committed? | Purpose |
|---|---|---|
| `.env.example` | Yes | Template with all keys, no values |
| `.env.local` | No (gitignore) | Local dev values |
| `.env.test` | No (gitignore) | Test environment (local Supabase) |
| `.env.production` | No (gitignore) | Production values — set in Vercel/Railway dashboard |

**File: `.env.example`** (committed to repo)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=

# PWA Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=

# App URLs
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_ADMIN_URL=
NEXT_PUBLIC_CONNECTION_FEE=200000
```

---

## 28. Security Architecture

### Security Boundary & Multi-Layer Controls Architecture

```mermaid
graph TD
    subgraph UntrustedZone["Public Web / Browser Client"]
        PWA["Roomie PWA Client"]
    end

    subgraph SecurityBoundary["Security & Middleware Boundary"]
        PKCE["PKCE OAuth Validator"]
        CookieMiddleware["Next.js Server Session Middleware (HttpOnly Cookies)"]
        HMAC["HMAC-SHA512 Webhook Signature Inspector"]
        CSP["Content Security Policy & CORS Headers"]
    end

    subgraph DBBoundary["Database Security Layer"]
        RLS["PostgreSQL Row-Level Security Policies"]
        NINHash["SHA-256 NIN Hash Storage (No Plaintext)"]
        PrivateBuckets["Private Storage Signed URLs (5-min Expiration)"]
    end

    PWA --> CSP
    CSP --> PKCE
    CSP --> CookieMiddleware
    CookieMiddleware --> RLS
    RLS --> NINHash
    RLS --> PrivateBuckets
    PWA --> HMAC
```

Security is non-negotiable for Roomie. The platform handles:
- PII (names, ages, university details, phone numbers)
- Sensitive documents (student ID photos)
- Financial transactions (Paystack payments)
- Private communications (chat messages)

Each of these demands a specific security control. This section covers every layer.

---

### 28.1 Authentication Security (Supabase Auth + Google OAuth)

**PKCE Flow (mandatory for SPAs):**

Supabase Auth uses the PKCE (Proof Key for Code Exchange) flow for Google OAuth by default in the browser client. Never use the implicit flow for a public client. Verify this in `packages/db/src/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "pkce",        // explicit PKCE — do not leave to default
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
}
```

**Session cookies (server-side):**

For server components and API routes, use `@supabase/ssr` with the cookie-based session pattern. JWTs must never be stored in `localStorage` — Supabase SSR handles this correctly via HttpOnly cookies.

```typescript
// packages/db/src/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { cookieStore.set({ name, value, ...options }); },
        remove(name, options) { cookieStore.set({ name, value: "", ...options }); },
      },
    }
  );
}
```

**Session cookie flags** (Supabase SSR sets these automatically):
- `HttpOnly` — JavaScript cannot read the session token
- `Secure` — only sent over HTTPS
- `SameSite=Lax` — CSRF protection
- `Path=/` — scoped to the entire app

**JWT expiry:** Supabase JWTs expire after 1 hour. The client auto-refreshes via the `autoRefreshToken: true` setting. On the server, always call `supabase.auth.getUser()` (validates against Supabase Auth server) rather than `supabase.auth.getSession()` (trusts the local cookie — vulnerable to JWT forgery).

```typescript
// CORRECT — verifies JWT with Supabase Auth server:
const { data: { user } } = await supabase.auth.getUser();

// WRONG — trusts cookie JWT without server verification:
const { data: { session } } = await supabase.auth.getSession();
```

---

### 28.2 API Route Security

**Every API route that mutates data must:**
1. Verify the caller is authenticated
2. Verify the caller is authorized for that specific resource
3. Validate inputs with Zod schemas before touching the database

**Auth guard middleware pattern:**

```typescript
// apps/app/src/lib/auth-guard.ts

import { createClient } from "@repo/db/server";
import { NextRequest, NextResponse } from "next/server";

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return handler(req, user.id);
}
```

**Input validation with Zod:**

```typescript
// Every POST/PATCH route validates its body before any DB operation
import { z } from "zod";

const InitiateConnectionSchema = z.object({
  receiverId: z.string().uuid("Must be a valid user ID"),
});

export async function POST(req: NextRequest) {
  return withAuth(req, async (req, requesterId) => {
    const body = await req.json();
    const parsed = InitiateConnectionSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { receiverId } = parsed.data;
    
    // Prevent self-connection (also enforced by DB constraint but defense in depth)
    if (receiverId === requesterId) {
      return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
    }
    
    // ... proceed with DB operation
  });
}
```

---

### 28.3 Row-Level Security (RLS) — Defense in Depth

RLS is the last line of defense. Even if an API route has a bug and passes the wrong `user_id`, PostgreSQL's RLS policies will prevent unauthorized data access.

Every table has RLS enabled (see Section 7). The critical policies to verify:

**Messages — only connection members, only ACTIVE connections:**
```sql
CREATE POLICY "messages_connection_members" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = messages.connection_id
        AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
        AND c.status = 'ACTIVE'   -- chat is LOCKED until payment confirmed
    )
  );
```

**Payments — read own only, never write from client:**
```sql
CREATE POLICY "payments_read_own" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- No INSERT/UPDATE policy for anon/authenticated role.
-- Payments are ONLY written by the service_role (webhook handler).
-- This prevents any client from fabricating a successful payment.
```

**Student IDs — never readable by other users:**
```sql
-- student_id_front_url and student_id_back_url columns are in profiles
-- but the actual files are in a PRIVATE Supabase Storage bucket.
-- Only the service_role key (used by admin API routes) can generate signed URLs.

-- Supabase Storage policy for student-ids bucket:
-- bucket: student-ids, policy: NONE for authenticated role
-- Access ONLY via service_role signed URL in admin routes
```

---

### 28.4 Payment Security

**Paystack webhook signature verification** (already covered in Section 14 but restated as a security requirement):

```typescript
// This MUST run before any payment state is mutated.
const hash = crypto
  .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
  .update(rawBody)          // raw body — NOT parsed JSON
  .digest("hex");

if (hash !== req.headers.get("x-paystack-signature")) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

**Idempotency — prevent double-processing:**

The `payments` table has `UNIQUE (reference)`. If Paystack sends the same webhook twice (it retries on non-200 responses), the second `INSERT` will fail silently:

```typescript
const { error } = await supabase
  .from("payments")
  .upsert(
    { reference, status: "SUCCESS", ... },
    { onConflict: "reference", ignoreDuplicates: true }
  );
// If reference already exists and is already SUCCESS, this is a no-op.
```

**Amount validation — never trust the client:**

The connection fee (₦2,000) must be verified server-side. When initializing a Paystack transaction, the amount comes from the server's environment variable (`NEXT_PUBLIC_CONNECTION_FEE`), never from the client request body:

```typescript
// apps/app/app/api/payments/initialize/route.ts
export async function POST(req: NextRequest) {
  return withAuth(req, async (req, userId) => {
    const body = await req.json();
    const { connectionId } = InitializePaymentSchema.parse(body);
    
    // Amount is ALWAYS from server config — client cannot influence it
    const amount = Number(process.env.CONNECTION_FEE_KOBO ?? 200000);
    
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,    // from server env — not from req.body
        email: user.email,
        metadata: { connection_id: connectionId, user_id: userId },
        channels: ["card", "bank", "ussd", "bank_transfer", "mobile_money"],
      }),
    });
    // ...
  });
}
```

---

### 28.5 Rate Limiting

Without rate limiting, Roomie is vulnerable to:
- Spam connection requests draining Paystack initialization quota
- Brute-force profile scraping
- Flooding the chat system

**Implementation: Upstash Redis + `@upstash/ratelimit`**

Upstash provides a serverless Redis compatible with Vercel Edge. Add it to critical API routes:

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// apps/app/src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different limits for different actions
export const connectionRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1h"),     // 5 connection requests per hour per user
  prefix: "rl:connection",
});

export const paymentInitRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1h"),    // 10 payment initializations per hour
  prefix: "rl:payment",
});

export const discoverRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, "1m"),   // 200 profile fetches per minute (PWA caching covers most)
  prefix: "rl:discover",
});
```

```typescript
// Usage in API route:
const { success, remaining } = await connectionRateLimit.limit(userId);
if (!success) {
  return NextResponse.json(
    { error: "Too many connection requests. Please wait before trying again." },
    { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
  );
}
```

**Rate limit table:**

| Route | Limit | Window | Why |
|---|---|---|---|
| `POST /api/connections` | 5 | 1 hour | Prevent connection spam |
| `POST /api/payments/initialize` | 10 | 1 hour | Prevent Paystack quota abuse |
| `GET /api/discover` | 200 | 1 minute | Prevent scraping |
| `POST /api/push/subscribe` | 10 | 1 hour | Prevent push spam |
| `POST /api/auth/callback` | 20 | 5 minutes | Prevent OAuth abuse |

---

### 28.6 File Upload Security (Student ID)

Student ID uploads go directly to Supabase Storage. The following controls apply:

**File type validation (client-side, then server-side):**

```typescript
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;  // 5 MB

function validateStudentIdFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPG, PNG, WebP, or PDF files are accepted.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "File must be under 5 MB.";
  }
  return null;   // null = valid
}
```

**Randomized storage path (prevent enumeration):**

Student IDs are stored at a path that cannot be guessed:

```typescript
// Path: student-ids/{userId}/{crypto.randomUUID()}.{ext}
// NOT: student-ids/{userId}/front.jpg   ← guessable

const path = `${userId}/${crypto.randomUUID()}.${ext}`;
const { data, error } = await supabase.storage
  .from("student-ids")        // private bucket — no public access
  .upload(path, file, { upsert: false });
```

**Admin signed URL (5-minute expiry):**

```typescript
// apps/admin/app/api/verifications/[userId]/route.ts
// Only super admin can call this route

const { data: signedUrl } = await supabase.storage
  .from("student-ids")
  .createSignedUrl(storedPath, 300);  // 300 seconds = 5 minutes
```

---

### 28.7 Content Security Policy (CSP)

Add CSP headers to prevent XSS attacks. Configure in `next.config.ts`:

```typescript
// apps/app/next.config.ts

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.paystack.co;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com https://api.fontshare.com;
  img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co;
  frame-src https://js.paystack.co;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\n/g, " ").trim();

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};
```

---

### 28.8 Chat Message Sanitization

Chat messages are stored as plain text in PostgreSQL. They are rendered with React's default string rendering (no `dangerouslySetInnerHTML`), so XSS from message content is not a risk in the React layer.

However, validate message length on the server before insert to prevent database abuse:

```typescript
const SendMessageSchema = z.object({
  connectionId: z.string().uuid(),
  content: z.string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message too long"),   // 2000 char limit
});
```

If Roomie ever adds markdown rendering to messages, use a sanitizer like `DOMPurify` before rendering.

---

### 28.9 Abuse Prevention

**Prevent duplicate connections:**

The `connections` table has a `UNIQUE` constraint on the normalized pair `(LEAST(a,b), GREATEST(a,b))`. This enforces at the database level that two users can only have one connection record, regardless of who initiates.

**Profile visibility for unverified users:**

During the first 24 hours after sign-up, new profiles are shown in the feed but they display a "Profile being reviewed" indicator. This doesn't block functionality but it sets a trust signal.

**Block / report system (Phase 3+):**

```sql
CREATE TABLE public.blocks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id    UUID NOT NULL REFERENCES public.profiles(id),
  blocked_id    UUID NOT NULL REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (blocker_id, blocked_id)
);
```

The discovery feed query excludes users who have been blocked by or have blocked the current user.

---

### 28.10 Secrets Management Summary

| Secret | Where stored | Who can read it |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env (server-only) | API routes and webhook handlers only — never in browser bundle |
| `PAYSTACK_SECRET_KEY` | Vercel env (server-only) | Webhook handler + payment initializer only |
| `VAPID_PRIVATE_KEY` | Vercel env (server-only) | Push send route only |
| `NEXT_PUBLIC_*` keys | Vercel env (public) | Safe for browser — anon key, public Paystack key, VAPID public key |
| Database passwords | Supabase managed | Never accessed directly — always via Supabase client |
| Student ID files | Supabase Storage (private bucket) | Service role only — time-limited signed URLs for admin review |

**Hard rules:**
- `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS — it must NEVER appear in `NEXT_PUBLIC_` variables or client-side code
- `PAYSTACK_SECRET_KEY` must NEVER be sent in a response or logged
- Webhook endpoints must verify their respective signatures before trusting any payload

---

## Summary

Roomie is a focused, monetizable SaaS product. Every design decision is made around one core interaction: two students finding each other, paying ₦2,000, and getting connected.

The stack (Supabase + Next.js 16 + Paystack + Serwist) is lean, fully TypeScript, and scales from 0 to 100,000 users on free/starter tiers. The PWA means no App Store friction — students install it directly from the browser.

The business model is transparent and simple. The admin dashboard creates a B2B revenue line with housing providers. The compatibility score and student verification build trust.

The GoFinder codebase is a direct reference — BottomTabNav, AuthLayout, roommate group logic, bill splitting, and the entire PWA setup are all ported rather than rebuilt from scratch. Containerization via Supabase CLI Docker keeps local development reproducible and CI-ready. The security architecture (RLS, PKCE, server-only secrets, webhook signature verification, rate limiting, CSP, file validation) ensures the platform is production-safe from the first deploy.

**Start with Phase 1. Ship the onboarding. Then the feed. Then the payment. Each phase is independently shippable.**
