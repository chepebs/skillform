import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CheckCircle as CheckCircle2, Circle, CircleNotch as Loader2 } from '@phosphor-icons/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Industry {
  id: string;
  name: string;
  sort_order: number;
}

interface IndustriesStepProps {
  form: UseFormReturn<any>;
}

const IndustriesStep: React.FC<IndustriesStepProps> = ({ form }) => {
  const { t } = useTranslation();
  const [availableIndustries, setAvailableIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fields = form.watch('industries') || [];
  
  const setFields = (newFields: any[]) => {
    form.setValue('industries', newFields);
  };

  useEffect(() => {
    const fetchIndustries = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching industries:', error);
      } else {
        setAvailableIndustries(data || []);
      }
      setLoading(false);
    };

    fetchIndustries();
  }, []);

  const toggleIndustry = (industryId: string) => {
    const existingIndex = fields.findIndex((f: any) => f.industry_id === industryId);

    if (existingIndex >= 0) {
      setFields(fields.filter((_: any, i: number) => i !== existingIndex));
    } else {
      setFields([...fields, { industry_id: industryId, years_experience: 1 }]);
    }
  };

  const updateYears = (industryId: string, years: number) => {
    setFields(fields.map((f: any) => 
      f.industry_id === industryId ? { ...f, years_experience: years } : f
    ));
  };

  const isSelected = (industryId: string) => {
    return fields.some((f: any) => f.industry_id === industryId);
  };

  const getYears = (industryId: string): number => {
    const field = fields.find((f: any) => f.industry_id === industryId);
    return field?.years_experience || 1;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {t('profile.industries.title', 'Industry Experience')}
        </h2>
        <p className="text-muted-foreground">
          {t('profile.industries.subtitle', 'Select the industries where you have professional experience')}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {t('profile.industries.instructions', 'Select at least 1 industry. You can specify years of experience for each.')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableIndustries.map((industry) => {
          const selected = isSelected(industry.id);
          
          return (
            <div
              key={industry.id}
              onClick={() => toggleIndustry(industry.id)}
              className={cn(
                'p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
                'hover:border-primary/50 hover:-translate-y-0.5',
                selected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:bg-accent/50'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                {selected ? (
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <span className="font-medium text-foreground">{industry.name}</span>
              </div>

              {selected && (
                <div
                  className="mt-3 pt-3 border-t border-border"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Label className="text-xs text-muted-foreground">
                    {t('profile.industries.yearsExperience', 'Years of experience')}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={getYears(industry.id)}
                    onChange={(e) => updateYears(industry.id, parseInt(e.target.value) || 0)}
                    className="mt-1 h-8 bg-background border-border"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {t('profile.industries.selectedCount', { count: fields.length, defaultValue: `${fields.length} industries selected` })}
      </div>

      {fields.length === 0 && (
        <p className="text-center text-sm text-amber-500">
          {t('profile.industries.minimumRequired', 'Please select at least 1 industry to continue')}
        </p>
      )}
    </div>
  );
};

export default IndustriesStep;
