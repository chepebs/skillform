import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, eachDayOfInterval, parseISO } from 'date-fns';

interface DashboardStats {
  totalUsers: number;
  completedProfiles: number;
  activeThisMonth: number;
  roleDistribution: { name: string; value: number; color: string }[];
}

interface RegistrationData {
  date: string;
  count: number;
}

interface DepartmentData {
  name: string;
  value: number;
}

interface CountryData {
  name: string;
  count: number;
  code?: string;
}

interface User {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  department: string | null;
  is_active: boolean;
  profile_completed: boolean;
  last_login_at: string | null;
  role: string;
  agency_name?: string;
}

export function useMasterDashboardData(dateRange: number = 30) {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    completedProfiles: 0,
    activeThisMonth: 0,
    roleDistribution: [],
  });
  const [registrationData, setRegistrationData] = useState<RegistrationData[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Fetch profiles with related data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*, agencies(name), countries(name, code)');

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Create role map
      const roleMap = (roles || []).reduce((acc, r) => {
        acc[r.user_id] = r.role;
        return acc;
      }, {} as Record<string, string>);

      // Calculate stats
      const totalUsers = profiles?.length || 0;
      const completedProfiles = profiles?.filter(p => p.profile_completed).length || 0;
      const monthStart = startOfMonth(new Date());
      const activeThisMonth = profiles?.filter(
        p => p.last_login_at && new Date(p.last_login_at) >= monthStart
      ).length || 0;

      // Role distribution
      const roleCounts = (roles || []).reduce((acc, r) => {
        acc[r.role] = (acc[r.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const roleDistribution = [
        { name: 'Employee', value: roleCounts.employee || 0, color: '#6B7280' },
        { name: 'Organizer', value: roleCounts.organizer_admin || 0, color: '#3B82F6' },
        { name: 'Director', value: roleCounts.department_director || 0, color: '#F59E0B' },
        { name: 'Master', value: roleCounts.master_admin || 0, color: '#9333EA' },
      ];

      setStats({
        totalUsers,
        completedProfiles,
        activeThisMonth,
        roleDistribution,
      });

      // Registration trend (last N days)
      const startDate = subDays(new Date(), dateRange);
      const dateInterval = eachDayOfInterval({ start: startDate, end: new Date() });
      
      const registrationByDate = (profiles || []).reduce((acc, p) => {
        const date = format(new Date(p.created_at || ''), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const registrations = dateInterval.map(date => ({
        date: format(date, 'yyyy-MM-dd'),
        count: registrationByDate[format(date, 'yyyy-MM-dd')] || 0,
      }));

      setRegistrationData(registrations);

      // Department distribution
      const deptCounts = (profiles || []).reduce((acc, p) => {
        const dept = p.department || 'Unassigned';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const departments = Object.entries(deptCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setDepartmentData(departments);

      // Country distribution
      const countryCounts = (profiles || []).reduce((acc, p) => {
        const country = (p.countries as { name: string; code: string } | null)?.name || 'Unknown';
        const code = (p.countries as { name: string; code: string } | null)?.code;
        if (!acc[country]) {
          acc[country] = { count: 0, code };
        }
        acc[country].count += 1;
        return acc;
      }, {} as Record<string, { count: number; code?: string }>);

      const countries = Object.entries(countryCounts)
        .map(([name, data]) => ({ name, count: data.count, code: data.code }))
        .sort((a, b) => b.count - a.count);

      setCountryData(countries);

      // Format users for table
      const formattedUsers: User[] = (profiles || []).map(p => ({
        id: p.id,
        user_id: p.user_id,
        email: p.email,
        first_name: p.first_name,
        last_name: p.last_name,
        avatar_url: p.avatar_url,
        department: p.department,
        is_active: p.is_active ?? true,
        profile_completed: p.profile_completed ?? false,
        last_login_at: p.last_login_at,
        role: roleMap[p.user_id] || 'user',
        agency_name: (p.agencies as { name: string } | null)?.name,
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  return {
    stats,
    registrationData,
    departmentData,
    countryData,
    users,
    loading,
    refreshing,
    refresh,
  };
}
