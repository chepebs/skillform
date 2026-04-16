-- Add missing columns to service_talent_matches
ALTER TABLE public.service_talent_matches
  ADD COLUMN IF NOT EXISTS skill_breakdown jsonb,
  ADD COLUMN IF NOT EXISTS manually_added boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_service_talent_matches_active
  ON public.service_talent_matches(is_active) WHERE is_active = true;

-- Enable pg_cron and pg_net extensions for scheduled matching
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;