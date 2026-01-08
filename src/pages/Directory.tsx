import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid, List, User, Mail, Building, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  department: string | null;
  position: string | null;
}

const Directory: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchQuery, departmentFilter]);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('profile_completed', true);

      if (error) throw error;
      setProfiles(data as Profile[] || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = [...profiles];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.first_name?.toLowerCase().includes(query) ||
          p.last_name?.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          p.department?.toLowerCase().includes(query) ||
          p.position?.toLowerCase().includes(query)
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter((p) => p.department === departmentFilter);
    }

    setFilteredProfiles(filtered);
  };

  const departments = [...new Set(profiles.map((p) => p.department).filter(Boolean))];

  const ProfileCard = ({ profile }: { profile: Profile }) => (
    <div
      onClick={() => navigate(`/profile/${profile.user_id}`)}
      className="glass-card rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-primary group"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xl font-semibold flex-shrink-0 group-hover:shadow-primary transition-shadow">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.first_name || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            profile.first_name?.[0] || profile.email[0].toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {profile.first_name && profile.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : profile.email}
          </h3>
          {profile.position && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="truncate">{profile.position}</span>
            </div>
          )}
          {profile.department && (
            <Badge variant="secondary" className="mt-2 bg-dark-elevated text-muted-foreground">
              <Building className="h-3 w-3 mr-1" />
              {profile.department}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  const ProfileRow = ({ profile }: { profile: Profile }) => (
    <div
      onClick={() => navigate(`/profile/${profile.user_id}`)}
      className="glass-card rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-primary flex items-center gap-4 group"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.first_name || 'User'}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          profile.first_name?.[0] || profile.email[0].toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile.email}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span className="truncate">{profile.email}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5" />
          <span className="truncate">{profile.position || 'Not specified'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building className="h-3.5 w-3.5" />
          <span className="truncate">{profile.department || 'Not specified'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Employee Directory</h1>
        <p className="text-muted-foreground mt-1">
          Browse and find talent across the organization
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-dark-elevated border-dark-border focus:border-primary"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-dark-elevated border border-dark-border text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept!}>
                {dept}
              </option>
            ))}
          </select>

          <div className="flex rounded-lg border border-dark-border overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-none',
                viewMode === 'grid' && 'bg-dark-elevated'
              )}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-none',
                viewMode === 'list' && 'bg-dark-elevated'
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredProfiles.length} of {profiles.length} employees
      </p>

      {/* Profiles Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 shimmer rounded" />
                  <div className="h-4 w-24 shimmer rounded" />
                  <div className="h-6 w-20 shimmer rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No employees found</h3>
          <p className="text-muted-foreground">
            {searchQuery || departmentFilter
              ? 'Try adjusting your search or filters'
              : 'No profiles have been created yet'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProfiles.map((profile) => (
            <ProfileRow key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Directory;