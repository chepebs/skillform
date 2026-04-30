
-- ============================================================
-- Document folders
-- ============================================================
CREATE TABLE IF NOT EXISTS public.document_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES public.document_folders(id) ON DELETE CASCADE,
  company_id uuid NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_document_folders_company ON public.document_folders(company_id);
CREATE INDEX IF NOT EXISTS idx_document_folders_parent ON public.document_folders(parent_id);

ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view folders"
  ON public.document_folders FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manager+ can create folders"
  ON public.document_folders FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (public.has_role(auth.uid(), 'manager'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Creator or admin can update folders"
  ON public.document_folders FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Creator or admin can delete folders"
  ON public.document_folders FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- Documents
-- ============================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  folder_id uuid REFERENCES public.document_folders(id) ON DELETE SET NULL,
  owner_id uuid NOT NULL,
  uploaded_by uuid NOT NULL,
  visibility text NOT NULL DEFAULT 'personal' CHECK (visibility IN ('personal', 'department', 'company')),
  department text,
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_documents_owner ON public.documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON public.documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_company ON public.documents(company_id);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- View: owner, admin, manager-of-owner, department peer (for dept), or anyone in company (for company)
CREATE POLICY "Documents visibility rules"
  ON public.documents FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR (
      visibility = 'personal'
      AND public.is_direct_manager(auth.uid(), owner_id)
    )
    OR (
      visibility = 'department'
      AND company_id = public.get_user_company(auth.uid())
      AND department IS NOT NULL
      AND department = (SELECT p.department FROM public.profiles p WHERE p.user_id = auth.uid())
    )
    OR (
      visibility = 'company'
      AND company_id = public.get_user_company(auth.uid())
    )
  );

-- Insert: anyone for themselves; managers can upload personal docs for direct reports; admins anywhere
CREATE POLICY "Documents insert rules"
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND (
      owner_id = auth.uid()
      OR public.has_role(auth.uid(), 'admin'::app_role)
      OR (
        public.has_role(auth.uid(), 'manager'::app_role)
        AND public.is_direct_manager(auth.uid(), owner_id)
      )
    )
  );

CREATE POLICY "Owner uploader or admin can update documents"
  ON public.documents FOR UPDATE TO authenticated
  USING (
    owner_id = auth.uid()
    OR uploaded_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Owner uploader or admin can delete documents"
  ON public.documents FOR DELETE TO authenticated
  USING (
    owner_id = auth.uid()
    OR uploaded_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Policies
-- ============================================================
CREATE TABLE IF NOT EXISTS public.policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  body_md text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  effective_from date,
  requires_acknowledgement boolean NOT NULL DEFAULT true,
  company_id uuid NOT NULL,
  created_by uuid NOT NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_policies_company_status ON public.policies(company_id, status);

ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view published policies"
  ON public.policies FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (status = 'published' AND company_id = public.get_user_company(auth.uid()))
  );

CREATE POLICY "Admin can create policies"
  ON public.policies FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update policies"
  ON public.policies FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete policies"
  ON public.policies FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_policies_updated_at
  BEFORE UPDATE ON public.policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Policy acknowledgements
-- ============================================================
CREATE TABLE IF NOT EXISTS public.policy_acknowledgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  policy_version integer NOT NULL,
  acknowledged_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (policy_id, user_id, policy_version)
);
CREATE INDEX IF NOT EXISTS idx_policy_ack_policy ON public.policy_acknowledgements(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_ack_user ON public.policy_acknowledgements(user_id);

ALTER TABLE public.policy_acknowledgements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own acknowledgements; admin sees all"
  ON public.policy_acknowledgements FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can acknowledge for themselves"
  ON public.policy_acknowledgements FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Storage policies for hr-documents and policies buckets
-- File path convention:
--   hr-documents/{owner_user_id}/{document_id}/{filename}
--   policies/{policy_id}/{filename}
-- ============================================================

-- hr-documents: read if you can read the matching public.documents row
CREATE POLICY "HR docs read via documents RLS"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'hr-documents'
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_path = storage.objects.name
    )
  );

CREATE POLICY "HR docs upload by authenticated"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'hr-documents');

CREATE POLICY "HR docs update by uploader or admin"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'hr-documents'
    AND (
      owner = auth.uid()
      OR public.has_role(auth.uid(), 'admin'::app_role)
    )
  );

CREATE POLICY "HR docs delete by uploader or admin"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'hr-documents'
    AND (
      owner = auth.uid()
      OR public.has_role(auth.uid(), 'admin'::app_role)
    )
  );

-- policies bucket: any authenticated company member can read; only admins can write
CREATE POLICY "Policy files readable by authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'policies');

CREATE POLICY "Admin can upload policy files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'policies' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update policy files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'policies' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete policy files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'policies' AND public.has_role(auth.uid(), 'admin'::app_role));
