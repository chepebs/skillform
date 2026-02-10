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
  const {
    t
  } = useTranslation();
  return <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 lg:px-10 shrink-0">
        <img src={garnierLogoSvg} alt="Grupo Garnier Logo" className="h-10 w-auto object-contain dark:invert" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher compact />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 lg:px-10 py-10 max-w-lg">
        {/* Branding */}
        
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1">{title}</h1>
        {subtitle && <p className="mb-8 text-brand text-base">{subtitle}</p>}
        
        {/* Form Card */}
        <div className="bg-card border border-border p-6 sm:p-8">
          {children}
        </div>
        
        <p className="text-xs text-muted-foreground mt-8">
          © Grupo Garnier. {t('common.labels.allRightsReserved')}
        </p>
      </div>
    </div>;
};