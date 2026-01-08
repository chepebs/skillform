import React from 'react';
import { MapPin } from 'lucide-react';

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
        <div className="absolute inset-0 bg-gradient-orange opacity-90" />
        
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-orange-light/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-dark/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-foreground/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-foreground/20 backdrop-blur-sm">
                <MapPin className="h-8 w-8" />
              </div>
              <span className="text-2xl font-bold">Grupo Garnier</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-4">
              Talent Map
            </h1>
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
            <div className="p-2 rounded-lg bg-gradient-orange">
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-orange-text">Grupo Garnier Talent Map</span>
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
            © 2024 Grupo Garnier. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};