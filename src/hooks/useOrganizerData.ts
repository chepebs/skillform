import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string | null;
  color?: string;
  member_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  added_at: string | null;
  profile?: {
    id: string;
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
    department: string | null;
    current_position: string | null;
    agency_id: string | null;
    country_id: string | null;
    years_of_experience: number | null;
    pitches_won: number | null;
    pitches_participated: number | null;
  };
}

export interface ProfileForOrganizer {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  department: string | null;
  current_position: string | null;
  agency_id: string | null;
  country_id: string | null;
  years_of_experience: number | null;
  pitches_won: number | null;
  pitches_participated: number | null;
  profile_completed: boolean | null;
  agency?: { name: string } | null;
  country?: { name: string; code: string } | null;
  group_ids?: string[];
}

export const useOrganizerData = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all groups
  const groupsQuery = useQuery({
    queryKey: ['organizer-groups'],
    queryFn: async () => {
      const { data: groups, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get member counts for each group
      const groupsWithCounts = await Promise.all(
        (groups || []).map(async (group) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            ...group,
            member_count: count || 0,
          };
        })
      );

      return groupsWithCounts as Group[];
    },
  });

  // Fetch all profiles
  const profilesQuery = useQuery({
    queryKey: ['organizer-profiles'],
    queryFn: async () => {
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
          agency_id,
          country_id,
          years_of_experience,
          pitches_won,
          pitches_participated,
          profile_completed
        `)
        .eq('profile_completed', true)
        .order('first_name');

      if (error) throw error;

      // Fetch agencies and countries
      const [agenciesRes, countriesRes, membershipsRes] = await Promise.all([
        supabase.from('agencies').select('id, name'),
        supabase.from('countries').select('id, name, code'),
        supabase.from('group_members').select('user_id, group_id'),
      ]);

      const agencies = agenciesRes.data || [];
      const countries = countriesRes.data || [];
      const memberships = membershipsRes.data || [];

      // Create lookup maps
      const agencyMap = new Map(agencies.map((a) => [a.id, a]));
      const countryMap = new Map(countries.map((c) => [c.id, c]));

      // Group memberships by user_id
      const membershipMap = new Map<string, string[]>();
      memberships.forEach((m) => {
        if (!membershipMap.has(m.user_id)) {
          membershipMap.set(m.user_id, []);
        }
        membershipMap.get(m.user_id)!.push(m.group_id);
      });

      return (profiles || []).map((profile) => ({
        ...profile,
        agency: profile.agency_id ? agencyMap.get(profile.agency_id) : null,
        country: profile.country_id ? countryMap.get(profile.country_id) : null,
        group_ids: membershipMap.get(profile.user_id) || [],
      })) as ProfileForOrganizer[];
    },
  });

  // Fetch members for a specific group
  const useGroupMembers = (groupId: string | null) => {
    return useQuery({
      queryKey: ['group-members', groupId],
      queryFn: async () => {
        if (!groupId) return [];

        const { data, error } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', groupId);

        if (error) throw error;

        // Fetch profile data for each member
        const userIds = (data || []).map((m) => m.user_id);
        if (userIds.length === 0) return [];

        const { data: profiles } = await supabase
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
            agency_id,
            country_id,
            years_of_experience,
            pitches_won,
            pitches_participated
          `)
          .in('user_id', userIds);

        const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

        return (data || []).map((member) => ({
          ...member,
          profile: profileMap.get(member.user_id),
        })) as GroupMember[];
      },
      enabled: !!groupId,
    });
  };

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const { data: group, error } = await supabase
        .from('groups')
        .insert({
          name: data.name,
          description: data.description || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-groups'] });
      toast({ title: 'Group created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create group', description: error.message, variant: 'destructive' });
    },
  });

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: async (data: { id: string; name?: string; description?: string }) => {
      const { error } = await supabase
        .from('groups')
        .update({
          name: data.name,
          description: data.description,
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-groups'] });
      toast({ title: 'Group updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update group', description: error.message, variant: 'destructive' });
    },
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-groups'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-profiles'] });
      toast({ title: 'Group deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete group', description: error.message, variant: 'destructive' });
    },
  });

  // Add member to group mutation
  const addMemberMutation = useMutation({
    mutationFn: async (data: { groupId: string; userId: string }) => {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: data.groupId,
          user_id: data.userId,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-members', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['organizer-groups'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-profiles'] });
      toast({ title: 'Member added to group' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add member', description: error.message, variant: 'destructive' });
    },
  });

  // Remove member from group mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (data: { groupId: string; userId: string }) => {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', data.groupId)
        .eq('user_id', data.userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-members', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['organizer-groups'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-profiles'] });
      toast({ title: 'Member removed from group' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to remove member', description: error.message, variant: 'destructive' });
    },
  });

  // Move member between groups
  const moveMemberMutation = useMutation({
    mutationFn: async (data: { userId: string; fromGroupId: string | null; toGroupId: string }) => {
      // Remove from old group if exists
      if (data.fromGroupId) {
        await supabase
          .from('group_members')
          .delete()
          .eq('group_id', data.fromGroupId)
          .eq('user_id', data.userId);
      }

      // Add to new group
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: data.toGroupId,
          user_id: data.userId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-groups'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-profiles'] });
      toast({ title: 'Member moved successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to move member', description: error.message, variant: 'destructive' });
    },
  });

  // Stats calculations
  const stats = {
    totalProfiles: profilesQuery.data?.length || 0,
    totalGroups: groupsQuery.data?.length || 0,
    profilesOrganized: profilesQuery.data?.filter((p) => p.group_ids && p.group_ids.length > 0).length || 0,
    organizationRate: profilesQuery.data?.length
      ? Math.round(
          ((profilesQuery.data.filter((p) => p.group_ids && p.group_ids.length > 0).length /
            profilesQuery.data.length) *
            100)
        )
      : 0,
  };

  return {
    groups: groupsQuery.data || [],
    profiles: profilesQuery.data || [],
    stats,
    isLoading: groupsQuery.isLoading || profilesQuery.isLoading,
    useGroupMembers,
    createGroup: createGroupMutation.mutate,
    updateGroup: updateGroupMutation.mutate,
    deleteGroup: deleteGroupMutation.mutate,
    addMember: addMemberMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    moveMember: moveMemberMutation.mutate,
    isCreating: createGroupMutation.isPending,
    isDeleting: deleteGroupMutation.isPending,
  };
};
