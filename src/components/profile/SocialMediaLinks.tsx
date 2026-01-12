import React from 'react';
import { useTranslation } from 'react-i18next';
import { Linkedin, Instagram, Palette, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialMediaLinksProps {
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  behanceUrl?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  linkedinUrl,
  instagramUrl,
  behanceUrl,
  className = '',
  size = 'md',
  showLabels = false,
}) => {
  const { t } = useTranslation();

  const hasAnyLink = linkedinUrl || instagramUrl || behanceUrl;

  if (!hasAnyLink) return null;

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizes = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  const linkClasses = cn(
    'flex items-center justify-center rounded-full transition-all duration-200',
    'bg-secondary/50 hover:bg-secondary text-foreground',
    'hover:scale-110',
    buttonSizes[size]
  );

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {linkedinUrl && (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(linkClasses, 'hover:bg-[#0A66C2] hover:text-white')}
          title={t('profile.socialMedia.linkedin', 'LinkedIn')}
        >
          <Linkedin className={iconSizes[size]} />
        </a>
      )}

      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(linkClasses, 'hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:text-white')}
          title={t('profile.socialMedia.instagram', 'Instagram')}
        >
          <Instagram className={iconSizes[size]} />
        </a>
      )}

      {behanceUrl && (
        <a
          href={behanceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(linkClasses, 'hover:bg-[#1769FF] hover:text-white')}
          title={t('profile.socialMedia.behance', 'Behance')}
        >
          <Palette className={iconSizes[size]} />
        </a>
      )}
    </div>
  );
};
