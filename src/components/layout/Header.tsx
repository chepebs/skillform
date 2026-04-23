import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CaretRight as ChevronRight,
  SignOut as LogOut,
  User,
  Gear as Settings,
  List as Menu,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { NotificationsDropdown } from './NotificationsDropdown';
import { supabase } from '@/integrations/supabase/client';
import aideaformLogo from '@/assets/aideaform-logo.svg';
import { SkillFormLogo } from '@/components/SkillFormLogo';
import { SkillFormIcon } from '@/components/SkillFormIcon';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

interface Breadcrumb {
  label: string;
  path?: string;
}

const getRouteLabels = (t: (key: string) => string): Record<string, string> => ({
  dashboard: t('common.navigation.dashboard'),
  profile: t('profile.title'),
  me: t('common.navigation.myProfile'),
  create: t('profile.createProfile'),
  edit: t('common.buttons.edit'),
  directory: t('common.navigation.directory'),
  admin: t('common.navigation.admin'),
  organizer: t('common.navigation.organizer'),
  director: t('common.navigation.director'),
  master: t('common.navigation.masterAdmin'),
  groups: t('common.navigation.groups'),
  team: t('common.navigation.myTeam'),
  info: t('common.navigation.departmentInfo'),
  users: t('common.navigation.userManagement'),
  analytics: t('common.navigation.analytics'),
  settings: t('common.navigation.settings'),
  new: t('common.actions.addNew'),
});

/**
 * Authenticated app top bar — styled to match the Signal*form Launchpad
 * LandingNav (58px height, partner logo + separator + Skill*form wordmark
 * + optional company badge, with matching right-side controls).
 */
export const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed,
  onMobileMenuToggle,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, company, role, signOut } = useAuth();
  const routeLabels = getRouteLabels(t);
  const [profileName, setProfileName] = useState<string | null>(null);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isProfileView =
    pathSegments[0] === 'profile' &&
    pathSegments.length === 2 &&
    pathSegments[1] !== 'me' &&
    pathSegments[1] !== 'create' &&
    pathSegments[1] !== 'edit';
  const profileUserId = isProfileView ? pathSegments[1] : null;

  useEffect(() => {
    if (!profileUserId) {
      setProfileName(null);
      return;
    }
    const fetchName = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', profileUserId)
        .single();
      if (data) {
        const name = [data.first_name, data.last_name].filter(Boolean).join(' ');
        setProfileName(name || null);
      }
    };
    fetchName();
  }, [profileUserId]);

  const generateBreadcrumbs = (): Breadcrumb[] => {
    const breadcrumbs: Breadcrumb[] = [];
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      if (index === 1 && pathSegments[0] === 'profile' && isProfileView) {
        breadcrumbs.push({
          label: profileName || t('profile.title'),
          path: index < pathSegments.length - 1 ? currentPath : undefined,
        });
        return;
      }
      const label =
        routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const isProfileParent =
        index === 0 &&
        segment === 'profile' &&
        pathSegments.length === 2 &&
        isProfileView;
      breadcrumbs.push({
        label,
        path: isProfileParent
          ? undefined
          : index < pathSegments.length - 1
          ? currentPath
          : undefined,
      });
    });
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const formatRole = (userRole: string | null) => {
    if (!userRole) return 'User';
    return userRole
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-[58px] border-b border-border bg-card transition-all duration-300',
        sidebarCollapsed ? 'left-14' : 'left-56',
        'max-md:left-0',
      )}
    >
      <div className="flex justify-between items-center h-full px-4 sm:px-6 md:px-8 gap-2">
        {/* Left: Mobile menu + brand cluster + breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 -ml-2 hover:bg-secondary transition-colors rounded-md shrink-0"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Partner logo + separator (desktop) */}
          <img
            src={aideaformLogo}
            alt="aidea*form"
            className="h-3 shrink-0 hidden md:block"
          />
          <span className="text-muted-foreground/40 text-xs hidden md:inline">|</span>

          {/* Brand mark: gradient icon tile + Skill*form wordmark */}
          <Link to="/dashboard" className="flex items-center gap-2 min-w-0 group">
            <div className="w-7 h-7 rounded-md accent-gradient flex items-center justify-center text-white shadow-signal shrink-0 group-hover:opacity-90 transition-opacity">
              <SkillFormIcon className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline-flex">
              <SkillFormLogo hideIcon textClassName="text-[15px]" />
            </span>
          </Link>

          {/* Company badge */}
          {company && (
            <>
              <span className="text-muted-foreground/40 text-xs hidden md:inline ml-1">
                |
              </span>
              <div className="hidden md:flex items-center gap-2">
                {company.logo_url && (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="h-5 w-5 object-contain"
                  />
                )}
                <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                  {company.name}
                </span>
              </div>
            </>
          )}

          {/* Breadcrumbs */}
          <nav className="hidden lg:flex items-center gap-1 text-sm min-w-0 border-l border-border pl-3 ml-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
                {crumb.path ? (
                  <button
                    onClick={() => navigate(crumb.path!)}
                    className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px] text-xs"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-foreground truncate max-w-[160px] text-xs font-medium">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right: Lang + Theme + Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          <ThemeToggle />
          <NotificationsDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground gap-2 rounded-full h-9 pl-1 pr-3"
              >
                <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center text-background text-xs font-semibold">
                  {profile?.first_name?.[0] ||
                    profile?.email?.[0]?.toUpperCase() ||
                    'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground leading-none">
                    {profile?.first_name || 'User'}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    {formatRole(role)}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t('auth.myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate('/profile/me')}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" weight="regular" />
                {t('profile.viewProfile')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate('/admin/settings')}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" weight="regular" />
                {t('common.navigation.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" weight="regular" />
                {t('auth.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
