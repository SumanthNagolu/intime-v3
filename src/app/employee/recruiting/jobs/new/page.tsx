'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useCreateJobStore, CreateJobFormData } from '@/stores/create-job-store'
import { EntityWizard } from '@/components/pcf/wizard/EntityWizard'
import { createJobCreateConfig, JobCreateFormData } from '@/configs/entities/wizards/job-create.config'

export default function CreateJobPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Get store
  const {
    formData,
    setFormData,
    resetForm,
    initializeFromAccount,
    isDirty,
    lastSaved,
  } = useCreateJobStore()

  // Initialize from accountId query param
  const accountIdParam = searchParams.get('accountId')
  useEffect(() => {
    if (accountIdParam) {
      initializeFromAccount(accountIdParam)
    }
  }, [accountIdParam, initializeFromAccount])

  // Fetch accounts for dropdown
  const { data: accountsData } = trpc.crm.accounts.list.useQuery({
    limit: 100,
    sortBy: 'name',
    sortOrder: 'asc',
  })

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
    },
  })

  // Build account options for select
  const accountOptions = accountsData?.items?.map((a) => ({
    value: a.id,
    label: a.name,
  })) || []

  // Handle form submission
  const handleSubmit = async (data: JobCreateFormData): Promise<unknown> => {
    return createMutation.mutateAsync({
      title: data.title,
      accountId: data.accountId,
      jobType: data.jobType as 'contract' | 'permanent' | 'contract_to_hire' | 'temp' | 'sow',
      location: data.location || undefined,
      isRemote: data.isRemote,
      hybridDays: data.isHybrid ? data.hybridDays : undefined,
      requiredSkills: data.requiredSkills,
      niceToHaveSkills: data.niceToHaveSkills.length > 0 ? data.niceToHaveSkills : undefined,
      minExperienceYears: data.minExperience ? parseInt(data.minExperience) : undefined,
      maxExperienceYears: data.maxExperience ? parseInt(data.maxExperience) : undefined,
      description: data.description || undefined,
      rateMin: data.rateMin ? parseFloat(data.rateMin) : undefined,
      rateMax: data.rateMax ? parseFloat(data.rateMax) : undefined,
      rateType: data.rateType as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual',
      positionsCount: data.positionsCount,
      priority: data.priority as 'low' | 'normal' | 'high' | 'urgent' | 'critical',
      targetFillDate: data.targetFillDate || undefined,
      targetStartDate: data.targetStartDate || undefined,
    })
  }

  // Create wizard config with account options and submit handler
  const wizardConfig = createJobCreateConfig(handleSubmit, {
    accountOptions,
    onSuccess: () => {}, // Already handled in mutation
    cancelRoute: '/employee/recruiting/jobs',
  })

  // Store adapter for EntityWizard
  const storeAdapter = {
    formData: formData as unknown as JobCreateFormData,
    setFormData: setFormData as (data: Partial<JobCreateFormData>) => void,
    resetForm,
    isDirty,
    lastSaved,
  }

  return (
    <EntityWizard
      config={wizardConfig}
      store={storeAdapter}
    />
  )
}
