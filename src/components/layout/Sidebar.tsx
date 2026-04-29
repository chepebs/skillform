import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  House as Home,
  User,
  Users,
  Folder,
  Buildings as Building,
  Shield,
  Gear as Settings,
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  Briefcase,
} from '@phosphor-icons/react';
import { SkillFormLogo } from '@/components/SkillFormLogo';
import { SkillFormIcon } from '@/components/SkillFormIcon';
import { useCanAccessServices } from '@/hooks/useCanAccessServices';

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
  { labelKey: 'common.navigation.dashboard', icon: Home, path: '/dashboard', roles: ['admin', 'manager', 'manager'] },
  { labelKey: 'common.navigation.myProfile', icon: User, path: '/profile/me' },
  { labelKey: 'common.navigation.directory', icon: Users, path: '/directory' },
  { labelKey: 'common.navigation.services', icon: Briefcase, path: '/services' },
  { labelKey: 'common.navigation.groups', icon: Folder, path: '/admin/organizer/groups', roles: ['manager', 'admin'] },
  { labelKey: 'common.navigation.myTeam', icon: Users, path: '/admin/director/team', roles: ['manager', 'admin'] },
  { labelKey: 'common.navigation.departmentInfo', icon: Building, path: '/admin/director/info', roles: ['manager', 'admin'] },
  { labelKey: 'common.navigation.userManagement', icon: Shield, path: '/admin/master/users', roles: ['admin'] },
  { labelKey: 'common.navigation.settings', icon: Settings, path: '/admin/settings', roles: ['admin'] },
];

/**
 * Signal*form-styled app sidebar.
 * - 58px header with brand asterisk tile + Skill*form wordmark
 * - Rounded-full nav pills with active gradient
 * - Compact icon-only collapsed mode (w-14)
 */
export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { role, profile } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { canAccess: canAccessServices } = useCanAccessServices();

  const filteredItems = navItems.filter((item) => {
    if (item.path === '/services' && !canAccessServices) return false;
    if (!item.roles) return true;
    return role && item.roles.includes(role);
  });

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const formatRole = (userRole: AppRole | null) => {
    if (!userRole) return t('common.labels.role');
    return userRole
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 ease-smooth',
        collapsed ? 'w-14' : 'w-56',
      )}
    >
      <div className="flex flex-col h-full">
        {/* Brand header — matches TopBar height (58px) */}
        <div
          className={cn(
            'flex items-center h-[58px] border-b border-border shrink-0',
            collapsed ? 'justify-center px-2' : 'gap-2 px-3',
          )}
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity min-w-0"
            aria-label="Skill form home"
          >
            <div className="w-7 h-7 rounded-md accent-gradient flex items-center justify-center text-white shadow-signal shrink-0">
              <SkillFormIcon className="h-4 w-4" />
            </div>
            {!collapsed && <SkillFormLogo hideIcon textClassName="text-[15px]" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
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
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-full transition-all duration-200 text-sm',
                      active
                        ? 'bg-secondary text-foreground font-semibold shadow-tonal'
                        : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                      collapsed && 'justify-center px-2',
                    )}
                    title={collapsed ? label : undefined}
                  >
                    <Icon
                      className="h-4 w-4 flex-shrink-0"
                      weight={active ? 'duotone' : 'regular'}
                    />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User card */}
        {!collapsed && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2.5 p-2 rounded-full bg-secondary/40">
              <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background font-semibold text-xs shrink-0">
                {profile?.first_name?.[0] ||
                  profile?.email?.[0]?.toUpperCase() ||
                  'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-xs leading-tight">
                  {profile?.first_name
                    ? `${profile.first_name} ${profile.last_name || ''}`
                    : profile?.email}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">
                  {formatRole(role)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-[70px] p-1 bg-card border border-border rounded-full hover:border-primary transition-colors shadow-signal hidden md:block"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      </div>
    </aside>
  );
};
