-- Add username and birthday_public columns to profiles table
ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN birthday_public BOOLEAN DEFAULT false;
