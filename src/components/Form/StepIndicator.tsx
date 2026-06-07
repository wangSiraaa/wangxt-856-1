import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isPending = index > currentStep;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'step-indicator',
                  isCompleted && 'step-completed',
                  isActive && 'step-active',
                  isPending && 'step-pending'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive && 'text-primary-600',
                  isCompleted && 'text-success-600',
                  isPending && 'text-gray-400'
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'step-line w-16',
                  isCompleted && index < currentStep && 'step-line-completed',
                  isActive && 'step-line-active',
                  isPending && 'step-line-pending'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
