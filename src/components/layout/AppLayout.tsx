import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { X } from '@phosphor-icons/react';

export const AppLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleCloseMobileMenu = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-56 bg-card border-r border-border animate-slide-in-left">
            <button
              onClick={handleCloseMobileMenu}
              onTouchEnd={handleCloseMobileMenu}
              className="absolute right-3 top-3 z-[60] p-2 rounded-full bg-card hover:bg-accent active:scale-95 transition-all touch-manipulation select-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="Close menu"
              type="button"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
            <Sidebar collapsed={false} onToggle={() => {}} />
          </div>
        </div>
      )}

      {/* Header */}
      <Header 
        sidebarCollapsed={sidebarCollapsed} 
        onMobileMenuToggle={() => setMobileMenuOpen(true)} 
      />

      {/* Main Content */}
      <main
        className={cn(
          'pt-[58px] min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'md:pl-14' : 'md:pl-56'
        )}
      >
        <div className="p-6 md:p-8 lg:p-10 animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Copyright Footer */}
      <footer
        className={cn(
          'py-6 text-center text-sm text-muted-foreground border-t border-border transition-all duration-300',
          sidebarCollapsed ? 'md:pl-14' : 'md:pl-56'
        )}
      >
        © Grupo Garnier. {t('common.labels.allRightsReserved')}
      </footer>
    </div>
  );
};