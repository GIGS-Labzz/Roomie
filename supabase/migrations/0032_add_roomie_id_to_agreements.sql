-- ─── Migration 0032: Add Roomie ID to roommate_agreements ────────────────────────────────────

-- 1. Add column roomie_id
ALTER TABLE public.roommate_agreements ADD COLUMN IF NOT EXISTS roomie_id TEXT UNIQUE;

-- 2. Create function to auto-generate unique Roomie ID on confirmation
CREATE OR REPLACE FUNCTION public.set_roomie_id_on_confirm()
RETURNS TRIGGER AS $$
DECLARE
  v_roomie_id TEXT;
  v_exists BOOLEAN;
BEGIN
  IF NEW.status = 'CONFIRMED' AND NEW.roomie_id IS NULL THEN
    LOOP
      v_roomie_id := 'RM-' || UPPER(substring(gen_random_uuid()::text from 1 for 8));
      SELECT EXISTS (SELECT 1 FROM public.roommate_agreements WHERE roomie_id = v_roomie_id) INTO v_exists;
      EXIT WHEN NOT v_exists;
    END LOOP;
    NEW.roomie_id := v_roomie_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create BEFORE INSERT OR UPDATE trigger
DROP TRIGGER IF EXISTS tr_set_roomie_id_on_confirm ON public.roommate_agreements;
CREATE TRIGGER tr_set_roomie_id_on_confirm
  BEFORE INSERT OR UPDATE ON public.roommate_agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_roomie_id_on_confirm();

-- 4. Backfill existing confirmed roommate agreements
UPDATE public.roommate_agreements
SET roomie_id = 'RM-' || UPPER(substring(gen_random_uuid()::text from 1 for 8))
WHERE status = 'CONFIRMED' AND roomie_id IS NULL;
