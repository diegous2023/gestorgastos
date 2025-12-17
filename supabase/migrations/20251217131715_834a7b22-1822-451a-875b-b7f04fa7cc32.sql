-- Create table for personalized notifications per user
CREATE TABLE public.user_personalized_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  button1_text TEXT NOT NULL DEFAULT 'Aceptar',
  button2_text TEXT NOT NULL DEFAULT 'Confirmar',
  dismiss_button INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_personalized_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for admin management
CREATE POLICY "Anyone can view personalized notifications"
ON public.user_personalized_notifications
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create personalized notifications"
ON public.user_personalized_notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update personalized notifications"
ON public.user_personalized_notifications
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete personalized notifications"
ON public.user_personalized_notifications
FOR DELETE
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_user_personalized_notifications_updated_at
BEFORE UPDATE ON public.user_personalized_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();