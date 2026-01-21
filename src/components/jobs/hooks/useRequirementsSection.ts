import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { RequirementsSectionData, SectionMode } from '@/lib/jobs/types'
import { DEFAULT_REQUIREMENTS_DATA } from '@/lib/jobs/types'

interface UseRequirementsSectionOptions {
  jobId: string
  initialData?: Partial<RequirementsSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseRequirementsSectionReturn {
  data: RequirementsSectionData
  isLoading: boolean
  isSaving: boolean
  isEditing: boolean
  errors: Record<string, string> | undefined
  handleChange: (field: string, value: unknown) => void
  handleSave: () => Promise<void>
  handleCancel: () => void
  handleEdit: () => void
}

/**
 * useRequirementsSection - Hook for managing Requirements section state and operations
 */
export function useRequirementsSection({
  jobId,
  initialData,
  mode,
  onSaveComplete,
}: UseRequirementsSectionOptions): UseRequirementsSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<RequirementsSectionData>(() => ({
    ...DEFAULT_REQUIREMENTS_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<RequirementsSectionData | null>(null)

  // Use the existing jobs.update mutation for partial updates
  const updateMutation = trpc.ats.jobs.update.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_REQUIREMENTS_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  // Handle single field change
  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Handle save - use jobs.update with intakeData for requirements
  const handleSave = useCallback(async () => {
    try {
      await updateMutation.mutateAsync({
        id: jobId,
        // Store detailed skills and other requirements in intakeData
        intakeData: {
          requiredSkillsDetailed: localData.requiredSkills,
          preferredSkills: localData.preferredSkills,
          minExperience: localData.minExperience,
          maxExperience: localData.maxExperience,
          experienceLevel: localData.experienceLevel,
          education: localData.education,
          certifications: localData.certifications,
          industries: localData.industries,
        },
        // Also update the simpler fields that have DB columns
        visaRequirements: localData.visaRequirements,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save requirements:', error)
      throw error
    }
  }, [jobId, localData, updateMutation, onSaveComplete])

  // Handle cancel - revert to original data
  const handleCancel = useCallback(() => {
    if (originalData) {
      setLocalData(originalData)
    }
    setIsEditing(false)
  }, [originalData])

  // Handle edit
  const handleEdit = useCallback(() => {
    setOriginalData(localData)
    setIsEditing(true)
  }, [localData])

  // Extract errors from mutation
  const errors = updateMutation.error?.data?.zodError?.fieldErrors as Record<string, string> | undefined

  return {
    data: localData,
    isLoading: false,
    isSaving: updateMutation.isPending,
    isEditing,
    errors,
    handleChange,
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useRequirementsSection
