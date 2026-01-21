import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { LocationSectionData, SectionMode } from '@/lib/jobs/types'
import { DEFAULT_LOCATION_DATA } from '@/lib/jobs/types'

interface UseLocationSectionOptions {
  jobId: string
  initialData?: Partial<LocationSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseLocationSectionReturn {
  data: LocationSectionData
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
 * useLocationSection - Hook for managing Location section state and operations
 */
export function useLocationSection({
  jobId,
  initialData,
  mode,
  onSaveComplete,
}: UseLocationSectionOptions): UseLocationSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<LocationSectionData>(() => ({
    ...DEFAULT_LOCATION_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<LocationSectionData | null>(null)

  // Use the existing jobs.update mutation for partial updates
  const updateMutation = trpc.ats.jobs.update.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_LOCATION_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  // Handle single field change
  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Handle save - use jobs.update
  const handleSave = useCallback(async () => {
    try {
      await updateMutation.mutateAsync({
        id: jobId,
        // DB columns
        location: localData.location || undefined,
        locationCity: localData.locationCity || undefined,
        locationState: localData.locationState || undefined,
        locationCountry: localData.locationCountry || undefined,
        isRemote: localData.isRemote,
        isHybrid: localData.workArrangement === 'hybrid',
        hybridDays: localData.hybridDays,
        // Store additional location details in intakeData
        intakeData: {
          workArrangement: localData.workArrangement,
          locationAddressLine1: localData.locationAddressLine1,
          locationAddressLine2: localData.locationAddressLine2,
          locationPostalCode: localData.locationPostalCode,
          locationRestrictions: localData.locationRestrictions,
          workAuthorizations: localData.workAuthorizations,
        },
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save location:', error)
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

export default useLocationSection
