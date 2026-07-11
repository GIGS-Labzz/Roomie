-- ─── Migration 0037: Add roomie_id_request to message_type enum ─────────────────
ALTER TYPE public.message_type ADD VALUE IF NOT EXISTS 'roomie_id_request';
