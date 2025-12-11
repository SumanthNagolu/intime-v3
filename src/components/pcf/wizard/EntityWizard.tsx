'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { WizardConfig, FieldDefinition } from '@/configs/entities/types'
import { WizardProgress } from './WizardProgress'
import { WizardStep } from './WizardStep'
import { WizardNavigation } from './WizardNavigation'
import { WizardReview } from './WizardReview'
import { toast } from '@/components/ui/use-toast'

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-heading font-bold text-charcoal-900">
          {config.title}
        </h1>
        {config.description && (
          <p className="text-charcoal-600 mt-2">{config.description}</p>
        )}
      </div>

      {/* Progress Indicator */}
      <WizardProgress
        steps={config.steps}
        currentStep={currentStep}
        style={config.stepIndicatorStyle}
        allowFreeNavigation={config.allowFreeNavigation}
        onStepClick={handleStepClick}
      />

      {/* Auto-save Indicator */}
      {store.lastSaved && store.isDirty && (
        <p className="text-sm text-charcoal-500 text-center mb-4">
          <Save className="w-3 h-3 inline mr-1" />
          Auto-saved {new Date(store.lastSaved).toLocaleTimeString()}
        </p>
      )}

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="mt-2 list-disc list-inside text-sm text-red-600">
            {Object.entries(validationErrors)
              .filter(([key]) => !key.startsWith('custom_'))
              .map(([key, error]) => (
                <li key={key}>{error}</li>
              ))}
          </ul>
        </div>
      )}

      {/* Step Content */}
      <Card className="bg-white mb-6">
        <CardHeader>
          <CardTitle>
            {isReviewStep
              ? config.reviewStep?.title || 'Review'
              : currentStepConfig?.label}
          </CardTitle>
          {currentStepConfig?.description && (
            <CardDescription>{currentStepConfig.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Navigation */}
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
  )
}
