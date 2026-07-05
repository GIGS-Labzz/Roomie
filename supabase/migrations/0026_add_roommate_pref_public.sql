-- Add roommate_pref_public column to profiles table
ALTER TABLE public.profiles ADD COLUMN roommate_pref_public BOOLEAN DEFAULT true;
