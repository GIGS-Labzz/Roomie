-- Migration 0036: Add Badge Personalization Columns
-- To support custom fonts and patterned backgrounds on Roomie badges.

ALTER TABLE public.roommate_agreements ADD COLUMN IF NOT EXISTS badge_font TEXT DEFAULT 'sans';
ALTER TABLE public.roommate_agreements ADD COLUMN IF NOT EXISTS badge_bg_pattern TEXT DEFAULT 'solid';
