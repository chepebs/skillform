import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  clickable?: boolean;
}

const LOGO_URL = 'https://arbolcg.com/Logo-Garnier-2025-small-white.png';

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  clickable = true
}) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16'
  };

  const fallbackSizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-16 w-16 text-xl'
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
      {!imageError ? (
        <img 
          src={LOGO_URL}
          alt="Grupo Garnier Logo"
          className={cn(sizes[size], 'w-auto object-contain')}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={cn(
          fallbackSizes[size], 
          'bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold'
        )}>
          GG
        </div>
      )}
      
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

// Light variant for use on dark/gradient backgrounds
export const LogoLight: React.FC<Omit<LogoProps, 'showText'> & { showText?: boolean }> = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  clickable = false
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16'
  };

  const fallbackSizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-16 w-16 text-xl'
  };

  const textSizes = {
    sm: { company: 'text-xs', app: 'text-sm' },
    md: { company: 'text-xs', app: 'text-base' },
    lg: { company: 'text-sm', app: 'text-2xl' }
  };

  const content = (
    <>
      {!imageError ? (
        <img 
          src={LOGO_URL}
          alt="Grupo Garnier Logo"
          className={cn(sizes[size], 'w-auto object-contain')}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={cn(
          fallbackSizes[size], 
          'bg-foreground/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-primary-foreground font-bold'
        )}>
          GG
        </div>
      )}
      
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