import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, X } from '@phosphor-icons/react';
import { BrandsProjectsData, YEARS, MONTHS } from '../types';
import { cn } from '@/lib/utils';

interface BrandsProjectsStepProps {
  form: UseFormReturn<BrandsProjectsData>;
}

const BrandsProjectsStep: React.FC<BrandsProjectsStepProps> = ({ form }) => {
  const { t } = useTranslation();
  const brandsArray = useFieldArray({ control: form.control, name: 'brands_managed' });
  const projectsArray = useFieldArray({ control: form.control, name: 'recent_projects' });

  const addBrand = () => brandsArray.append({ brand_name: '', description: '', years_managed: 0 });
  const addProject = () =>
    projectsArray.append({
      project_name: '',
      brand: '',
      description: '',
      project_year: new Date().getFullYear(),
      project_month: new Date().getMonth() + 1,
      role_in_project: '',
      key_results: '',
    });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">{t('profile.projects.title')}</h2>
        <p className="text-muted-foreground">{t('profile.projects.subtitle')}</p>
      </div>

      {/* Brands Managed */}
      <div className="space-y-4">
        <Label className="text-lg">{t('profile.projects.brandsManaged')}</Label>

        {brandsArray.fields.map((field, index) => (
          <div
            key={field.id}
            className={cn('p-4 rounded-lg border border-border bg-background/50 space-y-4', 'animate-fade-in')}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t('profile.counters.brandN', { n: index + 1 })}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => brandsArray.remove(index)}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`brands_managed.${index}.brand_name`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">{t('profile.projects.brandName')} <span className="text-destructive">*</span></Label>
                    <FormControl>
                      <Input {...field} placeholder={t('profile.projects.brandNamePlaceholder')} className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`brands_managed.${index}.years_managed`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">{t('profile.projects.yearsManaged')}</Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-background border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`brands_managed.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <Label className="text-xs">{t('profile.projects.brandDescription')}</Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('profile.projects.brandDescriptionPlaceholder')}
                      className="bg-background border-border resize-none"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addBrand}
          className="w-full border-dashed border-border hover:border-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('profile.projects.addBrand')}
        </Button>
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg">{t('profile.projects.recentProjects')} <span className="text-destructive">*</span></Label>
          <span className="text-xs text-muted-foreground">{t('profile.projects.recentProjectsHelper')}</span>
        </div>

        {form.formState.errors.recent_projects?.root && (
          <p className="text-sm text-destructive">{form.formState.errors.recent_projects.root.message}</p>
        )}

        {projectsArray.fields.map((field, index) => (
          <div
            key={field.id}
            className={cn('p-4 rounded-lg border border-border bg-background/50 space-y-4', 'animate-fade-in')}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t('profile.counters.projectN', { n: index + 1 })}</span>
              {projectsArray.fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => projectsArray.remove(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`recent_projects.${index}.project_name`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">{t('profile.projects.projectName')} <span className="text-destructive">*</span></Label>
                    <FormControl>
                      <Input {...field} placeholder={t('profile.projects.projectNamePlaceholder')} className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`recent_projects.${index}.brand`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">{t('profile.projects.projectBrand')}</Label>
                    <FormControl>
                      <Input {...field} placeholder={t('profile.projects.projectBrandPlaceholder')} className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`recent_projects.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <Label className="text-xs">{t('profile.projects.projectDescription')} <span className="text-destructive">*</span></Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('profile.projects.projectDescriptionPlaceholder')}
                      className="bg-background border-border resize-none"
                      rows={2}
                    />
                  </FormControl>
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">{field.value?.length || 0}/500</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name={`recent_projects.${index}.project_year`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">{t('profile.projects.projectYear')}</Label>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder={t('profile.projects.projectYearPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YEARS.map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`recent_projects.${index}.project_month`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">{t('profile.projects.projectMonth')}</Label>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder={t('profile.projects.projectMonthPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month} value={month.toString()}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`recent_projects.${index}.role_in_project`}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <Label className="text-xs">{t('profile.projects.projectRole')}</Label>
                    <FormControl>
                      <Input {...field} placeholder={t('profile.projects.projectRolePlaceholder')} className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`recent_projects.${index}.key_results`}
              render={({ field }) => (
                <FormItem>
                  <Label className="text-xs">{t('profile.projects.keyResults')}</Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('profile.projects.keyResultsPlaceholder')}
                      className="bg-background border-border resize-none"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addProject}
          className="w-full border-dashed border-border hover:border-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('profile.projects.addProject')}
        </Button>
      </div>
    </div>
  );
};

export default BrandsProjectsStep;
