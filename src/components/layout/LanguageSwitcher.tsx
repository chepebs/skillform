import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
  compact = false,
}) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <Select value={i18n.language} onValueChange={changeLanguage}>
      <SelectTrigger
        className={cn(
          'bg-dark-elevated border-dark-border focus:border-primary transition-all duration-300',
          compact ? 'w-16 px-2' : 'w-32',
          className
        )}
        aria-label="Select language"
      >
        <div className="flex items-center gap-2">
          {compact ? (
            <span className="text-base">{currentLanguage.flag}</span>
          ) : (
            <>
              <Globe className="h-4 w-4 text-muted-foreground" />
              <SelectValue>
                <span className="flex items-center gap-2">
                  <span>{currentLanguage.flag}</span>
                  <span className="hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
                </span>
              </SelectValue>
            </>
          )}
        </div>
      </SelectTrigger>
      <SelectContent className="bg-dark-elevated border-dark-border">
        {languages.map((language) => (
          <SelectItem
            key={language.code}
            value={language.code}
            className="cursor-pointer focus:bg-dark-surface"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{language.flag}</span>
              <span>{language.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
