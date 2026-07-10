-- ─── Migration 0031: Badges & Connection Network ─────────────────────────────

-- 1. Create Badges Table
CREATE TABLE IF NOT EXISTS public.badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_lottie TEXT,
  icon_svg    TEXT,
  category    TEXT NOT NULL DEFAULT 'SYSTEM' CHECK (category IN ('SYSTEM', 'COMMUNITY', 'HOUSING', 'SPONSOR')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create User Badges Mapping Table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id   UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata   JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- 3. Extend profiles Table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS network_size INTEGER DEFAULT 0;

-- 4. Extend roommate_agreements Table
ALTER TABLE public.roommate_agreements ADD COLUMN IF NOT EXISTS badge_color VARCHAR DEFAULT 'brand';
ALTER TABLE public.roommate_agreements ADD COLUMN IF NOT EXISTS badge_variant VARCHAR DEFAULT 'standard';
ALTER TABLE public.roommate_agreements ADD COLUMN IF NOT EXISTS badge_theme VARCHAR DEFAULT 'light';

-- 5. Seed Badges Inventory
INSERT INTO public.badges (code, name, description, icon_lottie, category)
VALUES
  ('VERIFIED_STUDENT', 'Verified Student', 'Identity and enrollment verified via student ID.', 'verified-badge.json', 'SYSTEM'),
  ('ROOMIE_PARTNER', 'Roomie Partner', 'Successfully entered a paid roommate agreement.', 'match-found.json', 'SYSTEM'),
  ('GOOD_PAYER', 'On-Time Payer', 'Settles bills reliably and quickly.', 'bill-settled.json', 'SYSTEM'),
  ('HOUSING_VERIFIED', 'Verified Resident', 'Resident status verified by a housing platform provider.', 'shield-check.json', 'SYSTEM'),
  ('COMMUNITY_VIBE', 'High Vibe', 'Active contributor on the feed.', 'star-pulse.json', 'SYSTEM')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_lottie = EXCLUDED.icon_lottie,
    category = EXCLUDED.category;

-- 6. Trigger: Update Profile Network Size on Connection Status Change
CREATE OR REPLACE FUNCTION public.update_profile_network_size()
RETURNS TRIGGER AS $$
BEGIN
  -- If status transitioned to ACTIVE
  IF (TG_OP = 'INSERT' AND NEW.status = 'ACTIVE') OR (TG_OP = 'UPDATE' AND NEW.status = 'ACTIVE' AND (OLD.status IS NULL OR OLD.status != 'ACTIVE')) THEN
    UPDATE public.profiles
    SET network_size = network_size + 1
    WHERE id IN (NEW.requester_id, NEW.receiver_id);
  -- If status transitioned away from ACTIVE
  ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'ACTIVE' AND NEW.status != 'ACTIVE') OR (TG_OP = 'DELETE' AND OLD.status = 'ACTIVE') THEN
    UPDATE public.profiles
    SET network_size = GREATEST(0, network_size - 1)
    WHERE id IN (OLD.requester_id, OLD.receiver_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_update_profile_network_size ON public.connections;
CREATE TRIGGER tr_update_profile_network_size
  AFTER INSERT OR UPDATE OR DELETE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_network_size();

-- 7. Trigger: Award VERIFIED_STUDENT badge on profile student_verified change
CREATE OR REPLACE FUNCTION public.award_verified_student_badge()
RETURNS TRIGGER AS $$
DECLARE
  v_badge_id UUID;
BEGIN
  -- Check if student_verified changed to true
  IF NEW.student_verified = true AND (OLD.student_verified IS NULL OR OLD.student_verified = false) THEN
    SELECT id INTO v_badge_id FROM public.badges WHERE code = 'VERIFIED_STUDENT';
    IF v_badge_id IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (NEW.id, v_badge_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_award_verified_student_badge ON public.profiles;
CREATE TRIGGER tr_award_verified_student_badge
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.award_verified_student_badge();

-- 8. Trigger: Award ROOMIE_PARTNER badge on roommate agreement confirmation
CREATE OR REPLACE FUNCTION public.award_roomie_partner_badge()
RETURNS TRIGGER AS $$
DECLARE
  v_badge_id UUID;
BEGIN
  IF NEW.status = 'CONFIRMED' AND (OLD.status IS NULL OR OLD.status != 'CONFIRMED') THEN
    SELECT id INTO v_badge_id FROM public.badges WHERE code = 'ROOMIE_PARTNER';
    IF v_badge_id IS NOT NULL THEN
      -- Award to initiator
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (NEW.initiator_id, v_badge_id)
      ON CONFLICT DO NOTHING;
      -- Award to acceptor
      IF NEW.acceptor_id IS NOT NULL THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (NEW.acceptor_id, v_badge_id)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_award_roomie_partner_badge ON public.roommate_agreements;
CREATE TRIGGER tr_award_roomie_partner_badge
  AFTER UPDATE ON public.roommate_agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.award_roomie_partner_badge();

-- 9. Trigger: Award GOOD_PAYER badge on splits settled on-time
CREATE OR REPLACE FUNCTION public.award_good_payer_badge()
RETURNS TRIGGER AS $$
DECLARE
  v_badge_id UUID;
  v_on_time_count INTEGER;
BEGIN
  -- When a bill item is marked paid
  IF NEW.is_paid = true AND (OLD.is_paid IS NULL OR OLD.is_paid = false) THEN
    SELECT id INTO v_badge_id FROM public.badges WHERE code = 'GOOD_PAYER';
    
    -- Check if user already has the badge
    IF v_badge_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.user_badges 
      WHERE user_id = NEW.user_id AND badge_id = v_badge_id
    ) THEN
      -- Count consecutive items paid within 48h of split creation
      -- We look at the last 5 bill split items for this user
      SELECT COUNT(*) INTO v_on_time_count
      FROM (
        SELECT bsi.is_paid, bsi.paid_at, bs.created_at
        FROM public.bill_split_items bsi
        JOIN public.bill_splits bs ON bsi.split_id = bs.id
        WHERE bsi.user_id = NEW.user_id
        ORDER BY bsi.created_at DESC
        LIMIT 5
      ) last_five
      WHERE is_paid = true AND (paid_at - created_at) <= INTERVAL '48 hours';
      
      IF v_on_time_count = 5 THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (NEW.user_id, v_badge_id)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_award_good_payer_badge ON public.bill_split_items;
CREATE TRIGGER tr_award_good_payer_badge
  AFTER UPDATE ON public.bill_split_items
  FOR EACH ROW
  EXECUTE FUNCTION public.award_good_payer_badge();

-- 10. Trigger: Award COMMUNITY_VIBE badge on active contributor (posts > 10 and likes received > 50)
CREATE OR REPLACE FUNCTION public.award_community_vibe_badge()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_badge_id UUID;
  v_post_count INTEGER;
  v_likes_received INTEGER;
BEGIN
  -- Determine which user's stats to check
  IF TG_TABLE_NAME = 'posts' THEN
    v_user_id := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'post_likes' THEN
    SELECT user_id INTO v_user_id FROM public.posts WHERE id = NEW.post_id;
  END IF;

  IF v_user_id IS NOT NULL THEN
    SELECT id INTO v_badge_id FROM public.badges WHERE code = 'COMMUNITY_VIBE';
    
    -- Check if user already has the badge
    IF v_badge_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.user_badges 
      WHERE user_id = v_user_id AND badge_id = v_badge_id
    ) THEN
      -- Get total posts count for the user
      SELECT COUNT(*) INTO v_post_count FROM public.posts WHERE user_id = v_user_id;
      
      -- Get total likes received on the user's posts
      SELECT COALESCE(SUM(likes_count), 0) INTO v_likes_received FROM public.posts WHERE user_id = v_user_id;
      
      IF v_post_count > 10 AND v_likes_received > 50 THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (v_user_id, v_badge_id)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_award_community_vibe_badge_posts ON public.posts;
CREATE TRIGGER tr_award_community_vibe_badge_posts
  AFTER INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.award_community_vibe_badge();

DROP TRIGGER IF EXISTS tr_award_community_vibe_badge_likes ON public.post_likes;
CREATE TRIGGER tr_award_community_vibe_badge_likes
  AFTER INSERT OR UPDATE ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.award_community_vibe_badge();

-- 11. Enable Row Level Security (RLS)
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS Policies
CREATE POLICY "Allow public select access to badges" ON public.badges
  FOR SELECT USING (true);

CREATE POLICY "Allow public select access to user_badges" ON public.user_badges
  FOR SELECT USING (true);

-- API Server side handles additions/deletions, but let users see/manage if needed
CREATE POLICY "Allow service role or user management of user_badges" ON public.user_badges
  FOR ALL USING (true) WITH CHECK (true);
