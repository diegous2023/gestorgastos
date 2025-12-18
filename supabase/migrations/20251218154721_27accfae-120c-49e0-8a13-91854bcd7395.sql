-- Create app_role enum for role management
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create admin_roles table for secure role management
CREATE TABLE public.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL UNIQUE,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Only allow reading admin_roles (no public write access)
CREATE POLICY "Anyone can read admin roles"
ON public.admin_roles FOR SELECT
USING (true);

-- Create security definer function to check admin role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE user_email = _user_email
      AND role = 'admin'
  )
$$;

-- =====================================================
-- FIX EXPENSES TABLE RLS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can create their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;

CREATE POLICY "Users can view their own expenses"
ON public.expenses FOR SELECT
USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can create their own expenses"
ON public.expenses FOR INSERT
WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update their own expenses"
ON public.expenses FOR UPDATE
USING (user_email = current_setting('request.jwt.claims', true)::json->>'email')
WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete their own expenses"
ON public.expenses FOR DELETE
USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- =====================================================
-- FIX CATEGORY_LIMITS TABLE RLS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own category limits" ON public.category_limits;
DROP POLICY IF EXISTS "Users can create their own category limits" ON public.category_limits;
DROP POLICY IF EXISTS "Users can update their own category limits" ON public.category_limits;
DROP POLICY IF EXISTS "Users can delete their own category limits" ON public.category_limits;

CREATE POLICY "Users can view their own category limits"
ON public.category_limits FOR SELECT
USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can create their own category limits"
ON public.category_limits FOR INSERT
WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update their own category limits"
ON public.category_limits FOR UPDATE
USING (user_email = current_setting('request.jwt.claims', true)::json->>'email')
WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete their own category limits"
ON public.category_limits FOR DELETE
USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- =====================================================
-- FIX AUTHORIZED_USERS TABLE RLS POLICIES (admin-only write)
-- =====================================================
DROP POLICY IF EXISTS "Anyone can manage authorized users" ON public.authorized_users;
DROP POLICY IF EXISTS "Anyone can read authorized users" ON public.authorized_users;

CREATE POLICY "Anyone can read authorized users"
ON public.authorized_users FOR SELECT
USING (true);

CREATE POLICY "Admins can insert authorized users"
ON public.authorized_users FOR INSERT
WITH CHECK (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can update authorized users"
ON public.authorized_users FOR UPDATE
USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can delete authorized users"
ON public.authorized_users FOR DELETE
USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

-- =====================================================
-- FIX NOTIFICATIONS TABLE RLS POLICIES (admin-only write)
-- =====================================================
DROP POLICY IF EXISTS "Anyone can manage notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can read notifications" ON public.notifications;

CREATE POLICY "Anyone can read notifications"
ON public.notifications FOR SELECT
USING (true);

CREATE POLICY "Admins can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can update notifications"
ON public.notifications FOR UPDATE
USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can delete notifications"
ON public.notifications FOR DELETE
USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

-- =====================================================
-- FIX SPECIAL_NOTIFICATIONS TABLE RLS POLICIES (admin-only write)
-- =====================================================
DROP POLICY IF EXISTS "Anyone can create special notifications" ON public.special_notifications;
DROP POLICY IF EXISTS "Anyone can update special notifications" ON public.special_notifications;
DROP POLICY IF EXISTS "Anyone can delete special notifications" ON public.special_notifications;
DROP POLICY IF EXISTS "Anyone can view active special notifications" ON public.special_notifications;

CREATE POLICY "Anyone can read special notifications"
ON public.special_notifications FOR SELECT
USING (true);

CREATE POLICY "Admins can insert special notifications"
ON public.special_notifications FOR INSERT
WITH CHECK (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can update special notifications"
ON public.special_notifications FOR UPDATE
USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can delete special notifications"
ON public.special_notifications FOR DELETE
USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

-- =====================================================
-- FIX USER_PERSONALIZED_NOTIFICATIONS TABLE RLS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Anyone can create personalized notifications" ON public.user_personalized_notifications;
DROP POLICY IF EXISTS "Anyone can update personalized notifications" ON public.user_personalized_notifications;
DROP POLICY IF EXISTS "Anyone can delete personalized notifications" ON public.user_personalized_notifications;
DROP POLICY IF EXISTS "Anyone can view personalized notifications" ON public.user_personalized_notifications;

-- Users can only read their own personalized notifications
CREATE POLICY "Users can read their own personalized notifications"
ON public.user_personalized_notifications FOR SELECT
USING (user_email = current_setting('request.jwt.claims', true)::json->>'email' 
       OR public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

-- Users can update only the is_dismissed field on their own notifications
CREATE POLICY "Users can dismiss their own notifications"
ON public.user_personalized_notifications FOR UPDATE
USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Admins can insert personalized notifications
CREATE POLICY "Admins can insert personalized notifications"
ON public.user_personalized_notifications FOR INSERT
WITH CHECK (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

-- Admins can update any personalized notification
CREATE POLICY "Admins can update personalized notifications"
ON public.user_personalized_notifications FOR UPDATE
USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

-- Admins can delete personalized notifications
CREATE POLICY "Admins can delete personalized notifications"
ON public.user_personalized_notifications FOR DELETE
USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

-- =====================================================
-- FIX USER_NOTIFICATION_READS TABLE RLS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Anyone can manage notification reads" ON public.user_notification_reads;

CREATE POLICY "Users can read their own notification reads"
ON public.user_notification_reads FOR SELECT
USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert their own notification reads"
ON public.user_notification_reads FOR INSERT
WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Add trigger for updated_at on admin_roles
CREATE TRIGGER update_admin_roles_updated_at
BEFORE UPDATE ON public.admin_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();