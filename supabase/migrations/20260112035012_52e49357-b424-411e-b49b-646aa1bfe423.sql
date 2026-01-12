-- =====================================================
-- SECURITY FIX: RLS Policies for profiles, employee_skills, invitation_tokens
-- =====================================================

-- =====================================================
-- ISSUE 1: Fix profiles table RLS - restrict access by role
-- =====================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Master admins can view all profiles
CREATE POLICY "Master admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'master_admin'::app_role));

-- 3. Organizer admins can view all profiles (for organizing groups)
CREATE POLICY "Organizer admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'organizer_admin'::app_role));

-- 4. Department directors can view profiles in their department
CREATE POLICY "Directors can view department profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.departments d
    WHERE d.director_id = auth.uid()
    AND d.name = profiles.department
  )
);

-- =====================================================
-- ISSUE 2: Fix invitation_tokens RLS - simplify and secure
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own invitation token" ON public.invitation_tokens;
DROP POLICY IF EXISTS "Master admin can manage tokens" ON public.invitation_tokens;

-- Create clean, simple policies for master admin only
CREATE POLICY "Master admins can view invitation tokens"
ON public.invitation_tokens
FOR SELECT
USING (has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Master admins can insert invitation tokens"
ON public.invitation_tokens
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Master admins can update invitation tokens"
ON public.invitation_tokens
FOR UPDATE
USING (has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Master admins can delete invitation tokens"
ON public.invitation_tokens
FOR DELETE
USING (has_role(auth.uid(), 'master_admin'::app_role));

-- =====================================================
-- ISSUE 3: Fix employee_skills RLS - restrict access by role
-- =====================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all skills" ON public.employee_skills;

-- 1. Users can view their own skills
CREATE POLICY "Users can view own skills"
ON public.employee_skills
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Master admins can view all skills
CREATE POLICY "Master admins can view all skills"
ON public.employee_skills
FOR SELECT
USING (has_role(auth.uid(), 'master_admin'::app_role));

-- 3. Organizer admins can view all skills (for organizing groups)
CREATE POLICY "Organizer admins can view all skills"
ON public.employee_skills
FOR SELECT
USING (has_role(auth.uid(), 'organizer_admin'::app_role));

-- 4. Department directors can view skills for their department members
CREATE POLICY "Directors can view department skills"
ON public.employee_skills
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    INNER JOIN public.departments d ON d.name = p.department
    WHERE p.user_id = employee_skills.user_id
    AND d.director_id = auth.uid()
  )
);