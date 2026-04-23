import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, X, Calendar, GraduationCap } from '@phosphor-icons/react';
import { EducationData } from '../types';
import { cn } from '@/lib/utils';

interface EducationStepProps {
  form: UseFormReturn<EducationData>;
}

const EducationStep: React.FC<EducationStepProps> = ({ form }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'previous_agencies',
  });

  const addAgency = () => {
    append({
      agency_name: '',
      role: '',
      start_date: '',
      end_date: '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Education & Experience</h2>
        <p className="text-muted-foreground">Your academic background and work history</p>
      </div>

      <FormField
        control={form.control}
        name="academic_degree"
        render={({ field }) => (
          <FormItem>
            <Label>Academic Degree <span className="text-destructive">*</span></Label>
            <FormControl>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...field}
                  placeholder="e.g., MBA in Marketing"
                  className="pl-10 bg-dark-elevated border-dark-border focus:border-primary"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="years_of_experience"
        render={({ field }) => (
          <FormItem>
            <Label>Years of Experience <span className="text-destructive">*</span></Label>
            <FormControl>
              <Input
                {...field}
                type="number"
                min={0}
                max={50}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                className="bg-dark-elevated border-dark-border focus:border-primary"
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">0-50 years</p>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Previous Agencies */}
      <div className="space-y-4">
        <Label>Previous Agencies</Label>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className={cn(
              'p-4 rounded-lg border border-dark-border bg-dark-elevated/50 space-y-4',
              'animate-fade-in'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Agency {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`previous_agencies.${index}.agency_name`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">Agency Name <span className="text-destructive">*</span></Label>
                    <FormControl>
                      <Input {...field} placeholder="Agency name" className="bg-dark-elevated border-dark-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`previous_agencies.${index}.role`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">Role <span className="text-destructive">*</span></Label>
                    <FormControl>
                      <Input {...field} placeholder="Your role" className="bg-dark-elevated border-dark-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`previous_agencies.${index}.start_date`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">Start Date</Label>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input {...field} type="date" className="pl-10 bg-dark-elevated border-dark-border" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`previous_agencies.${index}.end_date`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">End Date</Label>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input {...field} type="date" className="pl-10 bg-dark-elevated border-dark-border" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addAgency}
          className="w-full border-dashed border-dark-border hover:border-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Previous Agency
        </Button>
      </div>
    </div>
  );
};

export default EducationStep;
