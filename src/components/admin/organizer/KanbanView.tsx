import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical as GripVertical, Users } from '@phosphor-icons/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Group, ProfileForOrganizer } from '@/hooks/useOrganizerData';

interface KanbanViewProps {
  groups: Group[];
  profiles: ProfileForOrganizer[];
  onMoveProfile: (userId: string, fromGroupId: string | null, toGroupId: string) => void;
}

interface DraggableCardProps {
  profile: ProfileForOrganizer;
  groupId: string | null;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ profile, groupId }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${profile.user_id}-${groupId || 'unassigned'}`,
    data: { profile, groupId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 bg-background rounded-lg border border-border/50 hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <Avatar className="h-8 w-8">
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
      </div>
      {profile.department && (
        <Badge variant="secondary" className="text-xs mt-2">
          {profile.department}
        </Badge>
      )}
    </div>
  );
};

interface DroppableColumnProps {
  id: string;
  title: string;
  color: string;
  profiles: ProfileForOrganizer[];
  groupId: string | null;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  id,
  title,
  color,
  profiles,
  groupId,
}) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[280px] max-w-[280px] bg-muted/30 rounded-xl flex flex-col h-full transition-all ${
        isOver ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="font-medium text-foreground truncate flex-1">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {profiles.length}
          </Badge>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {profiles.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Drop profiles here
            </div>
          ) : (
            profiles.map((profile) => (
              <DraggableCard key={profile.user_id} profile={profile} groupId={groupId} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const GROUP_COLORS = [
  'bg-primary',
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-cyan-500',
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  groups,
  profiles,
  onMoveProfile,
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeProfile, setActiveProfile] = React.useState<ProfileForOrganizer | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get profiles for each group
  const getGroupProfiles = (groupId: string) => {
    return profiles.filter((p) => p.group_ids?.includes(groupId));
  };

  // Get unassigned profiles
  const unassignedProfiles = profiles.filter(
    (p) => !p.group_ids || p.group_ids.length === 0
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const data = active.data.current as { profile: ProfileForOrganizer };
    setActiveProfile(data.profile);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveProfile(null);

    if (!over) return;

    const activeData = active.data.current as { profile: ProfileForOrganizer; groupId: string | null };
    const overId = over.id as string;

    // Determine target group
    let targetGroupId: string | null = null;
    if (overId === 'unassigned') {
      // Don't allow dropping back to unassigned
      return;
    } else if (overId.startsWith('group-')) {
      targetGroupId = overId.replace('group-', '');
    } else {
      // Dropped on another card, find its group
      const targetProfile = profiles.find(
        (p) => `${p.user_id}-${activeData.groupId || 'unassigned'}` === overId
      );
      if (targetProfile) {
        targetGroupId = targetProfile.group_ids?.[0] || null;
      }
    }

    if (targetGroupId && targetGroupId !== activeData.groupId) {
      onMoveProfile(activeData.profile.user_id, activeData.groupId, targetGroupId);
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-300px)]">
        {/* Unassigned Column */}
        <DroppableColumn
          id="unassigned"
          title="Unassigned"
          color="bg-gray-500"
          profiles={unassignedProfiles}
          groupId={null}
        />

        {/* Group Columns */}
        {groups.map((group, index) => (
          <DroppableColumn
            key={group.id}
            id={`group-${group.id}`}
            title={group.name}
            color={GROUP_COLORS[index % GROUP_COLORS.length]}
            profiles={getGroupProfiles(group.id)}
            groupId={group.id}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProfile && (
          <div className="p-3 bg-background rounded-lg border-2 border-primary shadow-lg cursor-grabbing">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Avatar className="h-8 w-8">
                <AvatarImage src={activeProfile.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(activeProfile.first_name, activeProfile.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {activeProfile.first_name} {activeProfile.last_name}
                </p>
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
