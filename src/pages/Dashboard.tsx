import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { role, isLoading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    // Check if profile is complete
    if (profile && !profile.profile_completed) {
      navigate('/profile/create');
      return;
    }

    // Redirect based on role
    const dashboardRoutes: Record<AppRole, string> = {
      employee: '/profile/me',
      organizer_admin: '/admin/organizer',
      department_director: '/admin/director',
      master_admin: '/admin/master',
    };

    if (role) {
      navigate(dashboardRoutes[role], { replace: true });
    } else {
      // Default to profile if no role found
      navigate('/profile/me', { replace: true });
    }
  }, [role, isLoading, profile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;