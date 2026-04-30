
-- 1) event_rsvps: scope SELECT to same company / admin
DROP POLICY IF EXISTS "Authenticated can view RSVPs" ON public.event_rsvps;

CREATE POLICY "Company members can view event RSVPs"
  ON public.event_rsvps FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_rsvps.event_id
        AND (
          e.company_id = public.get_user_company(auth.uid())
          OR public.has_role(auth.uid(), 'admin'::public.app_role)
        )
    )
  );

-- 2) handle_new_user: ignore client-supplied company_id, always derive from token
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_company_id uuid;
  v_invite_token text;
BEGIN
  v_invite_token := NEW.raw_user_meta_data ->> 'invite_token';

  -- Only derive company from a valid invite token; never trust client-supplied company_id
  IF v_invite_token IS NOT NULL AND length(v_invite_token) > 0 THEN
    SELECT id INTO v_company_id
    FROM public.companies
    WHERE invite_token = v_invite_token
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (user_id, email, first_name, last_name, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    v_company_id
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user'::public.app_role);
  RETURN NEW;
END;
$function$;

-- 3) Hide invite_token from non-admin members of a company.
-- Replace the broad SELECT policy with one that excludes invite_token for regular members.
-- We achieve this with column-level privileges: revoke SELECT on invite_token for authenticated,
-- and grant it back via a SECURITY DEFINER function (already exists: get_company_invite_token).
REVOKE SELECT (invite_token) ON public.companies FROM authenticated, anon;

-- 4) group_members: restrict SELECT to same company
DROP POLICY IF EXISTS "All authenticated users can view group members" ON public.group_members;

CREATE POLICY "Company members can view group members"
  ON public.group_members FOR SELECT TO authenticated
  USING (
    company_id = public.get_user_company(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Also tighten groups visibility to same company for consistency
DROP POLICY IF EXISTS "All authenticated users can view groups" ON public.groups;

CREATE POLICY "Company members can view groups"
  ON public.groups FOR SELECT TO authenticated
  USING (
    company_id = public.get_user_company(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- 5) HR documents storage hardening
-- 5a) Restrict uploads to manager+/admin
DROP POLICY IF EXISTS "HR docs upload by authenticated" ON storage.objects;

CREATE POLICY "HR docs upload by manager or admin"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'hr-documents'
    AND (
      public.has_role(auth.uid(), 'manager'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

-- 5b) Restrict reads to users actually allowed to see the underlying document under documents RLS.
-- Recreate the policy to use a join that respects documents visibility rules.
DROP POLICY IF EXISTS "HR docs read via documents RLS" ON storage.objects;

CREATE POLICY "HR docs read via documents RLS"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'hr-documents'
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_path = storage.objects.name
        AND (
          d.owner_id = auth.uid()
          OR d.uploaded_by = auth.uid()
          OR public.has_role(auth.uid(), 'admin'::public.app_role)
          OR (d.visibility = 'personal' AND public.is_direct_manager(auth.uid(), d.owner_id))
          OR (
            d.visibility = 'department'
            AND d.company_id = public.get_user_company(auth.uid())
            AND d.department IS NOT NULL
            AND d.department = (SELECT p.department FROM public.profiles p WHERE p.user_id = auth.uid())
          )
          OR (d.visibility = 'company' AND d.company_id = public.get_user_company(auth.uid()))
        )
    )
  );

-- 6) Lock down SECURITY DEFINER functions: revoke EXECUTE from anon for sensitive ones.
-- Keep public-callable: get_company_by_invite, validate_invitation_token (used by anon invite flows).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_company(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_platform_master(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_company_admin(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_direct_manager(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_access_services(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_edit_service(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_company_invite_token(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.use_invitation_token(text, text) FROM anon;
