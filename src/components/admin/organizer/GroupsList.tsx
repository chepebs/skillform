import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Folder, MoreVertical, Edit, Trash2, Users, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Group } from '@/hooks/useOrganizerData';

interface GroupsListProps {
  groups: Group[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: () => void;
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (group: Group) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const GROUP_COLORS = [
  'bg-primary',
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-gray-500',
];

export const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
  searchQuery,
  onSearchChange,
}) => {
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glass-card rounded-xl h-full flex flex-col">
      <div className="p-4 border-b border-border/50">
        <h2 className="text-lg font-semibold text-foreground mb-4">Groups</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
        <Button
          onClick={onCreateGroup}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Group
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No groups found' : 'No groups yet'}
              </p>
            </div>
          ) : (
            filteredGroups.map((group, index) => (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedGroupId === group.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-muted/50 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`w-3 h-3 rounded-full mt-1.5 ${GROUP_COLORS[index % GROUP_COLORS.length]}`}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{group.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {group.member_count || 0}
                        </Badge>
                        {group.created_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditGroup(group)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteGroup(group)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
