-- Update RLS policies for expenses table to use app_metadata
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can create their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;

CREATE POLICY "Users can view their own expenses" 
ON public.expenses 
FOR SELECT 
USING (user_email = ((auth.jwt() -> 'app_metadata') ->> 'authorized_email'));

CREATE POLICY "Users can create their own expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (user_email = ((auth.jwt() -> 'app_metadata') ->> 'authorized_email'));

CREATE POLICY "Users can update their own expenses" 
ON public.expenses 
FOR UPDATE 
USING (user_email = ((auth.jwt() -> 'app_metadata') ->> 'authorized_email'))
WITH CHECK (user_email = ((auth.jwt() -> 'app_metadata') ->> 'authorized_email'));

CREATE POLICY "Users can delete their own expenses" 
ON public.expenses 
FOR DELETE 
USING (user_email = ((auth.jwt() -> 'app_metadata') ->> 'authorized_email'));

-- Update RLS policies for category_limits table
DROP POLICY IF EXISTS "Users can view their own category limits" ON public.category_limits;
DROP POLICY IF EXISTS "Users can create their own category limits" ON public.category_limits;
DROP POLICY IF EXISTS "Users can update their own category limits" ON public.category_limits;
DROP POLICY IF EXISTS "Users can delete their own category limits" ON public.category_limits;

CREATE POLICY "Users can view their own category limits" 
ON public.category_limits 
FOR SELECT 
USING (user_email = ((auth.jwt() -> 'app_metadata') ->> 'authorized_email'));

CREATE POLICY "Users can create their own category limits" 
ON public.category_limits 
FOR INSERT 
WITH CHECK (user_email = ((auth.jwt() -> 'app_metadata') ->> 'authorized_email'));

CREATE POLICY "Users can update their own category limits" 
ON public.category_limits 
FOR UPDATE 
USING (user_email = ((auth.jwt() -> 'app_metadata') ->> 'authorized_email'))
WITH CHECK (user_email = ((auth.jwt() -> 'app_metadata') ->> 'authorized_email'));

CREATE POLICY "Users can delete their own category limits" 
ON public.category_limits 
FOR DELETE 
USING (user_email = ((auth.jwt() -> 'app_metadata') ->> 'authorized_email'));

-- Update RLS policies for user_notification_reads table
DROP POLICY IF EXISTS "Users can read their own notification reads" ON public.user_notification_reads;
DROP POLICY IF EXISTS "Users can insert their own notification reads" ON public.user_notification_reads;

CREATE POLICY "Users can read their own notification reads" 
ON public.user_notification_reads 
FOR SELECT 
USING (user_email = ((auth.jwt() -> 'app_metadata') ->> 'authorized_email'));

CREATE POLICY "Users can insert their own notification reads" 
ON public.user_notification_reads 
FOR INSERT 
WITH CHECK (user_email = ((auth.jwt() -> 'app_metadata') ->> 'authorized_email'));

-- Update RLS policies for user_personalized_notifications table  
DROP POLICY IF EXISTS "Users can read their own personalized notifications" ON public.user_personalized_notifications;
DROP POLICY IF EXISTS "Users can dismiss their own notifications" ON public.user_personalized_notifications;

CREATE POLICY "Users can read their own personalized notifications" 
ON public.user_personalized_notifications 
FOR SELECT 
USING (
  user_email = ((auth.jwt() -> 'app_metadata') ->> 'authorized_email') 
  OR is_admin(((auth.jwt() -> 'app_metadata') ->> 'authorized_email'))
);

CREATE POLICY "Users can dismiss their own notifications" 
ON public.user_personalized_notifications 
FOR UPDATE 
USING (user_email = ((auth.jwt() -> 'app_metadata') ->> 'authorized_email'));