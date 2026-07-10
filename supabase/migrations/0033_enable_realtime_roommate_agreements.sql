-- ─── Migration 0033: Enable Realtime replication for roommate_agreements ─────
-- Without this, postgres_changes subscriptions never fire — the party who
-- didn't pay never sees the CONFIRMED update (and the congrats popup) live
-- in chat, since Supabase only replicates tables explicitly in this publication.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'roommate_agreements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.roommate_agreements;
  END IF;
END $$;
