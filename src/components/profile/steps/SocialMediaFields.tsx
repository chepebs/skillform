import React from 'react';
import { useTranslation } from 'react-i18next';
import { LinkedinLogo as Linkedin, InstagramLogo as Instagram, Palette } from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SocialMediaFieldsProps {
  linkedinUrl: string;
  instagramUrl: string;
  behanceUrl: string;
  onLinkedinChange: (value: string) => void;
  onInstagramChange: (value: string) => void;
  onBehanceChange: (value: string) => void;
  className?: string;
}

export const SocialMediaFields: React.FC<SocialMediaFieldsProps> = ({
  linkedinUrl,
  instagramUrl,
  behanceUrl,
  onLinkedinChange,
  onInstagramChange,
  onBehanceChange,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">
          {t('profile.socialMedia.title', 'Social Media')}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t('profile.socialMedia.subtitle', 'Add your professional social media profiles (optional)')}
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="linkedin" className="flex items-center gap-2 text-sm">
            <Linkedin className="h-4 w-4 text-social-linkedin" />
            {t('profile.socialMedia.linkedin', 'LinkedIn')}
          </Label>
          <Input
            id="linkedin"
            type="url"
            value={linkedinUrl}
            onChange={(e) => onLinkedinChange(e.target.value)}
            placeholder="https://linkedin.com/in/username"
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="instagram" className="flex items-center gap-2 text-sm">
            <Instagram className="h-4 w-4 text-social-instagram" />
            {t('profile.socialMedia.instagram', 'Instagram')}
          </Label>
          <Input
            id="instagram"
            type="url"
            value={instagramUrl}
            onChange={(e) => onInstagramChange(e.target.value)}
            placeholder="https://instagram.com/username"
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="behance" className="flex items-center gap-2 text-sm">
            <Palette className="h-4 w-4 text-social-behance" />
            {t('profile.socialMedia.behance', 'Behance')}
          </Label>
          <Input
            id="behance"
            type="url"
            value={behanceUrl}
            onChange={(e) => onBehanceChange(e.target.value)}
            placeholder="https://behance.net/username"
            className="bg-background border-border"
          />
        </div>
      </div>
    </div>
  );
};
