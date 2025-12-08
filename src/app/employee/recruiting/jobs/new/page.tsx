'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useCreateJobStore } from '@/stores/create-job-store'
import {
  CreateJobStep1BasicInfo,
  CreateJobStep2Requirements,
  CreateJobStep3Compensation,
} from '@/components/recruiting/jobs/create'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  AlertCircle,
  Briefcase,
  Code,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { number: 1, title: 'Basic Info', icon: Briefcase },
  { number: 2, title: 'Requirements', icon: Code },
  { number: 3, title: 'Compensation', icon: DollarSign },
]

export default function CreateJobPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // URL-based step management
  const stepParam = searchParams.get('step')
  const accountIdParam = searchParams.get('accountId')
  const currentStep = stepParam ? Math.min(Math.max(parseInt(stepParam), 1), 3) : 1

  // Store
  const {
    formData,
    setCurrentStep,
    resetForm,
    initializeFromAccount,
    isDirty,
    lastSaved,
  } = useCreateJobStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Initialize from accountId query param
  useEffect(() => {
    if (accountIdParam) {
      initializeFromAccount(accountIdParam)
    }
  }, [accountIdParam, initializeFromAccount])

  // Sync step with URL
  useEffect(() => {
    setCurrentStep(currentStep)
  }, [currentStep, setCurrentStep])

  // Create job mutation
  const createMutation = trpc.ats.jobs.create.useMutation({
    onSuccess: (data) => {
      utils.ats.jobs.list.invalidate()
      utils.ats.jobs.getStats.invalidate()
      toast({
        title: 'Job created successfully',
        description: `${data.title} has been created in draft status`,
      })
      resetForm()
      router.push(`/employee/recruiting/jobs/${data.jobId}`)
    },
    onError: (error) => {
      toast({
        title: 'Error creating job',
        description: error.message,
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  const validateStep = (step: number): boolean => {
    const errors: string[] = []

    switch (step) {
      case 1:
        if (!formData.title || formData.title.length < 3) {
          errors.push('Job title is required (minimum 3 characters)')
        }
        if (!formData.accountId) {
          errors.push('Please select a client account')
        }
        break
      case 2:
        if (formData.requiredSkills.length === 0) {
          errors.push('At least one required skill is needed')
        }
        if (formData.minExperience && formData.maxExperience) {
          if (parseInt(formData.maxExperience) < parseInt(formData.minExperience)) {
            errors.push('Max experience must be greater than min experience')
          }
        }
        break
      case 3:
        // Step 3 has no required fields
        break
    }

    setValidationErrors(errors)
    if (errors.length > 0) {
      toast({
        title: 'Validation Error',
        description: errors[0],
        variant: 'error',
      })
    }
    return errors.length === 0
  }

  const navigateToStep = (step: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', step.toString())
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) return
    if (currentStep < 3) {
      navigateToStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      navigateToStep(currentStep - 1)
    }
  }

  const handleStepClick = (step: number) => {
    navigateToStep(step)
  }

  const handleComplete = async () => {
    if (!validateStep(currentStep)) return
    setIsSubmitting(true)

    createMutation.mutate({
      title: formData.title,
      accountId: formData.accountId,
      jobType: formData.jobType as 'contract' | 'permanent' | 'contract_to_hire' | 'temp' | 'sow',
      location: formData.location || undefined,
      isRemote: formData.isRemote,
      hybridDays: formData.isHybrid ? formData.hybridDays : undefined,
      requiredSkills: formData.requiredSkills,
      niceToHaveSkills: formData.niceToHaveSkills.length > 0 ? formData.niceToHaveSkills : undefined,
      minExperienceYears: formData.minExperience ? parseInt(formData.minExperience) : undefined,
      maxExperienceYears: formData.maxExperience ? parseInt(formData.maxExperience) : undefined,
      description: formData.description || undefined,
      rateMin: formData.rateMin ? parseFloat(formData.rateMin) : undefined,
      rateMax: formData.rateMax ? parseFloat(formData.rateMax) : undefined,
      rateType: formData.rateType as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual',
      positionsCount: formData.positionsCount,
      priority: formData.priority as 'low' | 'normal' | 'high' | 'urgent' | 'critical',
      targetFillDate: formData.targetFillDate || undefined,
      targetStartDate: formData.targetStartDate || undefined,
    })
  }

  const handleSaveDraft = () => {
    toast({
      title: 'Draft saved',
      description: 'Your progress has been saved locally.',
    })
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((s, index) => {
        const Icon = s.icon
        return (
          <div key={s.number} className="flex items-center">
            <button
              type="button"
              onClick={() => handleStepClick(s.number)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-hublot-500 focus:ring-offset-2',
                s.number === currentStep
                  ? 'bg-hublot-900 text-white shadow-lg'
                  : s.number < currentStep
                    ? 'bg-hublot-700 text-white cursor-pointer'
                    : 'bg-charcoal-200 text-charcoal-500 cursor-pointer hover:bg-charcoal-300'
              )}
            >
              <Icon className="w-5 h-5" />
            </button>
            {index < 2 && (
              <div
                className={cn(
                  'w-16 h-0.5 transition-colors',
                  s.number < currentStep ? 'bg-hublot-700' : 'bg-charcoal-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <CreateJobStep1BasicInfo />
      case 2:
        return <CreateJobStep2Requirements />
      case 3:
        return <CreateJobStep3Compensation />
      default:
        return null
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress indicator */}
      {renderStepIndicator()}

      {/* Step title */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-heading font-semibold text-charcoal-900">
          Step {currentStep}: {STEPS[currentStep - 1].title}
        </h2>
        {lastSaved && isDirty && (
          <p className="text-sm text-charcoal-500 mt-1">
            <Save className="w-3 h-3 inline mr-1" />
            Auto-saved {new Date(lastSaved).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="mt-2 list-disc list-inside text-sm text-red-600">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step content */}
      <Card className="mb-6">
        <CardContent className="pt-6">{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={handleSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (confirm('Are you sure you want to cancel? Your progress will be lost.')) {
                resetForm()
                router.push('/employee/recruiting/jobs')
              }
            }}
          >
            Cancel
          </Button>

          {currentStep < 3 ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleComplete}
              disabled={isSubmitting}
              className="bg-hublot-900 hover:bg-hublot-800"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Job
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
