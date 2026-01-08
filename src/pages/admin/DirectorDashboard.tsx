import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Building, FileText, ArrowRight } from 'lucide-react';

const DirectorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'My Team',
      description: 'View and manage your team members',
      icon: Users,
      path: '/admin/director/team',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Department Info',
      description: 'Update department details and structure',
      icon: Building,
      path: '/admin/director/info',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Team Reports',
      description: 'View performance and analytics',
      icon: FileText,
      path: '/admin/director/team',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Department Director Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your department and team members
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-3xl font-bold text-foreground">-</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center">
              <FileText className="h-7 w-7 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Profiles</p>
              <p className="text-3xl font-bold text-foreground">-</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Building className="h-7 w-7 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="text-lg font-bold text-foreground">Not Set</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                onClick={() => navigate(action.path)}
                className="glass-card rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-all hover:shadow-primary group"
              >
                <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {action.description}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-primary p-0 h-auto"
                >
                  View
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;