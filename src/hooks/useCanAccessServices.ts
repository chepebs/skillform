import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

/**
 * Returns whether the current user can access the Services module.
 * Mirrors the Postgres `can_access_services` function.
 */
export const useCanAccessServices = (): { canAccess: boolean; isLoading: boolean } => {
  const { user, role, isLoading: authLoading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['can-access-services', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Role-based access first (cheap)
      if (role === 'admin' || role === 'manager' || role === 'manager') {
        return true;
      }
      // Otherwise, check seniority on profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('seniority_level')
        .eq('user_id', user!.id)
        .maybeSingle();
      const sl = profile?.seniority_level;
      return sl === 'director' || sl === 'vp' || sl === 'c-level';
    },
  });

  return { canAccess: !!data, isLoading: authLoading || isLoading };
};
