
-- Create countries table
CREATE TABLE public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create agencies table
CREATE TABLE public.agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country_id uuid REFERENCES public.countries(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create previous_positions table
CREATE TABLE public.previous_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  position_title text NOT NULL,
  company text NOT NULL,
  start_date date,
  end_date date,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create previous_agencies table
CREATE TABLE public.previous_agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agency_name text NOT NULL,
  role text NOT NULL,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);

-- Create brands_managed table
CREATE TABLE public.brands_managed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_name text NOT NULL,
  description text,
  years_managed integer,
  created_at timestamptz DEFAULT now()
);

-- Create employee_languages table
CREATE TABLE public.employee_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  language text NOT NULL,
  speaking_level integer DEFAULT 0 CHECK (speaking_level >= 0 AND speaking_level <= 100),
  reading_level integer DEFAULT 0 CHECK (reading_level >= 0 AND reading_level <= 100),
  writing_level integer DEFAULT 0 CHECK (writing_level >= 0 AND writing_level <= 100),
  is_native boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create recent_projects table
CREATE TABLE public.recent_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_name text NOT NULL,
  brand text,
  description text,
  project_year integer,
  project_month integer CHECK (project_month >= 1 AND project_month <= 12),
  role_in_project text,
  key_results text,
  created_at timestamptz DEFAULT now()
);

-- Create awards table
CREATE TABLE public.awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  award_name text NOT NULL,
  award_type text,
  category text,
  award_year integer,
  won boolean DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Add additional columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS country_id uuid REFERENCES public.countries(id),
ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agencies(id),
ADD COLUMN IF NOT EXISTS current_position text,
ADD COLUMN IF NOT EXISTS academic_degree text,
ADD COLUMN IF NOT EXISTS years_of_experience integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pitches_won integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pitches_participated integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS brand_creations integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS brand_refreshes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS effie_awards_won integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS effie_awards_participated integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS consulting_work text,
ADD COLUMN IF NOT EXISTS profile_completed_at timestamptz;

-- Enable RLS on all new tables
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.previous_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.previous_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands_managed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for countries (public read)
CREATE POLICY "Anyone can view countries" ON public.countries FOR SELECT USING (true);

-- RLS Policies for agencies (public read)
CREATE POLICY "Anyone can view agencies" ON public.agencies FOR SELECT USING (true);

-- RLS Policies for previous_positions
CREATE POLICY "Users can view own positions" ON public.previous_positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own positions" ON public.previous_positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own positions" ON public.previous_positions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own positions" ON public.previous_positions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for previous_agencies
CREATE POLICY "Users can view own agencies" ON public.previous_agencies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agencies" ON public.previous_agencies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agencies" ON public.previous_agencies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agencies" ON public.previous_agencies FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for brands_managed
CREATE POLICY "Users can view own brands" ON public.brands_managed FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brands" ON public.brands_managed FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brands" ON public.brands_managed FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brands" ON public.brands_managed FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for employee_languages
CREATE POLICY "Users can view own languages" ON public.employee_languages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own languages" ON public.employee_languages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own languages" ON public.employee_languages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own languages" ON public.employee_languages FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for recent_projects
CREATE POLICY "Users can view own projects" ON public.recent_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.recent_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.recent_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.recent_projects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for awards
CREATE POLICY "Users can view own awards" ON public.awards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own awards" ON public.awards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own awards" ON public.awards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own awards" ON public.awards FOR DELETE USING (auth.uid() = user_id);

-- Insert sample countries
INSERT INTO public.countries (name, code) VALUES
  ('United States', 'US'),
  ('Mexico', 'MX'),
  ('Costa Rica', 'CR'),
  ('Panama', 'PA'),
  ('Colombia', 'CO'),
  ('Brazil', 'BR'),
  ('Argentina', 'AR'),
  ('Chile', 'CL'),
  ('Peru', 'PE'),
  ('Spain', 'ES');

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);

-- Storage policies for profile-photos bucket
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view profile photos" ON storage.objects FOR SELECT USING (
  bucket_id = 'profile-photos'
);

CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
