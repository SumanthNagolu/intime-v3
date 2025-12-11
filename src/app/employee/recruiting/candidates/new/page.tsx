'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useCandidateIntakeStore } from '@/stores/candidate-intake-store'
import { EntityWizard } from '@/components/pcf/wizard/EntityWizard'
import { createCandidateIntakeConfig, CandidateIntakeFormData } from '@/configs/entities/wizards/candidate-intake.config'

export default function AddCandidatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Get store
  const {
    formData,
    setFormData,
    resetForm,
    isDirty,
    lastSaved,
  } = useCandidateIntakeStore()

  // Create candidate mutation
  const createMutation = trpc.ats.candidates.create.useMutation({
    onSuccess: (data) => {
      utils.ats.candidates.advancedSearch.invalidate()
      toast({ title: 'Candidate added successfully' })
      resetForm()
      router.push(`/employee/recruiting/candidates/${data.candidateId}`)
    },
    onError: (error) => {
      toast({
        title: 'Error adding candidate',
        description: error.message,
        variant: 'error',
      })
    },
  })

  // Handle form submission
  const handleSubmit = async (data: CandidateIntakeFormData): Promise<unknown> => {
    // Parse structured location from display string if not set directly
    const locationCity = data.locationCity || data.location?.split(',')[0]?.trim() || undefined
    const locationState = data.locationState || data.location?.split(',')[1]?.trim() || undefined
    const locationCountry = data.locationCountry || 'US'

    return createMutation.mutateAsync({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || undefined,
      linkedinUrl: data.linkedinProfile || undefined,
      professionalHeadline: data.professionalHeadline || undefined,
      professionalSummary: data.professionalSummary || undefined,
      skills: data.skills,
      experienceYears: data.experienceYears,
      visaStatus: data.visaStatus,
      availability: data.availability,
      location: data.location,
      // Structured location fields for centralized address creation
      locationCity,
      locationState,
      locationCountry,
      willingToRelocate: data.willingToRelocate,
      isRemoteOk: data.isRemoteOk,
      minimumHourlyRate: data.minimumHourlyRate,
      desiredHourlyRate: data.desiredHourlyRate,
      leadSource: data.leadSource,
      sourceDetails: data.sourceDetails || undefined,
      isOnHotlist: data.isOnHotlist,
      hotlistNotes: data.hotlistNotes || undefined,
    })
  }

  // Create wizard config
  const wizardConfig = createCandidateIntakeConfig(handleSubmit, {
    onSuccess: () => {}, // Already handled in mutation
    cancelRoute: '/employee/recruiting/candidates',
  })

  // Store adapter for EntityWizard
  const storeAdapter = {
    formData: formData as unknown as CandidateIntakeFormData,
    setFormData: setFormData as (data: Partial<CandidateIntakeFormData>) => void,
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
