import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SquaresFour as LayoutGrid, List, Folder } from '@phosphor-icons/react';
import { useOrganizerData, Group } from '@/hooks/useOrganizerData';
import { OrganizerStats } from '@/components/admin/organizer/OrganizerStats';
import { GroupsList } from '@/components/admin/organizer/GroupsList';
import { GroupDetails } from '@/components/admin/organizer/GroupDetails';
import { KanbanView } from '@/components/admin/organizer/KanbanView';
import { CreateGroupModal } from '@/components/admin/organizer/CreateGroupModal';
import { DeleteGroupDialog } from '@/components/admin/organizer/DeleteGroupDialog';

const OrganizerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'details' | 'kanban'>('details');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  const {
    groups,
    profiles,
    stats,
    isLoading,
    useGroupMembers,
    createGroup,
    deleteGroup,
    addMember,
    removeMember,
    moveMember,
    isCreating,
    isDeleting,
  } = useOrganizerData();

  const { data: groupMembers = [], isLoading: isLoadingMembers } = useGroupMembers(selectedGroupId);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const handleCreateGroup = (data: { name: string; description?: string }) => {
    createGroup(data, {
      onSuccess: () => {
        setCreateModalOpen(false);
      },
    });
  };

  const handleDeleteGroup = (group: Group) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (groupToDelete) {
      deleteGroup(groupToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setGroupToDelete(null);
          if (selectedGroupId === groupToDelete.id) {
            setSelectedGroupId(null);
          }
        },
      });
    }
  };

  const handleMoveProfile = (userId: string, fromGroupId: string | null, toGroupId: string) => {
    moveMember({ userId, fromGroupId, toGroupId });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-20 shimmer rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 shimmer rounded-xl" />
          ))}
        </div>
        <div className="h-[500px] shimmer rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {t('admin.organizer.title')}
            </h1>
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
              {t('admin.organizer.badge')}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {t('admin.organizer.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'details' | 'kanban')}>
            <TabsList className="grid grid-cols-2 w-[200px]">
              <TabsTrigger value="details" className="gap-2">
                <List className="h-4 w-4" />
                {t('admin.organizer.viewModes.details')}
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                {t('admin.organizer.viewModes.kanban')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Stats */}
      <OrganizerStats
        totalProfiles={stats.totalProfiles}
        totalGroups={stats.totalGroups}
        organizationRate={stats.organizationRate}
      />

      {/* Main Content */}
      {viewMode === 'details' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ minHeight: '500px' }}>
          {/* Groups List */}
          <div className="lg:col-span-4 xl:col-span-3">
            <GroupsList
              groups={groups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={setSelectedGroupId}
              onCreateGroup={() => setCreateModalOpen(true)}
              onEditGroup={() => {}} // TODO: implement edit
              onDeleteGroup={handleDeleteGroup}
              searchQuery={groupSearchQuery}
              onSearchChange={setGroupSearchQuery}
            />
          </div>

          {/* Group Details */}
          <div className="lg:col-span-8 xl:col-span-9">
            {selectedGroup ? (
              <GroupDetails
                group={selectedGroup}
                members={groupMembers}
                profiles={profiles}
                isLoadingMembers={isLoadingMembers}
                onAddMember={(userId) =>
                  addMember({ groupId: selectedGroup.id, userId })
                }
                onRemoveMember={(userId) =>
                  removeMember({ groupId: selectedGroup.id, userId })
                }
                onDeleteGroup={() => handleDeleteGroup(selectedGroup)}
              />
            ) : (
              <div className="glass-card rounded-xl h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t('admin.organizer.groups.selectGroup')}
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    {t('admin.organizer.groups.selectGroupDescription')}
                  </p>
                  <Button
                    onClick={() => setCreateModalOpen(true)}
                    className="mt-6 bg-gradient-to-r from-primary to-primary/80"
                  >
                    {t('admin.organizer.groups.createNewGroup')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4">
          <KanbanView
            groups={groups}
            profiles={profiles}
            onMoveProfile={handleMoveProfile}
          />
        </div>
      )}

      {/* Modals */}
      <CreateGroupModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateGroup}
        isLoading={isCreating}
      />

      <DeleteGroupDialog
        group={groupToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default OrganizerDashboard;
