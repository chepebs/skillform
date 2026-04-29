import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CircleNotch as Loader2 } from '@phosphor-icons/react';

/**
 * Ensures the user belongs to a company.
 * Platform master (master_admin without a company) bypasses.
 * Otherwise users with no company are sent to /company/create.
 */
export const CompanyGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/landing" state={{ from: location }} replace />;

  // Platform-level master (no company) — full access
  if (role === 'admin' && !profile?.company_id) return <>{children}</>;

  // Has company → ok
  if (profile?.company_id) return <>{children}</>;

  // Otherwise route to company creation
  return <Navigate to="/company/create" replace />;
};
