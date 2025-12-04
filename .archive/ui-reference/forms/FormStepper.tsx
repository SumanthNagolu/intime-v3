'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { Check, Circle, AlertCircle, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  fields: string[]; // Field names for validation
  optional?: boolean;
  component: React.ReactNode;
}

export interface FormStepperProps {
  steps: FormStep[];
  onComplete: () => void;
  onStepChange?: (stepIndex: number) => void;
  onSaveDraft?: () => void;
  showProgress?: boolean;
  showStepNumbers?: boolean;
  allowSkipAhead?: boolean;
  className?: string;
  stepIndicatorPosition?: 'top' | 'left';
  submitLabel?: string;
  nextLabel?: string;
  previousLabel?: string;
  saveDraftLabel?: string;
}

export function FormStepper({
  steps,
  onComplete,
  onStepChange,
  onSaveDraft,
  showProgress = true,
  showStepNumbers = true,
  allowSkipAhead = false,
  className,
  stepIndicatorPosition = 'top',
  submitLabel = 'Submit',
  nextLabel = 'Next',
  previousLabel = 'Previous',
  saveDraftLabel = 'Save Draft',
}: FormStepperProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [visitedSteps, setVisitedSteps] = React.useState<Set<number>>(new Set([0]));

  const { trigger, formState: { errors } } = useFormContext();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // Check if a step has errors
  const stepHasErrors = React.useCallback(
    (stepIndex: number): boolean => {
      const step = steps[stepIndex];
      return step.fields.some((field) => {
        const fieldError = field.split('.').reduce((obj: any, key) => obj?.[key], errors);
        return !!fieldError;
      });
    },
    [steps, errors]
  );

  // Validate current step fields
  const validateStep = React.useCallback(
    async (stepIndex: number): Promise<boolean> => {
      const step = steps[stepIndex];
      const isValid = await trigger(step.fields);
      return isValid;
    },
    [steps, trigger]
  );

  // Go to next step
  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid || steps[currentStep].optional) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      setVisitedSteps((prev) => new Set([...prev, nextStepIndex]));
      onStepChange?.(nextStepIndex);
    }
  };

  // Go to previous step
  const handlePrevious = () => {
    const prevStepIndex = currentStep - 1;
    setCurrentStep(prevStepIndex);
    onStepChange?.(prevStepIndex);
  };

  // Go to specific step
  const goToStep = async (stepIndex: number) => {
    if (!allowSkipAhead && stepIndex > currentStep) {
      // Must validate all steps in between
      for (let i = currentStep; i < stepIndex; i++) {
        const isValid = await validateStep(i);
        if (!isValid && !steps[i].optional) {
          return;
        }
        setCompletedSteps((prev) => new Set([...prev, i]));
      }
    }

    if (allowSkipAhead || stepIndex < currentStep || visitedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
      setVisitedSteps((prev) => new Set([...prev, stepIndex]));
      onStepChange?.(stepIndex);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid || steps[currentStep].optional) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      onComplete();
    }
  };

  // Step indicator component
  const renderStepIndicator = (step: FormStep, index: number) => {
    const isActive = currentStep === index;
    const isCompleted = completedSteps.has(index);
    const hasErrors = stepHasErrors(index);
    const isVisited = visitedSteps.has(index);
    const canNavigate = allowSkipAhead || index < currentStep || isVisited;

    return (
      <button
        key={step.id}
        type="button"
        onClick={() => canNavigate && goToStep(index)}
        disabled={!canNavigate}
        className={cn(
          'flex items-center gap-3 text-left transition-colors',
          stepIndicatorPosition === 'top' ? 'flex-col text-center' : 'w-full py-2',
          canNavigate && 'cursor-pointer hover:text-primary',
          !canNavigate && 'cursor-not-allowed opacity-50'
        )}
      >
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
            isActive && 'border-primary bg-primary text-primary-foreground',
            isCompleted && !hasErrors && 'border-green-500 bg-green-500 text-white',
            hasErrors && isVisited && 'border-destructive bg-destructive text-white',
            !isActive && !isCompleted && !hasErrors && 'border-muted-foreground/30'
          )}
        >
          {hasErrors && isVisited ? (
            <AlertCircle className="h-4 w-4" />
          ) : isCompleted ? (
            <Check className="h-4 w-4" />
          ) : showStepNumbers ? (
            <span className="text-sm font-medium">{index + 1}</span>
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </div>
        <div className={stepIndicatorPosition === 'left' ? 'flex-1' : ''}>
          <div
            className={cn(
              'text-sm font-medium',
              isActive && 'text-primary',
              !isActive && 'text-muted-foreground'
            )}
          >
            {step.title}
            {step.optional && (
              <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
            )}
          </div>
          {step.description && stepIndicatorPosition === 'left' && (
            <div className="text-xs text-muted-foreground">{step.description}</div>
          )}
        </div>
      </button>
    );
  };

  // Step connector line
  const renderConnector = (index: number) => {
    if (index >= steps.length - 1) return null;

    const isCompleted = completedSteps.has(index);

    return stepIndicatorPosition === 'top' ? (
      <div
        className={cn(
          'flex-1 h-0.5 mx-2',
          isCompleted ? 'bg-green-500' : 'bg-muted-foreground/30'
        )}
      />
    ) : (
      <div
        className={cn(
          'ml-4 w-0.5 h-6',
          isCompleted ? 'bg-green-500' : 'bg-muted-foreground/30'
        )}
      />
    );
  };

  // Top position step indicators
  const renderTopStepIndicators = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {renderStepIndicator(step, index)}
            {renderConnector(index)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // Left position step indicators
  const renderLeftStepIndicators = () => (
    <div className="w-64 border-r pr-6 mr-6 space-y-2">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {renderStepIndicator(step, index)}
          {renderConnector(index)}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className={cn('', className)}>
      {/* Progress bar */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-muted-foreground">
              {Math.round(progressPercentage)}% complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      {/* Main layout */}
      <div
        className={cn(
          'flex',
          stepIndicatorPosition === 'left' ? 'flex-row' : 'flex-col'
        )}
      >
        {/* Step indicators */}
        {stepIndicatorPosition === 'top'
          ? renderTopStepIndicators()
          : renderLeftStepIndicators()}

        {/* Step content */}
        <div className="flex-1">
          {/* Current step header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
            {steps[currentStep].description && (
              <p className="text-sm text-muted-foreground mt-1">
                {steps[currentStep].description}
              </p>
            )}
          </div>

          {/* Step content */}
          <div className="min-h-[200px]">{steps[currentStep].component}</div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div>
              {onSaveDraft && (
                <Button type="button" variant="outline" onClick={onSaveDraft}>
                  <Save className="mr-2 h-4 w-4" />
                  {saveDraftLabel}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {previousLabel}
                </Button>
              )}
              {isLastStep ? (
                <Button type="button" onClick={handleSubmit}>
                  {submitLabel}
                </Button>
              ) : (
                <Button type="button" onClick={handleNext}>
                  {nextLabel}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple step component wrapper for cleaner usage
export interface StepContentProps {
  children: React.ReactNode;
  className?: string;
}

export function StepContent({ children, className }: StepContentProps) {
  return <div className={cn('space-y-6', className)}>{children}</div>;
}

export default FormStepper;
