-- Create custom_categories table
CREATE TABLE public.custom_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_email, category_id)
);

-- Enable RLS
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own custom categories"
ON public.custom_categories
FOR SELECT
USING (user_email = ((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text));

CREATE POLICY "Users can create their own custom categories"
ON public.custom_categories
FOR INSERT
WITH CHECK (user_email = ((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text));

CREATE POLICY "Users can update their own custom categories"
ON public.custom_categories
FOR UPDATE
USING (user_email = ((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text));

CREATE POLICY "Users can delete their own custom categories"
ON public.custom_categories
FOR DELETE
USING (user_email = ((auth.jwt() -> 'app_metadata'::text) ->> 'authorized_email'::text));

-- Add trigger for updated_at
CREATE TRIGGER update_custom_categories_updated_at
BEFORE UPDATE ON public.custom_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();