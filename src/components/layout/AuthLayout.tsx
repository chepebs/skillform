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

      
    </div>;
};