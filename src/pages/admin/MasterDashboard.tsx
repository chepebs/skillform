import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  Building, 
  BarChart3, 
  Settings,
  TrendingUp,
  Activity
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  completedProfiles: number;
  departments: number;
  groups: number;
}

const MasterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    completedProfiles: 0,
    departments: 0,
    groups: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [profilesRes, departmentsRes, groupsRes] = await Promise.all([
        supabase.from('profiles').select('profile_completed'),
        supabase.from('departments').select('id'),
        supabase.from('groups').select('id'),
      ]);

      setStats({
        totalUsers: profilesRes.data?.length || 0,
        completedProfiles: profilesRes.data?.filter(p => p.profile_completed).length || 0,
        departments: departmentsRes.data?.length || 0,
        groups: groupsRes.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Completed Profiles', 
      value: stats.completedProfiles, 
      icon: Activity, 
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    { 
      label: 'Departments', 
      value: stats.departments, 
      icon: Building, 
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    { 
      label: 'Groups', 
      value: stats.groups, 
      icon: TrendingUp, 
      color: 'text-orange-400',
      bgColor: 'bg-orange/10'
    },
  ];

  const quickActions = [
    { label: 'Add New User', icon: UserPlus, path: '/admin/master/users/new' },
    { label: 'User Management', icon: Users, path: '/admin/master/users' },
    { label: 'View Analytics', icon: BarChart3, path: '/admin/master/analytics' },
    { label: 'System Settings', icon: Settings, path: '/admin/master/settings' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Master Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Complete overview of the talent management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {isLoading ? '-' : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                onClick={() => navigate(action.path)}
                className="h-auto p-6 flex flex-col items-center gap-3 border-dark-border hover:border-primary hover:bg-dark-elevated transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Activity feed coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;