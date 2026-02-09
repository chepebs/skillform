import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

const Login: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return null;
  }

  return (
    <AuthLayout 
      title={t('auth.login.title')} 
      subtitle={t('auth.login.subtitle')}
    >
      <LoginForm />
      
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t('auth.login.noAccount')}{' '}
          <Link 
            to="/register/demo" 
            className="text-foreground hover:text-foreground/70 transition-colors font-medium underline"
          >
            {t('auth.register.signIn')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
