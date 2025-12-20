-- Add button_count column to special_notifications (1 = single button, 2 = two buttons)
ALTER TABLE public.special_notifications 
ADD COLUMN button_count integer NOT NULL DEFAULT 2;

-- Add button_count column to user_personalized_notifications
ALTER TABLE public.user_personalized_notifications 
ADD COLUMN button_count integer NOT NULL DEFAULT 2;