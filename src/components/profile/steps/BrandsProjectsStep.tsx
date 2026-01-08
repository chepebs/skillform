import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, X } from 'lucide-react';
import { BrandsProjectsData, YEARS, MONTHS } from '../types';
import { cn } from '@/lib/utils';

interface BrandsProjectsStepProps {
  form: UseFormReturn<BrandsProjectsData>;
}

const BrandsProjectsStep: React.FC<BrandsProjectsStepProps> = ({ form }) => {
  const brandsArray = useFieldArray({
    control: form.control,
    name: 'brands_managed',
  });

  const projectsArray = useFieldArray({
    control: form.control,
    name: 'recent_projects',
  });

  const addBrand = () => {
    brandsArray.append({
      brand_name: '',
      description: '',
      years_managed: 0,
    });
  };

  const addProject = () => {
    projectsArray.append({
      project_name: '',
      brand: '',
      description: '',
      project_year: new Date().getFullYear(),
      project_month: new Date().getMonth() + 1,
      role_in_project: '',
      key_results: '',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Brands & Projects</h2>
        <p className="text-muted-foreground">Showcase your brand experience and recent projects</p>
      </div>

      {/* Brands Managed */}
      <div className="space-y-4">
        <Label className="text-lg">Brands Managed</Label>

        {brandsArray.fields.map((field, index) => (
          <div
            key={field.id}
            className={cn(
              'p-4 rounded-lg border border-dark-border bg-dark-elevated/50 space-y-4',
              'animate-fade-in'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Brand {index + 1}</span>
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
                    <Label className="text-xs">Brand Name <span className="text-destructive">*</span></Label>
                    <FormControl>
                      <Input {...field} placeholder="Brand name" className="bg-dark-elevated border-dark-border" />
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
                    <Label className="text-xs">Years Managed</Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-dark-elevated border-dark-border"
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
                  <Label className="text-xs">Description</Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief description..."
                      className="bg-dark-elevated border-dark-border resize-none"
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
          className="w-full border-dashed border-dark-border hover:border-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg">Recent Projects <span className="text-destructive">*</span></Label>
          <span className="text-xs text-muted-foreground">Minimum 1 required</span>
        </div>

        {form.formState.errors.recent_projects?.root && (
          <p className="text-sm text-destructive">{form.formState.errors.recent_projects.root.message}</p>
        )}

        {projectsArray.fields.map((field, index) => (
          <div
            key={field.id}
            className={cn(
              'p-4 rounded-lg border border-dark-border bg-dark-elevated/50 space-y-4',
              'animate-fade-in'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Project {index + 1}</span>
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
                    <Label className="text-xs">Project Name <span className="text-destructive">*</span></Label>
                    <FormControl>
                      <Input {...field} placeholder="Project name" className="bg-dark-elevated border-dark-border" />
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
                    <Label className="text-xs">Brand</Label>
                    <FormControl>
                      <Input {...field} placeholder="Associated brand" className="bg-dark-elevated border-dark-border" />
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
                  <Label className="text-xs">Description <span className="text-destructive">*</span></Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Project description..."
                      className="bg-dark-elevated border-dark-border resize-none"
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
                    <Label className="text-xs">Year</Label>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-dark-elevated border-dark-border">
                          <SelectValue placeholder="Year" />
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
                    <Label className="text-xs">Month</Label>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-dark-elevated border-dark-border">
                          <SelectValue placeholder="Month" />
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
                    <Label className="text-xs">Your Role</Label>
                    <FormControl>
                      <Input {...field} placeholder="Your role" className="bg-dark-elevated border-dark-border" />
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
                  <Label className="text-xs">Key Results</Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Key achievements and results..."
                      className="bg-dark-elevated border-dark-border resize-none"
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
          className="w-full border-dashed border-dark-border hover:border-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>
    </div>
  );
};

export default BrandsProjectsStep;
