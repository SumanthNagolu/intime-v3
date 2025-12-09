'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCreateCampaignStore } from '@/stores/create-campaign-store'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Megaphone, Users, Mail, Calendar, Shield, X } from 'lucide-react'
import {
  StepIndicator,
  CampaignSetupStep,
  TargetAudienceStep,
  ChannelsStep,
  ScheduleBudgetStep,
  ComplianceStep,
} from './steps'

const STEPS = [
  { id: 1, title: 'Campaign Setup', icon: Megaphone },
  { id: 2, title: 'Target Audience', icon: Users },
  { id: 3, title: 'Channels', icon: Mail },
  { id: 4, title: 'Schedule & Budget', icon: Calendar },
  { id: 5, title: 'Compliance', icon: Shield },
]

const STEP_COMPONENTS = [
  CampaignSetupStep,
  TargetAudienceStep,
  ChannelsStep,
  ScheduleBudgetStep,
  ComplianceStep,
]

export default function NewCampaignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStep = parseInt(searchParams.get('step') || '1')

  const { formData, setFormData, setCurrentStep, resetForm, lastSaved, isDirty } = useCreateCampaignStore()

  // Sync URL step with store
  useEffect(() => {
    setCurrentStep(currentStep)
  }, [currentStep, setCurrentStep])

  // Set default dates if not set
  useEffect(() => {
    if (!formData.startDate || !formData.endDate) {
      const today = new Date().toISOString().split('T')[0]
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      setFormData({
        startDate: formData.startDate || today,
        endDate: formData.endDate || thirtyDaysLater,
      })
    }
  }, [formData.startDate, formData.endDate, setFormData])

  const navigateToStep = (step: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', step.toString())
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const createCampaign = trpc.crm.campaigns.create.useMutation({
    onSuccess: (data) => {
      toast.success('Campaign created successfully!')
      resetForm()
      router.push(`/employee/crm/campaigns/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create campaign')
    },
  })

  const handleSubmit = () => {
    // Build sequences based on channel config (same logic as dialog)
    type SequenceStep = {
      stepNumber: number
      dayOffset: number
      subject?: string
      templateId?: string
      templateName?: string
    }
    type SequenceConfig = {
      steps: SequenceStep[]
      stopConditions?: string[]
      sendTime?: string
      respectTimezone?: boolean
      dailyLimit?: number
    }
    const sequences: Record<string, SequenceConfig> = {}

    // Only build manual sequences if no templates selected
    if (formData.sequenceTemplateIds.length === 0) {
      if (formData.channels.includes('email')) {
        sequences.email = {
          steps: Array.from({ length: formData.emailSteps }, (_, i) => ({
            stepNumber: i + 1,
            dayOffset: i * formData.emailDaysBetween,
            subject: '',
            templateId: '',
          })),
          stopConditions: [
            ...(formData.stopOnReply ? ['reply'] : []),
            ...(formData.stopOnBooking ? ['booking'] : []),
            'unsubscribe',
          ],
          dailyLimit: formData.dailyLimit,
        }
      }
      if (formData.channels.includes('linkedin')) {
        sequences.linkedin = {
          steps: Array.from({ length: formData.linkedinSteps }, (_, i) => ({
            stepNumber: i + 1,
            dayOffset: i * formData.linkedinDaysBetween,
          })),
          stopConditions: [
            ...(formData.stopOnReply ? ['reply'] : []),
            ...(formData.stopOnBooking ? ['booking'] : []),
          ],
        }
      }
    }

    createCampaign.mutate({
      name: formData.name,
      campaignType: formData.campaignType,
      goal: formData.goal,
      description: formData.description || undefined,
      sequenceTemplateIds: formData.sequenceTemplateIds.length > 0 ? formData.sequenceTemplateIds : undefined,
      targetCriteria: {
        audienceSource: formData.audienceSource,
        industries: formData.industries.length > 0 ? formData.industries : undefined,
        companySizes: formData.companySizes.length > 0 ? formData.companySizes : undefined,
        regions: formData.regions.length > 0 ? formData.regions : undefined,
        fundingStages: formData.fundingStages.length > 0 ? formData.fundingStages : undefined,
        targetTitles: formData.targetTitles.length > 0 ? formData.targetTitles : undefined,
        exclusions: {
          excludeExistingClients: formData.excludeExistingClients,
          excludeRecentlyContacted: formData.excludeRecentlyContacted,
          excludeCompetitors: formData.excludeCompetitors,
        },
      },
      channels: formData.channels,
      sequences: Object.keys(sequences).length > 0 ? sequences : undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      launchImmediately: formData.launchImmediately,
      budgetTotal: formData.budgetTotal,
      targetLeads: formData.targetLeads,
      targetMeetings: formData.targetMeetings,
      targetRevenue: formData.targetRevenue,
      complianceSettings: {
        gdpr: formData.gdpr,
        canSpam: formData.canSpam,
        casl: formData.casl,
        includeUnsubscribe: formData.includeUnsubscribe,
      },
    })
  }

  const handleCancel = () => {
    if (isDirty) {
      // Draft is preserved automatically
      toast.info('Draft saved. You can continue later.')
    }
    router.push('/employee/crm/campaigns')
  }

  const handleDiscardDraft = () => {
    resetForm()
    toast.success('Draft discarded')
  }

  const StepComponent = STEP_COMPONENTS[currentStep - 1]

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-charcoal-500 mb-4">
          <Link href="/employee/workspace/dashboard" className="hover:text-hublot-700 transition-colors">
            My Work
          </Link>
          <span>/</span>
          <Link href="/employee/crm/campaigns" className="hover:text-hublot-700 transition-colors">
            Campaigns
          </Link>
          <span>/</span>
          <span className="text-charcoal-900 font-medium">New Campaign</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/employee/crm/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-heading font-semibold text-charcoal-900">Create New Campaign</h1>
            <p className="text-charcoal-500">Set up a new outreach campaign to generate leads</p>
          </div>
        </div>

        {/* Draft Recovery Banner */}
        {lastSaved && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              Draft saved {new Date(lastSaved).toLocaleString()}
            </span>
            <button
              onClick={handleDiscardDraft}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Discard draft
            </button>
          </div>
        )}

        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {StepComponent && (
            <StepComponent
              formData={formData}
              setFormData={setFormData}
              onNext={() => navigateToStep(currentStep + 1)}
              onPrev={() => navigateToStep(currentStep - 1)}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isFirst={currentStep === 1}
              isLast={currentStep === STEPS.length}
              isSubmitting={createCampaign.isPending}
            />
          )}
        </div>
      </div>
    </div>
  )
}
