'use client'

import { Suspense, useMemo, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useCreateCandidateStore, CreateCandidateFormData } from '@/stores/create-candidate-store'
import { WizardWithSidebar } from '@/components/pcf/wizard/WizardWithSidebar'
import { createCandidateCreateConfig } from '@/configs/entities/wizards/candidate-create.config'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { useDebouncedCallback } from 'use-debounce'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPhoneValue, parsePhoneValue } from '@/components/ui/phone-input'

// Transform form data to entity data for API calls
function formToEntityData(formData: CreateCandidateFormData) {
  // Extract skill names from SkillEntry objects for API
  const skillNames = formData.skills?.map(s => typeof s === 'string' ? s : s.name) || []

  // Convert PhoneInputValue to string for API
  const phoneString = formData.phone ? formatPhoneValue(formData.phone) : undefined

  return {
    firstName: formData.firstName || undefined,
    lastName: formData.lastName || undefined,
    email: formData.email || undefined,
    phone: phoneString || undefined,
    linkedinUrl: formData.linkedinProfile || undefined,
    professionalHeadline: formData.professionalHeadline || undefined,
    professionalSummary: formData.professionalSummary || undefined,
    skills: skillNames,
    experienceYears: formData.experienceYears,
    visaStatus: formData.visaStatus,
    availability: formData.availability,
    location: formData.location || undefined,
    locationCity: formData.locationCity || undefined,
    locationState: formData.locationState || undefined,
    locationCountry: formData.locationCountry || undefined,
    willingToRelocate: formData.willingToRelocate,
    isRemoteOk: formData.isRemoteOk,
    minimumRate: formData.minimumRate,
    desiredRate: formData.desiredRate,
    rateType: formData.rateType,
    leadSource: formData.leadSource,
    sourceDetails: formData.sourceDetails || undefined,
    isOnHotlist: formData.isOnHotlist,
    hotlistNotes: formData.hotlistNotes || undefined,
    tags: formData.tags,
  }
}

// Transform entity data to form data for editing/resuming (used for edit mode)
function entityToFormData(entity: any): CreateCandidateFormData {
  // Convert string skills to SkillEntry format
  const skillEntries = (entity.skills || []).map((skill: string, index: number) => ({
    name: skill,
    proficiency: 'intermediate' as const,
    isPrimary: index < 5,
    isCertified: false,
  }))

  return {
    // Step 1
    sourceType: 'manual',
    resumeParsed: false,
    // Step 2
    firstName: entity.first_name || '',
    lastName: entity.last_name || '',
    email: entity.email || '',
    phone: parsePhoneValue(entity.phone),
    linkedinProfile: entity.linkedin_url || '',
    location: entity.location || '',
    locationCity: entity.location_city || '',
    locationState: entity.location_state || '',
    locationCountry: entity.location_country || 'US',
    // Step 3 - Professional
    professionalHeadline: entity.title || '',
    professionalSummary: entity.professional_summary || '',
    experienceYears: entity.years_experience || 0,
    employmentTypes: entity.employment_types || ['full_time', 'contract'],
    workModes: entity.work_modes || ['on_site', 'remote'],
    // Step 4 - Work History
    workHistory: [], // TODO: Fetch from candidate_work_history table
    // Step 5 - Education
    education: [], // TODO: Fetch from candidate_education table
    // Step 6 - Skills
    skills: skillEntries,
    primarySkills: skillEntries.filter((s: { isPrimary: boolean }) => s.isPrimary).map((s: { name: string }) => s.name),
    certifications: [],
    // Step 7 - Authorization
    visaStatus: entity.visa_status || 'us_citizen',
    visaExpiryDate: entity.visa_expiry_date || undefined,
    requiresSponsorship: false,
    availability: entity.availability || '2_weeks',
    availableFrom: entity.available_from || undefined,
    noticePeriodDays: entity.notice_period_days || undefined,
    willingToRelocate: entity.willing_to_relocate || false,
    relocationPreferences: entity.relocation_preferences || '',
    isRemoteOk: entity.is_remote_ok || false,
    // Step 8 - Compensation
    rateType: entity.rate_type || 'hourly',
    minimumRate: entity.minimum_rate || undefined,
    desiredRate: entity.desired_rate || undefined,
    currency: (entity.currency as 'USD' | 'CAD' | 'EUR' | 'GBP' | 'INR') || 'USD',
    isNegotiable: entity.is_negotiable !== false,
    compensationNotes: entity.compensation_notes || '',
    // Step 9 - Documents & Tracking
    leadSource: entity.lead_source || 'linkedin',
    sourceDetails: entity.lead_source_detail || '',
    referredBy: entity.referred_by || '',
    complianceDocuments: [], // TODO: Fetch from candidate_compliance_documents table
    isOnHotlist: entity.is_on_hotlist || false,
    hotlistNotes: entity.hotlist_notes || '',
    tags: entity.tags || [],
    internalNotes: '',
  }
}

function NewCandidatePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Get store - includes resumeFile and resumeParsedData for upload
  const store = useCreateCandidateStore()

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
  const createDraftMutation = trpc.ats.candidates.createDraft.useMutation()
  const updateMutation = trpc.ats.candidates.update.useMutation()
  const createMutation = trpc.ats.candidates.create.useMutation()

  // The actual draft ID to use (from URL param)
  const activeDraftId = draftId || resumeId

  // Query for draft/edit data (only when we have an ID)
  const entityQuery = trpc.ats.candidates.getById.useQuery(
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
        router.replace(`/employee/recruiting/candidates/new?draft=${result.id}`)
        utils.ats.candidates.advancedSearch.invalidate()
      })
      .catch((error) => {
        console.error('Failed to create draft:', error)
        hasCreatedDraft.current = false
        toast({ title: 'Error', description: 'Failed to start candidate creation.', variant: 'error' })
        router.push('/employee/recruiting/candidates')
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
    const wizardState = draft.wizard_state as { formData?: CreateCandidateFormData; currentStep?: number } | null

    if (wizardState?.formData) {
      // Resume from saved wizard state
      store.setFormData(wizardState.formData)
      if (wizardState.currentStep && store.setCurrentStep) {
        store.setCurrentStep(wizardState.currentStep)
      }
    }
    // For fresh drafts without wizard_state, do NOT load from entity
    // The store already has clean default values - don't overwrite with placeholder data

    previousFormData.current = JSON.stringify(store.formData)
    setIsReady(true)
  }, [activeDraftId, entityQuery.data, isEditMode, isReady])

  // Step 3: Load data for edit mode
  useEffect(() => {
    if (!isEditMode) return
    if (!editId) return
    if (!entityQuery.data) return

    const entity = entityQuery.data
    const wizardState = entity.wizard_state as { formData?: CreateCandidateFormData; currentStep?: number } | null

    // Prefer wizard_state.formData if available (contains full form data)
    // Otherwise fall back to entity field mapping
    if (wizardState?.formData) {
      store.setFormData(wizardState.formData)
      if (wizardState.currentStep && store.setCurrentStep) {
        store.setCurrentStep(wizardState.currentStep)
      }
    } else {
      const formData = entityToFormData(entity)
      store.setFormData(formData)
    }
    previousFormData.current = JSON.stringify(store.formData)
    setIsReady(true)
  }, [isEditMode, editId, entityQuery.data])

  // Auto-save debounced function - ONLY updates, never creates
  const debouncedSave = useDebouncedCallback(
    async (draftIdToUpdate: string, formData: CreateCandidateFormData, currentStep: number) => {
      const entityData = formToEntityData(formData)
      const wizardState = {
        formData,
        currentStep,
        totalSteps: 8,
        lastSavedAt: new Date().toISOString(),
      }

      try {
        await updateMutation.mutateAsync({
          candidateId: draftIdToUpdate,
          ...entityData,
          wizard_state: wizardState,
        } as any)
        setLastSavedAt(new Date())
        utils.ats.candidates.advancedSearch.invalidate()
      } catch (error) {
        console.error('[Candidate Wizard] Auto-save failed:', error)
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
    const hasData = store.formData.firstName?.trim() !== '' || store.formData.email?.trim() !== ''
    if (!hasData) return

    // Trigger debounced save - this ONLY updates, never creates
    debouncedSave(activeDraftId, store.formData, store.currentStep)
  }, [isReady, isEditMode, activeDraftId, store.formData, store.currentStep, debouncedSave])

  // Handle final submission
  const handleSubmit = useCallback(
    async (data: CreateCandidateFormData) => {
      try {
        // Parse structured location from display string if not set directly
        const locationCity = data.locationCity || data.location?.split(',')[0]?.trim() || undefined
        const locationState = data.locationState || data.location?.split(',')[1]?.trim() || undefined
        const locationCountry = data.locationCountry || 'US'

        // Prepare resume data if we have a parsed resume (from store)
        let resumeData: {
          storagePath: string
          fileName: string
          fileSize: number
          mimeType: string
          parsedContent?: string
          parsedSkills?: string[]
          parsedExperience?: string
          aiSummary?: string
          parsingConfidence?: number
        } | undefined = undefined

        // Upload resume to storage first if we have one (stored in Zustand store)
        const { resumeFile, resumeParsedData } = store
        if (resumeFile && resumeParsedData) {
          try {
            const supabase = createClient()
            const file = resumeFile
            const parsedResume = resumeParsedData
            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf'
            const tempId = `temp-${Date.now()}`
            const storagePath = `${tempId}/${Date.now()}-resume.${fileExt}`

            const { error: uploadError } = await supabase.storage
              .from('resumes')
              .upload(storagePath, file)

            if (uploadError) {
              console.error('Failed to upload resume:', uploadError.message)
              toast({
                title: 'Resume upload failed',
                description: `${uploadError.message}. Candidate will be saved without resume.`,
                variant: 'default',
              })
            } else {
              resumeData = {
                storagePath,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type || 'application/pdf',
                parsedContent: parsedResume.rawText,
                parsedSkills: parsedResume.skills,
                parsedExperience: parsedResume.professionalSummary,
                aiSummary: parsedResume.professionalSummary,
                parsingConfidence: parsedResume.confidence.overall,
              }
            }
          } catch (error) {
            console.error('Error uploading resume:', error)
          }
        }

        // Extract skill names from SkillEntry objects
        const skillNames = data.skills?.map(s => typeof s === 'string' ? s : s.name) || []

        // Convert phone to string for API
        const phoneForApi = data.phone ? formatPhoneValue(data.phone) : undefined

        if (isEditMode && editId) {
          // Update existing candidate
          await updateMutation.mutateAsync({
            candidateId: editId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: phoneForApi,
            linkedinUrl: data.linkedinProfile || undefined,
            professionalHeadline: data.professionalHeadline || undefined,
            professionalSummary: data.professionalSummary || undefined,
            skills: skillNames,
            experienceYears: data.experienceYears,
            visaStatus: data.visaStatus,
            availability: data.availability,
            location: data.location,
            locationCity,
            locationState,
            locationCountry,
            willingToRelocate: data.willingToRelocate,
            isRemoteOk: data.isRemoteOk,
            minimumRate: data.minimumRate,
            desiredRate: data.desiredRate,
            rateType: data.rateType,
            leadSource: data.leadSource,
            sourceDetails: data.sourceDetails || undefined,
            isOnHotlist: data.isOnHotlist,
            hotlistNotes: data.hotlistNotes || undefined,
            tags: data.tags,
            wizard_state: null, // Clear wizard state on finalization
          } as any)

          toast({
            title: 'Candidate updated!',
            description: `${data.firstName} ${data.lastName} has been successfully updated.`,
          })

          utils.ats.candidates.getById.invalidate({ id: editId })
          utils.ats.candidates.advancedSearch.invalidate()
          store.resetForm()
          router.push(`/employee/recruiting/candidates/${editId}`)
        } else if (activeDraftId) {
          // Finalize draft - create the full candidate record via create mutation
          // First, delete the draft (soft delete)
          await updateMutation.mutateAsync({
            candidateId: activeDraftId,
            profileStatus: 'active', // This will be overridden by create
            wizard_state: null,
          } as any)

          // Now create the actual candidate with full data
          // Map 60_days to 30_days for API compatibility
          const apiAvailability = data.availability === '60_days' ? '30_days' : data.availability
          // Map newer lead sources to 'other' for API compatibility
          const apiLeadSource = ['website', 'event'].includes(data.leadSource) ? 'other' : data.leadSource

          const result = await createMutation.mutateAsync({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: phoneForApi,
            linkedinUrl: data.linkedinProfile || undefined,
            professionalHeadline: data.professionalHeadline || undefined,
            professionalSummary: data.professionalSummary || undefined,
            skills: skillNames,
            experienceYears: data.experienceYears,
            visaStatus: data.visaStatus,
            availability: apiAvailability as 'immediate' | '2_weeks' | '30_days' | 'not_available',
            location: data.location,
            locationCity,
            locationState,
            locationCountry,
            willingToRelocate: data.willingToRelocate,
            isRemoteOk: data.isRemoteOk,
            minimumHourlyRate: data.minimumRate,
            desiredHourlyRate: data.desiredRate,
            leadSource: apiLeadSource as 'linkedin' | 'indeed' | 'dice' | 'monster' | 'referral' | 'direct' | 'agency' | 'job_board' | 'other',
            sourceDetails: data.sourceDetails || undefined,
            isOnHotlist: data.isOnHotlist,
            hotlistNotes: data.hotlistNotes || undefined,
            tags: data.tags,
            resumeData,
          })

          // Soft delete the draft now that we have the real candidate
          await updateMutation.mutateAsync({
            candidateId: activeDraftId,
            profileStatus: 'draft',
          } as any).catch(() => {}) // Ignore errors

          toast({
            title: 'Candidate created!',
            description: `${data.firstName} ${data.lastName} has been successfully added.`,
          })

          utils.ats.candidates.advancedSearch.invalidate()
          store.resetForm()
          router.push(`/employee/recruiting/candidates/${result.candidateId}`)
        }
      } catch (error) {
        console.error('Failed to save candidate:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to save candidate.',
          variant: 'error',
        })
        throw error
      }
    },
    [isEditMode, editId, activeDraftId, router, updateMutation, createMutation, utils, store, toast]
  )

  // Delete draft function (soft delete only)
  const deleteDraft = useCallback(async () => {
    if (activeDraftId && !isEditMode) {
      try {
        await updateMutation.mutateAsync({
          candidateId: activeDraftId,
          profileStatus: 'draft',
        } as any)
        utils.ats.candidates.advancedSearch.invalidate()
      } catch (error) {
        console.error('Failed to delete draft:', error)
      }
    }
  }, [activeDraftId, isEditMode, updateMutation, utils])

  // Handle cancel
  const handleCancel = useCallback(() => {
    store.resetForm()
    router.push('/employee/recruiting/candidates')
  }, [store, router])

  // Create wizard config
  const wizardConfig = useMemo(() => {
    const config = createCandidateCreateConfig(handleSubmit, {
      cancelRoute: isEditMode && editId ? `/employee/recruiting/candidates/${editId}` : '/employee/recruiting/candidates',
    })

    // Override title and labels for edit mode
    if (isEditMode) {
      return {
        ...config,
        title: 'Edit Candidate',
        description: 'Update candidate information',
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

  // Draft state for WizardWithSidebar
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
        candidateId: activeDraftId,
        ...entityData,
        wizard_state: wizardState,
      } as any)
      setLastSavedAt(new Date())
      utils.ats.candidates.advancedSearch.invalidate()
    },
    deleteDraft,
    finalizeDraft: async (status: string) => {
      if (!activeDraftId) throw new Error('No draft to finalize')
      // Note: Finalization happens in handleSubmit
      return { id: activeDraftId }
    },
  }

  // Show loading while creating initial draft or loading draft data
  if (!isEditMode && !activeDraftId) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" />
          <p className="text-charcoal-600">Creating new candidate draft...</p>
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
            {isEditMode ? 'Candidate not found' : 'Draft not found'}
          </h2>
          <p className="text-charcoal-500 mb-4">
            {isEditMode
              ? "The candidate you're looking for doesn't exist."
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
    <WizardWithSidebar
      config={wizardConfig}
      store={wizardStoreAdapter}
      draftState={draftState}
      onCancel={handleCancel}
    />
  )
}

export default function NewCandidatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center">Loading wizard...</div>}>
      <NewCandidatePageContent />
    </Suspense>
  )
}
