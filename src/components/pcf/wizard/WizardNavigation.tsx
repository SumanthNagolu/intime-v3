'use client'

import { ChevronLeft, ChevronRight, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <div className="flex items-center justify-between pt-6 border-t mt-6">
      {/* Left Side: Back + Save Draft */}
      <div className="flex items-center gap-2">
        {!isFirstStep && (
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        {showSaveDraft && (
          <Button type="button" variant="ghost" onClick={onSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            {saveDraftLabel}
          </Button>
        )}
      </div>

      {/* Right Side: Cancel + Next/Submit */}
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        {!isLastStep ? (
          <Button type="button" onClick={onNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-hublot-900 hover:bg-hublot-800"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
