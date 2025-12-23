-- Add pin column to authorized_users table
ALTER TABLE public.authorized_users ADD COLUMN IF NOT EXISTS pin TEXT NULL;

-- Enable realtime for authorized_users to detect PIN changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.authorized_users;