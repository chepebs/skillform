import React from 'react';
import garnierLogo from '@/assets/logo-garnier-small.png';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {

  return (
    <div className="min-h-screen flex bg-background pattern-bg">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-primary opacity-90" />
        
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-foreground/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <div className="mb-8">
            {/* Logo with company branding */}
            <div className="flex items-center gap-4 mb-8">
              <img 
                src={garnierLogo}
                alt="Garnier Logo"
                className="h-[60px] w-auto object-contain logo-white"
              />
              <div>
                <span className="text-lg font-semibold text-primary-foreground/80">Garnier</span>
                <h1 className="text-4xl font-bold leading-tight">
                  Talent Map
                </h1>
              </div>
            </div>
            <p className="text-xl text-primary-foreground/80 max-w-md">
              Discover, connect, and grow with our comprehensive talent management platform.
            </p>
          </div>
          
          <div className="space-y-6 mt-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold">Complete Profiles</h3>
                <p className="text-sm text-primary-foreground/70">Build comprehensive talent profiles</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h3 className="font-semibold">Smart Directory</h3>
                <p className="text-sm text-primary-foreground/70">Find the right talent instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-primary-foreground/70">Data-driven insights for growth</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img 
              src={garnierLogo}
              alt="Garnier Logo"
              className="h-[60px] w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground">Garnier</span>
              <span className="text-lg font-bold text-foreground">Talent Map</span>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{title}</h2>
              {subtitle && (
                <p className="text-muted-foreground">{subtitle}</p>
              )}
            </div>
            
            {children}
          </div>
          
          <p className="text-center text-xs text-muted-foreground mt-8">
            © 2025 Garnier. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};