-- Add performance indexes to speed up feed, filtering, blocks, and connections queries.

-- A. Indexes on connections foreign keys
CREATE INDEX IF NOT EXISTS idx_connections_requester ON public.connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON public.connections(receiver_id);

-- B. Index on profiles sorting columns
CREATE INDEX IF NOT EXISTS idx_profiles_feed ON public.profiles(is_active, onboarding_complete, last_seen_at DESC);

-- C. GIN index on Array columns (lifestyle_tags)
CREATE INDEX IF NOT EXISTS idx_profiles_lifestyle_tags ON public.profiles USING gin(lifestyle_tags);

-- D. Reverse index on blocks
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON public.blocks(blocked_id);
