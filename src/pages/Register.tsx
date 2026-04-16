import React, { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Register: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/profile/create');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return null;
  }

  return (
    <AuthLayout 
      title={t('auth.register.title')} 
      subtitle={t('auth.register.subtitle')}
    >
      <RegisterForm />
      
      <Button variant="ghost" asChild className="w-full text-muted-foreground mt-2">
        <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />{t('landing.backToHome', 'Back to Home')}</Link>
      </Button>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {t('auth.register.alreadyRegistered')}{' '}
          <Link 
            to="/login" 
            className="text-foreground underline underline-offset-4 hover:text-foreground/80 font-medium"
          >
            {t('auth.register.signIn')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;