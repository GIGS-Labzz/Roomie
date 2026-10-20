-- Migration 0040: Remove Onboarding Requirements
-- Sets onboarding_complete = TRUE by default for all users and updates trigger

-- 1. Alter default values
ALTER TABLE public.profiles ALTER COLUMN onboarding_complete SET DEFAULT TRUE;
ALTER TABLE public.profiles ALTER COLUMN onboarding_step SET DEFAULT 6;

-- 2. Mark all existing users as onboarding complete
UPDATE public.profiles
SET onboarding_complete = TRUE,
    onboarding_step = 6
WHERE onboarding_complete IS NOT TRUE;

-- 3. Update handle_new_user() trigger to ensure all new signups are immediately complete
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_connection_id UUID;
  v_support_exists BOOLEAN;
BEGIN
  -- Skip profile creation and auto-connect for non-student accounts
  IF NEW.raw_user_meta_data->>'user_type' IN ('provider', 'admin') THEN
    RETURN NEW;
  END IF;

  -- Insert profile with onboarding_complete = TRUE
  INSERT INTO public.profiles (id, display_name, avatar_url, onboarding_complete, onboarding_step)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    TRUE,
    6
  )
  ON CONFLICT (id) DO UPDATE SET
    onboarding_complete = TRUE;

  -- Auto-connect the user to the official roommate account
  IF NEW.id != 'a99928a0-8de7-4da0-871a-22077d13945d' THEN
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'a99928a0-8de7-4da0-871a-22077d13945d') INTO v_support_exists;
    
    IF v_support_exists THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.connections
        WHERE (requester_id = 'a99928a0-8de7-4da0-871a-22077d13945d' AND receiver_id = NEW.id)
           OR (requester_id = NEW.id AND receiver_id = 'a99928a0-8de7-4da0-871a-22077d13945d')
      ) THEN
        -- Insert connection and get its ID
        INSERT INTO public.connections (id, requester_id, receiver_id, status, connected_at)
        VALUES (gen_random_uuid(), 'a99928a0-8de7-4da0-871a-22077d13945d', NEW.id, 'ACTIVE', NOW())
        RETURNING id INTO v_connection_id;

        -- Insert welcome message
        INSERT INTO public.messages (connection_id, sender_id, content, message_type)
        VALUES (
          v_connection_id,
          'a99928a0-8de7-4da0-871a-22077d13945d',
          'Welcome to Roomie 😊 , this is the official support account, visit our Website on https://roomie-web-pg11.vercel.app/ ' || chr(10) || 'Feel free to always reach out in case of any type of support',
          'text'
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
