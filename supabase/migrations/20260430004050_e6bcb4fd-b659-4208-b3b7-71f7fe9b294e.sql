
-- =============================================
-- SURVEYS
-- =============================================

CREATE TABLE public.surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, open, closed
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  target_scope TEXT NOT NULL DEFAULT 'company', -- company, department
  department TEXT,
  opens_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members view open or own surveys" ON public.surveys
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin'::app_role)
    OR created_by = auth.uid()
    OR (
      company_id = public.get_user_company(auth.uid())
      AND status IN ('open','closed')
      AND (
        target_scope = 'company'
        OR (target_scope = 'department' AND department IS NOT NULL
            AND department = (SELECT p.department FROM public.profiles p WHERE p.user_id = auth.uid()))
      )
    )
  );
CREATE POLICY "Manager+ can create surveys" ON public.surveys
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (public.has_role(auth.uid(),'manager'::app_role) OR public.has_role(auth.uid(),'admin'::app_role))
  );
CREATE POLICY "Creator or admin update surveys" ON public.surveys
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Creator or admin delete surveys" ON public.surveys
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_surveys_updated
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.survey_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text', -- text, single_choice, multi_choice, rating, yes_no
  options JSONB,
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Survey questions visible if survey visible" ON public.survey_questions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys s WHERE s.id = survey_id AND (
        public.has_role(auth.uid(),'admin'::app_role)
        OR s.created_by = auth.uid()
        OR (s.company_id = public.get_user_company(auth.uid()) AND s.status IN ('open','closed'))
      )
    )
  );
CREATE POLICY "Survey owner manages questions" ON public.survey_questions
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.surveys s WHERE s.id = survey_id AND (s.created_by = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role)))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.surveys s WHERE s.id = survey_id AND (s.created_by = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role)))
  );

CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  respondent_id UUID, -- nullable for anonymous
  company_id UUID,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Respondent or survey owner sees responses" ON public.survey_responses
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin'::app_role)
    OR respondent_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.surveys s WHERE s.id = survey_id AND s.created_by = auth.uid())
  );
CREATE POLICY "Users submit own responses; anonymous allowed" ON public.survey_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.surveys s
      WHERE s.id = survey_id
        AND s.status = 'open'
        AND s.company_id = public.get_user_company(auth.uid())
        AND (
          (s.is_anonymous = true AND respondent_id IS NULL)
          OR (s.is_anonymous = false AND respondent_id = auth.uid())
        )
    )
  );

CREATE TABLE public.survey_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.survey_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Answers visible to response viewer" ON public.survey_answers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.survey_responses r
      WHERE r.id = response_id AND (
        public.has_role(auth.uid(),'admin'::app_role)
        OR r.respondent_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.surveys s WHERE s.id = r.survey_id AND s.created_by = auth.uid())
      )
    )
  );
CREATE POLICY "Insert answers when inserting own response" ON public.survey_answers
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.survey_responses r
      JOIN public.surveys s ON s.id = r.survey_id
      WHERE r.id = response_id
        AND s.status = 'open'
        AND s.company_id = public.get_user_company(auth.uid())
        AND (
          (s.is_anonymous = true AND r.respondent_id IS NULL)
          OR (s.is_anonymous = false AND r.respondent_id = auth.uid())
        )
    )
  );

CREATE INDEX idx_survey_questions_survey ON public.survey_questions(survey_id);
CREATE INDEX idx_survey_responses_survey ON public.survey_responses(survey_id);
CREATE INDEX idx_survey_answers_response ON public.survey_answers(response_id);

-- =============================================
-- ANNOUNCEMENTS
-- =============================================

CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'company', -- company, department
  department TEXT,
  pinned BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members view scoped announcements" ON public.announcements
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin'::app_role)
    OR created_by = auth.uid()
    OR (
      company_id = public.get_user_company(auth.uid())
      AND (
        scope = 'company'
        OR (scope = 'department' AND department IS NOT NULL
            AND department = (SELECT p.department FROM public.profiles p WHERE p.user_id = auth.uid()))
      )
    )
  );
CREATE POLICY "Manager+ create announcements" ON public.announcements
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (public.has_role(auth.uid(),'manager'::app_role) OR public.has_role(auth.uid(),'admin'::app_role))
  );
CREATE POLICY "Creator or admin update announcements" ON public.announcements
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Creator or admin delete announcements" ON public.announcements
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_announcements_updated
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.announcement_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner views own reads; admin or post creator views all" ON public.announcement_reads
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(),'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.announcements a WHERE a.id = announcement_id AND a.created_by = auth.uid())
  );
CREATE POLICY "Users record own reads" ON public.announcement_reads
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- SHARED FILES
-- =============================================

CREATE TABLE public.shared_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  scope TEXT NOT NULL DEFAULT 'company', -- company, department
  department TEXT,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shared_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view files scoped to them" ON public.shared_files
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin'::app_role)
    OR (
      company_id = public.get_user_company(auth.uid())
      AND (
        scope = 'company'
        OR (scope = 'department' AND department IS NOT NULL
            AND department = (SELECT p.department FROM public.profiles p WHERE p.user_id = auth.uid()))
      )
    )
  );
CREATE POLICY "Manager+ uploads files" ON public.shared_files
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND (public.has_role(auth.uid(),'manager'::app_role) OR public.has_role(auth.uid(),'admin'::app_role))
  );
CREATE POLICY "Uploader or admin updates files" ON public.shared_files
  FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Uploader or admin deletes files" ON public.shared_files
  FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('company-files','company-files',false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated read company-files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'company-files');
CREATE POLICY "Manager+ upload to company-files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'company-files'
    AND (public.has_role(auth.uid(),'manager'::app_role) OR public.has_role(auth.uid(),'admin'::app_role))
  );
CREATE POLICY "Manager+ delete in company-files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'company-files'
    AND (public.has_role(auth.uid(),'manager'::app_role) OR public.has_role(auth.uid(),'admin'::app_role))
  );
