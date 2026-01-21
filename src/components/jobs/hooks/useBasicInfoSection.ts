import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { BasicInfoSectionData, SectionMode } from '@/lib/jobs/types'
import { DEFAULT_BASIC_INFO_DATA } from '@/lib/jobs/types'

interface UseBasicInfoSectionOptions {
  jobId: string
  initialData?: Partial<BasicInfoSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseBasicInfoSectionReturn {
  data: BasicInfoSectionData
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
 * useBasicInfoSection - Hook for managing Basic Info section state and operations
 *
 * Handles:
 * - Local state management for form data
 * - Syncing from initial/server data
 * - Save operations via tRPC (uses jobs.update for partial updates)
 * - Edit mode toggling
 */
export function useBasicInfoSection({
  jobId,
  initialData,
  mode,
  onSaveComplete,
}: UseBasicInfoSectionOptions): UseBasicInfoSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<BasicInfoSectionData>(() => ({
    ...DEFAULT_BASIC_INFO_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<BasicInfoSectionData | null>(null)

  // Use the existing jobs.update mutation for partial updates
  const updateMutation = trpc.ats.jobs.update.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_BASIC_INFO_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  // Handle single field change
  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Handle save - use jobs.update with partial data
  const handleSave = useCallback(async () => {
    try {
      // Build update payload - only include changed/relevant fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatePayload: any = {
        id: jobId,
        accountId: localData.accountId || undefined,
        title: localData.title,
        description: localData.description || undefined,
        positionsCount: localData.positionsCount,
        jobType: localData.jobType,
        priority: localData.priority,
        urgency: localData.urgency,
        targetStartDate: localData.targetStartDate || undefined,
        targetEndDate: localData.targetEndDate || undefined,
        targetFillDate: localData.targetFillDate || undefined,
        externalJobId: localData.externalJobId || undefined,
        clientCompanyId: localData.clientCompanyId || undefined,
        endClientCompanyId: localData.endClientCompanyId || undefined,
        vendorCompanyId: localData.vendorCompanyId || undefined,
        hiringManagerContactId: localData.hiringManagerContactId || undefined,
        hrContactId: localData.hrContactId || undefined,
        // Store intake method in intakeData JSONB
        intakeData: {
          intakeMethod: localData.intakeMethod,
        },
      }

      await updateMutation.mutateAsync(updatePayload)

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save basic info:', error)
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

export default useBasicInfoSection
