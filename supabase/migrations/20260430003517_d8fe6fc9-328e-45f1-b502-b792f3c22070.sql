
-- =============================================
-- TIME OFF
-- =============================================

CREATE TABLE public.time_off_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'vacation', -- vacation, sick, personal, unpaid, other
  annual_allowance_days NUMERIC NOT NULL DEFAULT 0,
  accrual_method TEXT NOT NULL DEFAULT 'yearly', -- none, monthly, yearly
  is_paid BOOLEAN NOT NULL DEFAULT true,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.time_off_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view policies" ON public.time_off_policies
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()) OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admin can manage policies" ON public.time_off_policies
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_time_off_policies_updated
  BEFORE UPDATE ON public.time_off_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.time_off_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  user_id UUID NOT NULL,
  policy_id UUID NOT NULL REFERENCES public.time_off_policies(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  allocated_days NUMERIC NOT NULL DEFAULT 0,
  used_days NUMERIC NOT NULL DEFAULT 0,
  pending_days NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, policy_id, year)
);
ALTER TABLE public.time_off_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own or manager/admin balances" ON public.time_off_balances
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(),'admin'::app_role)
    OR public.is_direct_manager(auth.uid(), user_id)
  );
CREATE POLICY "Admin can manage balances" ON public.time_off_balances
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_time_off_balances_updated
  BEFORE UPDATE ON public.time_off_balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.time_off_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  user_id UUID NOT NULL,
  policy_id UUID NOT NULL REFERENCES public.time_off_policies(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  day_count NUMERIC NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approver_id UUID,
  decision_at TIMESTAMPTZ,
  decision_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own or manager/admin requests" ON public.time_off_requests
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR approver_id = auth.uid()
    OR public.has_role(auth.uid(),'admin'::app_role)
    OR public.is_direct_manager(auth.uid(), user_id)
  );
CREATE POLICY "Users create own requests" ON public.time_off_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owner can cancel; manager/admin can decide" ON public.time_off_requests
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(),'admin'::app_role)
    OR public.is_direct_manager(auth.uid(), user_id)
  );
CREATE POLICY "Owner or admin can delete request" ON public.time_off_requests
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_time_off_requests_updated
  BEFORE UPDATE ON public.time_off_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_time_off_requests_user ON public.time_off_requests(user_id);
CREATE INDEX idx_time_off_requests_status ON public.time_off_requests(status);

-- =============================================
-- JOB POSTINGS
-- =============================================

CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  location TEXT,
  employment_type TEXT, -- full_time, part_time, contract, internship
  seniority TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, open, closed
  deadline DATE,
  posted_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company sees open postings; creator/admin see all" ON public.job_postings
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin'::app_role)
    OR posted_by = auth.uid()
    OR (status = 'open' AND company_id = public.get_user_company(auth.uid()))
  );
CREATE POLICY "Manager+ can create postings" ON public.job_postings
  FOR INSERT TO authenticated
  WITH CHECK (
    posted_by = auth.uid()
    AND (public.has_role(auth.uid(),'manager'::app_role) OR public.has_role(auth.uid(),'admin'::app_role))
  );
CREATE POLICY "Creator or admin update postings" ON public.job_postings
  FOR UPDATE TO authenticated
  USING (posted_by = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Creator or admin delete postings" ON public.job_postings
  FOR DELETE TO authenticated
  USING (posted_by = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_job_postings_updated
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL,
  company_id UUID,
  cover_note TEXT,
  status TEXT NOT NULL DEFAULT 'submitted', -- submitted, reviewing, interviewing, offered, rejected, withdrawn
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applicant or job owner or admin can view" ON public.job_applications
  FOR SELECT TO authenticated
  USING (
    applicant_id = auth.uid()
    OR public.has_role(auth.uid(),'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.job_postings j WHERE j.id = job_id AND j.posted_by = auth.uid())
  );
CREATE POLICY "Users apply for themselves" ON public.job_applications
  FOR INSERT TO authenticated
  WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "Applicant or job owner or admin update" ON public.job_applications
  FOR UPDATE TO authenticated
  USING (
    applicant_id = auth.uid()
    OR public.has_role(auth.uid(),'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.job_postings j WHERE j.id = job_id AND j.posted_by = auth.uid())
  );

CREATE TRIGGER trg_job_applications_updated
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ONBOARDING
-- =============================================

CREATE TABLE public.onboarding_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members view templates" ON public.onboarding_templates
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()) OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admin manages templates" ON public.onboarding_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_onboarding_templates_updated
  BEFORE UPDATE ON public.onboarding_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.onboarding_template_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.onboarding_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  default_due_offset_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.onboarding_template_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view template tasks" ON public.onboarding_template_tasks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages template tasks" ON public.onboarding_template_tasks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TABLE public.onboarding_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  user_id UUID NOT NULL,
  template_id UUID REFERENCES public.onboarding_templates(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, cancelled
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.onboarding_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manager admin view assignments" ON public.onboarding_assignments
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(),'admin'::app_role)
    OR public.is_direct_manager(auth.uid(), user_id)
  );
CREATE POLICY "Admin or manager create assignments" ON public.onboarding_assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'manager'::app_role))
  );
CREATE POLICY "Admin or creator update assignments" ON public.onboarding_assignments
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admin delete assignments" ON public.onboarding_assignments
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_onboarding_assignments_updated
  BEFORE UPDATE ON public.onboarding_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.onboarding_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.onboarding_assignments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, skipped
  completed_at TIMESTAMPTZ,
  assignee_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manager admin view tasks" ON public.onboarding_tasks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.onboarding_assignments a
      WHERE a.id = assignment_id
        AND (
          a.user_id = auth.uid()
          OR public.has_role(auth.uid(),'admin'::app_role)
          OR public.is_direct_manager(auth.uid(), a.user_id)
        )
    )
  );
CREATE POLICY "Admin or manager create tasks" ON public.onboarding_tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'manager'::app_role)
  );
CREATE POLICY "Owner manager admin update tasks" ON public.onboarding_tasks
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.onboarding_assignments a
      WHERE a.id = assignment_id
        AND (
          a.user_id = auth.uid()
          OR public.has_role(auth.uid(),'admin'::app_role)
          OR public.is_direct_manager(auth.uid(), a.user_id)
        )
    )
  );
CREATE POLICY "Admin delete tasks" ON public.onboarding_tasks
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_onboarding_tasks_updated
  BEFORE UPDATE ON public.onboarding_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
