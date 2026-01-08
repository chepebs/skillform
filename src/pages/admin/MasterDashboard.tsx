import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  CheckCircle,
  Activity,
  Server,
  RefreshCw,
  UserPlus,
} from 'lucide-react';
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
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('30');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Master Admin Dashboard</h1>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            Master Admin
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setAddUserOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          iconColor="text-blue-400"
          iconBgColor="bg-blue-500/10"
          loading={loading}
        >
          <RoleDistributionMini data={stats.roleDistribution} />
        </StatsCard>

        <StatsCard
          title="Profile Completion"
          value={completionRate}
          icon={CheckCircle}
          iconColor={completionRate > 80 ? 'text-green-400' : completionRate > 50 ? 'text-yellow-400' : 'text-red-400'}
          iconBgColor={completionRate > 80 ? 'bg-green-500/10' : completionRate > 50 ? 'bg-yellow-500/10' : 'bg-red-500/10'}
          subtitle={`${stats.completedProfiles} of ${stats.totalUsers} completed`}
          loading={loading}
        />

        <StatsCard
          title="Active This Month"
          value={stats.activeThisMonth}
          icon={Activity}
          iconColor="text-green-400"
          iconBgColor="bg-green-500/10"
          subtitle={stats.totalUsers > 0 ? `${Math.round((stats.activeThisMonth / stats.totalUsers) * 100)}% engagement` : '0% engagement'}
          loading={loading}
        />

        <StatsCard
          title="System Status"
          value={0}
          icon={Server}
          iconColor="text-green-400"
          iconBgColor="bg-green-500/10"
          loading={loading}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-500">Online</span>
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
        <h2 className="text-xl font-semibold text-foreground mb-4">User Management</h2>
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
