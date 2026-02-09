import React from 'react';
import { useTranslation } from 'react-i18next';
import garnierLogo from '@/assets/logo-garnier-small.png';
import { LanguageSwitcher } from './LanguageSwitcher';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Left Side - Branding (Black) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-foreground">
        {/* Content */}
        <div className="relative z-20 flex flex-col justify-center px-16 text-background">
          <div className="mb-8">
            {/* Logo with company branding - stacked layout */}
            <div className="flex flex-col items-start gap-4 mb-8">
              <img 
                src={garnierLogo}
                alt="Garnier Logo"
                className="h-[60px] w-auto object-contain logo-white"
              />
              <div>
                <span className="text-lg font-semibold text-white/80">Garnier</span>
                <h1 className="text-4xl font-bold leading-tight">
                  Talent Map
                </h1>
              </div>
            </div>
            <p className="text-xl text-background/80 max-w-md">
              {t('auth.login.subtitle')}
            </p>
          </div>
          
          <div className="space-y-6 mt-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-background/10 flex items-center justify-center border border-background/20">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.features.profiles')}</h3>
                <p className="text-sm text-background/70">{t('auth.features.profilesDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-background/10 flex items-center justify-center border border-background/20">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.features.directory')}</h3>
                <p className="text-sm text-background/70">{t('auth.features.directoryDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-background/10 flex items-center justify-center border border-background/20">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.features.analytics')}</h3>
                <p className="text-sm text-background/70">{t('auth.features.analyticsDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Form (White/Light card) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 bg-background">
        {/* Language Selector - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo - stacked layout */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-8">
            <img 
              src={garnierLogo}
              alt="Garnier Logo"
              className="h-[60px] w-auto object-contain"
            />
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-muted-foreground">Garnier</span>
              <span className="text-lg font-bold text-foreground">Talent Map</span>
            </div>
          </div>
          
          {/* Login Card - White/Light theme */}
          <div className="bg-card border border-border p-8 relative overflow-hidden transition-all duration-300">
            {/* Top accent line - red */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2 text-card-foreground">{title}</h2>
              {subtitle && (
                <p className="text-muted-foreground">{subtitle}</p>
              )}
            </div>
            
            {children}
          </div>
          
          <p className="text-center text-xs text-muted-foreground mt-8">
            © Garnier. {t('common.labels.allRightsReserved')}
          </p>
        </div>
      </div>
    </div>
  );
};
