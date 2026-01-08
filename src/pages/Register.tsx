import React, { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';

const Register: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

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
      title="Create your account" 
      subtitle="Join the Grupo Garnier talent network"
    >
      <RegisterForm />
      
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-primary hover:text-orange-light transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;