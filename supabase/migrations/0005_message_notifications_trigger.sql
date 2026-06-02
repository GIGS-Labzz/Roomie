-- Insert a notification for the receiver whenever a new user message arrives.
-- Skips system/agreement messages (those are handled by the webhook/API).
-- Uses UPSERT so rapid messages don't spam notifications — one unread
-- notification per connection is updated instead of N separate rows.

CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_other_user_id UUID;
  v_sender_name   TEXT;
  v_body          TEXT;
  v_conn          RECORD;
BEGIN
  -- Only notify for human messages
  IF NEW.message_type NOT IN ('text', 'image') THEN
    RETURN NEW;
  END IF;

  SELECT requester_id, receiver_id
  INTO v_conn
  FROM public.connections
  WHERE id = NEW.connection_id;

  IF NOT FOUND THEN RETURN NEW; END IF;

  v_other_user_id := CASE
    WHEN v_conn.requester_id = NEW.sender_id THEN v_conn.receiver_id
    ELSE v_conn.requester_id
  END;

  SELECT display_name INTO v_sender_name
  FROM public.profiles WHERE id = NEW.sender_id;

  v_body := CASE
    WHEN NEW.message_type = 'image' THEN 'Sent a photo'
    ELSE left(NEW.content, 120)
  END;

  -- Upsert: one pending NEW_MESSAGE notification per connection per recipient.
  -- If one already exists (read_at IS NULL), update the body + timestamp
  -- so only the latest message is shown, not a flood.
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    v_other_user_id,
    'NEW_MESSAGE',
    v_sender_name,
    v_body,
    json_build_object('connection_id', NEW.connection_id)::jsonb
  )
  ON CONFLICT DO NOTHING;

  -- Update any existing unread NEW_MESSAGE for this connection so it stays fresh
  UPDATE public.notifications
  SET title   = v_sender_name,
      body    = v_body,
      data    = json_build_object('connection_id', NEW.connection_id)::jsonb,
      created_at = NOW()
  WHERE user_id  = v_other_user_id
    AND type     = 'NEW_MESSAGE'
    AND data->>'connection_id' = NEW.connection_id::TEXT
    AND read_at IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_message();
