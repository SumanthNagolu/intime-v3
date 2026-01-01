'use client'

import { ArrowLeft, ArrowRight, Loader2, Save, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  onSaveDraft: () => void
  onCancel: () => void
  onSubmit: () => void
  isSubmitting?: boolean
  submitLabel?: string
  saveDraftLabel?: string
  cancelRoute?: string
  showSaveDraft?: boolean
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSaveDraft,
  onCancel,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Submit',
  saveDraftLabel = 'Save Draft',
  showSaveDraft = true,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-100/50 shadow-elevation-sm p-6">
      <div className="flex items-center justify-between">
        {/* Left Side: Back + Save Draft */}
        <div className="flex items-center gap-3">
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className={cn(
                'h-11 px-5 rounded-xl border-charcoal-200',
                'hover:bg-charcoal-50 hover:border-charcoal-300',
                'transition-all duration-200'
              )}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {showSaveDraft && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSaveDraft}
              className={cn(
                'h-11 px-5 rounded-xl text-charcoal-600',
                'hover:bg-charcoal-100 hover:text-charcoal-800',
                'transition-all duration-200'
              )}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveDraftLabel}
            </Button>
          )}
        </div>

        {/* Right Side: Cancel + Next/Submit */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className={cn(
              'h-11 px-5 rounded-xl text-charcoal-500',
              'hover:bg-red-50 hover:text-red-600',
              'transition-all duration-200'
            )}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          {!isLastStep ? (
            <Button
              type="button"
              onClick={onNext}
              className={cn(
                'h-11 px-6 rounded-xl',
                'bg-gradient-to-r from-charcoal-800 to-charcoal-900',
                'hover:from-charcoal-700 hover:to-charcoal-800',
                'shadow-elevation-sm hover:shadow-elevation-md',
                'transition-all duration-200'
              )}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className={cn(
                'h-11 px-8 rounded-xl',
                'bg-gradient-to-r from-gold-500 to-gold-600',
                'hover:from-gold-400 hover:to-gold-500',
                'text-white font-semibold',
                'shadow-gold-glow hover:shadow-gold-glow-lg',
                'transition-all duration-300',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {submitLabel}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Hint */}
      <div className="mt-4 pt-4 border-t border-charcoal-100/50">
        <div className="flex items-center justify-between text-xs text-charcoal-500">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  i + 1 === currentStep && 'w-6 bg-gold-500',
                  i + 1 < currentStep && 'bg-forest-500',
                  i + 1 > currentStep && 'bg-charcoal-200'
                )}
              />
            ))}
          </div>
          <span className="text-charcoal-400">
            {isLastStep ? 'Final step' : `${totalSteps - currentStep} steps remaining`}
          </span>
        </div>
      </div>
    </div>
  )
}
