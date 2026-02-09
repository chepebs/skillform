import React, { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';

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

  // For demo purposes, we accept any token
  // In production, you would validate the token against the database

  return (
    <AuthLayout 
      title={t('auth.register.title')} 
      subtitle={t('auth.register.subtitle')}
    >
      <RegisterForm />
      
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t('auth.register.alreadyRegistered')}{' '}
          <Link 
            to="/login" 
            className="text-primary hover:text-orange-light transition-colors font-medium"
          >
            {t('auth.register.signIn')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;