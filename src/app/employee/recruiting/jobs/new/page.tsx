'use client'

import { Suspense, useMemo, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useCreateJobStore, CreateJobFormData, SkillEntry, InterviewRound } from '@/stores/create-job-store'
import { WizardWithSidebar } from '@/components/pcf/wizard/WizardWithSidebar'
import { createJobCreateConfig } from '@/configs/entities/wizards/job-create.config'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { useDebouncedCallback } from 'use-debounce'
import { Loader2 } from 'lucide-react'

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
    minExperienceYears: formData.minExperience ? parseInt(formData.minExperience) : undefined,
    maxExperienceYears: formData.maxExperience ? parseInt(formData.maxExperience) : undefined,
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
function entityToFormData(entity: any): CreateJobFormData {
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
  } as CreateJobFormData
}

function NewJobPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Get store
  const store = useCreateJobStore()

  // URL params
  const draftId = searchParams.get('draft')
  const editId = searchParams.get('edit')
  const resumeId = searchParams.get('resume') // Legacy support for old resume links
  const isEditMode = !!editId

  // Refs for preventing race conditions
  const hasCreatedDraft = useRef(false)
  const previousFormData = useRef<string>('')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Mutations
  const createDraftMutation = trpc.ats.jobs.createDraft.useMutation()
  const updateMutation = trpc.ats.jobs.update.useMutation()

  // The actual draft ID to use (from URL param)
  const activeDraftId = draftId || resumeId

  // Query for draft/edit data (only when we have an ID)
  const entityQuery = trpc.ats.jobs.getById.useQuery(
    { id: (activeDraftId || editId)! },
    { enabled: !!(activeDraftId || editId), retry: false }
  )

  // Step 1: If no draft param and not edit mode, create draft IMMEDIATELY and redirect
  useEffect(() => {
    if (isEditMode) {
      setIsReady(true) // Edit mode doesn't need draft creation
      return
    }
    if (activeDraftId) {
      // Already have a draft ID, just need to load it
      return
    }
    if (hasCreatedDraft.current) {
      return // Already creating
    }

    hasCreatedDraft.current = true
    store.resetForm()

    createDraftMutation.mutateAsync()
      .then((result) => {
        // Redirect to URL with draft ID - this ensures only ONE draft is created
        router.replace(`/employee/recruiting/jobs/new?draft=${result.id}`)
        utils.ats.jobs.list.invalidate()
      })
      .catch((error) => {
        console.error('Failed to create draft:', error)
        hasCreatedDraft.current = false
        toast({ title: 'Error', description: 'Failed to start job creation.', variant: 'error' })
        router.push('/employee/recruiting/jobs')
      })
  }, [isEditMode, activeDraftId])

  // Step 2: Load draft data when we have a draft ID and query returns data
  useEffect(() => {
    if (!activeDraftId) return
    if (isEditMode) return
    if (!entityQuery.data) return
    if (isReady) return // Already loaded

    // Load the draft data into the form
    const draft = entityQuery.data
    const wizardState = draft.wizard_state as { formData?: CreateJobFormData; currentStep?: number } | null

    if (wizardState?.formData) {
      store.setFormData(wizardState.formData)
      if (wizardState.currentStep && store.setCurrentStep) {
        store.setCurrentStep(wizardState.currentStep)
      }
    } else {
      // Fallback to entity field mapping
      const formData = entityToFormData(draft)
      store.setFormData(formData)
    }

    previousFormData.current = JSON.stringify(store.formData)
    setIsReady(true)
  }, [activeDraftId, entityQuery.data, isEditMode, isReady])

  // Step 3: Load data for edit mode
  useEffect(() => {
    if (!isEditMode) return
    if (!editId) return
    if (!entityQuery.data) return

    const formData = entityToFormData(entityQuery.data)
    store.setFormData(formData)
    previousFormData.current = JSON.stringify(formData)
    setIsReady(true)
  }, [isEditMode, editId, entityQuery.data])

  // Auto-save debounced function - ONLY updates, never creates
  const debouncedSave = useDebouncedCallback(
    async (draftIdToUpdate: string, formData: CreateJobFormData, currentStep: number) => {
      const entityData = formToEntityData(formData)
      const wizardState = {
        formData,
        currentStep,
        totalSteps: 8,
        lastSavedAt: new Date().toISOString(),
      }

      try {
        await updateMutation.mutateAsync({
          id: draftIdToUpdate,
          ...entityData,
          wizard_state: wizardState,
        } as any)
        setLastSavedAt(new Date())
        utils.ats.jobs.list.invalidate()
      } catch (error) {
        console.error('[Job Wizard] Auto-save failed:', error)
      }
    },
    2000
  )

  // Watch for form changes and auto-save (ONLY updates to existing draft)
  useEffect(() => {
    if (!isReady) return
    if (isEditMode) return // Don't auto-save in edit mode
    if (!activeDraftId) return // No draft to update

    const currentFormDataStr = JSON.stringify(store.formData)

    // Skip if no changes
    if (currentFormDataStr === previousFormData.current) return
    previousFormData.current = currentFormDataStr

    // Check if form has meaningful data worth saving
    const hasData = store.formData.title?.trim() !== ''
    if (!hasData) return

    // Trigger debounced save - this ONLY updates, never creates
    debouncedSave(activeDraftId, store.formData, store.currentStep)
  }, [isReady, isEditMode, activeDraftId, store.formData, store.currentStep, debouncedSave])

  // Handle final submission
  const handleSubmit = useCallback(
    async (data: CreateJobFormData) => {
      try {
        if (isEditMode && editId) {
          // Update existing job
          const entityData = formToEntityData(data)
          await updateMutation.mutateAsync({
            id: editId,
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
        } else if (activeDraftId) {
          // Finalize draft - update status from 'draft' to 'open'
          const entityData = formToEntityData(data)
          await updateMutation.mutateAsync({
            id: activeDraftId,
            ...entityData,
            status: 'open',
            ownerId: data.ownerId || undefined,
            recruiterIds: data.recruiterIds.length > 0 ? data.recruiterIds : undefined,
            wizard_state: null, // Clear wizard state on finalization
          } as any)

          toast({
            title: 'Job created!',
            description: `${data.title} has been successfully created.`,
          })

          // Invalidate and redirect
          utils.ats.jobs.list.invalidate()
          store.resetForm()
          router.push(`/employee/recruiting/jobs/${activeDraftId}`)
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
    [isEditMode, editId, activeDraftId, router, updateMutation, utils, store, toast]
  )

  // Delete draft function (soft delete only, no navigation)
  const deleteDraft = useCallback(async () => {
    if (activeDraftId && !isEditMode) {
      try {
        await updateMutation.mutateAsync({
          id: activeDraftId,
          deleted_at: new Date().toISOString(),
        } as any)
        utils.ats.jobs.list.invalidate()
      } catch (error) {
        console.error('Failed to delete draft:', error)
      }
    }
  }, [activeDraftId, isEditMode, updateMutation, utils])

  // Handle cancel - just navigate, the useEntityWizard hook will call deleteDraft
  const handleCancel = useCallback(() => {
    store.resetForm()
    router.push('/employee/recruiting/jobs')
  }, [store, router])

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
    lastSaved: lastSavedAt || store.lastSaved,
    currentStep: store.currentStep,
    setCurrentStep: store.setCurrentStep,
  }

  // Draft state for WizardWithSidebar (simplified - no create, only update)
  const draftState = isEditMode ? undefined : {
    isReady,
    isLoading: entityQuery.isLoading,
    isSaving: updateMutation.isPending,
    draftId: activeDraftId,
    lastSavedAt,
    saveDraft: async () => {
      if (!activeDraftId) return
      const entityData = formToEntityData(store.formData)
      const wizardState = {
        formData: store.formData,
        currentStep: store.currentStep,
        totalSteps: 8,
        lastSavedAt: new Date().toISOString(),
      }
      await updateMutation.mutateAsync({
        id: activeDraftId,
        ...entityData,
        wizard_state: wizardState,
      } as any)
      setLastSavedAt(new Date())
      utils.ats.jobs.list.invalidate()
    },
    deleteDraft,
    finalizeDraft: async (status: string) => {
      if (!activeDraftId) throw new Error('No draft to finalize')
      const entityData = formToEntityData(store.formData)
      const result = await updateMutation.mutateAsync({
        id: activeDraftId,
        ...entityData,
        status,
        wizard_state: null,
      } as any)
      utils.ats.jobs.list.invalidate()
      store.resetForm()
      return result
    },
  }

  // Show loading while creating initial draft or loading draft data
  if (!isEditMode && !activeDraftId) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" />
          <p className="text-charcoal-600">Creating new job draft...</p>
        </div>
      </div>
    )
  }

  // Show loading while fetching draft/edit data
  if ((activeDraftId || editId) && entityQuery.isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Skeleton className="h-8 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  // Error state
  if ((activeDraftId || editId) && !entityQuery.data && !entityQuery.isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-charcoal-900 mb-2">
            {isEditMode ? 'Job not found' : 'Draft not found'}
          </h2>
          <p className="text-charcoal-500 mb-4">
            {isEditMode
              ? "The job you're looking for doesn't exist."
              : "The draft you're looking for doesn't exist or has been deleted."}
          </p>
        </div>
      </div>
    )
  }

  // Wait for ready state
  if (!isReady) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" />
          <p className="text-charcoal-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <WizardWithSidebar config={wizardConfig} store={wizardStoreAdapter} draftState={draftState} onCancel={handleCancel} />
  )
}

export default function NewJobPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center">Loading wizard...</div>}>
      <NewJobPageContent />
    </Suspense>
  )
}
