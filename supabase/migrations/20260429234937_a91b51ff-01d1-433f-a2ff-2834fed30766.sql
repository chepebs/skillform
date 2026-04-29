-- Drop public-schema policies
DROP POLICY IF EXISTS "Authenticated users can view active agencies" ON public.agencies;
DROP POLICY IF EXISTS "Master admin can manage agencies" ON public.agencies;
DROP POLICY IF EXISTS "Authenticated users can insert own audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Master admin can view all audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Authenticated can create company" ON public.companies;
DROP POLICY IF EXISTS "Company admin can update company" ON public.companies;
DROP POLICY IF EXISTS "Members can view their company" ON public.companies;
DROP POLICY IF EXISTS "Platform master can delete company" ON public.companies;
DROP POLICY IF EXISTS "All authenticated users can view departments" ON public.departments;
DROP POLICY IF EXISTS "Directors and master admin can update departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can view all employee industries" ON public.employee_industries;
DROP POLICY IF EXISTS "Directors can view department skills" ON public.employee_skills;
DROP POLICY IF EXISTS "Master admins can view all skills" ON public.employee_skills;
DROP POLICY IF EXISTS "Organizer admins can view all skills" ON public.employee_skills;
DROP POLICY IF EXISTS "Organizer and master admin can manage group members" ON public.group_members;
DROP POLICY IF EXISTS "Organizer and master admin can manage groups" ON public.groups;
DROP POLICY IF EXISTS "Master admins can delete invitation tokens" ON public.invitation_tokens;
DROP POLICY IF EXISTS "Master admins can insert invitation tokens" ON public.invitation_tokens;
DROP POLICY IF EXISTS "Master admins can update invitation tokens" ON public.invitation_tokens;
DROP POLICY IF EXISTS "Master admins can view invitation tokens" ON public.invitation_tokens;
DROP POLICY IF EXISTS "Directors can view department profiles" ON public.profiles;
DROP POLICY IF EXISTS "Master admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Organizer admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Platform master can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Master admin can manage service catalog" ON public.service_catalog;
DROP POLICY IF EXISTS "Master admin can manage service categories" ON public.service_categories;
DROP POLICY IF EXISTS "Directors+ can view service skills" ON public.service_skills;
DROP POLICY IF EXISTS "Service editor can manage skills" ON public.service_skills;
DROP POLICY IF EXISTS "Service editor can manage talent matches" ON public.service_talent_matches;
DROP POLICY IF EXISTS "Users can view own matches" ON public.service_talent_matches;
DROP POLICY IF EXISTS "Directors+ can view vendors" ON public.service_vendors;
DROP POLICY IF EXISTS "Service editor can manage vendors" ON public.service_vendors;
DROP POLICY IF EXISTS "Directors+ can create services" ON public.services;
DROP POLICY IF EXISTS "Directors+ can view services" ON public.services;
DROP POLICY IF EXISTS "Manager or master admin can delete services" ON public.services;
DROP POLICY IF EXISTS "Manager or master admin can update services" ON public.services;
DROP POLICY IF EXISTS "Master admin can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

DROP POLICY IF EXISTS "Company admin can upload own company logo" ON storage.objects;
DROP POLICY IF EXISTS "Company admin can update own company logo" ON storage.objects;
DROP POLICY IF EXISTS "Company admin can delete own company logo" ON storage.objects;

-- Drop ALL functions referencing app_role
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
DROP FUNCTION IF EXISTS public.is_platform_master(uuid);
DROP FUNCTION IF EXISTS public.is_company_admin(uuid, uuid);
DROP FUNCTION IF EXISTS public.can_access_services(uuid);
DROP FUNCTION IF EXISTS public.can_edit_service(uuid, uuid);
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.validate_invitation_token(text);
DROP FUNCTION IF EXISTS public.get_company_invite_token(uuid);

-- Swap enum
CREATE TYPE public.app_role_new AS ENUM ('admin', 'manager', 'user');

ALTER TABLE public.user_roles
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE public.app_role_new
  USING (CASE role::text WHEN 'master_admin' THEN 'admin' WHEN 'department_director' THEN 'manager' WHEN 'organizer_admin' THEN 'manager' WHEN 'employee' THEN 'user' ELSE 'user' END)::public.app_role_new,
  ALTER COLUMN role SET DEFAULT 'user'::public.app_role_new;

ALTER TABLE public.invitation_tokens
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE public.app_role_new
  USING (CASE role::text WHEN 'master_admin' THEN 'admin' WHEN 'department_director' THEN 'manager' WHEN 'organizer_admin' THEN 'manager' WHEN 'employee' THEN 'user' ELSE 'user' END)::public.app_role_new,
  ALTER COLUMN role SET DEFAULT 'user'::public.app_role_new;

DROP TYPE public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

DELETE FROM public.user_roles a USING public.user_roles b
WHERE a.id < b.id AND a.user_id = b.user_id AND a.role = b.role;

-- Recreate functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id ORDER BY
    CASE role WHEN 'admin' THEN 1 WHEN 'manager' THEN 2 WHEN 'user' THEN 3 END
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_platform_master(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    LEFT JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = _user_id AND ur.role = 'admin'::public.app_role AND p.company_id IS NULL
  )
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin(_user_id uuid, _company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.companies c WHERE c.id = _company_id AND c.created_by = _user_id)
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = _user_id AND ur.role = 'admin'::public.app_role AND p.company_id = _company_id
  )
$$;

CREATE OR REPLACE FUNCTION public.can_access_services(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin'::public.app_role)
    OR public.has_role(_user_id, 'manager'::public.app_role)
    OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _user_id AND seniority_level IN ('director','vp','c-level'))
$$;

CREATE OR REPLACE FUNCTION public.can_edit_service(_user_id uuid, _service_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin'::public.app_role)
    OR EXISTS (SELECT 1 FROM public.services s WHERE s.id = _service_id AND s.managed_by = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.validate_invitation_token(p_token text)
RETURNS TABLE(email text, role public.app_role, is_valid boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT it.email::TEXT, it.role, (it.used = false AND it.expires_at > now())::BOOLEAN AS is_valid
  FROM public.invitation_tokens it
  WHERE it.token = p_token LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_company_invite_token(_company_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.invite_token FROM public.companies c
  WHERE c.id = _company_id
    AND (public.is_company_admin(auth.uid(), _company_id) OR public.is_platform_master(auth.uid()) OR c.created_by = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_company_id uuid;
  v_invite_token text;
  v_company_for_token uuid;
BEGIN
  v_invite_token := NEW.raw_user_meta_data ->> 'invite_token';
  v_company_id := NULLIF(NEW.raw_user_meta_data ->> 'company_id', '')::uuid;
  IF v_invite_token IS NOT NULL AND v_company_id IS NULL THEN
    SELECT id INTO v_company_for_token FROM public.companies WHERE invite_token = v_invite_token LIMIT 1;
    v_company_id := v_company_for_token;
  END IF;
  INSERT INTO public.profiles (user_id, email, first_name, last_name, company_id)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'last_name', v_company_id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user'::public.app_role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recreate policies
CREATE POLICY "Authenticated users can view active agencies" ON public.agencies FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admin can manage agencies" ON public.agencies FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Authenticated users can insert own audit logs" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all audit logs" ON public.audit_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Authenticated can create company" ON public.companies FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Company admin can update company" ON public.companies FOR UPDATE TO authenticated USING (public.is_company_admin(auth.uid(), id) OR public.is_platform_master(auth.uid()));
CREATE POLICY "Members can view their company" ON public.companies FOR SELECT TO authenticated USING ((id = public.get_user_company(auth.uid())) OR public.is_platform_master(auth.uid()));
CREATE POLICY "Platform master can delete company" ON public.companies FOR DELETE TO authenticated USING (public.is_platform_master(auth.uid()));
CREATE POLICY "All authenticated users can view departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manager or admin can update departments" ON public.departments FOR UPDATE TO authenticated USING ((director_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin can view all employee industries" ON public.employee_industries FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'manager'::public.app_role));
CREATE POLICY "Manager can view department skills" ON public.employee_skills FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p JOIN public.departments d ON d.name = p.department WHERE p.user_id = employee_skills.user_id AND d.director_id = auth.uid()));
CREATE POLICY "Admin can view all skills" ON public.employee_skills FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Manager can view all skills" ON public.employee_skills FOR SELECT USING (public.has_role(auth.uid(), 'manager'::public.app_role));
CREATE POLICY "Manager and admin can manage group members" ON public.group_members FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'manager'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Manager and admin can manage groups" ON public.groups FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'manager'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin can delete invitation tokens" ON public.invitation_tokens FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin can insert invitation tokens" ON public.invitation_tokens FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin can update invitation tokens" ON public.invitation_tokens FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin can view invitation tokens" ON public.invitation_tokens FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Manager can view department profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.departments d WHERE d.director_id = auth.uid() AND d.name = profiles.department));
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Manager can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'manager'::public.app_role));
CREATE POLICY "Platform master can view all profiles" ON public.profiles FOR SELECT USING (public.is_platform_master(auth.uid()));
CREATE POLICY "Admin can manage service catalog" ON public.service_catalog FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin can manage service categories" ON public.service_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Manager+ can view service skills" ON public.service_skills FOR SELECT TO authenticated USING (public.can_access_services(auth.uid()));
CREATE POLICY "Service editor can manage skills" ON public.service_skills FOR ALL TO authenticated USING (public.can_edit_service(auth.uid(), service_id)) WITH CHECK (public.can_edit_service(auth.uid(), service_id));
CREATE POLICY "Service editor can manage talent matches" ON public.service_talent_matches FOR ALL TO authenticated USING (public.can_edit_service(auth.uid(), service_id) OR public.has_role(auth.uid(), 'manager'::public.app_role)) WITH CHECK (public.can_edit_service(auth.uid(), service_id) OR public.has_role(auth.uid(), 'manager'::public.app_role));
CREATE POLICY "Users can view own matches" ON public.service_talent_matches FOR SELECT TO authenticated USING ((user_id = auth.uid()) OR public.can_access_services(auth.uid()));
CREATE POLICY "Manager+ can view vendors" ON public.service_vendors FOR SELECT TO authenticated USING (public.can_access_services(auth.uid()));
CREATE POLICY "Service editor can manage vendors" ON public.service_vendors FOR ALL TO authenticated USING (public.can_edit_service(auth.uid(), service_id)) WITH CHECK (public.can_edit_service(auth.uid(), service_id));
CREATE POLICY "Manager+ can create services" ON public.services FOR INSERT TO authenticated WITH CHECK (public.can_access_services(auth.uid()) AND (created_by = auth.uid()));
CREATE POLICY "Manager+ can view services" ON public.services FOR SELECT TO authenticated USING (public.can_access_services(auth.uid()));
CREATE POLICY "Service manager or admin can delete services" ON public.services FOR DELETE TO authenticated USING ((managed_by = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Service manager or admin can update services" ON public.services FOR UPDATE TO authenticated USING ((managed_by = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Company admin can upload own company logo"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'company-logos' AND (public.is_company_admin(auth.uid(), ((storage.foldername(name))[1])::uuid) OR public.is_platform_master(auth.uid())));
CREATE POLICY "Company admin can update own company logo"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'company-logos' AND (public.is_company_admin(auth.uid(), ((storage.foldername(name))[1])::uuid) OR public.is_platform_master(auth.uid())));
CREATE POLICY "Company admin can delete own company logo"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'company-logos' AND (public.is_company_admin(auth.uid(), ((storage.foldername(name))[1])::uuid) OR public.is_platform_master(auth.uid())));