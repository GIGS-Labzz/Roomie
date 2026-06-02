-- Add proof-of-payment columns to bill_split_items
ALTER TABLE public.bill_split_items
  ADD COLUMN IF NOT EXISTS proof_url       TEXT,
  ADD COLUMN IF NOT EXISTS amount_paid     INTEGER,        -- actual kobo paid (may be less than amount)
  ADD COLUMN IF NOT EXISTS payment_status  TEXT DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'partial', 'full'));

-- Backfill existing rows
UPDATE public.bill_split_items
  SET payment_status = CASE WHEN is_paid THEN 'full' ELSE 'unpaid' END
  WHERE payment_status = 'unpaid';

-- Public storage bucket for receipt images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/heic','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'receipts_insert_auth'
  ) THEN
    CREATE POLICY "receipts_insert_auth" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- Public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'receipts_select_all'
  ) THEN
    CREATE POLICY "receipts_select_all" ON storage.objects
      FOR SELECT USING (bucket_id = 'receipts');
  END IF;
END $$;

-- Owners can delete their own receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'receipts_delete_own'
  ) THEN
    CREATE POLICY "receipts_delete_own" ON storage.objects
      FOR DELETE USING (bucket_id = 'receipts' AND owner_id::text = auth.uid()::text);
  END IF;
END $$;
