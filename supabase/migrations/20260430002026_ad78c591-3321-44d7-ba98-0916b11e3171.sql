
-- ============================================================
-- PASS 0: Shared foundations
-- ============================================================

-- Profile additions for HR features
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS manager_id uuid;

CREATE INDEX IF NOT EXISTS idx_profiles_manager_id ON public.profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_profiles_birth_date ON public.profiles(birth_date);
CREATE INDEX IF NOT EXISTS idx_profiles_start_date ON public.profiles(start_date);

-- Helper: check if a user is the direct manager of another
CREATE OR REPLACE FUNCTION public.is_direct_manager(_manager_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND manager_id = _manager_id
  )
$$;

-- Generic attachments (polymorphic)
CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid NOT NULL,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_attachments_entity ON public.attachments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_attachments_company ON public.attachments(company_id);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments in their company"
  ON public.attachments FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can upload attachments"
  ON public.attachments FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Owner or admin can delete attachments"
  ON public.attachments FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

-- Generic comments (polymorphic)
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  user_id uuid NOT NULL,
  body text NOT NULL,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments in their company"
  ON public.comments FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Owner or admin can delete comments"
  ON public.comments FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
  VALUES ('hr-documents', 'hr-documents', false)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public)
  VALUES ('policies', 'policies', false)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public)
  VALUES ('event-images', 'event-images', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies for event-images (public bucket, authenticated upload)
CREATE POLICY "Event images are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated can upload event images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Manager+ can update event images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'event-images' AND (public.has_role(auth.uid(), 'manager'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Manager+ can delete event images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'event-images' AND (public.has_role(auth.uid(), 'manager'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role)));

-- ============================================================
-- PASS 1: People & culture
-- ============================================================

-- Kudos
CREATE TABLE IF NOT EXISTS public.kudos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  message text NOT NULL,
  value_tag text,
  visibility text NOT NULL DEFAULT 'public',
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kudos_to ON public.kudos(to_user_id);
CREATE INDEX IF NOT EXISTS idx_kudos_from ON public.kudos(from_user_id);
CREATE INDEX IF NOT EXISTS idx_kudos_company_created ON public.kudos(company_id, created_at DESC);

ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view public kudos"
  ON public.kudos FOR SELECT TO authenticated
  USING (
    (company_id = public.get_user_company(auth.uid()) AND visibility = 'public')
    OR from_user_id = auth.uid()
    OR to_user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can give kudos"
  ON public.kudos FOR INSERT TO authenticated
  WITH CHECK (from_user_id = auth.uid() AND from_user_id <> to_user_id);

CREATE POLICY "Sender or admin can delete kudos"
  ON public.kudos FOR DELETE TO authenticated
  USING (from_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text,
  is_virtual boolean NOT NULL DEFAULT false,
  meeting_url text,
  cover_image_url text,
  visibility text NOT NULL DEFAULT 'company',
  department_id uuid,
  created_by uuid NOT NULL,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_company_starts ON public.events(company_id, starts_at);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view events"
  ON public.events FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Manager+ can create events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (public.has_role(auth.uid(), 'manager'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Creator or admin can update events"
  ON public.events FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Creator or admin can delete events"
  ON public.events FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Event RSVPs
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'going',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON public.event_rsvps(event_id);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view RSVPs"
  ON public.event_rsvps FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can RSVP for themselves"
  ON public.event_rsvps FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own RSVP"
  ON public.event_rsvps FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can remove own RSVP"
  ON public.event_rsvps FOR DELETE TO authenticated
  USING (user_id = auth.uid());
