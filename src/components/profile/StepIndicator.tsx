import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, User, Briefcase, GraduationCap, BarChart3, FolderOpen, Globe, Sparkles, Award, ClipboardList, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Step configuration with icons and translation keys
const STEP_CONFIG: { icon: LucideIcon; translationKey: string }[] = [
  { icon: User, translationKey: 'profile.basicInfo.title' },           // Step 1
  { icon: Briefcase, translationKey: 'profile.professional.title' },   // Step 2
  { icon: GraduationCap, translationKey: 'profile.education.title' },  // Step 3
  { icon: BarChart3, translationKey: 'profile.performance.title' },    // Step 4
  { icon: FolderOpen, translationKey: 'profile.projects.title' },      // Step 5
  { icon: Globe, translationKey: 'profile.languages.title' },          // Step 6
  { icon: Sparkles, translationKey: 'profile.skills.title' },          // Step 7: Skills & Expertise
  { icon: Award, translationKey: 'profile.awards.title' },             // Step 8: Awards
  { icon: ClipboardList, translationKey: 'profile.review.title' },     // Step 9: Review
];

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const { t } = useTranslation();
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  // Get step titles from translations
  const stepTitles = STEP_CONFIG.slice(0, totalSteps).map(step => t(step.translationKey));
  const currentStepTitle = stepTitles[currentStep - 1] || '';

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
      
      {/* Desktop view - shows all steps */}
      <TooltipProvider>
        <div className="hidden md:flex justify-between">
          {STEP_CONFIG.slice(0, totalSteps).map((step, index) => {
            const stepNumber = index + 1;
            const Icon = step.icon;
            const title = t(step.translationKey);
            const isActive = currentStep === stepNumber;
            const isCompleted = currentStep > stepNumber;

            return (
              <Tooltip key={stepNumber}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'flex flex-col items-center gap-2 transition-colors cursor-default',
                      isActive && 'text-primary',
                      isCompleted && 'text-green-500',
                      !isActive && !isCompleted && 'text-muted-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 flex items-center justify-center border-2 transition-all',
                        isActive && 'border-primary bg-primary/10',
                        isCompleted && 'border-green-500 bg-green-500/10',
                        !isActive && !isCompleted && 'border-muted bg-muted/10'
                      )}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className="text-xs font-medium text-center max-w-[80px] truncate">{title}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('profile.creation.stepIndicator', { current: stepNumber, total: totalSteps })}: {title}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Mobile view - shows dots and current step name */}
      <div className="md:hidden">
        <div className="flex items-center justify-center gap-1 mb-2">
          {STEP_CONFIG.slice(0, totalSteps).map((_, index) => {
            const stepNumber = index + 1;
            return (
              <div
                key={stepNumber}
                className={cn(
                  'w-2 h-2 transition-all',
                  currentStep === stepNumber && 'w-4 bg-primary',
                  currentStep > stepNumber && 'bg-green-500',
                  currentStep < stepNumber && 'bg-muted'
                )}
              />
            );
          })}
        </div>
        <p className="text-center text-sm font-medium text-primary">{currentStepTitle}</p>
      </div>
    </div>
  );
};

export default StepIndicator;
