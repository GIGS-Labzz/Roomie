-- Redefine handle_new_user function to automatically connect new profiles to the Roomie.app support account
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Auto-connect the user to the official roommate account
  IF NEW.id != 'a99928a0-8de7-4da0-871a-22077d13945d' THEN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = 'a99928a0-8de7-4da0-871a-22077d13945d') THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.connections
        WHERE (requester_id = 'a99928a0-8de7-4da0-871a-22077d13945d' AND receiver_id = NEW.id)
           OR (requester_id = NEW.id AND receiver_id = 'a99928a0-8de7-4da0-871a-22077d13945d')
      ) THEN
        INSERT INTO public.connections (requester_id, receiver_id, status, connected_at)
        VALUES ('a99928a0-8de7-4da0-871a-22077d13945d', NEW.id, 'ACTIVE', NOW());
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill connections for existing users
INSERT INTO public.connections (requester_id, receiver_id, status, connected_at)
SELECT 'a99928a0-8de7-4da0-871a-22077d13945d', p.id, 'ACTIVE', NOW()
FROM public.profiles p
WHERE p.id != 'a99928a0-8de7-4da0-871a-22077d13945d'
  AND NOT EXISTS (
    SELECT 1 FROM public.connections c
    WHERE (c.requester_id = 'a99928a0-8de7-4da0-871a-22077d13945d' AND c.receiver_id = p.id)
       OR (c.requester_id = p.id AND c.receiver_id = 'a99928a0-8de7-4da0-871a-22077d13945d')
  );
