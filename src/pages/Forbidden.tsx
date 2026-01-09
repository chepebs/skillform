import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Forbidden: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const handleGoToDashboard = () => {
    // Smart redirect based on role
    if (role === 'master_admin') {
      navigate('/admin/master');
    } else if (role === 'organizer_admin') {
      navigate('/admin/organizer');
    } else if (role === 'department_director') {
      navigate('/admin/director');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-24 h-24 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="h-12 w-12 text-destructive" />
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-2">403</h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">Access Forbidden</h2>
        
        <p className="text-muted-foreground mb-4">
          You don't have permission to access this page. This could be because:
        </p>
        
        <ul className="text-sm text-muted-foreground mb-8 space-y-2 text-left max-w-xs mx-auto">
          <li className="flex items-start gap-2">
            <span className="text-destructive">•</span>
            Your account role doesn't have access to this resource
          </li>
          <li className="flex items-start gap-2">
            <span className="text-destructive">•</span>
            You need to complete your profile first
          </li>
          <li className="flex items-start gap-2">
            <span className="text-destructive">•</span>
            This page is restricted to administrators
          </li>
        </ul>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={handleGoToDashboard}
            className="bg-primary hover:bg-primary/90"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>

        {user && role && (
          <div className="mt-8 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Current role: <span className="font-medium text-foreground">{role}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forbidden;