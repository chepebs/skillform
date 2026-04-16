import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import garnierLogoSvg from '@/assets/logo-garnier.svg';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle
}) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-scale-in">
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src={garnierLogoSvg} alt="Grupo Garnier" className="h-4 dark:invert" />
            <span className="text-muted-foreground/40 text-xs">|</span>
            <span className="font-headline font-bold text-sm text-foreground tracking-tight">Talent Map</span>
          </div>
          <p className="eyebrow mb-3">{t('auth.login.eyebrow', 'Grupo Garnier')}</p>
          <h1 className="heading-section">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>}
        </div>

        <div className="space-y-4">
          {children}
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          <ThemeToggle />
          <LanguageSwitcher compact />
        </div>

        <p className="text-center text-[10px] text-muted-foreground/60 mt-8">
          © Grupo Garnier. {t('common.labels.allRightsReserved', 'All rights reserved.')}
        </p>
      </div>
    </div>
  );
};