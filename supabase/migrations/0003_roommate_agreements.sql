-- ─── Migration 0003: Roommate Agreements ────────────────────────────────────
-- Implements the in-chat consent/agreement flow.
-- ₦2,000 is paid by the acceptor at the moment they confirm the agreement.
-- On payment confirmed → agreement.status = 'CONFIRMED' → /housing unlocked for both.

-- ─── Extend message_type enum ────────────────────────────────────────────────
-- These values drive special card rendering inside MessageBubble.tsx

ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'agreement_request';   -- proposal card shown to receiver
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'agreement_confirmed'; -- celebration card after payment
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'agreement_declined';  -- muted pill on decline/cancel

-- ─── Roommate Agreements table ───────────────────────────────────────────────

CREATE TABLE public.roommate_agreements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Exactly one agreement per connection (enforced by UNIQUE)
  connection_id     UUID NOT NULL UNIQUE REFERENCES public.connections(id) ON DELETE CASCADE,

  -- Parties
  initiator_id      UUID NOT NULL REFERENCES public.profiles(id),
  acceptor_id       UUID REFERENCES public.profiles(id),  -- set at acceptance time

  -- Lifecycle: PENDING → CONFIRMED or DECLINED
  -- A DECLINED agreement can be replaced by a new PENDING one from either party.
  status            TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'CONFIRMED', 'DECLINED')),

  -- Payment (filled in by the Paystack webhook after charge.success)
  payment_reference TEXT UNIQUE,
  payment_channel   TEXT,
  amount            INTEGER DEFAULT 200000,  -- 200000 kobo = ₦2,000

  -- Timestamps
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  accepted_at       TIMESTAMPTZ,   -- when status became CONFIRMED
  paid_at           TIMESTAMPTZ,

  -- Safety: initiator cannot be the acceptor
  CONSTRAINT initiator_not_acceptor CHECK (initiator_id <> acceptor_id)
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.roommate_agreements ENABLE ROW LEVEL SECURITY;

-- Both parties in the underlying connection can read and modify the agreement.
-- Server-side API routes use the service role and bypass RLS for writes.
CREATE POLICY "agreements_connection_members" ON public.roommate_agreements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = roommate_agreements.connection_id
        AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
    )
  );

-- ─── Index ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_agreements_connection ON public.roommate_agreements(connection_id);
CREATE INDEX idx_agreements_status ON public.roommate_agreements(status);
