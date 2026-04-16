-- Trigger: prevent non-master-admins from changing seniority_level on profiles
CREATE OR REPLACE FUNCTION public.prevent_seniority_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If seniority_level is being changed
  IF NEW.seniority_level IS DISTINCT FROM OLD.seniority_level THEN
    -- Only master admins may change seniority_level
    IF NOT public.has_role(auth.uid(), 'master_admin'::app_role) THEN
      -- Silently revert the change (do not block the rest of the update)
      NEW.seniority_level := OLD.seniority_level;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_seniority_self_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_seniority_self_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_seniority_self_escalation();