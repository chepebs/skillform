import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { SENIORITY_LEVELS } from '../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Plus, X, Calendar } from '@phosphor-icons/react';
import { ProfessionalInfoData } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Country {
  id: string;
  name: string;
  code: string;
}

interface Agency {
  id: string;
  name: string;
  country_id: string;
}

interface Department {
  id: string;
  name: string;
}

interface ProfessionalInfoStepProps {
  form: UseFormReturn<ProfessionalInfoData>;
}

const ProfessionalInfoStep: React.FC<ProfessionalInfoStepProps> = ({ form }) => {
  const { t } = useTranslation();
  const { role } = useAuth();
  const isMasterAdmin = role === 'admin';
  const [countries, setCountries] = useState<Country[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'previous_positions',
  });

  useEffect(() => {
    const fetchData = async () => {
      const [countriesRes, agenciesRes, departmentsRes] = await Promise.all([
        supabase.from('countries').select('*').order('name'),
        supabase.from('agencies').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
        supabase.from('departments').select('*').order('name'),
      ]);

      console.log('Agencies fetched:', agenciesRes.data, agenciesRes.error);
      if (countriesRes.data) setCountries(countriesRes.data);
      if (agenciesRes.data) {
        setAgencies(agenciesRes.data);
        setFilteredAgencies(agenciesRes.data); // Show all agencies by default
      }
      if (departmentsRes.data) setDepartments(departmentsRes.data);
    };

    fetchData();
  }, []);

  const selectedCountry = form.watch('country_id');

  useEffect(() => {
    // Filter agencies by country if selected, otherwise show all
    if (selectedCountry) {
      const filtered = agencies.filter((a) => a.country_id === selectedCountry || !a.country_id);
      setFilteredAgencies(filtered.length > 0 ? filtered : agencies); // Fall back to all if none match
    } else {
      setFilteredAgencies(agencies);
    }
  }, [selectedCountry, agencies]);

  const addPosition = () => {
    if (fields.length < 10) {
      append({
        position_title: '',
        company: '',
        start_date: '',
        end_date: '',
        description: '',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Professional Information</h2>
        <p className="text-muted-foreground">Tell us about your current and previous work</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="country_id"
          render={({ field }) => (
            <FormItem>
              <Label>Country <span className="text-destructive">*</span></Label>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-dark-elevated border-dark-border">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agency_id"
          render={({ field }) => (
            <FormItem>
              <Label>Agency <span className="text-destructive">*</span></Label>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-dark-elevated border-dark-border">
                    <SelectValue placeholder="Select agency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredAgencies.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No agencies available
                    </div>
                  ) : (
                    filteredAgencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="department_id"
        render={({ field }) => (
          <FormItem>
            <Label>Department</Label>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="bg-dark-elevated border-dark-border">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="current_position"
        render={({ field }) => (
          <FormItem>
            <Label>Current Position <span className="text-destructive">*</span></Label>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g., Senior Creative Director"
                className="bg-dark-elevated border-dark-border focus:border-primary"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="seniority_level"
        render={({ field }) => (
          <FormItem>
            <Label>
              {t('profile.seniorityLevel', 'Seniority Level')} <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground -mt-1 mb-1">
              {isMasterAdmin
                ? t('profile.seniorityLevelHint', 'Your current career level within the organization')
                : t('profile.seniorityLevelLocked', 'Seniority is set by an administrator and cannot be changed here.')}
            </p>
            <Select onValueChange={field.onChange} value={field.value || 'mid'} disabled={!isMasterAdmin}>
              <FormControl>
                <SelectTrigger className="bg-dark-elevated border-dark-border">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SENIORITY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {t(`profile.seniority.${level === 'c-level' ? 'cLevel' : level}`,
                      level === 'mid' ? 'Mid-Level'
                      : level === 'vp' ? 'Vice President / VP'
                      : level === 'c-level' ? 'C-Level Executive'
                      : level.charAt(0).toUpperCase() + level.slice(1))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Previous Positions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Previous Positions</Label>
          <span className="text-xs text-muted-foreground">{fields.length}/10</span>
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
              <span className="text-sm font-medium text-muted-foreground">Position {index + 1}</span>
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
                name={`previous_positions.${index}.position_title`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">Title <span className="text-destructive">*</span></Label>
                    <FormControl>
                      <Input {...field} placeholder="Position title" className="bg-dark-elevated border-dark-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`previous_positions.${index}.company`}
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-xs">Company <span className="text-destructive">*</span></Label>
                    <FormControl>
                      <Input {...field} placeholder="Company name" className="bg-dark-elevated border-dark-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`previous_positions.${index}.start_date`}
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
                name={`previous_positions.${index}.end_date`}
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

            <FormField
              control={form.control}
              name={`previous_positions.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <Label className="text-xs">Description</Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief description of your role..."
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

        {fields.length < 10 && (
          <Button
            type="button"
            variant="outline"
            onClick={addPosition}
            className="w-full border-dashed border-dark-border hover:border-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Previous Position
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfessionalInfoStep;
