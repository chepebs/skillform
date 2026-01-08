-- Create audit_log table for activity tracking
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);

-- Only master_admin can view audit logs
CREATE POLICY "Master admin can view all audit logs"
ON public.audit_log
FOR SELECT
USING (has_role(auth.uid(), 'master_admin'));

-- System can insert audit logs (via triggers/functions)
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_log
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add is_active and last_login_at columns to profiles if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Create function to log user login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET last_login_at = NOW() 
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable realtime for audit_log
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_log;