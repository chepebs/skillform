import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, X } from '@phosphor-icons/react';
import { LanguagesData, LANGUAGES_OPTIONS } from '../types';
import { cn } from '@/lib/utils';

interface LanguagesStepProps {
  form: UseFormReturn<LanguagesData>;
}

const LevelBar: React.FC<{ level: number; label: string }> = ({ level, label }) => {
  const getColor = () => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{level}%</span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div className={cn('h-full transition-all duration-300', getColor())} style={{ width: `${level}%` }} />
      </div>
    </div>
  );
};

const LanguagesStep: React.FC<LanguagesStepProps> = ({ form }) => {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'languages',
  });

  const addLanguage = () => {
    append({ language: '', speaking_level: 50, reading_level: 50, writing_level: 50, is_native: false });
  };

  React.useEffect(() => {
    if (fields.length === 0) addLanguage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">{t('profile.languages.title')}</h2>
        <p className="text-muted-foreground">{t('profile.languages.subtitle')}</p>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-lg">{t('profile.counters.languagesLabel')} <span className="text-destructive">*</span></Label>
        <span className="text-xs text-muted-foreground">{t('profile.counters.minLanguagesRequired')}</span>
      </div>

      {form.formState.errors.languages?.root && (
        <p className="text-sm text-destructive">{form.formState.errors.languages.root.message}</p>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className={cn('p-4 rounded-lg border border-border bg-background/50 space-y-4', 'animate-fade-in')}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t('profile.counters.languageN', { n: index + 1 })}</span>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <FormField
              control={form.control}
              name={`languages.${index}.language`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Label className="text-xs">{t('profile.languages.language')} <span className="text-destructive">*</span></Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder={t('profile.languages.languagePlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LANGUAGES_OPTIONS.map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`languages.${index}.is_native`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 pt-6">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <Label className="text-xs cursor-pointer">{t('profile.languages.nativeLanguage')}</Label>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name={`languages.${index}.speaking_level`}
              render={({ field }) => (
                <FormItem>
                  <LevelBar level={field.value} label={t('profile.languages.speakingLevel')} />
                  <FormControl>
                    <Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} min={0} max={100} step={5} className="mt-2" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`languages.${index}.reading_level`}
              render={({ field }) => (
                <FormItem>
                  <LevelBar level={field.value} label={t('profile.languages.readingLevel')} />
                  <FormControl>
                    <Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} min={0} max={100} step={5} className="mt-2" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`languages.${index}.writing_level`}
              render={({ field }) => (
                <FormItem>
                  <LevelBar level={field.value} label={t('profile.languages.writingLevel')} />
                  <FormControl>
                    <Slider value={[field.value]} onValueChange={(v) => field.onChange(v[0])} min={0} max={100} step={5} className="mt-2" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addLanguage}
        className="w-full border-dashed border-border hover:border-primary"
      >
        <Plus className="mr-2 h-4 w-4" />
        {t('profile.counters.addAnotherLanguage')}
      </Button>
    </div>
  );
};

export default LanguagesStep;
