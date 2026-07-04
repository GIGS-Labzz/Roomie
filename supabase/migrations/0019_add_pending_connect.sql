-- Add PENDING_CONNECT to connection_status enum type
ALTER TYPE public.connection_status ADD VALUE IF NOT EXISTS 'PENDING_CONNECT';

-- Change the default value of connections status to 'PENDING_CONNECT'
ALTER TABLE public.connections ALTER COLUMN status SET DEFAULT 'PENDING_CONNECT'::public.connection_status;
