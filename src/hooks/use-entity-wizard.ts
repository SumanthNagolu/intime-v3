import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { WizardConfig, WizardStepConfig, FieldDefinition } from '@/configs/entities/types'
import { UseEntityDraftReturn } from '@/hooks/use-entity-draft'

export interface WizardStore<T> {
  formData: T
  setFormData: (data: Partial<T>) => void
  resetForm: () => void
  isDirty: boolean
  lastSaved: Date | null
  currentStep: number
  setCurrentStep?: (step: number) => void
}

interface UseEntityWizardOptions<T> {
  config: WizardConfig<T>
  store: WizardStore<T>
  draftState?: UseEntityDraftReturn<any>
  onCancel?: () => void
}

export interface UseEntityWizardReturn<T> {
  // Navigation State
  currentStep: number
  totalSteps: number
  isFirstStep: boolean
  isLastStep: boolean
  isReviewStep: boolean
  progressPercent: number
  
  // Validation State
  validationErrors: Record<string, string>
  isSubmitting: boolean
  
  // Actions
  navigateToStep: (step: number) => void
  handleNext: () => void
  handleBack: () => void
  handleStepClick: (step: number) => void
  handleSaveDraft: () => Promise<void>
  handleCancel: () => Promise<void>
  handleSubmit: () => Promise<void>
  validateStep: (step: number) => boolean
  
  // Config access
  currentStepConfig: WizardStepConfig<T> | null
  allFieldDefinitions: FieldDefinition[]
}

export function useEntityWizard<T extends object>({
  config,
  store,
  draftState,
  onCancel,
}: UseEntityWizardOptions<T>): UseEntityWizardReturn<T> {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current step from URL or Store (Store takes precedence if synced)
  // We sync URL to Store in useEffect usually, but here we read from URL for initial state if needed
  // ideally the store should drive the state
  const stepParam = searchParams.get('step')
  const totalSteps = config.steps.length + (config.reviewStep ? 1 : 0)
  
  // Use store's current step if available, otherwise fallback to URL or 1
  // We prefer the store because it might have been restored from a draft
  const currentStep = store.currentStep || (stepParam ? Math.min(Math.max(parseInt(stepParam), 1), totalSteps) : 1)

  const isReviewStep = !!config.reviewStep && currentStep === totalSteps
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  // Navigate to step
  const navigateToStep = useCallback(
    (step: number) => {
      const targetStep = Math.min(Math.max(step, 1), totalSteps)
      
      // Update store
      if (store.setCurrentStep) {
        store.setCurrentStep(targetStep)
      }
      
      // Update URL
      const params = new URLSearchParams(searchParams.toString())
      params.set('step', targetStep.toString())
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams, store, totalSteps]
  )

  // Validate current step
  const validateStep = useCallback(
    (step: number): boolean => {
      const stepConfig = config.steps[step - 1]
      // Review step is usually valid if we got there, but we could add checks
      if (!stepConfig && step === totalSteps && config.reviewStep) return true
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
        // Check if returns array of strings or object map
        if (Array.isArray(customErrors)) {
           customErrors.forEach((error, index) => {
            errors[`custom_${index}`] = error
          })
        } else if (typeof customErrors === 'object') {
           Object.assign(errors, customErrors)
        }
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
    [config.steps, config.reviewStep, store.formData, totalSteps]
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
      // Or allow checking any previous step
      if (step <= currentStep) {
        navigateToStep(step)
      } else if (step === currentStep + 1 && validateStep(currentStep)) {
        navigateToStep(step)
      }
    }
  }

  const handleSaveDraft = async () => {
    if (draftState) {
      try {
        await draftState.saveDraft()
        toast({
          title: 'Draft saved',
          description: 'Your progress has been saved.',
        })
      } catch (error) {
        toast({
          title: 'Error saving draft',
          description: 'Could not save your progress.',
          variant: 'error',
        })
      }
    } else {
      toast({
        title: 'Draft saved',
        description: 'Your progress has been saved locally.',
      })
    }
  }

  const handleCancel = async () => {
    if (
      store.isDirty &&
      !confirm('Are you sure you want to cancel? Your progress will be lost.')
    ) {
      return
    }

    // Delete draft if it exists (user explicitly cancelled, don't save)
    if (draftState?.draftId) {
      try {
        await draftState.deleteDraft()
      } catch (error) {
        // Silently ignore delete errors - user is cancelling anyway
        console.warn('Failed to delete draft on cancel:', error)
      }
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
      // If we have draft state, we might want to finalize it instead of just calling onSubmit
      // But usually onSubmit handles the mutation.
      // If draftState provides finalizeDraft, we might want to use it?
      // For now we stick to config.onSubmit but we might want to enhance this integration later
      
      const result = await config.onSubmit(store.formData)
      
      // If we have a draft, we might want to delete it or mark it as converted?
      // useEntityDraft's finalizeDraft usually handles this if used.
      // But if config.onSubmit is used, we might need to manually clean up draft
      if (draftState?.draftId && !draftState.finalizeDraft) {
         // Maybe delete draft if submission was successful and it wasn't a finalize operation?
         // This depends on whether onSubmit creates a new record or updates the draft to active
      }

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

  return {
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    isReviewStep,
    progressPercent,
    validationErrors,
    isSubmitting,
    navigateToStep,
    handleNext,
    handleBack,
    handleStepClick,
    handleSaveDraft,
    handleCancel,
    handleSubmit,
    validateStep,
    currentStepConfig,
    allFieldDefinitions,
  }
}


