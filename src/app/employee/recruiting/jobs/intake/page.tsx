'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import {
  useJobIntakeStore,
} from '@/stores/job-intake-store'
import {
  IntakeStep1BasicInfo,
  IntakeStep2Requirements,
  IntakeStep3RoleDetails,
  IntakeStep4Compensation,
  IntakeStep5Interview,
} from '@/components/recruiting/jobs/intake'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STEP_TITLES = [
  'Basic Information',
  'Technical Requirements',
  'Role Details',
  'Logistics & Compensation',
  'Interview Process',
]

export default function JobIntakePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // URL-based step management
  const stepParam = searchParams.get('step')
  const accountIdParam = searchParams.get('accountId')
  const currentStep = stepParam ? Math.min(Math.max(parseInt(stepParam), 1), 5) : 1

  // Store
  const { formData, setFormData, setCurrentStep, resetForm, initializeFromAccount, isDirty, lastSaved } =
    useJobIntakeStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Queries
  const accountQuery = trpc.crm.accounts.getById.useQuery(
    { id: accountIdParam || formData.accountId || '' },
    { enabled: !!(accountIdParam || formData.accountId) }
  )

  // Initialize from URL params
  useEffect(() => {
    if (accountIdParam && accountQuery.data) {
      initializeFromAccount(accountIdParam, accountQuery.data.name)
    }
  }, [accountIdParam, accountQuery.data, initializeFromAccount])

  // Sync step with URL
  useEffect(() => {
    setCurrentStep(currentStep)
  }, [currentStep, setCurrentStep])

  // Mutation
  const createJobMutation = trpc.ats.jobs.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Job requisition created!',
        description: `${formData.title} @ ${formData.accountName || 'Account'}`,
      })
      utils.ats.jobs.list.invalidate()
      utils.crm.accounts.getById.invalidate({ id: formData.accountId })
      resetForm()
      // The mutation returns { id, title, status, created_at } from the select
      const jobData = data as unknown as { id: string }
      router.push(`/employee/recruiting/jobs/${jobData.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create job requisition.',
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  const validateStep = (step: number): boolean => {
    const errors: string[] = []

    switch (step) {
      case 1:
        if (!formData.accountId) errors.push('Please select an account.')
        if (!formData.title.trim() || formData.title.trim().length < 3) {
          errors.push('Please enter a job title (at least 3 characters).')
        }
        break
      case 2:
        if (formData.requiredSkills.length === 0) {
          errors.push('Please add at least one required skill.')
        }
        break
      case 3:
        if (!formData.roleSummary.trim() || formData.roleSummary.length < 20) {
          errors.push('Please provide a role summary (at least 20 characters).')
        }
        if (!formData.responsibilities.trim() || formData.responsibilities.length < 20) {
          errors.push('Please provide key responsibilities (at least 20 characters).')
        }
        break
      case 4:
        if (!formData.billRateMin || !formData.billRateMax) {
          errors.push('Please enter bill rate range.')
        }
        break
      case 5:
        // No required fields on step 5
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
    if (currentStep < 5) {
      navigateToStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      navigateToStep(currentStep - 1)
    }
  }

  const handleStepClick = (step: number) => {
    // Allow clicking on completed or current step
    if (step <= currentStep) {
      navigateToStep(step)
    } else if (step === currentStep + 1 && validateStep(currentStep)) {
      // Allow clicking next step if current is valid
      navigateToStep(step)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    setIsSubmitting(true)

    try {
      createJobMutation.mutate({
        title: formData.title.trim(),
        accountId: formData.accountId,
        jobType: formData.jobType as 'contract' | 'permanent' | 'contract_to_hire' | 'temp' | 'sow',
        positionsCount: formData.positionsCount,
        priority: formData.priority as 'low' | 'normal' | 'high' | 'urgent' | 'critical',
        targetStartDate: formData.targetStartDate || undefined,
        // Location
        isRemote: formData.workArrangement === 'remote',
        isHybrid: formData.workArrangement === 'hybrid',
        hybridDays: formData.workArrangement === 'hybrid' ? formData.hybridDays : undefined,
        location: formData.officeLocation || undefined,
        // Requirements
        minExperience: formData.minExperience ? parseInt(formData.minExperience) : undefined,
        maxExperience: formData.preferredExperience ? parseInt(formData.preferredExperience) : undefined,
        requiredSkills: formData.requiredSkills.map((s) => s.name),
        niceToHaveSkills: formData.preferredSkills,
        description: `${formData.roleSummary}\n\nKey Responsibilities:\n${formData.responsibilities}`,
        // Compensation
        rateMin: formData.billRateMin ? parseFloat(formData.billRateMin) : undefined,
        rateMax: formData.billRateMax ? parseFloat(formData.billRateMax) : undefined,
        rateType: 'hourly',
        // Extended intake data
        intakeData: {
          intakeMethod: formData.intakeMethod,
          hiringManagerId: formData.hiringManagerId || undefined,
          experienceLevel: formData.experienceLevel,
          requiredSkillsDetailed: formData.requiredSkills,
          preferredSkills: formData.preferredSkills,
          education: formData.education,
          certifications: formData.certifications || undefined,
          industries: formData.industries,
          roleOpenReason: formData.roleOpenReason,
          teamName: formData.teamName || undefined,
          teamSize: formData.teamSize ? parseInt(formData.teamSize) : undefined,
          reportsTo: formData.reportsTo || undefined,
          directReports: formData.directReports ? parseInt(formData.directReports) : undefined,
          keyProjects: formData.keyProjects || undefined,
          successMetrics: formData.successMetrics || undefined,
          workArrangement: formData.workArrangement,
          hybridDays: formData.workArrangement === 'hybrid' ? formData.hybridDays : undefined,
          locationRestrictions: formData.locationRestrictions,
          workAuthorizations: formData.workAuthorizations,
          payRateMin: formData.payRateMin ? parseFloat(formData.payRateMin) : undefined,
          payRateMax: formData.payRateMax ? parseFloat(formData.payRateMax) : undefined,
          conversionSalaryMin: formData.conversionSalaryMin ? parseFloat(formData.conversionSalaryMin) : undefined,
          conversionSalaryMax: formData.conversionSalaryMax ? parseFloat(formData.conversionSalaryMax) : undefined,
          conversionFee: formData.conversionFee ? parseFloat(formData.conversionFee) : undefined,
          benefits: formData.benefits,
          weeklyHours: formData.weeklyHours ? parseInt(formData.weeklyHours) : undefined,
          overtimeExpected: formData.overtimeExpected,
          onCallRequired: formData.onCallRequired,
          onCallSchedule: formData.onCallRequired ? formData.onCallSchedule : undefined,
          interviewRounds: formData.interviewRounds,
          decisionDays: formData.decisionDays,
          submissionRequirements: formData.submissionRequirements,
          submissionFormat: formData.submissionFormat,
          submissionNotes: formData.submissionNotes || undefined,
          candidatesPerWeek: formData.candidatesPerWeek,
          feedbackTurnaround: formData.feedbackTurnaround ? parseInt(formData.feedbackTurnaround) : undefined,
          screeningQuestions: formData.screeningQuestions || undefined,
        },
      })
    } catch {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    toast({
      title: 'Draft saved',
      description: 'Your progress has been saved locally.',
    })
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((s, index) => (
        <div key={s} className="flex items-center">
          <button
            type="button"
            onClick={() => handleStepClick(s)}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
              'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-hublot-500 focus:ring-offset-2',
              s === currentStep
                ? 'bg-hublot-900 text-white shadow-lg'
                : s < currentStep
                  ? 'bg-hublot-700 text-white cursor-pointer'
                  : 'bg-charcoal-200 text-charcoal-500 cursor-not-allowed'
            )}
            disabled={s > currentStep + 1}
          >
            {s}
          </button>
          {index < 4 && (
            <div
              className={cn(
                'w-16 h-0.5 transition-colors',
                s < currentStep ? 'bg-hublot-700' : 'bg-charcoal-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <IntakeStep1BasicInfo />
      case 2:
        return <IntakeStep2Requirements />
      case 3:
        return <IntakeStep3RoleDetails />
      case 4:
        return <IntakeStep4Compensation />
      case 5:
        return <IntakeStep5Interview />
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress indicator */}
      {renderStepIndicator()}

      {/* Step title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
          Step {currentStep}: {STEP_TITLES[currentStep - 1]}
        </h1>
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

          {currentStep < 5 ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-hublot-900 hover:bg-hublot-800"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Job Requisition
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
