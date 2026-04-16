import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Lock } from 'lucide-react';
import { useCanAccessServices } from '@/hooks/useCanAccessServices';

const ServicesLayout: React.FC = () => {
  const { t } = useTranslation();
  const { canAccess, isLoading } = useCanAccessServices();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Lock className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-semibold mb-2">{t('services.noAccess')}</h1>
        <p className="text-muted-foreground">{t('services.requestAccess')}</p>
      </div>
    );
  }

  return <Outlet />;
};

export default ServicesLayout;
