import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pattern-bg flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-24 h-24 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="h-12 w-12 text-destructive" />
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-2">403</h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">Access Forbidden</h2>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-dark-border hover:bg-dark-elevated"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-orange hover:bg-gradient-orange-hover shadow-orange"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;