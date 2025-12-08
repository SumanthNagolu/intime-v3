'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useAccountOnboardingStore } from '@/stores/account-onboarding-store'
import {
  OnboardingStep1Profile,
  OnboardingStep2Contract,
  OnboardingStep3Billing,
  OnboardingStep4Contacts,
  OnboardingStep5Categories,
  OnboardingStep6Kickoff,
} from '@/components/recruiting/accounts/onboarding'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  AlertCircle,
  Building2,
  FileText,
  CreditCard,
  Users,
  Briefcase,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { number: 1, title: 'Company Profile', icon: Building2 },
  { number: 2, title: 'Contract Setup', icon: FileText },
  { number: 3, title: 'Billing Setup', icon: CreditCard },
  { number: 4, title: 'Key Contacts', icon: Users },
  { number: 5, title: 'Job Categories', icon: Briefcase },
  { number: 6, title: 'Kickoff Call', icon: Calendar },
]

export default function AccountOnboardingPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const accountId = params.id as string

  // URL-based step management
  const stepParam = searchParams.get('step')
  const currentStep = stepParam ? Math.min(Math.max(parseInt(stepParam), 1), 6) : 1

  // Store
  const {
    formData,
    setFormData,
    setCurrentStep,
    resetForm,
    initializeFromAccount,
    isDirty,
    lastSaved,
    accountName,
  } = useAccountOnboardingStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Fetch account data
  const accountQuery = trpc.crm.accounts.getById.useQuery({ id: accountId })

  // Initialize from account
  useEffect(() => {
    if (accountQuery.data) {
      initializeFromAccount(accountId, accountQuery.data.name)
      // Pre-populate fields from existing account data
      setFormData({
        legalName: accountQuery.data.name || '',
        industry: accountQuery.data.industry || '',
        website: accountQuery.data.website || '',
        city: accountQuery.data.city || '',
        state: accountQuery.data.state || '',
      })
    }
  }, [accountQuery.data, accountId, initializeFromAccount, setFormData])

  // Sync step with URL
  useEffect(() => {
    setCurrentStep(currentStep)
  }, [currentStep, setCurrentStep])

  // Complete onboarding mutation
  const completeOnboardingMutation = trpc.crm.accounts.completeOnboarding.useMutation({
    onSuccess: () => {
      toast({
        title: 'Onboarding Complete!',
        description: `${accountName || 'Account'} is now active and ready for job requisitions.`,
      })
      utils.crm.accounts.getById.invalidate({ id: accountId })
      utils.crm.accounts.list.invalidate()
      resetForm()
      router.push(`/employee/recruiting/accounts/${accountId}`)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete onboarding.',
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  const validateStep = (step: number): boolean => {
    const errors: string[] = []

    switch (step) {
      case 1:
        // Company profile - minimal validation
        break
      case 2:
        // Contract setup - minimal validation
        break
      case 3:
        // Billing - minimal validation
        break
      case 4:
        // Contacts - minimal validation
        break
      case 5:
        // Job categories - minimal validation
        break
      case 6:
        // Kickoff - no required fields
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
    if (currentStep < 6) {
      navigateToStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      navigateToStep(currentStep - 1)
    }
  }

  const handleStepClick = (step: number) => {
    // Allow clicking on any step (flexible navigation)
    navigateToStep(step)
  }

  const handleComplete = async () => {
    if (!validateStep(currentStep)) return
    setIsSubmitting(true)

    try {
      completeOnboardingMutation.mutate({
        accountId,
        // Step 1: Company Profile
        legalName: formData.legalName || undefined,
        dba: formData.dbaName || undefined,
        industry: formData.industry || undefined,
        companySize: (formData.companySize || undefined) as '1-50' | '51-200' | '201-500' | '501-1000' | '1000+' | undefined,
        streetAddress: formData.streetAddress || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.postalCode || undefined,
        taxId: formData.taxId || undefined,
        fundingStage: formData.fundingStage || undefined,
        // Step 2: Contract Setup
        contractType: (formData.contractType || undefined) as 'msa' | 'sow' | 'staffing_agreement' | 'vendor_agreement' | undefined,
        contractStartDate: formData.contractStartDate || undefined,
        contractEndDate: formData.contractEndDate || undefined,
        isEvergreen: formData.isEvergreen,
        specialTerms: formData.contractNotes || undefined,
        // Step 3: Billing Setup
        paymentTerms: (formData.paymentTerms || undefined) as 'net_15' | 'net_30' | 'net_45' | 'net_60' | undefined,
        billingFrequency: (formData.billingFrequency || undefined) as 'weekly' | 'biweekly' | 'monthly' | undefined,
        billingContactName: formData.billingContactName || undefined,
        billingContactEmail: formData.billingContactEmail || undefined,
        poRequired: formData.poRequired,
        poFormat: formData.poNumber || undefined,
        // Step 4: Communication Preferences
        preferredContactMethod: (formData.preferredChannel || undefined) as 'email' | 'phone' | 'slack' | 'teams' | undefined,
        meetingCadence: (formData.meetingCadence || undefined) as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | undefined,
        // Step 5: Job Categories
        jobCategories: formData.selectedJobCategories,
        techStack: formData.techStack ? formData.techStack.split(',').map(s => s.trim()) : undefined,
        workAuthRequirements: formData.workAuthorizations,
        experienceLevels: formData.experienceLevels,
        // Step 6: Kickoff
        kickoffScheduled: formData.scheduleKickoff,
        kickoffDate: formData.kickoffDate || undefined,
        sendWelcomePackage: formData.sendWelcomeEmail,
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
            {index < 5 && (
              <div
                className={cn(
                  'w-12 h-0.5 transition-colors',
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
        return <OnboardingStep1Profile />
      case 2:
        return <OnboardingStep2Contract />
      case 3:
        return <OnboardingStep3Billing />
      case 4:
        return <OnboardingStep4Contacts />
      case 5:
        return <OnboardingStep5Categories />
      case 6:
        return <OnboardingStep6Kickoff />
      default:
        return null
    }
  }

  if (accountQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress indicator */}
      {renderStepIndicator()}

      {/* Step title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
          Step {currentStep}: {STEPS[currentStep - 1].title}
        </h1>
        <p className="text-charcoal-500 mt-1">
          Onboarding: {accountName || accountQuery.data?.name || 'Account'}
        </p>
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
                router.push(`/employee/recruiting/accounts/${accountId}`)
              }
            }}
          >
            Cancel
          </Button>

          {currentStep < 6 ? (
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
              Complete Onboarding
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
