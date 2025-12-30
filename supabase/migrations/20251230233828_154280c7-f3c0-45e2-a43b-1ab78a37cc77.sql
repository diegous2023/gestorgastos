-- Add new columns to special_notifications for fixed window mode and button links
ALTER TABLE public.special_notifications 
ADD COLUMN IF NOT EXISTS is_fixed_window boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS button1_link text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS button2_link text DEFAULT NULL;

-- Enable realtime for special_notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.special_notifications;

-- Add comment explaining the new columns
COMMENT ON COLUMN public.special_notifications.is_fixed_window IS 'When true, users cannot dismiss or interact with the app until clicking a button';
COMMENT ON COLUMN public.special_notifications.button1_link IS 'Optional URL to open when button 1 is clicked';
COMMENT ON COLUMN public.special_notifications.button2_link IS 'Optional URL to open when button 2 is clicked';