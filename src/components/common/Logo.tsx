import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import garnierLogoSvg from '@/assets/logo-garnier.svg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  clickable?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  clickable = true
}) => {
  const navigate = useNavigate();
  
  const sizes = {
    sm: 'h-16',
    md: 'h-20',
    lg: 'h-32'
  };

  const textSizes = {
    sm: { company: 'text-xs', app: 'text-sm' },
    md: { company: 'text-xs', app: 'text-base' },
    lg: { company: 'text-sm', app: 'text-xl' }
  };

  const handleClick = () => {
    if (clickable) {
      navigate('/dashboard');
    }
  };

  const content = (
    <>
      <img 
        src={garnierLogoSvg}
        alt="Grupo Garnier Logo"
        className={cn(sizes[size], 'w-auto object-contain dark:invert')}
      />
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn(textSizes[size].company, 'font-semibold text-muted-foreground')}>
            Grupo Garnier
          </span>
          <span className={cn(textSizes[size].app, 'font-bold text-foreground')}>
            Talent Map
          </span>
        </div>
      )}
    </>
  );

  if (clickable) {
    return (
      <button 
        onClick={handleClick}
        className={cn(
          'flex items-center gap-3 hover:opacity-80 transition-opacity',
          className
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {content}
    </div>
  );
};

// Light variant for use on dark backgrounds
export const LogoLight: React.FC<Omit<LogoProps, 'showText'> & { showText?: boolean }> = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  clickable = false
}) => {
  const sizes = {
    sm: 'h-16',
    md: 'h-20',
    lg: 'h-32'
  };

  const textSizes = {
    sm: { company: 'text-xs', app: 'text-sm' },
    md: { company: 'text-xs', app: 'text-base' },
    lg: { company: 'text-sm', app: 'text-2xl' }
  };

  const content = (
    <>
      <img 
        src={garnierLogoSvg}
        alt="Grupo Garnier Logo"
        className={cn(sizes[size], 'w-auto object-contain invert')}
      />
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn(textSizes[size].company, 'font-semibold text-primary-foreground/80')}>
            Grupo Garnier
          </span>
          <span className={cn(textSizes[size].app, 'font-bold text-primary-foreground')}>
            Talent Map
          </span>
        </div>
      )}
    </>
  );

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {content}
    </div>
  );
};
