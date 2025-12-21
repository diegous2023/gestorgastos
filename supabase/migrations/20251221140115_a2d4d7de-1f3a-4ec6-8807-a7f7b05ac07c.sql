-- Create table to track user login sessions
CREATE TABLE public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  logged_in_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read sessions (for admin panel)
CREATE POLICY "Anyone can read sessions"
ON public.user_sessions
FOR SELECT
USING (true);

-- Allow inserts (will be done via service role)
CREATE POLICY "Service role can insert sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (true);