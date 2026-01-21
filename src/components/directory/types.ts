export interface DirectoryProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  department: string | null;
  position: string | null;
  current_position: string | null;
  phone: string | null;
  years_of_experience: number | null;
  pitches_won: number | null;
  pitches_participated: number | null;
  consulting_work: string | null;
  profile_completed: boolean | null;
  country_id: string | null;
  agency_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  country?: { id: string; name: string; code: string } | null;
  agency?: { id: string; name: string } | null;
  languages_count?: number;
  awards_count?: number;
  projects_count?: number;
}

export interface DirectoryFilters {
  departments: string[];
  countries: string[];
  agencies: string[];
  experienceLevel: string | null;
  languages: string[];
  minLanguageProficiency: number;
  minPitchWinRatio: number | null;
  maxPitchWinRatio: number | null;
  hasEffieAwards: boolean;
  hasCannesAwards: boolean;
  hasAnyAwards: boolean;
  completedOnly: boolean;
  skills: string[];
  industries: string[];
}

export interface Industry {
  id: string;
  name: string;
  sort_order: number | null;
}

export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface Agency {
  id: string;
  name: string;
  country_id: string | null;
}

export interface FilterCounts {
  departments: Record<string, number>;
  countries: Record<string, number>;
  agencies: Record<string, number>;
}

export type SortOption = 
  | 'name_asc' 
  | 'name_desc' 
  | 'experience_desc' 
  | 'experience_asc' 
  | 'pitch_win_desc' 
  | 'pitch_win_asc' 
  | 'department_asc'
  | 'created_desc'
  | 'updated_desc';

export type ViewMode = 'grid' | 'list';

export const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior', min: 0, max: 3 },
  { value: 'mid', label: 'Mid-level', min: 4, max: 7 },
  { value: 'senior', label: 'Senior', min: 8, max: 12 },
  { value: 'lead', label: 'Lead', min: 13, max: 20 },
  { value: 'executive', label: 'Executive', min: 21, max: 100 },
];

export const DEPARTMENTS = [
  'Strategy',
  'Creative',
  'Production',
  'Media',
  'Digital',
  'IT',
  'Management',
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'experience_desc', label: 'Experience (Most to Least)' },
  { value: 'experience_asc', label: 'Experience (Least to Most)' },
  { value: 'pitch_win_desc', label: 'Pitch Win % (High to Low)' },
  { value: 'pitch_win_asc', label: 'Pitch Win % (Low to High)' },
  { value: 'department_asc', label: 'Department (A-Z)' },
  { value: 'created_desc', label: 'Recently Added' },
  { value: 'updated_desc', label: 'Recently Updated' },
];
