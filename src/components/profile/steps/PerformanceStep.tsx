import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { PerformanceData } from '../types';
import { cn } from '@/lib/utils';

interface PerformanceStepProps {
  form: UseFormReturn<PerformanceData>;
}

const RatioDisplay: React.FC<{ won: number; participated: number; label: string }> = ({ won, participated, label }) => {
  const ratio = participated > 0 ? (won / participated) * 100 : 0;

  const getColor = () => {
    if (ratio > 60) return 'text-green-500 bg-green-500';
    if (ratio >= 30) return 'text-yellow-500 bg-yellow-500';
    return 'text-red-500 bg-red-500';
  };

  const colorClass = getColor();

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-border">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn('text-2xl font-bold', colorClass.split(' ')[0])}>{ratio.toFixed(1)}%</p>
      </div>
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90">
          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={`${(ratio / 100) * 176} 176`}
            className={colorClass.split(' ')[1]}
          />
        </svg>
        <span className={cn('absolute inset-0 flex items-center justify-center text-xs font-medium', colorClass.split(' ')[0])}>
          {Math.round(ratio)}%
        </span>
      </div>
    </div>
  );
};

const PerformanceStep: React.FC<PerformanceStepProps> = ({ form }) => {
  const { t } = useTranslation();
  const pitchesWon = form.watch('pitches_won') || 0;
  const pitchesParticipated = form.watch('pitches_participated') || 0;
  const effieWon = form.watch('effie_awards_won') || 0;
  const effieParticipated = form.watch('effie_awards_participated') || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">{t('profile.performance.title')}</h2>
        <p className="text-muted-foreground">{t('profile.performance.subtitle')}</p>
      </div>

      {/* Pitches Section */}
      <div className="space-y-4">
        <Label className="text-lg">{t('profile.performance.pitchWinRatio')}</Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pitches_won"
            render={({ field }) => (
              <FormItem>
                <Label>{t('profile.performance.pitchesWon')}</Label>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className="bg-background border-border focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pitches_participated"
            render={({ field }) => (
              <FormItem>
                <Label>{t('profile.performance.pitchesParticipated')}</Label>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className="bg-background border-border focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <RatioDisplay won={pitchesWon} participated={pitchesParticipated} label={t('profile.performance.pitchWinRatio')} />
      </div>

      {/* Brands Section */}
      <div className="space-y-4">
        <Label className="text-lg">{t('profile.performance.brandCreations')}</Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand_creations"
            render={({ field }) => (
              <FormItem>
                <Label>{t('profile.performance.brandCreations')}</Label>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className="bg-background border-border focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand_refreshes"
            render={({ field }) => (
              <FormItem>
                <Label>{t('profile.performance.brandRefreshes')}</Label>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className="bg-background border-border focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Effie Section */}
      <div className="space-y-4">
        <Label className="text-lg">{t('profile.performance.effieWinRatio')}</Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="effie_awards_won"
            render={({ field }) => (
              <FormItem>
                <Label>{t('profile.performance.effieAwardsWon')}</Label>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className="bg-background border-border focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="effie_awards_participated"
            render={({ field }) => (
              <FormItem>
                <Label>{t('profile.performance.effieAwardsParticipated')}</Label>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className="bg-background border-border focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <RatioDisplay won={effieWon} participated={effieParticipated} label={t('profile.performance.effieWinRatio')} />
      </div>
    </div>
  );
};

export default PerformanceStep;
