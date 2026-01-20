'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Check, AlertCircle, ArrowLeft, ArrowRight, Loader2, Clock, Sparkles } from 'lucide-react'
import { TopNavigation } from '@/components/navigation/TopNavigation'
import { ResizableSidebarWrapper } from '@/components/navigation/ResizableSidebarWrapper'

/**
 * Step definition for the wizard
 */
export interface WizardStep {
  id: string
  label: string
  description?: string
}

/**
 * Props for WizardLayout component
 */
interface WizardLayoutProps {
  /** Wizard title (e.g., "Create Account") */
  title: string
  /** Entity name being created (e.g., "Acme Corporation") */
  entityName?: string
  /** Status badge (e.g., "Draft") */
  status?: string
  /** Array of step definitions */
  steps: WizardStep[]
  /** Current step number (1-indexed) */
  currentStep: number
  /** Handler for step clicks */
  onStepClick?: (stepNumber: number) => void
  /** Handler for back navigation */
  onBack?: () => void
  /** Handler for next/continue navigation */
  onNext?: () => void
  /** Handler for final submission */
  onSubmit?: () => void
  /** Handler for cancel action */
  onCancel?: () => void
  /** Whether we're on the last step */
  isLastStep?: boolean
  /** Whether submission is in progress */
  isSubmitting?: boolean
  /** Whether next step is in progress (saving current step) */
  isSaving?: boolean
  /** Last saved timestamp */
  lastSavedAt?: Date | null
  /** Validation errors for current step */
  validationErrors?: Record<string, string>
  /** Label for submit button */
  submitLabel?: string
  /** Children content (the step content) */
  children: React.ReactNode
  /** Additional className */
  className?: string
}

/**
 * WizardLayout - URL-based wizard navigation layout
 *
 * Features:
 * - Uses SidebarLayout pattern with custom sidebar
 * - Shows step progress with completion indicators
 * - Supports URL-based navigation (step passed as prop from URL)
 * - Handles back/next/submit navigation
 */
export function WizardLayout({
  title,
  entityName,
  status = 'Draft',
  steps,
  currentStep,
  onStepClick,
  onBack,
  onNext,
  onSubmit,
  onCancel,
  isLastStep = false,
  isSubmitting = false,
  isSaving = false,
  lastSavedAt,
  validationErrors = {},
  submitLabel = 'Create Account',
  children,
  className,
}: WizardLayoutProps) {
  const totalSteps = steps.length
  const isFirstStep = currentStep === 1
  const currentStepConfig = steps[currentStep - 1]
  const hasErrors = Object.keys(validationErrors).length > 0

  return (
    <div className={cn('h-screen flex flex-col overflow-hidden', className)}>
      <TopNavigation />

      <div className="flex flex-1 overflow-hidden">
        {/* Wizard Steps Sidebar */}
        <ResizableSidebarWrapper>
          <WizardStepsSidebar
            title={title}
            entityName={entityName}
            status={status}
            steps={steps}
            currentStep={currentStep}
            onStepClick={onStepClick}
          />
        </ResizableSidebarWrapper>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Content Header */}
          <header className="bg-white border-b border-charcoal-100 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                <h1 className="text-xl font-heading font-bold text-charcoal-900">
                  {currentStepConfig?.label || `Step ${currentStep}`}
                </h1>
              </div>
              {currentStepConfig?.description && (
                <p className="text-sm text-charcoal-500 mt-1 ml-7">
                  {currentStepConfig.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-6">
              {/* Last Saved Indicator */}
              {lastSavedAt && (
                <div className="flex items-center gap-2 text-xs text-charcoal-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Saved {lastSavedAt.toLocaleTimeString()}</span>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                {onCancel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    disabled={isSubmitting || isSaving}
                  >
                    Cancel
                  </Button>
                )}

                {!isFirstStep && onBack && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBack}
                    disabled={isSubmitting || isSaving}
                    className="gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                )}

                {isLastStep ? (
                  <Button
                    size="sm"
                    onClick={onSubmit}
                    disabled={isSubmitting || isSaving}
                    className="gap-1 bg-gold-500 hover:bg-gold-600"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      submitLabel
                    )}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={onNext}
                    disabled={isSaving}
                    className="gap-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Validation Errors Summary */}
          {hasErrors && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Please fix the following errors:</span>
              </div>
              <ul className="mt-2 list-disc list-inside text-sm text-red-600 space-y-1">
                {Object.entries(validationErrors).map(([key, error]) => (
                  <li key={key}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto bg-cream">
            <div className="w-full max-w-none px-8 py-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Internal sidebar component for wizard steps
 */
interface WizardStepsSidebarProps {
  title: string
  entityName?: string
  status: string
  steps: WizardStep[]
  currentStep: number
  onStepClick?: (stepNumber: number) => void
}

function WizardStepsSidebar({
  title,
  entityName,
  status,
  steps,
  currentStep,
  onStepClick,
}: WizardStepsSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-charcoal-100 w-64 flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-charcoal-100 bg-charcoal-900 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-500">
            {title}
          </span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white border border-white/20">
            {status}
          </span>
        </div>
        {entityName && (
          <h2 className="text-lg font-heading font-bold text-white truncate" title={entityName}>
            {entityName}
          </h2>
        )}
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
          Steps
        </div>
        <nav className="space-y-1">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            const isPending = stepNumber > currentStep

            return (
              <button
                key={step.id}
                onClick={() => onStepClick?.(stepNumber)}
                disabled={!onStepClick}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4',
                  isCurrent
                    ? 'bg-gold-50 border-gold-500'
                    : 'border-transparent hover:bg-charcoal-50',
                  isPending && 'opacity-70',
                  !onStepClick && 'cursor-default'
                )}
              >
                {/* Status Indicator */}
                <div
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full border text-xs transition-colors',
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-gold-500 border-gold-500 text-white'
                      : 'border-charcoal-300 text-charcoal-500'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium truncate',
                      isCurrent ? 'text-charcoal-900' : 'text-charcoal-600'
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default WizardLayout
