import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
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
} from 'lucide-react';
import garnierLogo from '@/assets/logo-garnier-small.png';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  labelKey: string;
  icon: React.ElementType;
  path: string;
  roles?: AppRole[];
}

const navItems: NavItem[] = [
  { labelKey: 'common.navigation.dashboard', icon: Home, path: '/dashboard' },
  { labelKey: 'common.navigation.myProfile', icon: User, path: '/profile/me' },
  { labelKey: 'common.navigation.directory', icon: Users, path: '/directory' },
  { labelKey: 'common.navigation.groups', icon: Folder, path: '/admin/organizer/groups', roles: ['organizer_admin', 'master_admin'] },
  { labelKey: 'common.navigation.myTeam', icon: Users, path: '/admin/director/team', roles: ['department_director', 'master_admin'] },
  { labelKey: 'common.navigation.departmentInfo', icon: Building, path: '/admin/director/info', roles: ['department_director', 'master_admin'] },
  { labelKey: 'common.navigation.userManagement', icon: Shield, path: '/admin/master/users', roles: ['master_admin'] },
  { labelKey: 'common.navigation.analytics', icon: BarChart3, path: '/admin/master/analytics', roles: ['master_admin'] },
  { labelKey: 'common.navigation.settings', icon: Settings, path: '/admin/settings', roles: ['master_admin'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { role, profile } = useAuth();
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

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
    if (!userRole) return t('common.labels.role');
    return userRole.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Theme-aware logo filter: white in dark mode, black in light mode
  const logoFilter = resolvedTheme === 'dark' 
    ? 'brightness(0) invert(1)' 
    : 'brightness(0)';

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-smooth',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo Header */}
        <div className={cn(
          'flex items-center h-16 border-b border-sidebar-border',
          collapsed ? 'justify-center px-2' : 'gap-3 px-4'
        )}>
          <button 
            onClick={() => navigate('/dashboard')}
            className={cn(
              'flex items-center gap-3 hover:opacity-80 transition-opacity',
              collapsed ? 'justify-center' : ''
            )}
          >
            <img 
              src={garnierLogo}
              alt="Grupo Garnier Logo"
              className={cn(
                'object-contain flex-shrink-0',
                collapsed ? 'h-8 w-8' : 'h-10 w-auto'
              )}
              style={{ filter: logoFilter }}
            />
            {!collapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <h2 className="text-base font-bold text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                  Grupo Garnier
                </h2>
                <p className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                  Talent Map
                </p>
              </div>
            )}
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const label = t(item.labelKey);
              
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
                    title={collapsed ? label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="font-medium truncate">{label}</span>
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
          className="absolute -right-3 top-20 p-1.5 rounded-full bg-card border border-border hover:border-primary transition-colors"
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