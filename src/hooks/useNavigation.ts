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

    // Users go through /dashboard which routes them to the right view.
    const dashboardRoutes: Record<AppRole, string> = {
      user: '/dashboard',
      manager: '/admin/director',
      admin: '/admin/master',
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