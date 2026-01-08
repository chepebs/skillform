import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, X, Trophy } from 'lucide-react';
import { AwardsData, AWARD_TYPES } from '../types';
import { cn } from '@/lib/utils';

interface AwardsStepProps {
  form: UseFormReturn<AwardsData>;
  onSkip?: () => void;
}

const AWARD_YEARS = Array.from({ length: 36 }, (_, i) => 2025 - i);

const AwardsStep: React.FC<AwardsStepProps> = ({ form, onSkip }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'awards',
  });

  const addAward = () => {
    append({
      award_name: '',
      award_type: '',
      category: '',
      award_year: new Date().getFullYear(),
      won: true,
      description: '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Awards & Recognition</h2>
        <p className="text-muted-foreground">Share your achievements (optional)</p>
      </div>

      {/* Awards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <Label className="text-lg">Awards</Label>
          </div>
          <span className="text-xs text-muted-foreground">Optional</span>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className={cn(
              'p-4 rounded-lg border border-dark-border bg-dark-elevated/50 space-y-4',
              'animate-fade-in'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Award {index + 1}</span>
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
                name={`awards.${index}.award_name`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">Award Name <span className="text-destructive">*</span></Label>
                    <FormControl>
                      <Input {...field} placeholder="Award name" className="bg-dark-elevated border-dark-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`awards.${index}.award_type`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">Award Type</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-dark-elevated border-dark-border">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AWARD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name={`awards.${index}.category`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">Category</Label>
                    <FormControl>
                      <Input {...field} placeholder="Category" className="bg-dark-elevated border-dark-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`awards.${index}.award_year`}
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
                        {AWARD_YEARS.map((year) => (
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
                name={`awards.${index}.won`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 pt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label className="text-xs cursor-pointer">Won Award</Label>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`awards.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <Label className="text-xs">Description</Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief description of the award..."
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
          onClick={addAward}
          className="w-full border-dashed border-dark-border hover:border-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Award
        </Button>
      </div>

      {/* Consulting Work */}
      <div className="space-y-4">
        <Label className="text-lg">Consulting Work</Label>
        <FormField
          control={form.control}
          name="consulting_work"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe any consulting work, speaking engagements, or other professional activities..."
                  className="bg-dark-elevated border-dark-border resize-none min-h-[120px]"
                />
              </FormControl>
              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">{field.value?.length || 0}/1000</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {onSkip && (
        <div className="text-center pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </Button>
        </div>
      )}
    </div>
  );
};

export default AwardsStep;
