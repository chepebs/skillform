import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DepartmentInfo {
  id: string;
  name: string;
  description: string | null;
  director_id: string | null;
}

export interface TeamMember {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  department: string | null;
  current_position: string | null;
  years_of_experience: number | null;
  pitches_won: number | null;
  pitches_participated: number | null;
  profile_completed: boolean | null;
  agency_id: string | null;
  country_id: string | null;
  agency?: { name: string } | null;
  country?: { name: string; code: string } | null;
  languages_count?: number;
  awards_count?: number;
  projects_count?: number;
}

export interface DirectorStats {
  teamSize: number;
  avgExperience: number;
  activeProjects: number;
  avgPitchWinRate: number;
  totalAwards: number;
  completedProfiles: number;
  completionRate: number;
}

export const useDirectorData = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch departments where current user is director
  const departmentsQuery = useQuery({
    queryKey: ['director-departments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // For master_admin, show all departments
      if (role === 'master_admin') {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .order('name');
        
        if (error) throw error;
        return data as DepartmentInfo[];
      }

      // For department_director, show only their departments
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('director_id', user.id)
        .order('name');

      if (error) throw error;
      return data as DepartmentInfo[];
    },
    enabled: !!user?.id,
  });

  // Fetch team members for a specific department
  const useTeamMembers = (departmentName: string | null) => {
    return useQuery({
      queryKey: ['director-team', departmentName],
      queryFn: async () => {
        if (!departmentName) return [];

        const { data: profiles, error } = await supabase
          .from('profiles')
          .select(`
            id,
            user_id,
            first_name,
            last_name,
            email,
            avatar_url,
            department,
            current_position,
            years_of_experience,
            pitches_won,
            pitches_participated,
            profile_completed,
            agency_id,
            country_id
          `)
          .eq('department', departmentName)
          .order('first_name');

        if (error) throw error;

        // Fetch additional data
        const userIds = (profiles || []).map((p) => p.user_id);
        if (userIds.length === 0) return [];

        const [agenciesRes, countriesRes, languagesRes, awardsRes, projectsRes] = await Promise.all([
          supabase.from('agencies').select('id, name'),
          supabase.from('countries').select('id, name, code'),
          supabase.from('employee_languages').select('user_id').in('user_id', userIds),
          supabase.from('awards').select('user_id').in('user_id', userIds),
          supabase.from('recent_projects').select('user_id').in('user_id', userIds),
        ]);

        const agencyMap = new Map((agenciesRes.data || []).map((a) => [a.id, a]));
        const countryMap = new Map((countriesRes.data || []).map((c) => [c.id, c]));
        
        // Count by user_id
        const languagesCounts = new Map<string, number>();
        (languagesRes.data || []).forEach((l) => {
          languagesCounts.set(l.user_id, (languagesCounts.get(l.user_id) || 0) + 1);
        });
        
        const awardsCounts = new Map<string, number>();
        (awardsRes.data || []).forEach((a) => {
          awardsCounts.set(a.user_id, (awardsCounts.get(a.user_id) || 0) + 1);
        });
        
        const projectsCounts = new Map<string, number>();
        (projectsRes.data || []).forEach((p) => {
          projectsCounts.set(p.user_id, (projectsCounts.get(p.user_id) || 0) + 1);
        });

        return (profiles || []).map((profile) => ({
          ...profile,
          agency: profile.agency_id ? agencyMap.get(profile.agency_id) : null,
          country: profile.country_id ? countryMap.get(profile.country_id) : null,
          languages_count: languagesCounts.get(profile.user_id) || 0,
          awards_count: awardsCounts.get(profile.user_id) || 0,
          projects_count: projectsCounts.get(profile.user_id) || 0,
        })) as TeamMember[];
      },
      enabled: !!departmentName,
    });
  };

  // Calculate stats for a department
  const useDirectorStats = (teamMembers: TeamMember[]) => {
    const stats: DirectorStats = {
      teamSize: teamMembers.length,
      avgExperience: teamMembers.length
        ? Math.round(
            teamMembers.reduce((sum, m) => sum + (m.years_of_experience || 0), 0) /
              teamMembers.length
          )
        : 0,
      activeProjects: teamMembers.reduce((sum, m) => sum + (m.projects_count || 0), 0),
      avgPitchWinRate: teamMembers.length
        ? Math.round(
            teamMembers.reduce((sum, m) => {
              const participated = m.pitches_participated || 0;
              const won = m.pitches_won || 0;
              return sum + (participated > 0 ? (won / participated) * 100 : 0);
            }, 0) / teamMembers.length
          )
        : 0,
      totalAwards: teamMembers.reduce((sum, m) => sum + (m.awards_count || 0), 0),
      completedProfiles: teamMembers.filter((m) => m.profile_completed).length,
      completionRate: teamMembers.length
        ? Math.round(
            (teamMembers.filter((m) => m.profile_completed).length / teamMembers.length) *
              100
          )
        : 0,
    };
    return stats;
  };

  // Update department info
  const updateDepartmentMutation = useMutation({
    mutationFn: async (data: { id: string; description?: string }) => {
      const { error } = await supabase
        .from('departments')
        .update({ description: data.description })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['director-departments'] });
      toast({ title: 'Department info updated' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update department',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    departments: departmentsQuery.data || [],
    isLoadingDepartments: departmentsQuery.isLoading,
    useTeamMembers,
    useDirectorStats,
    updateDepartment: updateDepartmentMutation.mutate,
    isUpdating: updateDepartmentMutation.isPending,
  };
};
