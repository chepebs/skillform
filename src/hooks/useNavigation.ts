import { useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';

export const useAppNavigation = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const navigateToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const navigateToDashboard = () => {
    if (!role) {
      navigate('/dashboard');
      return;
    }

    // Employees should go through /dashboard so it can decide whether to show
    // profile creation vs. the profile view.
    const dashboardRoutes: Record<AppRole, string> = {
      employee: '/dashboard',
      organizer_admin: '/admin/organizer',
      department_director: '/admin/director',
      master_admin: '/admin/master',
    };

    navigate(dashboardRoutes[role] || '/dashboard');
  };

  const goBack = () => {
    navigate(-1);
  };

  return {
    navigateTo,
    navigateToProfile,
    navigateToDashboard,
    goBack,
  };
};