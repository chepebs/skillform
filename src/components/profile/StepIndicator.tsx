import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, User, Briefcase, GraduationCap, BarChart3, FolderOpen, Languages, Sparkles, Award, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const STEP_ICONS = [User, Briefcase, GraduationCap, BarChart3, FolderOpen, Languages, Sparkles, Award, ClipboardList];

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const { t } = useTranslation();
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const stepTitles = [
    t('profile.basicInfo.title'),
    t('profile.professional.title'),
    t('profile.education.title'),
    t('profile.performance.title'),
    t('profile.projects.title'),
    t('profile.languages.title'),
    t('profile.skills.title'),
    t('profile.awards.title'),
    t('profile.review.title'),
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">
          {t('profile.creation.stepIndicator', { current: currentStep, total: totalSteps })}
        </span>
        <span className="text-sm text-muted-foreground">
          {t('profile.creation.progressLabel', { percent: Math.round(progress) })}
        </span>
      </div>
      <Progress value={progress} className="h-2 mb-6" />
      
      <div className="hidden md:flex justify-between">
        {stepTitles.slice(0, totalSteps).map((title, index) => {
          const stepNumber = index + 1;
          const Icon = STEP_ICONS[index] || ClipboardList;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <div
              key={stepNumber}
              className={cn(
                'flex flex-col items-center gap-2 transition-colors',
                isActive && 'text-primary',
                isCompleted && 'text-green-500',
                !isActive && !isCompleted && 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                  isActive && 'border-primary bg-primary/10',
                  isCompleted && 'border-green-500 bg-green-500/10',
                  !isActive && !isCompleted && 'border-muted bg-muted/10'
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className="text-xs font-medium text-center max-w-[80px] truncate">{title}</span>
            </div>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="md:hidden flex items-center justify-center gap-1">
        {stepTitles.slice(0, totalSteps).map((_, index) => {
          const stepNumber = index + 1;
          return (
            <div
              key={stepNumber}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                currentStep === stepNumber && 'w-4 bg-primary',
                currentStep > stepNumber && 'bg-green-500',
                currentStep < stepNumber && 'bg-muted'
              )}
            />
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
