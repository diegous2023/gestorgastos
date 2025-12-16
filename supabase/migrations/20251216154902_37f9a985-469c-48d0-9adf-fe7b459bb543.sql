-- Create authorized_users table for storing approved emails
CREATE TABLE public.authorized_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table for admin announcements
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_notification_reads to track which notifications a user has read
CREATE TABLE public.user_notification_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_email, notification_id)
);

-- Enable RLS on all tables (but with permissive policies for this simple app)
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_reads ENABLE ROW LEVEL SECURITY;

-- Allow public read access to authorized_users (for login verification)
CREATE POLICY "Anyone can read authorized users"
ON public.authorized_users
FOR SELECT
USING (true);

-- Allow public insert/update/delete on authorized_users (admin will use password)
CREATE POLICY "Anyone can manage authorized users"
ON public.authorized_users
FOR ALL
USING (true)
WITH CHECK (true);

-- Allow public read access to notifications
CREATE POLICY "Anyone can read notifications"
ON public.notifications
FOR SELECT
USING (true);

-- Allow public insert/delete on notifications (admin will use password)
CREATE POLICY "Anyone can manage notifications"
ON public.notifications
FOR ALL
USING (true)
WITH CHECK (true);

-- Allow public access to notification reads
CREATE POLICY "Anyone can manage notification reads"
ON public.user_notification_reads
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_authorized_users_updated_at
BEFORE UPDATE ON public.authorized_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;