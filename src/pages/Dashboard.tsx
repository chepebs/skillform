import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { CircleNotch as Loader2 } from '@phosphor-icons/react';

const Dashboard: React.FC = () => {
  const { role, isLoading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    // Admin roles go straight to their dashboards (no profile required)
    if (role === 'master_admin') {
      navigate('/admin/master', { replace: true });
      return;
    }
    if (role === 'organizer_admin') {
      navigate('/admin/organizer', { replace: true });
      return;
    }
    if (role === 'department_director') {
      navigate('/admin/director', { replace: true });
      return;
    }

    // Employee (or unknown role): require a completed profile
    if (!profile || !profile.profile_completed) {
      navigate('/profile/create', { replace: true });
      return;
    }

    navigate('/profile/me', { replace: true });
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