-- Enable old row values in Realtime payloads so clients can detect PIN changes
ALTER TABLE public.authorized_users REPLICA IDENTITY FULL;