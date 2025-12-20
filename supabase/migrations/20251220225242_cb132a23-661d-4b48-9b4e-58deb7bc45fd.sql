-- Fix admin-only write policies to work with our app's authorized_email stored in JWT app_metadata.
-- This restores the Admin panel's ability to add users and create/delete notifications.

-- authorized_users
DROP POLICY IF EXISTS "Admins can insert authorized users" ON public.authorized_users;
DROP POLICY IF EXISTS "Admins can update authorized users" ON public.authorized_users;
DROP POLICY IF EXISTS "Admins can delete authorized users" ON public.authorized_users;

CREATE POLICY "Admins can insert authorized users"
ON public.authorized_users
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text))
);

CREATE POLICY "Admins can update authorized users"
ON public.authorized_users
FOR UPDATE
TO authenticated
USING (
  public.is_admin(((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text))
);

CREATE POLICY "Admins can delete authorized users"
ON public.authorized_users
FOR DELETE
TO authenticated
USING (
  public.is_admin(((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text))
);

-- notifications
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;

CREATE POLICY "Admins can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text))
);

CREATE POLICY "Admins can update notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  public.is_admin(((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text))
);

CREATE POLICY "Admins can delete notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (
  public.is_admin(((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text))
);

-- special_notifications
DROP POLICY IF EXISTS "Admins can insert special notifications" ON public.special_notifications;
DROP POLICY IF EXISTS "Admins can update special notifications" ON public.special_notifications;
DROP POLICY IF EXISTS "Admins can delete special notifications" ON public.special_notifications;

CREATE POLICY "Admins can insert special notifications"
ON public.special_notifications
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text))
);

CREATE POLICY "Admins can update special notifications"
ON public.special_notifications
FOR UPDATE
TO authenticated
USING (
  public.is_admin(((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text))
);

CREATE POLICY "Admins can delete special notifications"
ON public.special_notifications
FOR DELETE
TO authenticated
USING (
  public.is_admin(((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text))
);

-- user_personalized_notifications (admin write)
DROP POLICY IF EXISTS "Admins can insert personalized notifications" ON public.user_personalized_notifications;
DROP POLICY IF EXISTS "Admins can update personalized notifications" ON public.user_personalized_notifications;
DROP POLICY IF EXISTS "Admins can delete personalized notifications" ON public.user_personalized_notifications;

CREATE POLICY "Admins can insert personalized notifications"
ON public.user_personalized_notifications
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text))
);

CREATE POLICY "Admins can update personalized notifications"
ON public.user_personalized_notifications
FOR UPDATE
TO authenticated
USING (
  public.is_admin(((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text))
);

CREATE POLICY "Admins can delete personalized notifications"
ON public.user_personalized_notifications
FOR DELETE
TO authenticated
USING (
  public.is_admin(((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text))
);
