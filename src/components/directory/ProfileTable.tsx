import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowsDownUp as ArrowUpDown, ArrowUp, ArrowDown, Envelope as Mail, Translate as Languages, Trophy } from '@phosphor-icons/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DirectoryProfile, SortOption } from './types';

interface ProfileTableProps {
  profiles: DirectoryProfile[];
  sortBy: SortOption;
  onSort: (sort: SortOption) => void;
  searchQuery?: string;
}

const SORTABLE_COLUMNS: { key: string; asc: SortOption; desc: SortOption; label: string }[] = [
  { key: 'name', asc: 'name_asc', desc: 'name_desc', label: 'Name' },
  { key: 'experience', asc: 'experience_asc', desc: 'experience_desc', label: 'Experience' },
  { key: 'department', asc: 'department_asc', desc: 'department_asc', label: 'Department' },
];

export const ProfileTable: React.FC<ProfileTableProps> = ({
  profiles,
  sortBy,
  onSort,
  searchQuery,
}) => {
  const navigate = useNavigate();

  const getSortIcon = (asc: SortOption, desc: SortOption) => {
    if (sortBy === asc) return <ArrowUp className="h-3 w-3 ml-1" />;
    if (sortBy === desc) return <ArrowDown className="h-3 w-3 ml-1" />;
    return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
  };

  const handleSort = (asc: SortOption, desc: SortOption) => {
    if (sortBy === asc) {
      onSort(desc);
    } else {
      onSort(asc);
    }
  };

  const highlightText = (text: string) => {
    if (!searchQuery || !text) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-primary font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="sticky top-0 bg-dark-card z-10">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-[250px]">
              <button
                onClick={() => handleSort('name_asc', 'name_desc')}
                className="flex items-center hover:text-foreground transition-colors"
              >
                Name
                {getSortIcon('name_asc', 'name_desc')}
              </button>
            </TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Agency</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('department_asc', 'department_asc')}
                className="flex items-center hover:text-foreground transition-colors"
              >
                Department
                {getSortIcon('department_asc', 'department_asc')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('experience_asc', 'experience_desc')}
                className="flex items-center hover:text-foreground transition-colors"
              >
                Experience
                {getSortIcon('experience_asc', 'experience_desc')}
              </button>
            </TableHead>
            <TableHead>Languages</TableHead>
            <TableHead>Pitch Win %</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile, index) => {
            const fullName = profile.first_name && profile.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : profile.email;

            const pitchWinRatio = profile.pitches_participated && profile.pitches_participated > 0
              ? Math.round((profile.pitches_won || 0) / profile.pitches_participated * 100)
              : null;

            return (
              <TableRow
                key={profile.id}
                className={cn(
                  'cursor-pointer border-border hover:bg-background transition-colors',
                  index % 2 === 1 && 'bg-background/30'
                )}
                onClick={() => navigate(`/profile/${profile.user_id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-border flex-shrink-0 overflow-hidden bg-primary">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary-foreground font-semibold">
                          {profile.first_name?.[0] || profile.email[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{highlightText(fullName)}</p>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {highlightText(profile.current_position || profile.position || '-')}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {profile.agency?.name || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {highlightText(profile.department || '-')}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {profile.years_of_experience !== null ? `${profile.years_of_experience} years` : '-'}
                </TableCell>
                <TableCell>
                  {profile.languages_count !== undefined && profile.languages_count > 0 ? (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Languages className="h-3.5 w-3.5" />
                      {profile.languages_count}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {pitchWinRatio !== null ? (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'gap-1',
                        pitchWinRatio >= 60
                          ? 'bg-green-500/20 text-green-400'
                          : pitchWinRatio >= 30
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      )}
                    >
                      <Trophy className="h-3 w-3" />
                      {pitchWinRatio}%
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${profile.user_id}`);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
