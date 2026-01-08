import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Home,
  User,
  Users,
  Folder,
  Building,
  Shield,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles?: AppRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, path: '/dashboard' },
  { label: 'My Profile', icon: User, path: '/profile/me' },
  { label: 'Directory', icon: Users, path: '/directory' },
  { label: 'Groups', icon: Folder, path: '/admin/organizer/groups', roles: ['organizer_admin', 'master_admin'] },
  { label: 'My Team', icon: Users, path: '/admin/director/team', roles: ['department_director', 'master_admin'] },
  { label: 'Department Info', icon: Building, path: '/admin/director/info', roles: ['department_director', 'master_admin'] },
  { label: 'User Management', icon: Shield, path: '/admin/master/users', roles: ['master_admin'] },
  { label: 'Analytics', icon: BarChart3, path: '/admin/master/analytics', roles: ['master_admin'] },
  { label: 'Settings', icon: Settings, path: '/admin/master/settings', roles: ['master_admin'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { role, profile } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true;
    return role && item.roles.includes(role);
  });

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getRoleBadgeColor = (userRole: AppRole | null) => {
    switch (userRole) {
      case 'master_admin':
        return 'bg-red-500/20 text-red-400';
      case 'department_director':
        return 'bg-blue-500/20 text-blue-400';
      case 'organizer_admin':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-green-500/20 text-green-400';
    }
  };

  const formatRole = (userRole: AppRole | null) => {
    if (!userRole) return 'User';
    return userRole.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-smooth',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-sidebar-border">
          <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-foreground truncate">Talent Map</h1>
              <p className="text-xs text-muted-foreground truncate">Grupo Garnier</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      active
                        ? 'bg-gradient-primary text-primary-foreground shadow-primary'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="font-medium truncate">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                {profile?.first_name?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-sm">
                  {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : profile?.email}
                </p>
                <span className={cn('text-xs px-2 py-0.5 rounded-full', getRoleBadgeColor(role))}>
                  {formatRole(role)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 p-1.5 rounded-full bg-dark-elevated border border-dark-border hover:border-primary transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </aside>
  );
};