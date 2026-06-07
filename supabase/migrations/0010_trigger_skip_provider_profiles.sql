-- Update the handle_new_user trigger to skip profile creation
-- for housing providers and admin accounts (identified by user_type metadata).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Skip profile creation for non-student accounts
  IF NEW.raw_user_meta_data->>'user_type' IN ('provider', 'admin') THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;
