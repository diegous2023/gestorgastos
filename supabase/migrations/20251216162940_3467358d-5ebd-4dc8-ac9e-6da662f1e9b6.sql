-- Add policies for managing special notifications from admin
CREATE POLICY "Anyone can create special notifications" 
ON public.special_notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update special notifications" 
ON public.special_notifications 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete special notifications" 
ON public.special_notifications 
FOR DELETE 
USING (true);