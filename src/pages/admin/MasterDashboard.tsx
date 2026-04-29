import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, CheckCircle, Pulse as Activity, HardDrives as Server, ArrowsClockwise as RefreshCw, UserPlus, Buildings as Building2, SquaresFour as LayoutDashboard } from '@phosphor-icons/react';
import { StatsCard } from '@/components/admin/master/StatsCard';
import { UserManagementTable } from '@/components/admin/master/UserManagementTable';
import { ActivityFeed } from '@/components/admin/master/ActivityFeed';
import {
  RegistrationTrendChart,
  DepartmentDistributionChart,
  CountryDistributionChart,
  RoleDistributionMini,
} from '@/components/admin/master/DashboardCharts';
import { AddUserModal } from '@/components/admin/master/AddUserModal';
import { ChangeRoleModal } from '@/components/admin/master/ChangeRoleModal';
import { DeleteUserDialog } from '@/components/admin/master/DeleteUserDialog';
import { PendingInvitations } from '@/components/admin/master/PendingInvitations';
import { ExportPDFButton } from '@/components/admin/master/ExportPDFButton';
import { AgencyManagement } from '@/components/admin/master/AgencyManagement';
import { DepartmentManagement } from '@/components/admin/master/DepartmentManagement';
import { useMasterDashboardData } from '@/hooks/useMasterDashboardData';

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

const MasterDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [changeRoleUser, setChangeRoleUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const {
    stats,
    registrationData,
    departmentData,
    countryData,
    users,
    loading,
    refreshing,
    refresh,
  } = useMasterDashboardData(parseInt(dateRange));

  const completionRate = stats.totalUsers > 0
    ? Math.round((stats.completedProfiles / stats.totalUsers) * 100)
    : 0;

  return (
    <div id="analytics-dashboard" className="space-y-8 pdf-exportable animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <h1 className="text-display-md text-foreground">{t('admin.master.title')}</h1>
          <span className="bracket-tag bracket-tag-accent">
            {t('admin.master.badge')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'dashboard' && (
            <>
              <ExportPDFButton targetId="analytics-dashboard" filename="Grupo-Garnier-Analytics" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">{t('admin.master.dateRange.last7Days')}</SelectItem>
                  <SelectItem value="30">{t('admin.master.dateRange.last30Days')}</SelectItem>
                  <SelectItem value="90">{t('admin.master.dateRange.last90Days')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={refresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => setAddUserOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                {t('admin.master.addUser')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-3 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            {t('admin.master.tabs.dashboard')}
          </TabsTrigger>
          <TabsTrigger value="agencies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {t('admin.master.tabs.agencies')}
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {t('admin.master.tabs.departments')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 tab-content">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('admin.master.stats.totalUsers')}
          value={stats.totalUsers}
          icon={Users}
          iconColor="text-chart-3"
          iconBgColor="bg-chart-3/10"
          loading={loading}
        >
          <RoleDistributionMini data={stats.roleDistribution} />
        </StatsCard>

        <StatsCard
          title={t('admin.master.stats.profileCompletion')}
          value={completionRate}
          icon={CheckCircle}
          iconColor={completionRate > 80 ? 'text-success' : completionRate > 50 ? 'text-warning' : 'text-destructive'}
          iconBgColor={completionRate > 80 ? 'bg-success/10' : completionRate > 50 ? 'bg-warning/10' : 'bg-destructive/10'}
          subtitle={t('admin.master.stats.completionRate', { count: stats.completedProfiles, total: stats.totalUsers })}
          loading={loading}
        />

        <StatsCard
          title={t('admin.master.stats.activeThisMonth')}
          value={stats.activeThisMonth}
          icon={Activity}
          iconColor="text-success"
          iconBgColor="bg-success/10"
          subtitle={stats.totalUsers > 0 ? t('admin.master.stats.engagementRate', { percent: Math.round((stats.activeThisMonth / stats.totalUsers) * 100) }) : t('admin.master.stats.engagementRate', { percent: 0 })}
          loading={loading}
        />

        <StatsCard
          title={t('admin.master.stats.systemStatus')}
          value={0}
          icon={Server}
          iconColor="text-success"
          iconBgColor="bg-success/10"
          loading={loading}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-success">{t('admin.master.stats.online')}</span>
          </div>
        </StatsCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RegistrationTrendChart data={registrationData} loading={loading} />
        <DepartmentDistributionChart data={departmentData} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CountryDistributionChart data={countryData} loading={loading} />
        </div>
        <ActivityFeed />
      </div>

      {/* Pending Invitations */}
      <PendingInvitations />

          {/* User Management */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">{t('admin.master.userManagement')}</h2>
            <UserManagementTable
              users={users}
              loading={loading}
              onRefresh={refresh}
              onEditUser={(u) => setChangeRoleUser(u)}
              onChangeRole={(u) => setChangeRoleUser(u)}
              onDeleteUser={(u) => setDeleteUser(u)}
              currentUserId={user?.id || ''}
            />
          </div>
        </TabsContent>

        <TabsContent value="agencies" className="tab-content">
          <AgencyManagement />
        </TabsContent>

        <TabsContent value="departments" className="tab-content">
          <DepartmentManagement />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddUserModal
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        onSuccess={refresh}
        currentUserId={user?.id || ''}
      />
      <ChangeRoleModal
        open={!!changeRoleUser}
        onOpenChange={(open) => !open && setChangeRoleUser(null)}
        user={changeRoleUser}
        onSuccess={refresh}
        currentUserId={user?.id || ''}
      />
      <DeleteUserDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
        user={deleteUser}
        onSuccess={refresh}
        currentUserId={user?.id || ''}
      />
    </div>
  );
};

export default MasterDashboard;
