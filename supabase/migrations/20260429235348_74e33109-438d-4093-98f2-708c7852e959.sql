-- Add departments management capabilities
ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Unique department names (case-insensitive) at platform level
CREATE UNIQUE INDEX IF NOT EXISTS departments_name_lower_idx ON public.departments (lower(name));

-- INSERT/DELETE policies for admins
DROP POLICY IF EXISTS "Admin can insert departments" ON public.departments;
CREATE POLICY "Admin can insert departments"
ON public.departments
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin can delete departments" ON public.departments;
CREATE POLICY "Admin can delete departments"
ON public.departments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed standard advertising/marketing agency departments
INSERT INTO public.departments (name, description, sort_order)
VALUES
  ('Account Management', 'Client relationships and account servicing', 10),
  ('Strategy & Planning', 'Brand strategy, planning and insights', 20),
  ('Creative', 'Art direction, copywriting and design', 30),
  ('Production', 'Content production, video and post-production', 40),
  ('Media', 'Media planning, buying and analytics', 50),
  ('Digital & Performance', 'Digital marketing, paid media and performance', 60),
  ('Social Media', 'Social content, community management and influencers', 70),
  ('Public Relations', 'PR, communications and reputation', 80),
  ('Data & Analytics', 'Analytics, measurement and data science', 90),
  ('Technology', 'Web, development and martech', 100),
  ('Operations', 'Project management, traffic and operations', 110),
  ('Finance', 'Finance, billing and procurement', 120),
  ('People & Culture', 'HR, talent and culture', 130),
  ('Business Development', 'New business, pitches and growth', 140)
ON CONFLICT (lower(name)) DO NOTHING;
