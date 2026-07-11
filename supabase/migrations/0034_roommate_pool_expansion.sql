-- ─── Migration 0034: Roommate Pool Expansion ────────────────────────────────────
-- Support adding multiple roommates into a single pool sharing one roomie_id.

-- 1. Extend roommate_agreements status check constraint
ALTER TABLE public.roommate_agreements DROP CONSTRAINT IF EXISTS roommate_agreements_status_check;
ALTER TABLE public.roommate_agreements ADD CONSTRAINT roommate_agreements_status_check CHECK (status IN ('PENDING_APPROVAL', 'PENDING', 'CONFIRMED', 'DECLINED'));

-- 2. Add pool_roomie_id and pool_approvals columns
ALTER TABLE public.roommate_agreements ADD COLUMN IF NOT EXISTS pool_roomie_id TEXT;
ALTER TABLE public.roommate_agreements ADD COLUMN IF NOT EXISTS pool_approvals JSONB DEFAULT '{}'::jsonb;

-- 3. Update set_roomie_id_on_confirm trigger function to copy pool_roomie_id
CREATE OR REPLACE FUNCTION public.set_roomie_id_on_confirm()
RETURNS TRIGGER AS $$
DECLARE
  v_roomie_id TEXT;
  v_exists BOOLEAN;
BEGIN
  IF NEW.status = 'CONFIRMED' AND NEW.roomie_id IS NULL THEN
    IF NEW.pool_roomie_id IS NOT NULL THEN
      NEW.roomie_id := NEW.pool_roomie_id;
    ELSE
      LOOP
        v_roomie_id := 'RM-' || UPPER(substring(gen_random_uuid()::text from 1 for 8));
        SELECT EXISTS (SELECT 1 FROM public.roommate_agreements WHERE roomie_id = v_roomie_id) INTO v_exists;
        EXIT WHEN NOT v_exists;
      END LOOP;
      NEW.roomie_id := v_roomie_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Extend message_type enum
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'pool_add_request';
