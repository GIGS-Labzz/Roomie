-- Migration 0035: Remove roommate agreements roomie_id unique constraint
-- To support multi-member roommate pools sharing the same roomie_id.

ALTER TABLE public.roommate_agreements DROP CONSTRAINT IF EXISTS roommate_agreements_roomie_id_key;
