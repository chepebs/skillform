import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, FileText, BarChart3, Settings } from 'lucide-react';
import { useDirectorData, DepartmentInfo } from '@/hooks/useDirectorData';
import { DirectorStatsCards } from '@/components/admin/director/DirectorStatsCards';
import { TeamRoster } from '@/components/admin/director/TeamRoster';
import { TeamAnalytics } from '@/components/admin/director/TeamAnalytics';
import { DepartmentInfoForm } from '@/components/admin/director/DepartmentInfoForm';

const DirectorDashboard: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('team');

  const {
    departments,
    isLoadingDepartments,
    useTeamMembers,
    useDirectorStats,
    updateDepartment,
    isUpdating,
  } = useDirectorData();

  // Auto-select first department
  React.useEffect(() => {
    if (departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0].name);
    }
  }, [departments, selectedDepartment]);

  const currentDepartment = departments.find((d) => d.name === selectedDepartment);
  const { data: teamMembers = [], isLoading: isLoadingTeam } = useTeamMembers(
    selectedDepartment
  );
  const stats = useDirectorStats(teamMembers);

  if (isLoadingDepartments) {
    return (
      <div className="space-y-8">
        <div className="h-20 shimmer rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 shimmer rounded-xl" />
          ))}
        </div>
        <div className="h-[400px] shimmer rounded-xl" />
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No Departments Assigned
          </h2>
          <p className="text-muted-foreground max-w-md">
            You don't have any departments assigned to you yet. Contact a master admin to
            be assigned as a department director.
          </p>
        </div>
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
              Department Director
            </h1>
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
              Director
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage your department and team
          </p>
        </div>

        {/* Department Selector */}
        {departments.length > 1 && (
          <Select
            value={selectedDepartment || undefined}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Current Department */}
      {currentDepartment && (
        <div className="glass-card rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Settings className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{currentDepartment.name}</h2>
            <p className="text-sm text-muted-foreground">
              {currentDepartment.description || 'No description set'}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <DirectorStatsCards stats={stats} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="info" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Dept Info</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-6">
          <TeamRoster teamMembers={teamMembers} isLoading={isLoadingTeam} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <TeamAnalytics teamMembers={teamMembers} />
        </TabsContent>

        <TabsContent value="info" className="mt-6">
          {currentDepartment && (
            <DepartmentInfoForm
              department={currentDepartment}
              onSave={updateDepartment}
              isSaving={isUpdating}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DirectorDashboard;
