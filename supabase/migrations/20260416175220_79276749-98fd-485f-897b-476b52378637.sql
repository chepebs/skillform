-- =====================================================
-- PART 1: SENIORITY LEVELS
-- =====================================================

CREATE TYPE public.seniority_type AS ENUM (
  'junior', 'mid', 'senior', 'director', 'vp', 'c-level'
);

ALTER TABLE public.profiles
ADD COLUMN seniority_level public.seniority_type NOT NULL DEFAULT 'mid';

CREATE INDEX idx_profiles_seniority ON public.profiles(seniority_level);

-- =====================================================
-- PART 2: ACCESS HELPER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.can_access_services(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'master_admin'::app_role)
    OR public.has_role(_user_id, 'department_director'::app_role)
    OR public.has_role(_user_id, 'organizer_admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = _user_id
        AND seniority_level IN ('director','vp','c-level')
    )
$$;

-- =====================================================
-- PART 3: SERVICE CATEGORIES
-- =====================================================

CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES public.service_categories(id) ON DELETE CASCADE,
  level integer NOT NULL CHECK (level IN (1,2)),
  description text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_service_categories_parent ON public.service_categories(parent_id);
CREATE INDEX idx_service_categories_level ON public.service_categories(level);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view service categories"
ON public.service_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Master admin can manage service categories"
ON public.service_categories FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master_admin'::app_role));

-- =====================================================
-- PART 4: SERVICE CATALOG
-- =====================================================

CREATE TABLE public.service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.service_categories(id),
  subcategory_id uuid REFERENCES public.service_categories(id),
  typical_skills text[],
  description text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_service_catalog_category ON public.service_catalog(category_id);
CREATE INDEX idx_service_catalog_subcategory ON public.service_catalog(subcategory_id);
CREATE INDEX idx_service_catalog_active ON public.service_catalog(is_active);

ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view service catalog"
ON public.service_catalog FOR SELECT TO authenticated USING (true);

CREATE POLICY "Master admin can manage service catalog"
ON public.service_catalog FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'master_admin'::app_role));

-- Seed categories + catalog
DO $$
DECLARE
  prod_id uuid; mkt_id uuid; strat_id uuid;
  av_id uuid; dp_id uuid; sf_id uuid; gd_id uuid; wd_id uuid;
  inf_id uuid; sm_id uuid; cc_id uuid; cm_id uuid;
  bs_id uuid; mr_id uuid; ic_id uuid;
BEGIN
  INSERT INTO public.service_categories (name, level, sort_order) VALUES ('Production Services', 1, 1) RETURNING id INTO prod_id;
  INSERT INTO public.service_categories (name, level, sort_order) VALUES ('Marketing Services', 1, 2) RETURNING id INTO mkt_id;
  INSERT INTO public.service_categories (name, level, sort_order) VALUES ('Strategic Services', 1, 3) RETURNING id INTO strat_id;

  INSERT INTO public.service_categories (name, parent_id, level, sort_order) VALUES ('Audiovisual Production', prod_id, 2, 1) RETURNING id INTO av_id;
  INSERT INTO public.service_categories (name, parent_id, level, sort_order) VALUES ('Digital Production', prod_id, 2, 2) RETURNING id INTO dp_id;
  INSERT INTO public.service_categories (name, parent_id, level, sort_order) VALUES ('Short Form Content', prod_id, 2, 3) RETURNING id INTO sf_id;
  INSERT INTO public.service_categories (name, parent_id, level, sort_order) VALUES ('Graphic Design', prod_id, 2, 4) RETURNING id INTO gd_id;
  INSERT INTO public.service_categories (name, parent_id, level, sort_order) VALUES ('Web & Digital', prod_id, 2, 5) RETURNING id INTO wd_id;

  INSERT INTO public.service_categories (name, parent_id, level, sort_order) VALUES ('Influencer Marketing', mkt_id, 2, 1) RETURNING id INTO inf_id;
  INSERT INTO public.service_categories (name, parent_id, level, sort_order) VALUES ('Social Media Management', mkt_id, 2, 2) RETURNING id INTO sm_id;
  INSERT INTO public.service_categories (name, parent_id, level, sort_order) VALUES ('Content Creation', mkt_id, 2, 3) RETURNING id INTO cc_id;
  INSERT INTO public.service_categories (name, parent_id, level, sort_order) VALUES ('Campaign Management', mkt_id, 2, 4) RETURNING id INTO cm_id;

  INSERT INTO public.service_categories (name, parent_id, level, sort_order) VALUES ('Brand Strategy', strat_id, 2, 1) RETURNING id INTO bs_id;
  INSERT INTO public.service_categories (name, parent_id, level, sort_order) VALUES ('Market Research', strat_id, 2, 2) RETURNING id INTO mr_id;
  INSERT INTO public.service_categories (name, parent_id, level, sort_order) VALUES ('Innovation Consulting', strat_id, 2, 3) RETURNING id INTO ic_id;

  INSERT INTO public.service_catalog (service_name, category_id, subcategory_id, typical_skills, description, sort_order) VALUES
    ('Video Production', prod_id, av_id, ARRAY['Video Editing','Videography','Directing'], 'Full-service video production from concept to delivery', 1),
    ('Photography', prod_id, av_id, ARRAY['Photography','Photo Editing','Art Direction'], 'Commercial photography and photo editing services', 2),
    ('Animation', prod_id, av_id, ARRAY['Animation','After Effects','Motion Graphics'], '2D animation and motion graphics', 3),
    ('Motion Graphics', prod_id, av_id, ARRAY['Motion Graphics','After Effects','Cinema 4D'], 'Motion design and animated graphics', 4),
    ('3D Modeling & Animation', prod_id, dp_id, ARRAY['3D Modeling','Cinema 4D','Blender','3D Animation'], '3D modeling, rendering, and animation', 5),
    ('AR/VR Experiences', prod_id, dp_id, ARRAY['AR Development','VR Development','Unity','Unreal Engine'], 'Augmented and virtual reality experiences', 6),
    ('Interactive Content', prod_id, dp_id, ARRAY['Interactive Design','JavaScript','WebGL'], 'Interactive digital experiences and installations', 7),
    ('Social Media Videos', prod_id, sf_id, ARRAY['Video Editing','Social Media Strategy','Short Form Content'], 'Short-form video content for social platforms', 8),
    ('Reels/TikTok/Stories', prod_id, sf_id, ARRAY['Mobile Video Production','TikTok','Instagram Reels'], 'Vertical video content for social media', 9),
    ('GIFs & Memes', prod_id, sf_id, ARRAY['GIF Creation','Photoshop','After Effects'], 'Animated GIFs and meme content', 10),
    ('Brand Identity Design', prod_id, gd_id, ARRAY['Brand Identity','Logo Design','Brand Strategy'], 'Complete brand identity systems', 11),
    ('Print Design', prod_id, gd_id, ARRAY['Print Design','Adobe InDesign','Typography'], 'Print materials and collateral design', 12),
    ('Packaging Design', prod_id, gd_id, ARRAY['Packaging Design','Product Design','3D Rendering'], 'Product packaging and structural design', 13),
    ('Web Development', prod_id, wd_id, ARRAY['Web Development','React','JavaScript','HTML/CSS'], 'Custom website development', 14),
    ('UI/UX Design', prod_id, wd_id, ARRAY['UI Design','UX Design','Figma','User Research'], 'User interface and experience design', 15),
    ('App Development', prod_id, wd_id, ARRAY['Mobile Development','iOS Development','Android Development'], 'Native and hybrid mobile app development', 16),
    ('Influencer Campaign Management', mkt_id, inf_id, ARRAY['Influencer Marketing','Campaign Management','Social Media'], 'End-to-end influencer campaign execution', 17),
    ('Influencer Sourcing & Vetting', mkt_id, inf_id, ARRAY['Influencer Marketing','Talent Scouting','Contract Negotiation'], 'Identifying and contracting with influencers', 18),
    ('Content Collaboration', mkt_id, inf_id, ARRAY['Influencer Marketing','Content Creation','Brand Partnerships'], 'Co-creating content with influencers', 19),
    ('Social Media Strategy', mkt_id, sm_id, ARRAY['Social Media Strategy','Digital Strategy','Content Strategy'], 'Strategic social media planning and execution', 20),
    ('Community Management', mkt_id, sm_id, ARRAY['Community Management','Social Media','Customer Service'], 'Social media community engagement and moderation', 21),
    ('Paid Social Advertising', mkt_id, sm_id, ARRAY['Facebook Ads','Instagram Ads','TikTok Ads','Media Buying'], 'Paid social media campaign management', 22),
    ('Copywriting', mkt_id, cc_id, ARRAY['Copywriting','Content Writing','Creative Writing'], 'Brand copywriting and content creation', 23),
    ('Blog & Article Writing', mkt_id, cc_id, ARRAY['Content Writing','SEO Writing','Editorial'], 'Long-form content and editorial', 24),
    ('Script Writing', mkt_id, cc_id, ARRAY['Scriptwriting','Storytelling','Video Content'], 'Video and audio script development', 25),
    ('Brand Positioning', strat_id, bs_id, ARRAY['Brand Strategy','Market Research','Competitive Analysis'], 'Strategic brand positioning and architecture', 26),
    ('Brand Refresh', strat_id, bs_id, ARRAY['Brand Strategy','Brand Identity','Rebranding'], 'Brand evolution and modernization', 27),
    ('Consumer Insights', strat_id, mr_id, ARRAY['Market Research','Consumer Insights','Data Analysis'], 'Consumer research and insights generation', 28),
    ('Competitive Analysis', strat_id, mr_id, ARRAY['Competitive Analysis','Market Research','Strategic Planning'], 'Competitive landscape analysis', 29);
END $$;

-- =====================================================
-- PART 5: SERVICES
-- =====================================================

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_catalog_id uuid REFERENCES public.service_catalog(id) NOT NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  agency_id uuid REFERENCES public.agencies(id),
  managed_by uuid,
  projects_per_month numeric(10,2),
  projects_per_year integer,
  external_budget_monthly numeric(12,2) DEFAULT 0,
  external_budget_annual numeric(12,2) DEFAULT 0,
  description text,
  typical_duration_days integer,
  typical_duration_hours numeric(6,2),
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  CONSTRAINT valid_volume CHECK (
    (projects_per_month IS NOT NULL AND projects_per_month > 0)
    OR (projects_per_year IS NOT NULL AND projects_per_year > 0)
  )
);

CREATE INDEX idx_services_catalog ON public.services(service_catalog_id);
CREATE INDEX idx_services_department ON public.services(department_id);
CREATE INDEX idx_services_agency ON public.services(agency_id);
CREATE INDEX idx_services_managed_by ON public.services(managed_by);
CREATE INDEX idx_services_active ON public.services(is_active);

CREATE TRIGGER trg_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Now safe to create can_edit_service since services exists
CREATE OR REPLACE FUNCTION public.can_edit_service(_user_id uuid, _service_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'master_admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = _service_id AND s.managed_by = _user_id
    )
$$;

CREATE POLICY "Directors+ can view services"
ON public.services FOR SELECT TO authenticated
USING (public.can_access_services(auth.uid()));

CREATE POLICY "Directors+ can create services"
ON public.services FOR INSERT TO authenticated
WITH CHECK (public.can_access_services(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Manager or master admin can update services"
ON public.services FOR UPDATE TO authenticated
USING (managed_by = auth.uid() OR public.has_role(auth.uid(),'master_admin'::app_role));

CREATE POLICY "Manager or master admin can delete services"
ON public.services FOR DELETE TO authenticated
USING (managed_by = auth.uid() OR public.has_role(auth.uid(),'master_admin'::app_role));

-- =====================================================
-- PART 6: SERVICE VENDORS
-- =====================================================

CREATE TABLE public.service_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  vendor_name text NOT NULL,
  vendor_type text,
  projects_per_year integer,
  average_project_cost numeric(10,2),
  contact_info jsonb,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_service_vendors_service ON public.service_vendors(service_id);
CREATE INDEX idx_service_vendors_active ON public.service_vendors(is_active);

ALTER TABLE public.service_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Directors+ can view vendors"
ON public.service_vendors FOR SELECT TO authenticated
USING (public.can_access_services(auth.uid()));

CREATE POLICY "Service editor can manage vendors"
ON public.service_vendors FOR ALL TO authenticated
USING (public.can_edit_service(auth.uid(), service_id))
WITH CHECK (public.can_edit_service(auth.uid(), service_id));

-- =====================================================
-- PART 7: SERVICE SKILLS
-- =====================================================

CREATE TABLE public.service_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  importance_level text DEFAULT 'required',
  min_proficiency integer DEFAULT 70,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_importance CHECK (importance_level IN ('required','preferred','nice-to-have')),
  CONSTRAINT valid_proficiency CHECK (min_proficiency BETWEEN 0 AND 100)
);

CREATE INDEX idx_service_skills_service ON public.service_skills(service_id);
CREATE INDEX idx_service_skills_skill_name ON public.service_skills(skill_name);

ALTER TABLE public.service_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Directors+ can view service skills"
ON public.service_skills FOR SELECT TO authenticated
USING (public.can_access_services(auth.uid()));

CREATE POLICY "Service editor can manage skills"
ON public.service_skills FOR ALL TO authenticated
USING (public.can_edit_service(auth.uid(), service_id))
WITH CHECK (public.can_edit_service(auth.uid(), service_id));

-- =====================================================
-- PART 8: SERVICE TALENT MATCHES
-- =====================================================

CREATE TABLE public.service_talent_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  match_score numeric(5,2) DEFAULT 0,
  matched_skills text[],
  auto_matched boolean DEFAULT true,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(service_id, user_id),
  CONSTRAINT valid_match_score CHECK (match_score BETWEEN 0 AND 100)
);

CREATE INDEX idx_stm_service ON public.service_talent_matches(service_id);
CREATE INDEX idx_stm_user ON public.service_talent_matches(user_id);
CREATE INDEX idx_stm_score ON public.service_talent_matches(match_score DESC);

ALTER TABLE public.service_talent_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches"
ON public.service_talent_matches FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.can_access_services(auth.uid()));

CREATE POLICY "Service editor can manage talent matches"
ON public.service_talent_matches FOR ALL TO authenticated
USING (public.can_edit_service(auth.uid(), service_id) OR public.has_role(auth.uid(),'organizer_admin'::app_role))
WITH CHECK (public.can_edit_service(auth.uid(), service_id) OR public.has_role(auth.uid(),'organizer_admin'::app_role));