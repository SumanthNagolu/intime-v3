'use client'

import { Suspense, useMemo, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useCreateJobStore, CreateJobFormData, SkillEntry, InterviewRound } from '@/stores/create-job-store'
import { WizardWithSidebar } from '@/components/pcf/wizard/WizardWithSidebar'
import { createJobCreateConfig } from '@/configs/entities/wizards/job-create.config'
import { useEntityDraft, WizardStore } from '@/hooks/use-entity-draft'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'

// Transform form data to entity data for API calls
function formToEntityData(formData: CreateJobFormData) {
  // Parse rate strings to numbers safely
  const parseRate = (val: string) => {
    if (!val || val.trim() === '') return undefined
    const num = parseFloat(val)
    return isNaN(num) ? undefined : num
  }

  return {
    // Basic Info
    title: formData.title,
    accountId: formData.accountId,
    description: formData.description || undefined,
    positionsCount: formData.positionsCount,
    jobType: formData.jobType,
    priority: formData.priority,
    urgency: formData.urgency,
    targetStartDate: formData.targetStartDate || undefined,
    targetEndDate: formData.targetEndDate || undefined,
    targetFillDate: formData.targetFillDate || undefined,
    externalJobId: formData.externalJobId || undefined,

    // Company/Contact References
    clientCompanyId: formData.clientCompanyId || undefined,
    endClientCompanyId: formData.endClientCompanyId || undefined,
    vendorCompanyId: formData.vendorCompanyId || undefined,
    hiringManagerContactId: formData.hiringManagerContactId || undefined,
    hrContactId: formData.hrContactId || undefined,

    // Location
    location: formData.location || undefined,
    locationCity: formData.locationCity || undefined,
    locationState: formData.locationState || undefined,
    locationCountry: formData.locationCountry || undefined,
    isRemote: formData.isRemote,
    isHybrid: formData.workArrangement === 'hybrid',
    hybridDays: formData.workArrangement === 'hybrid' ? formData.hybridDays : undefined,

    // Requirements (main fields)
    requiredSkills: formData.requiredSkills.map((s) => s.name),
    niceToHaveSkills: formData.preferredSkills,
    minExperience: formData.minExperience ? parseInt(formData.minExperience) : undefined,
    maxExperience: formData.maxExperience ? parseInt(formData.maxExperience) : undefined,
    visaRequirements: formData.visaRequirements,

    // Rates
    rateMin: parseRate(formData.billRateMin),
    rateMax: parseRate(formData.billRateMax),
    rateType: formData.rateType,
    currency: formData.currency,

    // Fee structure
    feeType: formData.feeType,
    feePercentage: parseRate(formData.feePercentage),
    feeFlatAmount: parseRate(formData.feeFlatAmount),

    // Team
    priorityRank: formData.priorityRank || undefined,
    slaDays: formData.slaDays,

    // Client process
    clientSubmissionInstructions: formData.clientSubmissionInstructions || undefined,
    clientInterviewProcess: formData.clientInterviewProcess || undefined,

    // Extended intake data stored in JSONB
    intakeData: {
      intakeMethod: formData.intakeMethod,
      targetStartDate: formData.targetStartDate,
      targetEndDate: formData.targetEndDate,
      experienceLevel: formData.experienceLevel,
      requiredSkillsDetailed: formData.requiredSkills.map((s) => ({
        name: s.name,
        years: s.years,
        proficiency: s.proficiency,
      })),
      preferredSkills: formData.preferredSkills,
      education: formData.education,
      certifications: formData.certifications,
      industries: formData.industries,
      roleOpenReason: formData.roleOpenReason,
      teamName: formData.teamName,
      teamSize: formData.teamSize,
      reportsTo: formData.reportsTo,
      directReports: formData.directReports,
      keyProjects: formData.keyProjects,
      successMetrics: formData.successMetrics,
      workArrangement: formData.workArrangement,
      hybridDays: formData.hybridDays,
      locationRestrictions: formData.locationRestrictions,
      locationAddressLine1: formData.locationAddressLine1,
      locationAddressLine2: formData.locationAddressLine2,
      locationCity: formData.locationCity,
      locationState: formData.locationState,
      locationPostalCode: formData.locationPostalCode,
      locationCountry: formData.locationCountry,
      workAuthorizations: formData.workAuthorizations,
      payRateMin: parseRate(formData.payRateMin),
      payRateMax: parseRate(formData.payRateMax),
      conversionSalaryMin: parseRate(formData.conversionSalaryMin),
      conversionSalaryMax: parseRate(formData.conversionSalaryMax),
      conversionFee: parseRate(formData.conversionFee),
      benefits: formData.benefits,
      weeklyHours: formData.weeklyHours ? parseInt(formData.weeklyHours) : undefined,
      overtimeExpected: formData.overtimeExpected,
      onCallRequired: formData.onCallRequired,
      onCallSchedule: formData.onCallSchedule,
      interviewRounds: formData.interviewRounds.map((r) => ({
        name: r.name,
        format: r.format,
        duration: r.duration,
        interviewer: r.interviewer,
        focus: r.focus,
      })),
      decisionDays: formData.decisionDays,
      submissionRequirements: formData.submissionRequirements,
      submissionFormat: formData.submissionFormat,
      submissionNotes: formData.submissionNotes,
      candidatesPerWeek: formData.candidatesPerWeek,
      feedbackTurnaround: formData.feedbackTurnaround ? parseInt(formData.feedbackTurnaround) : undefined,
      screeningQuestions: formData.screeningQuestions,
    },
  }
}

// Transform entity data to form data for editing/resuming
function entityToFormData(entity: any): Partial<CreateJobFormData> {
  const intakeData = entity.intake_data || entity.intakeData || {}

  // Parse skills from requiredSkillsDetailed or fallback to simple array
  let requiredSkills: SkillEntry[] = []
  if (intakeData.requiredSkillsDetailed && Array.isArray(intakeData.requiredSkillsDetailed)) {
    requiredSkills = intakeData.requiredSkillsDetailed.map((s: any) => ({
      name: s.name || '',
      years: s.years || '',
      proficiency: s.proficiency || 'proficient',
    }))
  } else if (entity.required_skills && Array.isArray(entity.required_skills)) {
    requiredSkills = entity.required_skills.map((name: string) => ({
      name,
      years: '',
      proficiency: 'proficient' as const,
    }))
  }

  // Parse interview rounds
  let interviewRounds: InterviewRound[] = []
  if (intakeData.interviewRounds && Array.isArray(intakeData.interviewRounds)) {
    interviewRounds = intakeData.interviewRounds.map((r: any, idx: number) => ({
      id: `round-${idx}`,
      name: r.name || '',
      format: r.format || 'video',
      duration: r.duration || 60,
      interviewer: r.interviewer || '',
      focus: r.focus || '',
    }))
  }

  // Determine work arrangement from flags
  let workArrangement: 'remote' | 'hybrid' | 'onsite' = 'remote'
  if (intakeData.workArrangement) {
    workArrangement = intakeData.workArrangement
  } else if (entity.is_hybrid) {
    workArrangement = 'hybrid'
  } else if (!entity.is_remote) {
    workArrangement = 'onsite'
  }

  return {
    // Step 1: Basic Information
    accountId: entity.company_id || entity.account_id || '',
    accountName: entity.company?.name || entity.account?.name || '',
    title: entity.title || '',
    description: entity.description || '',
    positionsCount: entity.positions_count || 1,
    jobType: entity.job_type || 'contract',
    priority: entity.priority || 'normal',
    urgency: entity.urgency || 'medium',
    targetStartDate: entity.target_start_date || intakeData.targetStartDate || '',
    targetEndDate: entity.target_end_date || intakeData.targetEndDate || '',
    targetFillDate: entity.target_fill_date || '',
    intakeMethod: intakeData.intakeMethod || 'phone_video',
    externalJobId: entity.external_job_id || '',

    // Company references
    clientCompanyId: entity.client_company_id || null,
    endClientCompanyId: entity.end_client_company_id || null,
    vendorCompanyId: entity.vendor_company_id || null,
    hiringManagerContactId: entity.hiring_manager_contact_id || null,
    hrContactId: entity.hr_contact_id || null,

    // Step 2: Requirements
    requiredSkills,
    preferredSkills: intakeData.preferredSkills || entity.nice_to_have_skills || [],
    minExperience: entity.min_experience_years?.toString() || intakeData.minExperience || '',
    maxExperience: entity.max_experience_years?.toString() || intakeData.maxExperience || '',
    experienceLevel: intakeData.experienceLevel || '',
    education: intakeData.education || '',
    certifications: intakeData.certifications || [],
    industries: intakeData.industries || [],
    visaRequirements: entity.visa_requirements || intakeData.workAuthorizations || [],

    // Step 3: Role Details
    roleSummary: entity.role_summary || intakeData.roleSummary || '',
    responsibilities: entity.responsibilities || intakeData.responsibilities || '',
    roleOpenReason: intakeData.roleOpenReason || '',
    teamName: intakeData.teamName || '',
    teamSize: intakeData.teamSize || '',
    reportsTo: intakeData.reportsTo || '',
    directReports: intakeData.directReports || '',
    keyProjects: intakeData.keyProjects || '',
    successMetrics: intakeData.successMetrics || '',

    // Step 4: Location
    workArrangement,
    hybridDays: entity.hybrid_days || intakeData.hybridDays || 3,
    location: entity.location || '',
    locationAddressLine1: intakeData.locationAddressLine1 || '',
    locationAddressLine2: intakeData.locationAddressLine2 || '',
    locationCity: entity.location_city || intakeData.locationCity || '',
    locationState: entity.location_state || intakeData.locationState || '',
    locationPostalCode: intakeData.locationPostalCode || '',
    locationCountry: entity.location_country || intakeData.locationCountry || 'US',
    locationRestrictions: intakeData.locationRestrictions || [],
    workAuthorizations: intakeData.workAuthorizations || [],
    isRemote: entity.is_remote ?? (workArrangement === 'remote'),

    // Step 5: Compensation
    rateType: entity.rate_type || 'hourly',
    currency: entity.currency || 'USD',
    billRateMin: entity.rate_min?.toString() || '',
    billRateMax: entity.rate_max?.toString() || '',
    payRateMin: intakeData.payRateMin?.toString() || '',
    payRateMax: intakeData.payRateMax?.toString() || '',
    conversionSalaryMin: intakeData.conversionSalaryMin?.toString() || '',
    conversionSalaryMax: intakeData.conversionSalaryMax?.toString() || '',
    conversionFee: intakeData.conversionFee?.toString() || '',
    feeType: entity.fee_type || 'percentage',
    feePercentage: entity.fee_percentage?.toString() || '',
    feeFlatAmount: entity.fee_flat_amount?.toString() || '',
    benefits: intakeData.benefits || [],
    weeklyHours: intakeData.weeklyHours?.toString() || '40',
    overtimeExpected: intakeData.overtimeExpected || '',
    onCallRequired: intakeData.onCallRequired || false,
    onCallSchedule: intakeData.onCallSchedule || '',

    // Step 6: Interview Process
    interviewRounds,
    decisionDays: intakeData.decisionDays || '',
    submissionRequirements: intakeData.submissionRequirements || [],
    submissionFormat: intakeData.submissionFormat || 'standard',
    submissionNotes: intakeData.submissionNotes || '',
    candidatesPerWeek: intakeData.candidatesPerWeek || '',
    feedbackTurnaround: intakeData.feedbackTurnaround?.toString() || '',
    screeningQuestions: intakeData.screeningQuestions || '',
    clientInterviewProcess: entity.client_interview_process || '',
    clientSubmissionInstructions: entity.client_submission_instructions || '',

    // Step 7: Team Assignment
    ownerId: entity.owner_id || '',
    recruiterIds: entity.recruiter_ids || [],
    priorityRank: entity.priority_rank || 0,
    slaDays: entity.sla_days || 30,
  }
}

function NewJobPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Get store
  const store = useCreateJobStore()

  // Check for edit mode or resume mode
  const editId = searchParams.get('edit')
  const resumeId = searchParams.get('resume')
  const isEditMode = !!editId

  // Fetch existing job if in edit mode
  const editJobQuery = trpc.ats.jobs.getById.useQuery(
    { id: editId! },
    { enabled: !!editId, retry: false }
  )

  // Fetch draft if resuming (only for non-edit mode)
  const getDraftQuery = trpc.ats.jobs.getById.useQuery(
    { id: resumeId! },
    { enabled: !!resumeId && !editId, retry: false }
  )

  // Mutations
  const createMutation = trpc.ats.jobs.create.useMutation()
  const updateMutation = trpc.ats.jobs.update.useMutation()

  // Draft integration (only for create/resume mode, not edit mode)
  const draftState = useEntityDraft({
    entityType: 'Job',
    wizardRoute: '/employee/recruiting/jobs/new',
    totalSteps: 8,
    store: () => store as unknown as WizardStore<CreateJobFormData>,
    resumeId: isEditMode ? undefined : resumeId,
    createMutation: {
      mutateAsync: async (data: Record<string, unknown>) => {
        const result = await createMutation.mutateAsync(data as any)
        return result as any
      },
      isPending: createMutation.isPending,
    },
    updateMutation: {
      mutateAsync: async (data: Record<string, unknown>) => {
        // Map 'id' to 'jobId' for update mutation
        const { id, ...rest } = data
        const result = await updateMutation.mutateAsync({ jobId: id as string, ...rest } as any)
        return result as any
      },
      isPending: updateMutation.isPending,
    },
    getDraftQuery: {
      data: getDraftQuery.data as any,
      isLoading: getDraftQuery.isLoading,
      error: getDraftQuery.error,
    },
    searchParamsString: searchParams.toString(),

    // Transform Form -> Entity (for saving)
    formToEntity: (formData) => {
      const wizardState = isEditMode
        ? undefined
        : {
            formData,
            currentStep: store.currentStep,
          }

      const entityData = formToEntityData(formData)
      return {
        ...entityData,
        wizard_state: wizardState,
      }
    },

    // Transform Entity -> Form (for loading)
    entityToForm: (entity: any): CreateJobFormData => {
      // Prefer wizard_state data if available (stored in custom_fields or directly)
      const wizardState = entity.wizard_state || entity.custom_fields?.wizard_state
      if (wizardState?.formData) {
        return wizardState.formData as CreateJobFormData
      }

      // Fallback mapping for drafts without wizard state
      return entityToFormData(entity) as CreateJobFormData
    },

    getDisplayName: (data) => data.title || 'Untitled Job',
    hasData: (data) => !!data.title && data.title.trim() !== '' && !!data.accountId,
    onInvalidate: () => utils.ats.jobs.list.invalidate(),
  })

  // Populate form when editing an existing job
  useEffect(() => {
    if (isEditMode && editJobQuery.data && draftState.isReady) {
      const formData = entityToFormData(editJobQuery.data)
      store.setFormData(formData)
    }
  }, [isEditMode, editJobQuery.data, draftState.isReady])

  // Handle final submission
  const handleSubmit = useCallback(
    async (data: CreateJobFormData) => {
      try {
        if (isEditMode && editId) {
          // Update existing job
          const entityData = formToEntityData(data)
          await updateMutation.mutateAsync({
            jobId: editId,
            ...entityData,
            ownerId: data.ownerId || undefined,
            recruiterIds: data.recruiterIds.length > 0 ? data.recruiterIds : undefined,
            wizard_state: null, // Clear wizard state on finalization
          } as any)

          toast({
            title: 'Job updated!',
            description: `${data.title} has been successfully updated.`,
          })

          // Invalidate and redirect
          utils.ats.jobs.getById.invalidate({ id: editId })
          utils.ats.jobs.list.invalidate()
          store.resetForm()
          router.push(`/employee/recruiting/jobs/${editId}`)
        } else {
          // Create new job (via draft system)
          const job = await draftState.finalizeDraft('open')

          toast({
            title: 'Job created!',
            description: `${data.title} has been successfully created.`,
          })

          // Redirect to the created job page
          if (job?.id) {
            router.push(`/employee/recruiting/jobs/${job.id}`)
          } else {
            router.push('/employee/recruiting/jobs')
          }
        }
      } catch (error) {
        console.error('Failed to save job:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to save job.',
          variant: 'error',
        })
        throw error
      }
    },
    [isEditMode, editId, draftState, router, updateMutation, utils, store, toast]
  )

  // Create wizard config with appropriate mode
  const wizardConfig = useMemo(() => {
    const config = createJobCreateConfig(handleSubmit, {
      cancelRoute: isEditMode && editId ? `/employee/recruiting/jobs/${editId}` : '/employee/recruiting/jobs',
    })

    // Override title and labels for edit mode
    if (isEditMode) {
      return {
        ...config,
        title: 'Edit Job Requisition',
        description: 'Update job requisition information',
        submitLabel: 'Save Changes',
      }
    }

    return config
  }, [handleSubmit, isEditMode, editId])

  // Adapt store for WizardWithSidebar
  const wizardStoreAdapter = {
    formData: store.formData,
    setFormData: store.setFormData,
    resetForm: store.resetForm,
    isDirty: store.isDirty,
    lastSaved: store.lastSaved,
    currentStep: store.currentStep,
    setCurrentStep: store.setCurrentStep,
  }

  // Loading state for edit mode
  if (isEditMode && editJobQuery.isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Skeleton className="h-8 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  // Error state for edit mode
  if (isEditMode && !editJobQuery.data && !editJobQuery.isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-charcoal-900 mb-2">Job not found</h2>
          <p className="text-charcoal-500 mb-4">The job you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <WizardWithSidebar config={wizardConfig} store={wizardStoreAdapter} draftState={isEditMode ? undefined : draftState} />
  )
}

export default function NewJobPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center">Loading wizard...</div>}>
      <NewJobPageContent />
    </Suspense>
  )
}
