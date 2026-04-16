-- Remove audit_log from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.audit_log;

-- Fix audit_log INSERT policy to enforce user_id = auth.uid()
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_log;
CREATE POLICY "Authenticated users can insert own audit logs"
  ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);