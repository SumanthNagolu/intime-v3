import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { TeamSectionData, SectionMode } from '@/lib/jobs/types'
import { DEFAULT_TEAM_DATA } from '@/lib/jobs/types'

interface UseTeamSectionOptions {
  jobId: string
  initialData?: Partial<TeamSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseTeamSectionReturn {
  data: TeamSectionData
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
 * useTeamSection - Hook for managing Team section state and operations
 */
export function useTeamSection({
  jobId,
  initialData,
  mode,
  onSaveComplete,
}: UseTeamSectionOptions): UseTeamSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<TeamSectionData>(() => ({
    ...DEFAULT_TEAM_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<TeamSectionData | null>(null)

  // Use the existing jobs.update mutation for partial updates
  const updateMutation = trpc.ats.jobs.update.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_TEAM_DATA, ...initialData }
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
        ownerId: localData.ownerId || undefined,
        recruiterIds: localData.recruiterIds.length > 0 ? localData.recruiterIds : undefined,
        priorityRank: localData.priorityRank,
        slaDays: localData.slaDays,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save team:', error)
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

export default useTeamSection
