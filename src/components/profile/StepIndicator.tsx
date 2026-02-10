import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, stepTitles }) => {
  const { t } = useTranslation();

  const defaultTitles = [
    t('profile.basicInfo.title'),
    t('profile.professional.title'),
    t('profile.education.title'),
    t('profile.performance.title'),
    t('profile.projects.title'),
    t('profile.languages.title'),
    t('profile.skills.title'),
    t('profile.industries.title'),
    t('profile.awards.title'),
    t('profile.review.title'),
  ];

  const titles = stepTitles || defaultTitles.slice(0, totalSteps);

  return (
    <div className="mb-8 space-y-6">
      {/* Section cards row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {titles.map((title, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <div
              key={stepNumber}
              className={cn(
                'p-3 border transition-colors',
                isActive && 'border-foreground bg-muted',
                isCompleted && 'border-border bg-muted/50',
                !isActive && !isCompleted && 'border-border'
              )}
            >
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
                {t('profile.creation.sectionLabel', { number: stepNumber })}
              </p>
              <p className={cn(
                'text-sm font-medium leading-tight',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Numbered circles row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {titles.map((_, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isCompleted = currentStep > stepNumber;

            return (
              <div
                key={stepNumber}
                className={cn(
                  'w-8 h-8 flex items-center justify-center text-sm font-medium border transition-colors',
                  isActive && 'border-foreground bg-foreground text-background',
                  isCompleted && 'border-foreground bg-foreground text-background',
                  !isActive && !isCompleted && 'border-border text-muted-foreground'
                )}
                style={{ borderRadius: '50%' }}
              >
                {stepNumber}
              </div>
            );
          })}
        </div>
        <span className="text-sm text-muted-foreground">
          {t('profile.creation.stepIndicator', { current: currentStep, total: totalSteps })}
        </span>
      </div>
    </div>
  );
};

export default StepIndicator;
