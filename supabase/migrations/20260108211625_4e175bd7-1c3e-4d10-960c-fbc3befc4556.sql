-- Create employee_skills table
CREATE TABLE public.employee_skills (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  skill_name varchar(100) NOT NULL,
  skill_category varchar(50) NOT NULL,
  proficiency_level integer NOT NULL CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
  years_experience integer CHECK (years_experience >= 0 AND years_experience <= 50),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

-- Enable RLS
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all skills"
ON public.employee_skills
FOR SELECT
USING (true);

CREATE POLICY "Users can insert own skills"
ON public.employee_skills
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
ON public.employee_skills
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills"
ON public.employee_skills
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_employee_skills_updated_at
BEFORE UPDATE ON public.employee_skills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();