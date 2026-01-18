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

// Helper to convert File to base64 for tRPC upload
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Transform form data to entity data for API calls
function formToEntityData(formData: CreateCandidateFormData) {
  // Transform skills to full skill entry format for API
  const skillEntries = (formData.skills || []).map(s => {
    if (typeof s === 'string') {
      return { name: s, proficiency: 'intermediate' as const, isPrimary: false, isCertified: false }
    }
    return {
      name: s.name,
      proficiency: s.proficiency || 'intermediate' as const,
      yearsOfExperience: s.yearsOfExperience,
      isPrimary: s.isPrimary || false,
      isCertified: s.isCertified || false,
      lastUsed: s.lastUsed,
    }
  })

  // Transform work history for API
  const workHistoryEntries = (formData.workHistory || []).map(w => ({
    companyName: w.companyName,
    jobTitle: w.jobTitle,
    employmentType: w.employmentType,
    startDate: w.startDate,
    endDate: w.endDate,
    isCurrent: w.isCurrent || false,
    locationCity: w.locationCity,
    locationState: w.locationState,
    isRemote: w.isRemote || false,
    description: w.description,
    achievements: w.achievements || [],
  }))

  // Transform education for API
  const educationEntries = (formData.education || []).map(e => ({
    institutionName: e.institutionName,
    degreeType: e.degreeType,
    degreeName: e.degreeName,
    fieldOfStudy: e.fieldOfStudy,
    startDate: e.startDate,
    endDate: e.endDate,
    isCurrent: e.isCurrent || false,
    gpa: e.gpa,
    honors: e.honors,
  }))

  // Transform certifications for API
  const certificationEntries = (formData.certifications || []).map(c => ({
    name: c.name,
    acronym: c.acronym,
    issuingOrganization: c.issuingOrganization,
    credentialId: c.credentialId,
    credentialUrl: c.credentialUrl,
    issueDate: c.issueDate,
    expiryDate: c.expiryDate,
    isLifetime: c.isLifetime || false,
  }))

  // Convert PhoneInputValue to string for API
  const phoneString = formData.phone ? formatPhoneValue(formData.phone) : undefined

  // Map visa status to work authorization label for display
  const visaStatusLabels: Record<string, string> = {
    us_citizen: 'US Citizen',
    green_card: 'Green Card / Permanent Resident',
    h1b: 'H1B Visa',
    l1: 'L1 Visa',
    tn: 'TN Visa',
    opt: 'OPT (F1)',
    cpt: 'CPT (F1)',
    ead: 'EAD Card',
    other: 'Other',
  }

  return {
    // Personal info
    firstName: formData.firstName || undefined,
    lastName: formData.lastName || undefined,
    email: formData.email || undefined,
    phone: phoneString || undefined,
    linkedinUrl: formData.linkedinProfile || undefined,

    // Professional info
    professionalHeadline: formData.professionalHeadline || undefined,
    professionalSummary: formData.professionalSummary || undefined,
    experienceYears: formData.experienceYears,

    // Employment preferences
    employmentTypes: formData.employmentTypes,
    workModes: formData.workModes,

    // Skills with full metadata (objects, not just names)
    skills: skillEntries,

    // Work history
    workHistory: workHistoryEntries,

    // Education
    education: educationEntries,

    // Certifications
    certifications: certificationEntries,

    // Work authorization
    visaStatus: formData.visaStatus,
    visaExpiryDate: formData.visaExpiryDate || undefined,
    workAuthorization: visaStatusLabels[formData.visaStatus] || formData.visaStatus,
    requiresSponsorship: formData.requiresSponsorship,
    currentSponsor: formData.currentSponsor || undefined,
    isTransferable: formData.isTransferable,

    // Availability
    availability: formData.availability,
    availableFrom: formData.availableFrom || undefined,
    noticePeriodDays: formData.noticePeriodDays,

    // Location
    location: formData.location || undefined,
    locationCity: formData.locationCity || undefined,
    locationState: formData.locationState || undefined,
    locationCountry: formData.locationCountry || undefined,
    willingToRelocate: formData.willingToRelocate,
    relocationPreferences: formData.relocationPreferences || undefined,
    isRemoteOk: formData.isRemoteOk,

    // Compensation
    minimumRate: formData.minimumRate,
    desiredRate: formData.desiredRate,
    rateType: formData.rateType,
    currency: formData.currency,
    isNegotiable: formData.isNegotiable,
    compensationNotes: formData.compensationNotes || undefined,

    // Source tracking
    leadSource: formData.leadSource,
    sourceDetails: formData.sourceDetails || undefined,
    referredBy: formData.referredBy || undefined,
    campaignId: formData.campaignId || undefined,

    // Tracking
    isOnHotlist: formData.isOnHotlist,
    hotlistNotes: formData.hotlistNotes || undefined,
    tags: formData.tags,
    internalNotes: formData.internalNotes || undefined,
  }
}

// Transform entity data to form data for editing/resuming (used for edit mode)
function entityToFormData(entity: any): CreateCandidateFormData {
  // Map proficiency level from DB value (1-5) to string
  const proficiencyMap: Record<number, 'beginner' | 'intermediate' | 'advanced' | 'expert'> = {
    1: 'beginner',
    2: 'beginner',
    3: 'intermediate',
    4: 'advanced',
    5: 'expert',
  }

  // Convert skills from DB format to SkillEntry format
  const skillEntries = (entity.skills || []).map((skill: any, index: number) => ({
    name: skill.skill_name || skill.name || skill,
    proficiency: typeof skill.proficiency_level === 'number'
      ? proficiencyMap[skill.proficiency_level] || 'intermediate'
      : (skill.proficiency_level === '3' ? 'intermediate' : skill.proficiency_level) || 'intermediate',
    yearsOfExperience: skill.years_of_experience,
    isPrimary: skill.is_primary || index < 5,
    isCertified: skill.is_certified || false,
    lastUsed: skill.last_used_date,
  }))

  // Convert work history from DB format
  const workHistoryEntries = (entity.workHistory || []).map((w: any) => ({
    id: w.id,
    companyName: w.company_name || '',
    jobTitle: w.job_title || '',
    employmentType: w.employment_type || 'full_time',
    startDate: w.start_date || '',
    endDate: w.end_date || undefined,
    isCurrent: w.is_current || false,
    locationCity: w.location_city || '',
    locationState: w.location_state || '',
    isRemote: w.is_remote || false,
    description: w.description || '',
    achievements: w.achievements || [],
  }))

  // Convert education from DB format
  const educationEntries = (entity.education || []).map((e: any) => ({
    id: e.id,
    institutionName: e.institution_name || '',
    degreeType: e.degree_type || 'bachelor',
    degreeName: e.degree_name || '',
    fieldOfStudy: e.field_of_study || '',
    startDate: e.start_date || '',
    endDate: e.end_date || undefined,
    isCurrent: e.is_current || false,
    gpa: e.gpa,
    honors: e.honors || '',
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
    // Step 4 - Work History (now populated from entity.workHistory)
    workHistory: workHistoryEntries,
    // Step 5 - Education (now populated from entity.education)
    education: educationEntries,
    // Step 6 - Skills (now populated from entity.skills with full metadata)
    skills: skillEntries,
    primarySkills: skillEntries.filter((s: { isPrimary: boolean }) => s.isPrimary).map((s: { name: string }) => s.name),
    certifications: [],
    // Step 7 - Authorization
    visaStatus: entity.visa_status || 'us_citizen',
    visaExpiryDate: entity.visa_expiry_date || undefined,
    requiresSponsorship: entity.requires_sponsorship || false,
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
    complianceDocuments: [],
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
  const deleteDraftMutation = trpc.ats.candidates.deleteDraft.useMutation()
  const uploadResumeMutation = trpc.resumes.upload.useMutation()
  const uploadDocumentMutation = trpc.documents.upload.useMutation()

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

      // Determine which step to resume from
      let resumeStep = wizardState.currentStep || 1

      // Skip step 1 (Source) when resuming since source is already determined
      // Only skip if sourceType is already set and we'd otherwise start at step 1
      if (resumeStep === 1 && wizardState.formData.sourceType) {
        resumeStep = 2 // Start at Contact Info instead
      }

      if (store.setCurrentStep) {
        store.setCurrentStep(resumeStep)
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
    } else {
      const formData = entityToFormData(entity)
      store.setFormData(formData)
    }

    // In edit mode, always start at step 2 (Contact Info) - step 1 (Source) is irrelevant
    // The candidate already exists, so source selection doesn't apply
    if (store.setCurrentStep) {
      store.setCurrentStep(2)
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

        // Upload resume via tRPC (uses admin client to bypass storage RLS)
        // Use getState() to get fresh state at submission time (not stale closure reference)
        const currentState = useCreateCandidateStore.getState()
        const { resumeFile, resumeParsedData } = currentState
        const candidateIdForUpload = isEditMode ? editId : activeDraftId

        if (resumeFile && candidateIdForUpload) {
          try {
            const file = resumeFile
            const parsedResume = resumeParsedData // May be null if parsing failed/skipped

            // Convert file to base64 for tRPC upload
            const fileData = await fileToBase64(file)

            // Upload via tRPC (bypasses storage RLS using admin client)
            const uploadResult = await uploadResumeMutation.mutateAsync({
              candidateId: candidateIdForUpload,
              fileName: file.name,
              fileData,
              fileSize: file.size,
              mimeType: file.type || 'application/pdf',
              isPrimary: true,
              // Include parsed data if available
              parsedContent: parsedResume?.rawText ? { rawText: parsedResume.rawText } : undefined,
              parsedSkills: parsedResume?.skills,
              aiSummary: parsedResume?.professionalSummary,
            })

            // Set resumeData for the candidate update (won't create duplicate - just metadata reference)
            resumeData = {
              storagePath: uploadResult.filePath,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type || 'application/pdf',
              parsedContent: parsedResume?.rawText,
              parsedSkills: parsedResume?.skills,
              parsedExperience: parsedResume?.professionalSummary,
              aiSummary: parsedResume?.professionalSummary,
              parsingConfidence: parsedResume?.confidence?.overall,
            }
          } catch (error: any) {
            console.error('Error uploading resume:', error)
            toast({
              title: 'Resume upload failed',
              description: `${error.message || 'Unknown error'}. Candidate will be saved without resume.`,
              variant: 'default',
            })
          }
        }

        // Upload compliance documents via tRPC (uses admin client to bypass storage RLS)
        const complianceDocsData: Array<{
          documentType: string
          fileName: string
          fileSize: number
          storagePath: string
          notes?: string
        }> = []

        const { complianceDocumentFiles } = currentState
        for (const doc of data.complianceDocuments || []) {
          const file = complianceDocumentFiles.get(doc.id)
          if (file && candidateIdForUpload) {
            try {
              // Convert file to base64 for tRPC upload
              const fileData = await fileToBase64(file)

              // Upload via tRPC (bypasses storage RLS using admin client)
              const uploadResult = await uploadDocumentMutation.mutateAsync({
                entityType: 'candidate',
                entityId: candidateIdForUpload,
                fileName: file.name,
                fileData,
                fileSizeBytes: file.size,
                mimeType: file.type || 'application/pdf',
                documentType: doc.type as any, // Type mapping
                documentCategory: 'compliance',
                description: doc.notes,
              })

              complianceDocsData.push({
                documentType: doc.type,
                fileName: file.name,
                fileSize: file.size,
                storagePath: uploadResult.publicUrl || '',
                notes: doc.notes,
              })
              console.log(`[Candidate Wizard] Compliance doc uploaded via tRPC: ${doc.type}`)
            } catch (error: any) {
              console.error(`Error uploading compliance doc ${doc.type}:`, error.message)
            }
          }
        }

        // Transform skill entries for API (keep full metadata, not just names)
        const skillEntries = (data.skills || []).map(s => {
          if (typeof s === 'string') {
            return { name: s, proficiency: 'intermediate' as const, isPrimary: false, isCertified: false }
          }
          return {
            name: s.name,
            proficiency: s.proficiency || 'intermediate' as const,
            yearsOfExperience: s.yearsOfExperience,
            isPrimary: s.isPrimary || false,
            isCertified: s.isCertified || false,
            lastUsed: s.lastUsed,
          }
        })

        // Transform work history for API
        const workHistoryEntries = (data.workHistory || []).map(w => ({
          companyName: w.companyName,
          jobTitle: w.jobTitle,
          employmentType: w.employmentType,
          startDate: w.startDate,
          endDate: w.endDate,
          isCurrent: w.isCurrent || false,
          locationCity: w.locationCity,
          locationState: w.locationState,
          isRemote: w.isRemote || false,
          description: w.description,
          achievements: w.achievements || [],
        }))

        // Transform education for API
        const educationEntries = (data.education || []).map(e => ({
          institutionName: e.institutionName,
          degreeType: e.degreeType,
          degreeName: e.degreeName,
          fieldOfStudy: e.fieldOfStudy,
          startDate: e.startDate,
          endDate: e.endDate,
          isCurrent: e.isCurrent || false,
          gpa: e.gpa,
          honors: e.honors,
        }))

        // Transform certifications for API
        const certificationEntries = (data.certifications || []).map(c => ({
          name: c.name,
          acronym: c.acronym,
          issuingOrganization: c.issuingOrganization,
          credentialId: c.credentialId,
          credentialUrl: c.credentialUrl,
          issueDate: c.issueDate,
          expiryDate: c.expiryDate,
          isLifetime: c.isLifetime || false,
        }))

        // Convert phone to string for API
        const phoneForApi = data.phone ? formatPhoneValue(data.phone) : undefined

        // Map visa status to work authorization label for display
        const visaStatusLabels: Record<string, string> = {
          us_citizen: 'US Citizen',
          green_card: 'Green Card / Permanent Resident',
          h1b: 'H1B Visa',
          l1: 'L1 Visa',
          tn: 'TN Visa',
          opt: 'OPT (F1)',
          cpt: 'CPT (F1)',
          ead: 'EAD Card',
          other: 'Other',
        }

        // Build common payload with all candidate fields
        const candidatePayload = {
          // Personal info
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: phoneForApi,
          linkedinUrl: data.linkedinProfile || undefined,

          // Professional info
          professionalHeadline: data.professionalHeadline || undefined,
          professionalSummary: data.professionalSummary || undefined,
          experienceYears: data.experienceYears,

          // Employment preferences
          employmentTypes: data.employmentTypes,
          workModes: data.workModes,

          // Skills with full metadata
          skills: skillEntries,

          // Work history
          workHistory: workHistoryEntries,

          // Education
          education: educationEntries,

          // Certifications
          certifications: certificationEntries,

          // Work authorization
          visaStatus: data.visaStatus,
          visaExpiryDate: data.visaExpiryDate || undefined,
          requiresSponsorship: data.requiresSponsorship,
          currentSponsor: data.currentSponsor || undefined,
          isTransferable: data.isTransferable,

          // Availability
          availability: data.availability as 'immediate' | '2_weeks' | '30_days' | '60_days' | 'not_available',
          availableFrom: data.availableFrom || undefined,
          noticePeriodDays: data.noticePeriodDays,

          // Location
          location: data.location,
          locationCity,
          locationState,
          locationCountry,
          willingToRelocate: data.willingToRelocate,
          relocationPreferences: data.relocationPreferences || undefined,
          isRemoteOk: data.isRemoteOk,

          // Compensation
          rateType: data.rateType,
          minimumRate: data.minimumRate,
          desiredRate: data.desiredRate,
          currency: data.currency,
          isNegotiable: data.isNegotiable,
          compensationNotes: data.compensationNotes || undefined,

          // Source tracking
          leadSource: data.leadSource as 'linkedin' | 'indeed' | 'dice' | 'monster' | 'referral' | 'direct' | 'agency' | 'job_board' | 'website' | 'event' | 'other',
          sourceDetails: data.sourceDetails || undefined,
          referredBy: data.referredBy || undefined,
          campaignId: data.campaignId || undefined,

          // Tracking
          isOnHotlist: data.isOnHotlist,
          hotlistNotes: data.hotlistNotes || undefined,
          tags: data.tags,
          internalNotes: data.internalNotes || undefined,

          // Clear wizard state on finalization
          wizard_state: null,
        }

        if (isEditMode && editId) {
          // Update existing candidate
          await updateMutation.mutateAsync({
            candidateId: editId,
            ...candidatePayload,
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
          // Finalize draft - update status from 'draft' to 'active'
          const finalPayload = {
            candidateId: activeDraftId,
            ...candidatePayload,
            profileStatus: 'active', // Finalize: change status from 'draft' to 'active'
            resumeData, // Pass resume data for contact_resumes record creation
            complianceDocumentsData: complianceDocsData.length > 0 ? complianceDocsData : undefined,
            internalNotes: data.internalNotes || undefined, // Pass internal notes for notes table
          }
          await updateMutation.mutateAsync(finalPayload as any)

          toast({
            title: 'Candidate created!',
            description: `${data.firstName} ${data.lastName} has been successfully added.`,
          })

          utils.ats.candidates.advancedSearch.invalidate()
          store.resetForm()
          router.push(`/employee/recruiting/candidates/${activeDraftId}`) // Use same ID (draft becomes the real record)
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
    [isEditMode, editId, activeDraftId, router, updateMutation, utils, store, toast]
  )

  // Delete draft function (proper soft delete via deleted_at)
  const deleteDraft = useCallback(async () => {
    if (activeDraftId && !isEditMode) {
      try {
        await deleteDraftMutation.mutateAsync({ id: activeDraftId })
        utils.ats.candidates.advancedSearch.invalidate()
        utils.ats.candidates.listMyDrafts.invalidate()
      } catch (error) {
        console.error('Failed to delete draft:', error)
      }
    }
  }, [activeDraftId, isEditMode, deleteDraftMutation, utils])

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
