import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';
import {
  DirectoryProfile,
  DirectoryFilters,
  Country,
  Agency,
  FilterCounts,
  SortOption,
  EXPERIENCE_LEVELS,
} from '@/components/directory/types';

const GRID_PAGE_SIZE = 24;
const LIST_PAGE_SIZE = 50;

export function useDirectoryData(
  searchQuery: string,
  filters: DirectoryFilters,
  sortBy: SortOption,
  viewMode: 'grid' | 'list',
  page: number
) {
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [allLanguages, setAllLanguages] = useState<string[]>([]);
  const [filterCounts, setFilterCounts] = useState<FilterCounts>({
    departments: {},
    countries: {},
    agencies: {},
  });

  const debouncedSearch = useDebounce(searchQuery, 300);
  const pageSize = viewMode === 'grid' ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;

  // Fetch reference data on mount
  useEffect(() => {
    const fetchReferenceData = async () => {
      const [countriesRes, agenciesRes, languagesRes] = await Promise.all([
        supabase.from('countries').select('*').order('name'),
        supabase.from('agencies').select('*').order('name'),
        supabase.from('employee_languages').select('language'),
      ]);

      if (countriesRes.data) setCountries(countriesRes.data);
      if (agenciesRes.data) setAgencies(agenciesRes.data);
      if (languagesRes.data) {
        const uniqueLangs = [...new Set(languagesRes.data.map((l) => l.language))];
        setAllLanguages(uniqueLangs.sort());
      }
    };

    fetchReferenceData();
  }, []);

  // Fetch filter counts
  useEffect(() => {
    const fetchFilterCounts = async () => {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('department')
        .eq('profile_completed', true);

      if (profilesData) {
        const deptCounts: Record<string, number> = {};
        profilesData.forEach((p) => {
          if (p.department) {
            deptCounts[p.department] = (deptCounts[p.department] || 0) + 1;
          }
        });
        setFilterCounts((prev) => ({ ...prev, departments: deptCounts }));
      }
    };

    fetchFilterCounts();
  }, []);

  // Fetch profiles with filters
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build base query
        let query = supabase
          .from('profiles')
          .select(
            `
            id,
            user_id,
            email,
            first_name,
            last_name,
            avatar_url,
            department,
            position,
            current_position,
            phone,
            years_of_experience,
            pitches_won,
            pitches_participated,
            consulting_work,
            profile_completed,
            country_id,
            agency_id,
            created_at,
            updated_at
          `,
            { count: 'exact' }
          );

        // Apply profile completion filter
        if (filters.completedOnly) {
          query = query.eq('profile_completed', true);
        }

        // Apply search filter
        if (debouncedSearch) {
          query = query.or(
            `first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,current_position.ilike.%${debouncedSearch}%,department.ilike.%${debouncedSearch}%,position.ilike.%${debouncedSearch}%`
          );
        }

        // Apply department filter
        if (filters.departments.length > 0) {
          query = query.in('department', filters.departments);
        }

        // Apply country filter
        if (filters.countries.length > 0) {
          query = query.in('country_id', filters.countries);
        }

        // Apply agency filter
        if (filters.agencies.length > 0) {
          query = query.in('agency_id', filters.agencies);
        }

        // Apply experience level filter
        if (filters.experienceLevel) {
          const level = EXPERIENCE_LEVELS.find((l) => l.value === filters.experienceLevel);
          if (level) {
            query = query.gte('years_of_experience', level.min).lte('years_of_experience', level.max);
          }
        }

        // Apply sorting
        switch (sortBy) {
          case 'name_asc':
            query = query.order('first_name', { ascending: true, nullsFirst: false });
            break;
          case 'name_desc':
            query = query.order('first_name', { ascending: false, nullsFirst: false });
            break;
          case 'experience_desc':
            query = query.order('years_of_experience', { ascending: false, nullsFirst: false });
            break;
          case 'experience_asc':
            query = query.order('years_of_experience', { ascending: true, nullsFirst: false });
            break;
          case 'department_asc':
            query = query.order('department', { ascending: true, nullsFirst: false });
            break;
          case 'created_desc':
            query = query.order('created_at', { ascending: false });
            break;
          case 'updated_desc':
            query = query.order('updated_at', { ascending: false });
            break;
          case 'pitch_win_desc':
          case 'pitch_win_asc':
            // These are calculated, handled in client-side sort below
            query = query.order('first_name', { ascending: true });
            break;
        }

        // Apply pagination
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        query = query.range(start, end);

        const { data, error: queryError, count } = await query;

        if (queryError) throw queryError;

        // Enrich profiles with related data
        const enrichedProfiles = await enrichProfiles(data || []);

        // Apply client-side filters and sorting for pitch win ratio
        let filteredProfiles = enrichedProfiles;

        // Filter by pitch win ratio
        if (filters.minPitchWinRatio !== null && filters.maxPitchWinRatio !== null) {
          filteredProfiles = filteredProfiles.filter((p) => {
            if (!p.pitches_participated || p.pitches_participated === 0) return false;
            const ratio = ((p.pitches_won || 0) / p.pitches_participated) * 100;
            return ratio >= filters.minPitchWinRatio! && ratio <= filters.maxPitchWinRatio!;
          });
        }

        // Filter by awards
        if (filters.hasAnyAwards) {
          filteredProfiles = filteredProfiles.filter((p) => (p.awards_count || 0) > 0);
        }

        // Sort by pitch win ratio if needed
        if (sortBy === 'pitch_win_desc' || sortBy === 'pitch_win_asc') {
          filteredProfiles.sort((a, b) => {
            const ratioA = a.pitches_participated ? (a.pitches_won || 0) / a.pitches_participated : 0;
            const ratioB = b.pitches_participated ? (b.pitches_won || 0) / b.pitches_participated : 0;
            return sortBy === 'pitch_win_desc' ? ratioB - ratioA : ratioA - ratioB;
          });
        }

        setProfiles(filteredProfiles);
        setTotalCount(count || 0);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to load profiles. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [debouncedSearch, filters, sortBy, page, pageSize]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    profiles,
    totalCount,
    totalPages,
    isLoading,
    error,
    countries,
    agencies,
    allLanguages,
    filterCounts,
    pageSize,
  };
}

async function enrichProfiles(profiles: DirectoryProfile[]): Promise<DirectoryProfile[]> {
  if (profiles.length === 0) return [];

  const userIds = profiles.map((p) => p.user_id);
  const countryIds = profiles.map((p) => p.country_id).filter(Boolean) as string[];
  const agencyIds = profiles.map((p) => p.agency_id).filter(Boolean) as string[];

  // Fetch related data in parallel
  const [countriesRes, agenciesRes, languagesRes, awardsRes, projectsRes] = await Promise.all([
    countryIds.length > 0
      ? supabase.from('countries').select('*').in('id', countryIds)
      : { data: [] as { id: string; name: string; code: string }[] },
    agencyIds.length > 0
      ? supabase.from('agencies').select('*').in('id', agencyIds)
      : { data: [] as { id: string; name: string }[] },
    supabase
      .from('employee_languages')
      .select('user_id')
      .in('user_id', userIds),
    supabase.from('awards').select('user_id').in('user_id', userIds),
    supabase.from('recent_projects').select('user_id').in('user_id', userIds),
  ]);

  const countriesMap = new Map<string, { id: string; name: string; code: string }>();
  countriesRes.data?.forEach((c) => countriesMap.set(c.id, c));
  
  const agenciesMap = new Map<string, { id: string; name: string }>();
  agenciesRes.data?.forEach((a) => agenciesMap.set(a.id, a));

  // Count languages per user
  const languageCounts = new Map<string, number>();
  languagesRes.data?.forEach((l) => {
    languageCounts.set(l.user_id, (languageCounts.get(l.user_id) || 0) + 1);
  });

  // Count awards per user
  const awardCounts = new Map<string, number>();
  awardsRes.data?.forEach((a) => {
    awardCounts.set(a.user_id, (awardCounts.get(a.user_id) || 0) + 1);
  });

  // Count projects per user
  const projectCounts = new Map<string, number>();
  projectsRes.data?.forEach((p) => {
    projectCounts.set(p.user_id, (projectCounts.get(p.user_id) || 0) + 1);
  });

  return profiles.map((profile) => ({
    ...profile,
    country: profile.country_id ? countriesMap.get(profile.country_id) || null : null,
    agency: profile.agency_id ? agenciesMap.get(profile.agency_id) || null : null,
    languages_count: languageCounts.get(profile.user_id) || 0,
    awards_count: awardCounts.get(profile.user_id) || 0,
    projects_count: projectCounts.get(profile.user_id) || 0,
  }));
}

export function useExportCSV(
  profiles: DirectoryProfile[],
  isAdmin: boolean
) {
  const exportToCSV = () => {
    if (!isAdmin) return;

    const headers = [
      'Name',
      'Email',
      'Phone',
      'Position',
      'Department',
      'Agency',
      'Country',
      'Experience (Years)',
      'Languages',
      'Pitch Win %',
      'Awards Count',
    ];

    const rows = profiles.map((p) => {
      const name = p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : p.email;
      const pitchWinRatio = p.pitches_participated && p.pitches_participated > 0
        ? Math.round((p.pitches_won || 0) / p.pitches_participated * 100)
        : '';

      return [
        name,
        p.email,
        p.phone || '',
        p.current_position || p.position || '',
        p.department || '',
        p.agency?.name || '',
        p.country?.name || '',
        p.years_of_experience?.toString() || '',
        p.languages_count?.toString() || '0',
        pitchWinRatio.toString(),
        p.awards_count?.toString() || '0',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `talent-directory-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { exportToCSV };
}
