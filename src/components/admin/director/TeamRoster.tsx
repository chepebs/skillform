import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Search,
  Eye,
  Mail,
  Download,
  ChevronUp,
  ChevronDown,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TeamMember } from '@/hooks/useDirectorData';

interface TeamRosterProps {
  teamMembers: TeamMember[];
  isLoading: boolean;
}

type SortField = 'name' | 'experience' | 'performance' | 'position';
type SortOrder = 'asc' | 'desc';

export const TeamRoster: React.FC<TeamRosterProps> = ({
  teamMembers,
  isLoading,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  const getSeniorityBadge = (years: number | null) => {
    if (!years) return { label: 'New', variant: 'secondary' as const };
    if (years >= 13) return { label: 'Lead', variant: 'default' as const };
    if (years >= 8) return { label: 'Senior', variant: 'default' as const };
    if (years >= 4) return { label: 'Mid', variant: 'secondary' as const };
    return { label: 'Junior', variant: 'outline' as const };
  };

  const getPitchWinRate = (won: number | null, participated: number | null) => {
    if (!participated || participated === 0) return null;
    return Math.round(((won || 0) / participated) * 100);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedMembers = React.useMemo(() => {
    let filtered = teamMembers.filter((member) => {
      // Search filter
      const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        fullName.includes(searchQuery.toLowerCase()) ||
        (member.current_position || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Experience filter
      let matchesExperience = true;
      if (experienceFilter !== 'all') {
        const exp = member.years_of_experience || 0;
        switch (experienceFilter) {
          case 'junior':
            matchesExperience = exp >= 0 && exp <= 3;
            break;
          case 'mid':
            matchesExperience = exp >= 4 && exp <= 7;
            break;
          case 'senior':
            matchesExperience = exp >= 8 && exp <= 12;
            break;
          case 'lead':
            matchesExperience = exp >= 13;
            break;
        }
      }

      return matchesSearch && matchesExperience;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
          );
          break;
        case 'experience':
          comparison = (a.years_of_experience || 0) - (b.years_of_experience || 0);
          break;
        case 'performance':
          const aRate = getPitchWinRate(a.pitches_won, a.pitches_participated) || 0;
          const bRate = getPitchWinRate(b.pitches_won, b.pitches_participated) || 0;
          comparison = aRate - bRate;
          break;
        case 'position':
          comparison = (a.current_position || '').localeCompare(b.current_position || '');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [teamMembers, searchQuery, experienceFilter, sortField, sortOrder]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Position', 'Experience', 'Languages', 'Awards', 'Pitch Win %'];
    const rows = filteredAndSortedMembers.map((m) => [
      `${m.first_name || ''} ${m.last_name || ''}`,
      m.email,
      m.current_position || '',
      m.years_of_experience?.toString() || '0',
      m.languages_count?.toString() || '0',
      m.awards_count?.toString() || '0',
      getPitchWinRate(m.pitches_won, m.pitches_participated)?.toString() || 'N/A',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-roster-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 shimmer rounded" />
                <div className="h-3 w-24 shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Team Roster ({filteredAndSortedMembers.length})
          </h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="junior">Junior (0-3)</SelectItem>
                <SelectItem value="mid">Mid (4-7)</SelectItem>
                <SelectItem value="senior">Senior (8-12)</SelectItem>
                <SelectItem value="lead">Lead (13+)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={exportToCSV}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort('name')}
              >
                Name <SortIcon field="name" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort('position')}
              >
                Position <SortIcon field="position" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground text-center"
                onClick={() => handleSort('experience')}
              >
                Experience <SortIcon field="experience" />
              </TableHead>
              <TableHead className="text-center">Languages</TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground text-center"
                onClick={() => handleSort('performance')}
              >
                Performance <SortIcon field="performance" />
              </TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No team members found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedMembers.map((member) => {
                const seniority = getSeniorityBadge(member.years_of_experience);
                const winRate = getPitchWinRate(member.pitches_won, member.pitches_participated);

                return (
                  <TableRow key={member.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(member.first_name, member.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground truncate max-w-[150px]">
                          {member.current_position || 'No position'}
                        </span>
                        <Badge variant={seniority.variant} className="text-xs shrink-0">
                          {seniority.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{member.years_of_experience || 0}</span>
                        <span className="text-xs text-muted-foreground">years</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{member.languages_count || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {winRate !== null ? (
                        <Badge
                          variant="outline"
                          className={
                            winRate >= 60
                              ? 'border-green-500 text-green-500'
                              : winRate >= 30
                              ? 'border-yellow-500 text-yellow-500'
                              : 'border-red-500 text-red-500'
                          }
                        >
                          {winRate}%
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {member.profile_completed ? (
                        <Badge className="bg-green-500/20 text-green-500">Complete</Badge>
                      ) : (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                          Incomplete
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/profile/${member.user_id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.location.href = `mailto:${member.email}`}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
