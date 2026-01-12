-- Add missing columns to agencies table
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Add unique constraint on name if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'agencies_name_key'
  ) THEN
    ALTER TABLE public.agencies ADD CONSTRAINT agencies_name_key UNIQUE (name);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agencies_active ON public.agencies(is_active);
CREATE INDEX IF NOT EXISTS idx_agencies_sort ON public.agencies(sort_order);

-- Insert all agencies
INSERT INTO public.agencies (name, is_active, sort_order) VALUES
  ('Grupo Garnier', true, 1),
  ('Garnier BBDO', true, 2),
  ('OMD', true, 3),
  ('PHD', true, 4),
  ('House Dentsu', true, 5),
  ('CAC/Porter Novelli', true, 6),
  ('Shift PR', true, 7),
  ('Garnier Chile', true, 8),
  ('Garnier Miami', true, 9),
  ('Garnier Peru', true, 10),
  ('Garnier Colombia', true, 11),
  ('Garnier Ecuador', true, 12),
  ('Garnier Costa Rica', true, 13),
  ('Kaiju', true, 14),
  ('Loymark', true, 15),
  ('Ignite', true, 16),
  ('Riot/TBWA', true, 17),
  ('Carat', true, 18),
  ('Boombit', true, 19),
  ('Assembly', true, 20),
  ('Alison+Partners', true, 21),
  ('Astro', true, 22)
ON CONFLICT (name) DO UPDATE SET 
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- Update existing RLS policy to allow viewing active agencies
DROP POLICY IF EXISTS "Anyone can view agencies" ON public.agencies;
DROP POLICY IF EXISTS "Authenticated users can view agencies" ON public.agencies;

CREATE POLICY "Authenticated users can view active agencies"
ON public.agencies
FOR SELECT
TO authenticated
USING (is_active = true);

-- Allow master admin to manage agencies
DROP POLICY IF EXISTS "Master admin can manage agencies" ON public.agencies;
CREATE POLICY "Master admin can manage agencies"
ON public.agencies
FOR ALL
USING (public.has_role(auth.uid(), 'master_admin'));

-- Create industries table
CREATE TABLE IF NOT EXISTS public.industries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on industries
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;

-- RLS policies for industries
CREATE POLICY "Authenticated users can view industries"
ON public.industries
FOR SELECT
TO authenticated
USING (true);

-- Insert industries
INSERT INTO public.industries (name, sort_order) VALUES
  ('Finance', 1),
  ('Retail', 2),
  ('Healthcare', 3),
  ('Pharma', 4),
  ('B2B', 5),
  ('DTC', 6),
  ('Automotive', 7),
  ('Education', 8),
  ('Travel & Hospitality', 9),
  ('Food and Beverage', 10),
  ('Beer and Liquor', 11),
  ('Real Estate', 12),
  ('Tech', 13),
  ('Non-Profit', 14),
  ('Political', 15)
ON CONFLICT (name) DO NOTHING;

-- Create employee_industries junction table
CREATE TABLE IF NOT EXISTS public.employee_industries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  industry_id uuid NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
  years_experience integer DEFAULT 0 CHECK (years_experience >= 0),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, industry_id)
);

-- Enable RLS on employee_industries
ALTER TABLE public.employee_industries ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employee_industries_user ON public.employee_industries(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_industries_industry ON public.employee_industries(industry_id);

-- RLS policies for employee_industries
CREATE POLICY "Users can view own industries"
ON public.employee_industries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own industries"
ON public.employee_industries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own industries"
ON public.employee_industries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own industries"
ON public.employee_industries
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all industries
CREATE POLICY "Admins can view all employee industries"
ON public.employee_industries
FOR SELECT
USING (
  public.has_role(auth.uid(), 'master_admin') OR 
  public.has_role(auth.uid(), 'organizer_admin')
);