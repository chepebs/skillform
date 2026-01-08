import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProfileData {
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
  bio: string | null;
  years_of_experience: number | null;
  academic_degree: string | null;
  pitches_participated: number | null;
  pitches_won: number | null;
  brand_creations: number | null;
  brand_refreshes: number | null;
  effie_awards_participated: number | null;
  effie_awards_won: number | null;
  consulting_work: string | null;
  profile_completed: boolean | null;
  country_id: string | null;
  agency_id: string | null;
  country?: { id: string; name: string; code: string } | null;
  agency?: { id: string; name: string } | null;
}

export interface PreviousPosition {
  id: string;
  position_title: string;
  company: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface PreviousAgency {
  id: string;
  agency_name: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
}

export interface BrandManaged {
  id: string;
  brand_name: string;
  years_managed: number | null;
  description: string | null;
}

export interface EmployeeLanguage {
  id: string;
  language: string;
  is_native: boolean | null;
  speaking_level: number | null;
  reading_level: number | null;
  writing_level: number | null;
}

export interface RecentProject {
  id: string;
  project_name: string;
  brand: string | null;
  project_year: number | null;
  project_month: number | null;
  role_in_project: string | null;
  description: string | null;
  key_results: string | null;
}

export interface Award {
  id: string;
  award_name: string;
  award_type: string | null;
  category: string | null;
  award_year: number | null;
  won: boolean | null;
  description: string | null;
}

export interface FullProfileData {
  profile: ProfileData | null;
  previousPositions: PreviousPosition[];
  previousAgencies: PreviousAgency[];
  brandsManaged: BrandManaged[];
  languages: EmployeeLanguage[];
  recentProjects: RecentProject[];
  awards: Award[];
  isOwnProfile: boolean;
  canEdit: boolean;
}

export const useProfileData = (userId: string | undefined) => {
  const { user, role } = useAuth();
  
  const isOwnProfile = user?.id === userId;
  const canEdit = isOwnProfile || role === 'master_admin';

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          country:countries(id, name, code),
          agency:agencies(id, name)
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data as ProfileData;
    },
    enabled: !!userId,
  });

  const { data: previousPositions = [] } = useQuery({
    queryKey: ['previousPositions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('previous_positions')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as PreviousPosition[];
    },
    enabled: !!userId,
  });

  const { data: previousAgencies = [] } = useQuery({
    queryKey: ['previousAgencies', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('previous_agencies')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as PreviousAgency[];
    },
    enabled: !!userId,
  });

  const { data: brandsManaged = [] } = useQuery({
    queryKey: ['brandsManaged', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('brands_managed')
        .select('*')
        .eq('user_id', userId)
        .order('years_managed', { ascending: false });

      if (error) throw error;
      return data as BrandManaged[];
    },
    enabled: !!userId,
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('employee_languages')
        .select('*')
        .eq('user_id', userId)
        .order('is_native', { ascending: false });

      if (error) throw error;
      return data as EmployeeLanguage[];
    },
    enabled: !!userId,
  });

  const { data: recentProjects = [] } = useQuery({
    queryKey: ['recentProjects', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('recent_projects')
        .select('*')
        .eq('user_id', userId)
        .order('project_year', { ascending: false });

      if (error) throw error;
      return data as RecentProject[];
    },
    enabled: !!userId,
  });

  const { data: awards = [] } = useQuery({
    queryKey: ['awards', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .eq('user_id', userId)
        .order('award_year', { ascending: false });

      if (error) throw error;
      return data as Award[];
    },
    enabled: !!userId,
  });

  return {
    profile,
    previousPositions,
    previousAgencies,
    brandsManaged,
    languages,
    recentProjects,
    awards,
    isOwnProfile,
    canEdit,
    isLoading: profileLoading,
    error: profileError,
  };
};
