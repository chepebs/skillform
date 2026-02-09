import React, { useEffect } from 'react';
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
  variant?: 'default' | 'dark';
}

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
  compact = false,
  variant = 'default',
}) => {
  const { i18n } = useTranslation();

  // Load saved language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('preferredLanguage', lng);
  };

  const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

  const isDark = variant === 'dark';

  return (
    <Select value={i18n.language} onValueChange={changeLanguage}>
      <SelectTrigger
        className={cn(
          'transition-all duration-300',
          isDark 
            ? 'bg-black/80 border-white/20 text-white hover:border-foreground focus:border-foreground focus:ring-foreground/20'
            : 'bg-card border-border focus:border-foreground hover:border-foreground',
          compact ? 'w-auto min-w-[100px] px-2' : 'w-40',
          className
        )}
        aria-label="Select language"
      >
        <div className="flex items-center gap-2">
          <Globe className={cn("h-4 w-4 flex-shrink-0", isDark ? "text-white/60" : "text-muted-foreground")} />
          <span className="text-base">{currentLanguage.flag}</span>
          <span className="text-sm">{currentLanguage.label}</span>
        </div>
      </SelectTrigger>
      <SelectContent className={cn(
        isDark ? "bg-[#0a0a0a] border-white/20" : "bg-card border-border"
      )}>
        {languages.map((language) => (
          <SelectItem
            key={language.code}
            value={language.code}
            className={cn(
              "cursor-pointer",
              isDark ? "focus:bg-foreground/20 text-white" : "focus:bg-accent"
            )}
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
