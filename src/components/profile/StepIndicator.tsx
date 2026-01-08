import React from 'react';
import { Check, User, Briefcase, GraduationCap, BarChart3, FolderOpen, Languages, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Professional', icon: Briefcase },
  { id: 3, title: 'Education', icon: GraduationCap },
  { id: 4, title: 'Performance', icon: BarChart3 },
  { id: 5, title: 'Brands', icon: FolderOpen },
  { id: 6, title: 'Languages', icon: Languages },
  { id: 7, title: 'Awards', icon: Award },
];

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">Step {currentStep} of {totalSteps}</span>
        <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
      </div>
      <Progress value={progress} className="h-2 mb-6" />
      
      <div className="hidden md:flex justify-between">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div
              key={step.id}
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
              <span className="text-xs font-medium text-center">{step.title}</span>
            </div>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="md:hidden flex items-center justify-center gap-1">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              currentStep === step.id && 'w-4 bg-primary',
              currentStep > step.id && 'bg-green-500',
              currentStep < step.id && 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
