
-- 1. Create subscription_status enum
CREATE TYPE public.subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled');

-- 2. Companies table
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  description text,
  website text,
  industry text,
  country_id uuid,
  subscription_status public.subscription_status NOT NULL DEFAULT 'trialing',
  subscription_plan text NOT NULL DEFAULT 'free_testing',
  invite_token text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Add company_id to all tenant-scoped tables
ALTER TABLE public.profiles ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.services ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.service_vendors ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.service_skills ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.service_talent_matches ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.groups ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.group_members ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.departments ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.agencies ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.awards ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.brands_managed ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.recent_projects ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.previous_agencies ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.previous_positions ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.employee_skills ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.employee_languages ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.employee_industries ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.invitation_tokens ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;

CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_services_company_id ON public.services(company_id);
CREATE INDEX idx_groups_company_id ON public.groups(company_id);

-- 4. Security definer functions
CREATE OR REPLACE FUNCTION public.get_user_company(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT company_id FROM public.profiles WHERE user_id = _user_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION public.is_platform_master(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    LEFT JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = 'master_admin'::app_role
      AND p.company_id IS NULL
  )
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin(_user_id uuid, _company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies c WHERE c.id = _company_id AND c.created_by = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = 'master_admin'::app_role
      AND p.company_id = _company_id
  )
$$;

-- 5. RLS policies for companies
CREATE POLICY "Members can view their company" ON public.companies
FOR SELECT TO authenticated
USING (id = public.get_user_company(auth.uid()) OR public.is_platform_master(auth.uid()));

CREATE POLICY "Authenticated can create company" ON public.companies
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Company admin can update company" ON public.companies
FOR UPDATE TO authenticated
USING (public.is_company_admin(auth.uid(), id) OR public.is_platform_master(auth.uid()));

CREATE POLICY "Platform master can delete company" ON public.companies
FOR DELETE TO authenticated
USING (public.is_platform_master(auth.uid()));

-- Allow looking up a company by invite token (anon can validate via security definer below)
CREATE OR REPLACE FUNCTION public.get_company_by_invite(_slug text, _token text)
RETURNS TABLE(id uuid, name text, slug text, logo_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, name, slug, logo_url FROM public.companies
  WHERE slug = _slug AND invite_token = _token
  LIMIT 1
$$;

-- 6. Add tenant filter policies on profiles (additive — existing role policies preserved)
CREATE POLICY "Company members can view company profiles" ON public.profiles
FOR SELECT
USING (company_id IS NOT NULL AND company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Platform master can view all profiles" ON public.profiles
FOR SELECT
USING (public.is_platform_master(auth.uid()));

-- 7. Update handle_new_user to attach company from invite metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
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
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    v_company_id
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'employee');

  RETURN NEW;
END;
$$;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Storage bucket for company logos
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Company logos publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated can upload company logos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "Authenticated can update company logos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated can delete company logos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'company-logos');
