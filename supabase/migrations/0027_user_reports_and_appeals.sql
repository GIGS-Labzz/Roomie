-- Add is_barred column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_barred BOOLEAN DEFAULT false;

-- Create user_reports table
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_reporter_reported UNIQUE (reporter_id, reported_id)
);

-- Create user_appeals table
CREATE TABLE IF NOT EXISTS public.user_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  document_url TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_appeals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_reports
CREATE POLICY "user_reports_insert_policy" ON public.user_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "user_reports_read_policy" ON public.user_reports
  FOR SELECT USING (
    auth.uid() = reporter_id OR 
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- RLS Policies for user_appeals
CREATE POLICY "user_appeals_insert_policy" ON public.user_appeals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_appeals_read_policy" ON public.user_appeals
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "user_appeals_update_policy" ON public.user_appeals
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- Trigger function to bar user if reported by > 3 unique accounts
CREATE OR REPLACE FUNCTION check_reports_and_bar()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT count(*) 
    FROM public.user_reports 
    WHERE reported_id = NEW.reported_id
  ) > 3 THEN
    UPDATE public.profiles
    SET is_active = false, is_barred = true, verification_status = 'REJECTED'
    WHERE id = NEW.reported_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER user_reports_after_insert
AFTER INSERT ON public.user_reports
FOR EACH ROW
EXECUTE FUNCTION check_reports_and_bar();

-- Trigger function to automatically create a pending appeal when a user is barred
CREATE OR REPLACE FUNCTION auto_create_appeal_on_bar()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_barred = true AND (OLD.is_barred = false OR OLD.is_barred IS NULL) THEN
    -- Only insert if there isn't already a PENDING appeal
    IF NOT EXISTS (
      SELECT 1 
      FROM public.user_appeals 
      WHERE user_id = NEW.id AND status = 'PENDING'
    ) THEN
      INSERT INTO public.user_appeals (user_id, status, document_url, message)
      VALUES (NEW.id, 'PENDING', 'Awaiting upload', 'Account barred. Awaiting appeal submission.');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER profiles_after_bar
AFTER UPDATE OF is_barred ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION auto_create_appeal_on_bar();
