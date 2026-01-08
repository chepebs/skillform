import React, { useState } from 'react';
import { Users, Trash2, Search, Plus, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Group, GroupMember, ProfileForOrganizer } from '@/hooks/useOrganizerData';

interface GroupDetailsProps {
  group: Group;
  members: GroupMember[];
  profiles: ProfileForOrganizer[];
  isLoadingMembers: boolean;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  onDeleteGroup: () => void;
}

export const GroupDetails: React.FC<GroupDetailsProps> = ({
  group,
  members,
  profiles,
  isLoadingMembers,
  onAddMember,
  onRemoveMember,
  onDeleteGroup,
}) => {
  const [memberSearch, setMemberSearch] = useState('');
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  // Get profiles that are not in this group
  const memberUserIds = new Set(members.map((m) => m.user_id));
  const availableProfiles = profiles.filter((p) => !memberUserIds.has(p.user_id));

  // Filter current members by search
  const filteredMembers = members.filter((member) => {
    if (!memberSearch) return true;
    const fullName = `${member.profile?.first_name || ''} ${member.profile?.last_name || ''}`.toLowerCase();
    return fullName.includes(memberSearch.toLowerCase());
  });

  // Calculate group stats
  const avgExperience = members.length
    ? Math.round(
        members.reduce((sum, m) => sum + (m.profile?.years_of_experience || 0), 0) / members.length
      )
    : 0;

  const departments = Array.from(
    new Set(members.map((m) => m.profile?.department).filter(Boolean))
  );

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  const getPitchWinRate = (won: number | null, participated: number | null) => {
    if (!participated || participated === 0) return null;
    return Math.round(((won || 0) / participated) * 100);
  };

  return (
    <div className="glass-card rounded-xl h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{group.name}</h2>
            {group.description && (
              <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteGroup}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Group
          </Button>
        </div>

        {/* Group Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-2xl font-bold text-foreground">{members.length}</p>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-2xl font-bold text-foreground">{avgExperience}</p>
            <p className="text-xs text-muted-foreground">Avg Experience</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-2xl font-bold text-foreground">{departments.length}</p>
            <p className="text-xs text-muted-foreground">Departments</p>
          </div>
        </div>
      </div>

      {/* Add Members Section */}
      <div className="p-4 border-b border-border/50">
        <Popover open={addMemberOpen} onOpenChange={setAddMemberOpen}>
          <PopoverTrigger asChild>
            <Button className="w-full" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Members
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-80" align="start">
            <Command>
              <CommandInput placeholder="Search employees..." />
              <CommandList>
                <CommandEmpty>No employees found.</CommandEmpty>
                <CommandGroup>
                  {availableProfiles.slice(0, 10).map((profile) => (
                    <CommandItem
                      key={profile.user_id}
                      onSelect={() => {
                        onAddMember(profile.user_id);
                        setAddMemberOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(profile.first_name, profile.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {profile.first_name} {profile.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {profile.current_position || profile.department || 'No position'}
                        </p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Members List */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 pt-2 space-y-2">
            {isLoadingMembers ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-muted rounded mb-2" />
                        <div className="h-3 w-24 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {memberSearch ? 'No members found' : 'No members in this group'}
                </p>
              </div>
            ) : (
              filteredMembers.map((member) => {
                const winRate = getPitchWinRate(
                  member.profile?.pitches_won || null,
                  member.profile?.pitches_participated || null
                );

                return (
                  <div
                    key={member.id}
                    className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {getInitials(
                            member.profile?.first_name || null,
                            member.profile?.last_name || null
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {member.profile?.first_name} {member.profile?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.profile?.current_position || 'No position'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.profile?.department && (
                          <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                            {member.profile.department}
                          </Badge>
                        )}
                        {winRate !== null && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              winRate >= 60
                                ? 'border-green-500 text-green-500'
                                : winRate >= 30
                                ? 'border-yellow-500 text-yellow-500'
                                : 'border-red-500 text-red-500'
                            }`}
                          >
                            {winRate}%
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onRemoveMember(member.user_id)}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
