-- Update notifications table to include title
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title TEXT;

-- Create special notifications table
CREATE TABLE public.special_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  button1_text TEXT NOT NULL DEFAULT 'Aceptar',
  button2_text TEXT NOT NULL DEFAULT 'Confirmar',
  dismiss_button INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.special_notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view active special notifications"
ON public.special_notifications
FOR SELECT
USING (true);

-- Create table to track user dismissals
CREATE TABLE public.special_notification_dismissals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  notification_id UUID NOT NULL REFERENCES public.special_notifications(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_email, notification_id)
);

-- Enable RLS
ALTER TABLE public.special_notification_dismissals ENABLE ROW LEVEL SECURITY;

-- Allow public access for dismissals
CREATE POLICY "Anyone can view dismissals"
ON public.special_notification_dismissals
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create dismissals"
ON public.special_notification_dismissals
FOR INSERT
WITH CHECK (true);