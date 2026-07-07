-- Create function to generate a unique username from first name and random numbers
CREATE OR REPLACE FUNCTION public.generate_unique_username(first_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract first name and convert to lowercase, remove spaces
  base_username := LOWER(REGEXP_REPLACE(first_name, '\s+', '', 'g'));
  
  -- Start with base + 2 random digits
  final_username := base_username || LPAD(FLOOR(RANDOM() * 100)::TEXT, 2, '0');
  
  -- If username exists, keep trying with new random numbers
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    final_username := base_username || LPAD(FLOOR(RANDOM() * 100)::TEXT, 2, '0');
    counter := counter + 1;
    
    -- Safety check to prevent infinite loop
    IF counter > 100 THEN
      -- If we can't find a unique username after 100 tries, add timestamp
      final_username := base_username || '_' || EXTRACT(EPOCH FROM NOW())::INTEGER;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_username;
END;
$$;

-- Create trigger to auto-generate username for new profiles without one
CREATE OR REPLACE FUNCTION public.auto_generate_username()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  first_name TEXT;
BEGIN
  -- Only generate username if it's not already set
  IF NEW.username IS NULL OR NEW.username = '' THEN
    -- Extract first name from display_name (everything before the first space)
    first_name := SPLIT_PART(NEW.display_name, ' ', 1);
    
    -- Generate unique username if first name exists
    IF first_name IS NOT NULL AND first_name != '' THEN
      NEW.username := public.generate_unique_username(first_name);
    ELSE
      -- Fallback if no display name
      NEW.username := 'user' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_generate_username ON public.profiles;

-- Create trigger on INSERT and UPDATE
CREATE TRIGGER trigger_auto_generate_username
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_username();

-- Generate usernames for existing profiles without usernames
UPDATE public.profiles
SET username = public.generate_unique_username(SPLIT_PART(display_name, ' ', 1))
WHERE username IS NULL OR username = '';
