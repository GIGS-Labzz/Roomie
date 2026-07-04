CREATE OR REPLACE FUNCTION public.notify_on_connection_change()
RETURNS TRIGGER AS $$
DECLARE
  v_sender_name TEXT;
  v_receiver_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- If a new connection is created (starts in PENDING_CONNECT status), notify the receiver.
    SELECT display_name INTO v_sender_name
    FROM public.profiles WHERE id = NEW.requester_id;

    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      NEW.receiver_id,
      'CONNECTION_REQUEST',
      'Connection Request',
      coalesce(v_sender_name, 'Someone') || ' wants to connect with you.',
      json_build_object('connection_id', NEW.id, 'requester_id', NEW.requester_id)::jsonb
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- If the status changed to ACTIVE, notify the requester.
    IF NEW.status = 'ACTIVE' AND OLD.status <> 'ACTIVE' THEN
      SELECT display_name INTO v_receiver_name
      FROM public.profiles WHERE id = NEW.receiver_id;

      INSERT INTO public.notifications (user_id, type, title, body, data)
      VALUES (
        NEW.requester_id,
        'AGREEMENT_CONFIRMED',
        'Connection accepted!',
        coalesce(v_receiver_name, 'Someone') || ' connected back with you. You can now chat!',
        json_build_object('connection_id', NEW.id)::jsonb
      );
    -- If the status changed back to PENDING_CONNECT (re-request), notify the receiver.
    ELSIF NEW.status = 'PENDING_CONNECT' AND OLD.status <> 'PENDING_CONNECT' THEN
      SELECT display_name INTO v_sender_name
      FROM public.profiles WHERE id = NEW.requester_id;

      INSERT INTO public.notifications (user_id, type, title, body, data)
      VALUES (
        NEW.receiver_id,
        'CONNECTION_REQUEST',
        'Connection Request',
        coalesce(v_sender_name, 'Someone') || ' wants to connect with you.',
        json_build_object('connection_id', NEW.id, 'requester_id', NEW.requester_id)::jsonb
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
