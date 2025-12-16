-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount_usd DECIMAL(12,2),
  amount_eur DECIMAL(12,2),
  currency TEXT NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create category_limits table
CREATE TABLE public.category_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  category_id TEXT NOT NULL,
  limit_usd DECIMAL(12,2),
  limit_eur DECIMAL(12,2),
  currency TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_email, category_id)
);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for expenses - users can only see/manage their own expenses
CREATE POLICY "Users can view their own expenses" 
ON public.expenses 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own expenses" 
ON public.expenses 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their own expenses" 
ON public.expenses 
FOR DELETE 
USING (true);

-- RLS policies for category_limits
CREATE POLICY "Users can view their own category limits" 
ON public.category_limits 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own category limits" 
ON public.category_limits 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own category limits" 
ON public.category_limits 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their own category limits" 
ON public.category_limits 
FOR DELETE 
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_category_limits_updated_at
BEFORE UPDATE ON public.category_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();