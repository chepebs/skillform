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

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Top right controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <img 
            src={garnierLogoSvg}
            alt="Grupo Garnier Logo"
            className="h-16 w-auto object-contain dark:invert"
          />
          <span className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
            Talent Map
          </span>
        </div>
        
        {/* Login Card */}
        <div className="bg-card border border-border p-8 transition-all duration-300">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-card-foreground">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          {children}
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-8">
          © Grupo Garnier. {t('common.labels.allRightsReserved')}
        </p>
      </div>
    </div>
  );
};
