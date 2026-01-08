import { z } from 'zod';

// Validation Schemas
export const basicInfoSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required').regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format'),
  avatar_url: z.string().optional(),
});

export const previousPositionSchema = z.object({
  id: z.string().optional(),
  position_title: z.string().min(1, 'Position title is required'),
  company: z.string().min(1, 'Company is required'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) > new Date(data.start_date);
  }
  return true;
}, { message: 'End date must be after start date', path: ['end_date'] });

export const professionalInfoSchema = z.object({
  country_id: z.string().min(1, 'Country is required'),
  agency_id: z.string().optional(),
  department_id: z.string().optional(),
  current_position: z.string().min(1, 'Current position is required'),
  previous_positions: z.array(previousPositionSchema).max(10),
});

export const previousAgencySchema = z.object({
  id: z.string().optional(),
  agency_name: z.string().min(1, 'Agency name is required'),
  role: z.string().min(1, 'Role is required'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export const educationSchema = z.object({
  academic_degree: z.string().min(1, 'Academic degree is required'),
  years_of_experience: z.number().min(0).max(50),
  previous_agencies: z.array(previousAgencySchema),
});

export const performanceSchema = z.object({
  pitches_won: z.number().min(0),
  pitches_participated: z.number().min(0),
  brand_creations: z.number().min(0),
  brand_refreshes: z.number().min(0),
  effie_awards_won: z.number().min(0),
  effie_awards_participated: z.number().min(0),
});

export const brandSchema = z.object({
  id: z.string().optional(),
  brand_name: z.string().min(1, 'Brand name is required'),
  description: z.string().optional(),
  years_managed: z.number().min(0).optional(),
});

export const projectSchema = z.object({
  id: z.string().optional(),
  project_name: z.string().min(1, 'Project name is required'),
  brand: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  project_year: z.number().optional(),
  project_month: z.number().min(1).max(12).optional(),
  role_in_project: z.string().optional(),
  key_results: z.string().optional(),
});

export const brandsProjectsSchema = z.object({
  brands_managed: z.array(brandSchema),
  recent_projects: z.array(projectSchema).min(1, 'At least one project is required'),
});

export const languageSchema = z.object({
  id: z.string().optional(),
  language: z.string().min(1, 'Language is required'),
  speaking_level: z.number().min(0).max(100),
  reading_level: z.number().min(0).max(100),
  writing_level: z.number().min(0).max(100),
  is_native: z.boolean(),
});

export const languagesSchema = z.object({
  languages: z.array(languageSchema).min(1, 'At least one language is required'),
});

export const awardSchema = z.object({
  id: z.string().optional(),
  award_name: z.string().min(1, 'Award name is required'),
  award_type: z.string().optional(),
  category: z.string().optional(),
  award_year: z.number().min(1990).max(2025).optional(),
  won: z.boolean(),
  description: z.string().optional(),
});

export const awardsSchema = z.object({
  awards: z.array(awardSchema),
  consulting_work: z.string().optional(),
});

// Types
export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type PreviousPosition = z.infer<typeof previousPositionSchema>;
export type ProfessionalInfoData = z.infer<typeof professionalInfoSchema>;
export type PreviousAgency = z.infer<typeof previousAgencySchema>;
export type EducationData = z.infer<typeof educationSchema>;
export type PerformanceData = z.infer<typeof performanceSchema>;
export type Brand = z.infer<typeof brandSchema>;
export type Project = z.infer<typeof projectSchema>;
export type BrandsProjectsData = z.infer<typeof brandsProjectsSchema>;
export type Language = z.infer<typeof languageSchema>;
export type LanguagesData = z.infer<typeof languagesSchema>;
export type Award = z.infer<typeof awardSchema>;
export type AwardsData = z.infer<typeof awardsSchema>;

export interface ProfileFormData {
  basicInfo: BasicInfoData;
  professionalInfo: ProfessionalInfoData;
  education: EducationData;
  performance: PerformanceData;
  brandsProjects: BrandsProjectsData;
  languages: LanguagesData;
  awards: AwardsData;
}

export const LANGUAGES_OPTIONS = [
  'English', 'Spanish', 'Portuguese', 'French', 'German', 
  'Italian', 'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Other'
];

export const AWARD_TYPES = [
  'Effie', 'Cannes Lions', 'El Ojo', 'Clio Awards', 
  'One Show', 'D&AD', 'Webby Awards', 'Other'
];

export const YEARS = Array.from({ length: 3 }, (_, i) => 2025 - i);
export const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
