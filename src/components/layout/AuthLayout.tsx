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
    <div className="min-h-screen flex bg-black relative overflow-hidden">
      {/* Animated background with black and red */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0000] to-black" />
        <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-red-600/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-red-800/10 rounded-full blur-[150px] animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[60%] left-[60%] w-72 h-72 bg-red-500/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher variant="dark" />
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-700/90 via-red-800/80 to-black/90 z-10" />
        
        {/* Animated background shapes */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-red-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Content */}
        <div className="relative z-20 flex flex-col justify-center px-16 text-white">
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
            <p className="text-xl text-white/80 max-w-md">
              {t('auth.login.subtitle')}
            </p>
          </div>
          
          <div className="space-y-6 mt-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.features.profiles')}</h3>
                <p className="text-sm text-white/70">{t('auth.features.profilesDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.features.directory')}</h3>
                <p className="text-sm text-white/70">{t('auth.features.directoryDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.features.analytics')}</h3>
                <p className="text-sm text-white/70">{t('auth.features.analyticsDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo - stacked layout */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-8">
            <img 
              src={garnierLogo}
              alt="Garnier Logo"
              className="h-[60px] w-auto object-contain logo-white"
            />
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-white/60">Garnier</span>
              <span className="text-lg font-bold text-white">Talent Map</span>
            </div>
          </div>
          
          {/* Login Card */}
          <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_80px_rgba(255,0,0,0.1)] relative overflow-hidden transition-all duration-400 hover:border-red-500/40 hover:shadow-[0_30px_80px_rgba(0,0,0,0.9),0_0_100px_rgba(255,0,0,0.2)]">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600/80 to-transparent" />
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
              {subtitle && (
                <p className="text-white/60">{subtitle}</p>
              )}
            </div>
            
            {children}
          </div>
          
          <p className="text-center text-xs text-white/50 mt-8">
            © 2025 Garnier. {t('common.labels.allRightsReserved')}
          </p>
        </div>
      </div>
    </div>
  );
};
