'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Save, Sparkles, Clock } from 'lucide-react'
import { WizardConfig, FieldDefinition } from '@/configs/entities/types'
import { WizardProgressHorizontal } from './WizardProgressHorizontal'
import { WizardStep } from './WizardStep'
import { WizardNavigation } from './WizardNavigation'
import { WizardReview } from './WizardReview'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface EntityWizardProps<T> {
  config: WizardConfig<T>
  store: {
    formData: T
    setFormData: (data: Partial<T>) => void
    resetForm: () => void
    isDirty: boolean
    lastSaved: Date | null
  }
  onCancel?: () => void
}

export function EntityWizard<T extends object>({
  config,
  store,
  onCancel,
}: EntityWizardProps<T>) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current step from URL
  const stepParam = searchParams.get('step')
  const totalSteps = config.steps.length + (config.reviewStep ? 1 : 0)
  const currentStep = stepParam
    ? Math.min(Math.max(parseInt(stepParam), 1), totalSteps)
    : 1

  const isReviewStep = config.reviewStep && currentStep === totalSteps

  // Navigate to step
  const navigateToStep = useCallback(
    (step: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('step', step.toString())
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  // Validate current step
  const validateStep = useCallback(
    (step: number): boolean => {
      const stepConfig = config.steps[step - 1]
      if (!stepConfig) return true

      const errors: Record<string, string> = {}

      // Zod schema validation
      if (stepConfig.validation) {
        const result = stepConfig.validation.safeParse(store.formData)
        if (!result.success) {
          result.error.errors.forEach((err) => {
            const path = err.path.join('.')
            errors[path] = err.message
          })
        }
      }

      // Custom validation function
      if (stepConfig.validateFn) {
        const customErrors = stepConfig.validateFn(store.formData)
        customErrors.forEach((error, index) => {
          errors[`custom_${index}`] = error
        })
      }

      // Required field validation from field definitions
      if (stepConfig.fields) {
        stepConfig.fields.forEach((field) => {
          if (field.required) {
            const value = store.formData[field.key as keyof T]
            if (value === null || value === undefined || value === '') {
              errors[field.key] = `${field.label} is required`
            }
            if (Array.isArray(value) && value.length === 0) {
              errors[field.key] = `${field.label} is required`
            }
          }
        })
      }

      setValidationErrors(errors)

      if (Object.keys(errors).length > 0) {
        const firstError = Object.values(errors)[0]
        toast({
          title: 'Validation Error',
          description: firstError,
          variant: 'error',
        })
        return false
      }

      return true
    },
    [config.steps, store.formData]
  )

  // Handlers
  const handleNext = () => {
    if (!validateStep(currentStep)) return
    if (currentStep < totalSteps) {
      navigateToStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      navigateToStep(currentStep - 1)
    }
  }

  const handleStepClick = (step: number) => {
    if (config.allowFreeNavigation) {
      navigateToStep(step)
    } else {
      // Only allow clicking completed or current step
      if (step <= currentStep) {
        navigateToStep(step)
      } else if (step === currentStep + 1 && validateStep(currentStep)) {
        navigateToStep(step)
      }
    }
  }

  const handleSaveDraft = () => {
    toast({
      title: 'Draft saved',
      description: 'Your progress has been saved locally.',
    })
  }

  const handleCancel = () => {
    if (
      store.isDirty &&
      !confirm('Are you sure you want to cancel? Your progress will be lost.')
    ) {
      return
    }
    store.resetForm()
    if (onCancel) {
      onCancel()
    } else if (config.cancelRoute) {
      router.push(config.cancelRoute)
    }
  }

  const handleSubmit = async () => {
    // Validate all steps before submit
    for (let i = 1; i <= config.steps.length; i++) {
      if (!validateStep(i)) {
        navigateToStep(i)
        return
      }
    }

    setIsSubmitting(true)
    try {
      const result = await config.onSubmit(store.formData)
      store.resetForm()
      config.onSuccess?.(result)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit',
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get all field definitions for review step
  const allFieldDefinitions: FieldDefinition[] = config.steps.flatMap(
    (step) => step.fields || []
  )

  // Current step config
  const currentStepConfig = isReviewStep ? null : config.steps[currentStep - 1]

  // Calculate progress percentage
  const progressPercent = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-gold-50/30">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-charcoal-100/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Title & Progress */}
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold-500" />
                  <h1 className="text-xl font-heading font-bold text-charcoal-900">
                    {config.title}
                  </h1>
                </div>
                {config.description && (
                  <p className="text-sm text-charcoal-500 mt-0.5">{config.description}</p>
                )}
              </div>
            </div>

            {/* Right Side: Auto-save & Progress */}
            <div className="flex items-center gap-6">
              {store.lastSaved && (
                <div className="flex items-center gap-2 text-sm text-charcoal-500">
                  <Clock className="w-4 h-4" />
                  <span>Auto-saved {new Date(store.lastSaved).toLocaleTimeString()}</span>
                </div>
              )}
              
              {/* Progress Circle */}
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-charcoal-100"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (125.6 * progressPercent) / 100}
                    className="text-gold-500 transition-all duration-500 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-charcoal-700">
                  {progressPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Horizontal Progress */}
      <WizardProgressHorizontal
        steps={config.steps}
        currentStep={currentStep}
        style={config.stepIndicatorStyle}
        allowFreeNavigation={config.allowFreeNavigation}
        onStepClick={handleStepClick}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="w-full">
          {/* Main Content Area */}
          <main className="w-full">
            {/* Mobile Progress */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-between text-sm text-charcoal-600 mb-2">
                <span>Step {currentStep} of {totalSteps}</span>
                <span className="font-medium">
                  {isReviewStep ? 'Review' : currentStepConfig?.label}
                </span>
              </div>
              <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Validation Errors */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Please fix the following errors:</span>
                </div>
                <ul className="mt-2 list-disc list-inside text-sm text-red-600 space-y-1">
                  {Object.entries(validationErrors)
                    .filter(([key]) => !key.startsWith('custom_'))
                    .map(([key, error]) => (
                      <li key={key}>{error}</li>
                    ))}
                </ul>
              </div>
            )}

            {/* Step Content Card */}
            <div className="bg-white rounded-2xl shadow-elevation-md border border-charcoal-100/50 overflow-hidden animate-fade-in">
              {/* Card Header */}
              <div className="px-8 py-6 bg-gradient-to-r from-charcoal-50/50 to-transparent border-b border-charcoal-100/50">
                <div className="flex items-center gap-4">
                  {currentStepConfig?.icon && (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-gold-glow">
                      <currentStepConfig.icon className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-heading font-bold text-charcoal-900">
                      {isReviewStep
                        ? config.reviewStep?.title || 'Review'
                        : currentStepConfig?.label}
                    </h2>
                    {currentStepConfig?.description && (
                      <p className="text-sm text-charcoal-500 mt-0.5">
                        {currentStepConfig.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8">
                {isReviewStep && config.reviewStep ? (
                  <WizardReview
                    title={config.reviewStep.title}
                    sections={config.reviewStep.sections.map((s) => ({
                      label: s.label,
                      fields: s.fields,
                    }))}
                    formData={store.formData}
                    fieldDefinitions={allFieldDefinitions}
                    onEditStep={navigateToStep}
                  />
                ) : currentStepConfig ? (
                  <WizardStep
                    step={currentStepConfig}
                    formData={store.formData}
                    setFormData={store.setFormData}
                    errors={validationErrors}
                  />
                ) : null}
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="mt-8">
              <WizardNavigation
                currentStep={currentStep}
                totalSteps={totalSteps}
                onBack={handleBack}
                onNext={handleNext}
                onSaveDraft={handleSaveDraft}
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel={config.submitLabel}
                saveDraftLabel={config.saveDraftLabel}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
