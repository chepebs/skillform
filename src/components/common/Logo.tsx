import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SkillFormLogo } from '@/components/SkillFormLogo';

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

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  const handleClick = () => {
    if (clickable) {
      navigate('/dashboard');
    }
  };

  if (clickable) {
    return (
      <button 
        onClick={handleClick}
        className={cn('flex items-center gap-3 hover:opacity-80 transition-opacity', className)}
      >
        <SkillFormLogo iconClassName={iconSizes[size]} textClassName={showText ? textSizes[size] : 'hidden'} />
      </button>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <SkillFormLogo iconClassName={iconSizes[size]} textClassName={showText ? textSizes[size] : 'hidden'} />
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
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl'
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <SkillFormLogo iconClassName={iconSizes[size]} textClassName={showText ? textSizes[size] : 'hidden'} />
    </div>
  );
};
